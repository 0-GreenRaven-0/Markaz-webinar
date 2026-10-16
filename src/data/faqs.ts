/**
 * The FAQ questions and answers, in the order they appear on the page.
 *
 * Any entry with an empty `a` renders a visible "answer still to be written"
 * marker on the page, so an unfinished one cannot slip through to launch
 * unnoticed. All seven are written.
 */
export interface Faq {
	q: string;
	a: string;
}

export const faqs: Faq[] = [
	{
		q: "Who's this Cohort for?",
		a: "This is for every individual in Lebanon who aspires to become a talented game developer and is tired of being stuck in tutorials or from the headache of having to learn everything by themselves",
	},
	{
		q: "Is this an online program or do I need to personally attend an academy?",
		a: "No, it's an interactive online mentorship designed to help you become a game developer from any place.",
	},
	{
		q: "What makes this program special from the game development courses at private universities or online courses?",
		a: "This is a one-of-a-kind program which was put together by developers with years of experience who worked on 10+ projects that generated $550,000+ in revenue and coached a lot of students whose projects you're about to see in the free webinar",
	},
	{
		q: "Do I need experience to join or benefit from the cohort?",
		a: "Not at all! This program was created to guide you from absolute ZERO to releasing your first game ever on Steam and gain real world experience from working with teams",
	},
	{
		q: "What will I learn EXACTLY from this cohort?",
		a: "This cohort will walk you through 6 different Divisions (Game Designer, Programmer, 3D artist...), help you choose the Division that fits you the most and provide you with full interactive coaching to become an expert in that Division",
	},
	{
		q: "What If I couldn't attend the webinar?",
		a: "Replays for the webinar aren't guaranteed so we highly recommend that you attend and not miss out on such a huge opportunity",
	},
	{
		q: "Is game development a good career for IT or computer science students/graduates?",
		a: "Game development is an EXCELLENT career for Computer Science or IT students, because they gain tremendous advantage in this career due to their programming skills, backend and their problem solving skills + it's a lucrative career that is often overlooked by us Lebanese",
	},
];
