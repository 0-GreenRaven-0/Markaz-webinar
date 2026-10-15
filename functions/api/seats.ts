/**
 * How many seats are left: the number set in config.ts, minus everyone already
 * on the signup sheet. Served at /api/seats.
 *
 * A Cloudflare Pages Function — the page itself is static, built once and
 * served from the edge, so the figure cannot be baked into the HTML. The
 * counter asks this for it instead, which is also why the page shows a loading
 * state first.
 *
 * It NEVER fails in a way the visitor can see. If the sheet cannot be read, the
 * configured number is returned and the counter shows that: a seat count that
 * is slightly stale is harmless, a broken counter in the hero is not.
 */
import { seatsRemaining as configuredSeats } from "../../src/data/config";
import { getGoogleAccessToken, countSheetRows } from "../../src/lib/google-auth";

interface Env {
	GOOGLE_SERVICE_ACCOUNT_JSON?: string;
	GOOGLE_SHEET_SIGNUPS?: string;
}

/**
 * Seconds a browser may reuse this answer. Short enough that the number moves
 * during a launch, long enough that a burst of visitors does not turn into a
 * burst of Google API calls.
 */
const CACHE_SECONDS = 30;

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), {
		status,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": `public, max-age=${CACHE_SECONDS}`,
		},
	});

export const onRequestGet: PagesFunction<Env> = async (context) => {
	const env = context.env ?? ({} as Env);
	const credsJson = env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "";
	const sheetId = env.GOOGLE_SHEET_SIGNUPS ?? "";

	if (!credsJson || !sheetId) {
		console.error("[seats] sheet is not configured; falling back to the number in config.ts");
		return json({ remaining: configuredSeats, exact: false });
	}

	try {
		const token = await getGoogleAccessToken(credsJson);
		const taken = await countSheetRows(sheetId, token);
		// Never below zero, and never above the number that was offered.
		const remaining = Math.min(configuredSeats, Math.max(0, configuredSeats - taken));
		return json({ remaining, exact: true });
	} catch (err) {
		console.error("[seats] could not read the sheet:", err);
		return json({ remaining: configuredSeats, exact: false });
	}
};
