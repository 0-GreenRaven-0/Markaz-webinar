/**
 * Google service-account auth for the Sheets API.
 *
 * This signs the JWT by hand with Web Crypto rather than using the googleapis
 * package, because this runs on Cloudflare Workers — there is no Node crypto
 * there, and the official library will not run in that environment.
 *
 * The caller passes the whole service-account JSON as a string, which is how it
 * is stored (GOOGLE_SERVICE_ACCOUNT_JSON). It contains a private key, so it only
 * ever exists inside a server function.
 */

/**
 * Every network call in this file used to have no timeout at all. If Google's
 * token endpoint or the Sheets API ever stalled — a slow edge, a dropped
 * connection that never resets — the fetch would hang forever with it, and so
 * would the whole /api/subscribe request behind it: the signup button on the
 * page would sit on "Sending…" indefinitely, with nothing to time out and no
 * error to show. This wraps every call here in a bound, so the worst case is
 * a clear failure in a few seconds, never a silent hang.
 */
const FETCH_TIMEOUT_MS = 8000;

/** Exported so subscribe.ts can put the same bound on its own Brevo call. */
export async function fetchWithTimeout(input: string, init: RequestInit = {}): Promise<Response> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		return await fetch(input, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

function base64url(data: string | ArrayBuffer): string {
	const bytes =
		typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToBuffer(pem: string): ArrayBuffer {
	const b64 = pem
		.replace(/-----BEGIN PRIVATE KEY-----/, "")
		.replace(/-----END PRIVATE KEY-----/, "")
		.replace(/\s/g, "");
	const binary = atob(b64);
	const buf = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
	return buf.buffer;
}

export async function getGoogleAccessToken(credsJson: string): Promise<string> {
	const creds = JSON.parse(credsJson) as { client_email: string; private_key: string };
	const now = Math.floor(Date.now() / 1000);

	const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
	const payload = base64url(
		JSON.stringify({
			iss: creds.client_email,
			scope: "https://www.googleapis.com/auth/spreadsheets",
			aud: "https://oauth2.googleapis.com/token",
			iat: now,
			exp: now + 3600,
		}),
	);

	const signingInput = `${header}.${payload}`;

	const privateKey = await crypto.subtle.importKey(
		"pkcs8",
		pemToBuffer(creds.private_key),
		{ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signature = await crypto.subtle.sign(
		"RSASSA-PKCS1-v1_5",
		privateKey,
		new TextEncoder().encode(signingInput),
	);

	const res = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${signingInput}.${base64url(signature)}`,
	});

	if (!res.ok) {
		throw new Error(`Google token request failed: ${res.status} ${await res.text()}`);
	}

	const data = (await res.json()) as { access_token: string };
	return data.access_token;
}

/**
 * How many people have signed up: the number of filled rows in the first
 * column, not counting the header.
 *
 * Only column A is fetched, so this stays small however many columns the sheet
 * grows. Blank rows are ignored — deleting a row's contents without removing
 * the row should not put a seat back.
 */
export async function countSheetRows(sheetId: string, token: string): Promise<number> {
	const res = await fetchWithTimeout(
		`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:A?majorDimension=COLUMNS`,
		{ headers: { Authorization: `Bearer ${token}` } },
	);

	if (!res.ok) {
		throw new Error(`Sheets read failed: ${res.status} ${await res.text()}`);
	}

	const data = (await res.json()) as { values?: string[][] };
	const column = data.values?.[0] ?? [];
	const filled = column.filter((cell) => (cell ?? "").trim() !== "");

	// The first filled cell is the "Full name" header.
	return Math.max(0, filled.length - 1);
}

/**
 * Appends one row, writing the header row first if the sheet is empty or its
 * columns have changed.
 *
 * valueInputOption is RAW on purpose. With USER_ENTERED, Sheets treats a phone
 * number as a number and eats the leading zero — "03317172" becomes 3317172 —
 * and reads a leading "+" as the start of a formula. RAW stores every cell
 * exactly as sent.
 */
export async function appendToSheet(
	sheetId: string,
	headers: string[],
	row: string[],
	token: string,
): Promise<void> {
	const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values`;
	const auth = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
	const lastCol = String.fromCharCode(64 + Math.min(headers.length, 26));

	const check = await fetchWithTimeout(`${base}/A1:${lastCol}1`, { headers: auth });
	const checkData = (await check.json()) as { values?: string[][] };
	const existing = checkData.values?.[0] ?? [];

	if (existing[0] !== headers[0] || existing.length < headers.length) {
		await fetchWithTimeout(`${base}/A1:${lastCol}1?valueInputOption=RAW`, {
			method: "PUT",
			headers: auth,
			body: JSON.stringify({ values: [headers] }),
		});
	}

	const res = await fetchWithTimeout(
		`${base}/A:${lastCol}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
		{
			method: "POST",
			headers: auth,
			body: JSON.stringify({ values: [row] }),
		},
	);

	if (!res.ok) {
		throw new Error(`Sheets append failed: ${res.status} ${await res.text()}`);
	}
}
