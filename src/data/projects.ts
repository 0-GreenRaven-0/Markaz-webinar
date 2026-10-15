/**
 * The student project videos shown in the Projects section, in display order.
 *
 * The files in `public/videos/` are web-compressed copies. The untouched
 * originals are kept in `media-source/`, which is not published.
 *
 * Titles and blurbs are not shown on the page — the section is videos only —
 * but the title is still used as the video's accessible name, so keep it
 * meaningful. To add a video: compress it, drop it in `public/videos/`, and
 * add an entry here.
 *
 * The file numbers are just filenames: the order on the page is the order of
 * this list, nothing else. project-9 and project-10 are the two newest clips
 * (originals "video 11" and "video 12"), shown first by request, and a removed
 * video leaves a gap in the numbering rather than renaming everything after it.
 */
export interface Project {
	src: string;
	poster: string;
	title: string;
	blurb: string;
}

export const projects: Project[] = [
	{
		src: "/videos/project-9.mp4",
		poster: "/videos/project-9.jpg",
		title: "Student Project 01",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-10.mp4",
		poster: "/videos/project-10.jpg",
		title: "Student Project 02",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-1.mp4",
		poster: "/videos/project-1.jpg",
		title: "Student Project 03",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-3.mp4",
		poster: "/videos/project-3.jpg",
		title: "Student Project 04",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-4.mp4",
		poster: "/videos/project-4.jpg",
		title: "Student Project 05",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-5.mp4",
		poster: "/videos/project-5.jpg",
		title: "Student Project 06",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-6.mp4",
		poster: "/videos/project-6.jpg",
		title: "Student Project 07",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-7.mp4",
		poster: "/videos/project-7.jpg",
		title: "Student Project 08",
		blurb: "Placeholder — describe this project in one line.",
	},
	{
		src: "/videos/project-8.mp4",
		poster: "/videos/project-8.jpg",
		title: "Student Project 09",
		blurb: "Placeholder — describe this project in one line.",
	},
];
