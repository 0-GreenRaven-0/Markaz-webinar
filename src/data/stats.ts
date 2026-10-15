/**
 * The proof band under the hero: headline figures, then who the studio has
 * worked with.
 *
 * Figures are shown in Marzano. Its character set is small, but $ + , . and
 * K/M are all present, so currency and suffixes render properly.
 */
export interface Stat {
	value: string;
	label: string;
}

export const stats: Stat[] = [
	{ value: "10+", label: "Completed projects" },
	{ value: "$550,000+", label: "Revenue" },
];

export const trustedByHeading = "Trusted by";

export const trustedBy: string[] = [
	"Masha And The Bear",
	"Liwan Najid",
	"Crypto University",
	"CGU",
];
