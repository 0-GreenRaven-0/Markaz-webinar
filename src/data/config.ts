/**
 * Settings you are most likely to want to change. Everything here is read at
 * build time, so edit a value, rebuild, and the site updates.
 */

/** Shown in the scrolling bar at the top of the page. Edit this when the date changes. */
export const webinarDate = "FRIDAY 30 OCTOBER — 7PM";

/**
 * When the webinar actually starts, as a real timestamp — this drives the
 * countdown. The offset is Lebanon time (+02:00 once daylight saving ends in
 * late October). Keep it in step with webinarDate above.
 */
export const webinarAt = "2026-10-30T19:00:00+02:00";

/** The number shown in the hero seats counter. */
export const seatsRemaining = 418;

/**
 * How a signup reaches Brevo: the server function at src/pages/api/subscribe.ts
 * calls the Brevo API with BREVO_API_KEY and BREVO_LIST_SIGNUPS, which are set
 * in Cloudflare (and in .dev.vars locally), never here.
 *
 * There is deliberately no Brevo form-embed URL. It was a second, separate way
 * into Brevo, and keeping both would have sent every signup twice. The API is
 * the one kept because it can report back whether Brevo accepted the contact;
 * a form embed cannot.
 */

/**
 * What search engines and link previews show: the browser tab title, and the
 * sentence underneath it in a Google result or a shared link.
 */
export const meta = {
	title: "Become a talented Lebanese game developer",
	description:
		"Join our FREE webinar to discover a one-of-a-kind cohort designed to take Lebanese from ZERO to launching their 1st successful game on Steam",
};

/** Site-wide details used in metadata and the footer. */
export const site = {
	name: "Markaz Studio",
	tagline: "Game development training in Lebanon",
	email: "hello@markazstudio.com",
	year: new Date().getFullYear(),
};
