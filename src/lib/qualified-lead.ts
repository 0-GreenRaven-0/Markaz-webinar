/**
 * Decides whether a signup counts as a "Qualified_Lead" for the pixel, from
 * the answers to the first two qualifying questions in config.ts (`interest`
 * and `enroll`).
 *
 * Qualified:
 *   - interest "Yes I am!"                      AND enroll "Of course"
 *   - interest "Yes I am!"                      AND enroll "I need to see this program first"
 *   - interest "Haven't made up my mind yet"    AND enroll "Of course"
 *
 * Everything else — including "No I'm not" on either answer, and "Haven't
 * made up my mind yet" paired with "I need to see this program first" — is
 * not qualified.
 *
 * The matching is on the exact option text, not on position in the list, so
 * reordering signupQuestions in config.ts cannot silently change who
 * qualifies. It WILL break silently if the wording of an option is edited
 * there without updating it here — there is no shared source for these two
 * lists because the rule is specific to this funnel, not a property of the
 * question itself.
 */

const QUALIFIED: ReadonlySet<string> = new Set([
	"Yes I am!" + "\u0000" + "Of course",
	"Yes I am!" + "\u0000" + "I need to see this program first",
	"Haven't made up my mind yet" + "\u0000" + "Of course",
]);

export function isQualifiedLead(interest: string, enroll: string): boolean {
	return QUALIFIED.has(`${interest.trim()}\u0000${enroll.trim()}`);
}
