// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// A purely static build: `astro build` writes finished HTML into dist/, and
	// that is the folder Cloudflare Pages publishes.
	//
	// There is deliberately NO Cloudflare adapter. The adapter targets Workers
	// and splits the output into dist/client and dist/server, which is what put
	// the site at /client/ and left the server code downloadable at
	// /server/entry.mjs. The two server endpoints live in functions/ instead,
	// as Pages Functions, which Cloudflare runs without an adapter.
	output: 'static',

	// The floating Astro dev toolbar is off. It only ever appeared during local
	// development and was never part of the built site, but it also injected
	// source-file attributes into the markup, which made the page served
	// locally differ from the real one.
	devToolbar: {
		enabled: false,
	},
});
