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
		text: "Become a talented game developer & launch your 1st game on Steam",
	},
];

export const subHeadline =
	"Discover the most unique program in whole Lebanon that'll take you from ZERO to a talented game developer";
