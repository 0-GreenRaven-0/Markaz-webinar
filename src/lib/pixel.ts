/**
 * Meta Pixel events.
 *
 * The base pixel and the PageView are in BaseLayout, written out exactly as
 * Meta supplies them. Everything else on the site goes through here, so there
 * is one place to see what is being reported and one place to switch it off.
 *
 * Nothing in here throws. Three things can go wrong and all of them are normal:
 *
 *   - `metaPixelId` is empty, so no pixel script was written into the page at
 *     all and `fbq` does not exist.
 *   - The visitor runs an ad blocker. The snippet still defines `fbq` and still
 *     queues the call, but connect.facebook.net is never fetched and the queue
 *     is never sent. A meaningful share of visitors are in this state — treat
 *     the numbers in Events Manager as a floor, not a count.
 *   - Tracking has not finished initialising when a page fires its event. The
 *     snippet queues calls made before the script loads, so this is safe.
 *
 * The conversions are deliberately reported from the PAGE a visitor lands on
 * rather than from the click that sent them there: a `fbq` call made moments
 * before `location.assign` is often cancelled by the navigation, and the
 * conversion is lost. /check-email and /confirm are only reachable by
 * registering, so they are honest places to count from.
 */

/** The standard Meta events this site reports. */
export type PixelEvent = "Lead" | "CompleteRegistration";

type Params = Record<string, string | number | boolean>;

type Fbq = ((...args: unknown[]) => void) | undefined;

const fbq = (): Fbq => (window as unknown as { fbq?: Fbq }).fbq;

/** One of Meta's standard events. These are what ad delivery optimises against. */
export function track(event: PixelEvent, params?: Params): void {
	try {
		fbq()?.("track", event, params);
	} catch {
		// Reporting must never break the page it is reporting on.
	}
}

/**
 * An event of our own. Useful for watching the funnel, but Meta cannot optimise
 * delivery against one as well as it can a standard event.
 */
export function trackCustom(event: string, params?: Params): void {
	try {
		fbq()?.("trackCustom", event, params);
	} catch {
		/* see above */
	}
}

/**
 * Runs `fire` only the first time it is asked for in this browsing session.
 *
 * Conversions are reported on page load, and a page can be reloaded, shared or
 * reopened from history. Without this a single registration could be counted
 * several times and the ad reporting would flatter itself. The key is cleared
 * when the tab closes, which is the right lifetime: a genuine second
 * registration means a new session.
 */
export function once(key: string, fire: () => void): void {
	const slot = `markaz:pixel:${key}`;
	try {
		if (sessionStorage.getItem(slot)) return;
		sessionStorage.setItem(slot, "1");
	} catch {
		// Private mode, or storage refused. Report it rather than lose it — a
		// double count is the lesser problem.
	}
	fire();
}
