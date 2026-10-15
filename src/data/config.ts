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
 * How long the webinar runs, in minutes. Only used to work out the end time on
 * the calendar invite offered on /confirm.
 */
export const webinarDurationMinutes = 90;

/**
 * The Google Apps Script web app that marks a registration Confirmed.
 *
 * /confirm calls this from the visitor's browser with the email from the link
 * in their confirmation message, so this URL is PUBLIC — it is visible to
 * anyone who opens the page. That is fine for an Apps Script endpoint whose
 * only action is to tick a row from Unconfirmed to Confirmed, but do not put
 * anything secret behind it, and have the script itself ignore an email it
 * cannot find rather than reporting back what is on the sheet.
 *
 * To point this at a different script, replace the URL below. It ends in
 * /exec, and the deployment has to be set to "Anyone" so a visitor's browser
 * can reach it without signing in. Redeploying the Apps Script as a NEW
 * version usually issues a NEW /exec URL — if confirmations stop working after
 * you edit the script, this is the first thing to check. Leave it empty and
 * /confirm shows its "could not confirm" state without calling anything.
 */
export const confirmEndpoint =
	"https://script.google.com/macros/s/AKfycbxx_6yA8qGRMfCOgFnqOBwKQ-7wvlao7Ojys5Bwxq7Ft9FxYht7bqqWGiiLcNnTCnwYqg/exec";

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

/**
 * The qualifying dropdowns on the signup form, in the order they appear.
 *
 * Each one becomes a required dropdown and its own column on the sheet, so
 * `column` is the heading a person reads there and `id` is the internal name —
 * keep `id` stable, or old rows and new rows stop lining up.
 *
 * Edit the wording here and the form, the sheet heading and the stored answer
 * all follow.
 */
export interface SignupQuestion {
	id: string;
	label: string;
	column: string;
	options: string[];
	/**
	 * Keeps this question hidden until an earlier one is answered a particular
	 * way. Leave it out and the question is always shown.
	 *
	 * A hidden question is not required and is submitted empty, so its column on
	 * the sheet stays blank for anyone who never saw it.
	 */
	revealedBy?: { question: string; answers: string[] };
}

export const signupQuestions: SignupQuestion[] = [
	{
		id: "interest",
		label: "Are you interested in becoming a game developer?",
		column: "Interested",
		options: ["Yes I am!", "Haven't made up my mind yet", "No I'm not"],
	},
	{
		id: "enroll",
		label:
			"Would you enroll in a program that can help you build a successful game development career for the long term even if it costs $1000+?",
		column: "Would enroll at $1000+",
		options: ["Of course", "I need to see this program first", "No I won't"],
	},
	{
		id: "payment",
		label:
			"We offer flexible payment options to people who are willing to commit to the program and make full use of it, which plan would suit you the most?",
		column: "Payment plan",
		options: ["Full payment", "Monthly Installment (at least $250)"],
		// Only worth asking of someone who has not already ruled the program out.
		revealedBy: {
			question: "enroll",
			answers: ["Of course", "I need to see this program first"],
		},
	},
];

/**
 * Meta (Facebook) Pixel id, used by the base pixel in BaseLayout.
 *
 * Empty disables it: no script is written into the page at all. That is the
 * switch to use if the pixel ever has to come off in a hurry — and remember
 * the privacy policy describes it, so that page needs updating too.
 */
export const metaPixelId = "1814348579981984";
