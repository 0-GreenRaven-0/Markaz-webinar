/**
 * Receives a signup from the form and records it.
 *
 * This runs on the server (a Cloudflare function), which is the only reason the
 * Google credentials and the Brevo key can be used at all — on a purely static
 * page anything the code can read, a visitor can read too.
 *
 * It writes to the Google Sheet and, when a Brevo key and list are configured,
 * creates the contact in Brevo as well. A Sheets failure is reported; a Brevo
 * failure is not allowed to lose the lead, since the row is already safe.
 *
 * SECRETS ARE READ FROM THE WORKERS RUNTIME, NOT FROM import.meta.env. Astro
 * replaces `import.meta.env.FOO` with the literal value at build time, which
 * bakes the private key into the worker bundle — and then whatever is set in
 * the Cloudflare dashboard is ignored, and rotating a key needs a rebuild
 * rather than a dashboard change.
 *
 * `cloudflare:workers` hands them over at the moment of the request instead, so
 * nothing is ever compiled in. (This used to be `locals.runtime.env`, which
 * Astro 7 removed — it now throws rather than returning the values.)
 */
export const prerender = false;

import type { APIRoute } from "astro";
import { getGoogleAccessToken, appendToSheet } from "../../lib/google-auth";
import { checkEmail, honeypotTripped, logRejection, normalizeEmail } from "../../lib/email-check";

const SHEET_HEADERS = ["Full name", "Email", "Phone number", "Status", "Date"];

/** Every signup lands as Unconfirmed; the column is yours to change by hand. */
const DEFAULT_STATUS = "Unconfirmed";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});

export const POST: APIRoute = async ({ request }) => {
	// Handed over by the Workers runtime per request, and in `astro dev` by the
	// platform proxy reading .dev.vars. Deliberately NOT read via
	// import.meta.env: a dynamic lookup there makes Vite inline the entire env
	// object into the bundle, which is exactly how the private key ended up
	// compiled into the build once before.
	const { env } = await import("cloudflare:workers");
	const runtimeEnv = env as unknown as Record<string, string | undefined>;
	const readEnv = (key: string): string => runtimeEnv?.[key] ?? "";

	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return json({ success: false, error: "Malformed request." }, 400);
	}

	const str = (key: string) => String(body[key] ?? "").trim();

	const fullName = str("full_name") || [str("first_name"), str("last_name")].join(" ").trim();
	const email = normalizeEmail(body.email);
	const phone = str("phone_full");

	// A bot filling every field, including ones no human can see. It is answered
	// with success so the bot learns nothing, but nothing below this runs: no
	// sheet row, no Brevo contact.
	if (honeypotTripped(body)) {
		logRejection("honeypot", "");
		return json({ success: true }, 200);
	}

	if (!fullName) {
		return json({ success: false, error: "Please enter your full name." }, 400);
	}

	// Keeps addresses that cannot receive mail off the list. Every bounce damages
	// the sending reputation that gets the webinar link into everyone else's
	// inbox. Uncertain cases are accepted — see the note in email-check.ts.
	const verdict = await checkEmail(email);
	if (!verdict.ok) {
		logRejection(verdict.reason, email);
		return json({ success: false, error: verdict.message }, 422);
	}

	const credsJson = readEnv("GOOGLE_SERVICE_ACCOUNT_JSON");
	const sheetId = readEnv("GOOGLE_SHEET_SIGNUPS");

	if (!credsJson || !sheetId) {
		console.error("[subscribe] GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEET_SIGNUPS is not set.");
		return json({ success: false, error: "Signups are not configured yet." }, 500);
	}

	// Written for a person to read, in Beirut time rather than UTC.
	const stamp = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "short",
		timeStyle: "short",
		timeZone: "Asia/Beirut",
	}).format(new Date());

	const row = [fullName, email, phone, DEFAULT_STATUS, stamp];

	try {
		const token = await getGoogleAccessToken(credsJson);
		await appendToSheet(sheetId, SHEET_HEADERS, row, token);
	} catch (err) {
		console.error("[subscribe] sheet write failed:", err);
		return json({ success: false, error: "Could not record that. Please try again." }, 502);
	}

	// Brevo is best-effort: the lead is already on the sheet, so a failure here
	// must not show the visitor an error or make them submit twice. The outcome
	// is reported back as `brevo` so a failure is visible instead of silent.
	const brevoKey = readEnv("BREVO_API_KEY");
	const brevoList = Number(readEnv("BREVO_LIST_SIGNUPS"));
	let brevo = "skipped";

	if (brevoKey && brevoList) {
		// E.164, which is what Brevo requires: a leading + and digits only.
		// Stripping the + as well produces "9613001234", which Brevo rejects as an
		// invalid phone number — and it rejects the WHOLE contact with it, so the
		// name and email never arrive either.
		const trimmedPhone = phone.trim();
		const sms = trimmedPhone.startsWith("+") ? `+${trimmedPhone.replace(/\D/g, "")}` : "";

		const parts = fullName.trim().split(/\s+/);
		const attributes: Record<string, string> = {
			FIRSTNAME: parts[0] ?? "",
			LASTNAME: parts.slice(1).join(" "),
		};
		if (sms) attributes.SMS = sms;

		const postContact = (attrs: Record<string, string>) =>
			fetch("https://api.brevo.com/v3/contacts", {
				method: "POST",
				headers: {
					"api-key": brevoKey,
					"Content-Type": "application/json",
					accept: "application/json",
				},
				body: JSON.stringify({
					email,
					attributes: attrs,
					listIds: [brevoList],
					updateEnabled: true,
				}),
			});

		try {
			let res = await postContact(attributes);

			// updateEnabled resolves a duplicate email, but not a duplicate phone: if
			// that number already belongs to another contact, Brevo hard-rejects the
			// whole request. Retry without it so the person still lands on the list.
			if (res.status === 400 && attributes.SMS) {
				const body400 = await res.clone().text();
				let duplicateSms = false;
				try {
					const parsed = JSON.parse(body400) as {
						code?: string;
						metadata?: { duplicate_identifiers?: string[] };
					};
					duplicateSms =
						parsed.code === "duplicate_parameter" &&
						Boolean(parsed.metadata?.duplicate_identifiers?.includes("SMS"));
				} catch {
					/* not JSON — fall through and report the original failure */
				}
				if (duplicateSms) {
					const { SMS: _dropped, ...withoutSms } = attributes;
					res = await postContact(withoutSms);
				}
			}

			// 201 is a new contact, 204 an existing one updated. Both are success.
			if (res.status === 201 || res.status === 204) {
				brevo = "ok";
			} else {
				brevo = `failed-${res.status}`;
				console.error("[subscribe] brevo:", res.status, await res.text());
			}
		} catch (err) {
			brevo = "failed-network";
			console.error("[subscribe] brevo threw:", err);
		}
	}

	return json({ success: true, brevo }, 200);
};
