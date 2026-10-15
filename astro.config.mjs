// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	// The pages stay static. Only the files under src/pages/api opt out of
	// prerendering, and those run as Cloudflare functions — which is what lets
	// the site hold secrets the browser never sees.
	output: 'static',

	// No part of this site uses sessions. Left on, the adapter asks Cloudflare
	// for a KV namespace to store them in, and a deploy that has to create one
	// stops to ask — which nothing can answer during an automated build.
	session: false,

	// platformProxy gives `astro dev` the same locals.runtime.env that Cloudflare
	// provides in production, read from .dev.vars.
	adapter: cloudflare({
		platformProxy: { enabled: true },
	}),

	// The floating Astro dev toolbar is off. It only ever appeared during local
	// development and was never part of the built site, but it also injected
	// source-file attributes into the markup, which made the page served
	// locally differ from the real one.
	devToolbar: {
		enabled: false,
	},
});
