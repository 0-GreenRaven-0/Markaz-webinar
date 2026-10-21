/**
 * The three hero headlines under A/B test.
 *
 * One is chosen at random per visitor session and stays fixed for that
 * session, so a visitor never sees the headline change under them. Which one
 * was shown is submitted with the signup form as `hook_variant`, so you can
 * tell which headline actually produces signups.
 *
 * To add or change a hook, edit this list. Keep `id` stable — it is the label
 * that appears in your form submissions.
 */
export interface Hook {
	id: string;
	text: string;
}

export const hooks: Hook[] = [
	{
		id: "A",
		text: "Develop your 1st game & launch it on Steam in just 6 months",
	},
];

export const subHeadline =
	"Join our FREE webinar to discover how Markaz Academy can take you from ZERO to becoming a successful game developer";
