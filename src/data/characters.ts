/**
 * The six Divisions shown in the "What makes this cohort one of a kind"
 * section: the character art, the heading, and the paragraph beside it.
 *
 * The art in `public/characters/` is web-compressed and trimmed right down to
 * the character — every transparent margin is cropped off, so the frame it sits
 * in can close around it. That is why `width` and `height` differ from entry to
 * entry and must be kept in step with the files; the untouched originals are in
 * `media-source/characters/`, which is not published.
 *
 * The order here is the order they appear in down the page, and the sides
 * alternate from it — so moving an entry also moves which side it sits on.
 *
 * THE WORDING IS THE USER'S, verbatim. Do not "tidy" the punctuation.
 */
export interface Character {
	name: string;
	src: string;
	/** The file's real pixel size, so the browser reserves the right shape. */
	width: number;
	height: number;
	blurb: string;
}

export const characters: Character[] = [
	{
		name: "Game Designer",
		src: "/characters/game-designer.webp",
		width: 900,
		height: 1518,
		blurb:
			"The most important Division, because they are the ones who shape how the game plays: the rules, mechanics, levels, and story. They give birth to ideas and guide the whole team to make them happen",
	},
	{
		name: "Programmer",
		src: "/characters/programmer.webp",
		width: 770,
		height: 1522,
		blurb:
			"They wield their coding & problem solving skills to build the actual game from systems, backends, mechanics. Computer scientists often choose this Division because they have tremendous advantage in it",
	},
	{
		name: "Game Artist",
		src: "/characters/game-artist.webp",
		width: 900,
		height: 1366,
		blurb:
			"Another huge important Division, because the secret to a successful and eye catching video game is the creativity and design of worlds, characters, 3D assets, illustrations, which is what game artists bring in",
	},
	{
		name: "Animator",
		src: "/characters/animator.webp",
		width: 836,
		height: 1426,
		blurb:
			"Animators are responsible for creating fluid animations which give life to all characters and communicate clearly the purpose of each action performed inside the game",
	},
	{
		name: "Music Composer",
		src: "/characters/music-composer.webp",
		width: 824,
		height: 1396,
		blurb:
			"They create those intense or soothing soundtracks and the sound effects you often hear in your favorite video games",
	},
	{
		name: "VFX Artist",
		src: "/characters/vfx-artist.webp",
		width: 808,
		height: 1444,
		blurb:
			"They create special visual effects like explosions and magical effects which make actions in the game feel powerful and show the impact",
	},
];
