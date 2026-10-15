## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project conventions

These are deliberate decisions, not defaults. Follow them unless the user
changes them.

### Who this is for

The user does not read or write code and will not review it. Do not answer
with code snippets or ask them to check, paste or debug anything. Explain in
plain language, and ask questions in terms they can judge — what it looks
like, what it says, who it is for.

Never report work as done on the strength of a successful build. Build it,
view the running page, and describe what is actually visible.

### Styling: no Tailwind, no CSS frameworks

Styling is plain CSS, on purpose. Astro scopes `<style>` blocks per component
and drops unused CSS, which covers what a utility framework would be doing
here. Do not add Tailwind, a CSS-in-JS library or a component library.

- `src/styles/tokens.css` — every colour, space, font-size and radius lives
  here as a custom property, and nowhere else.
- `src/styles/global.css` — minimal reset and base element styles only.
- Component styling goes in a scoped `<style>` block in its `.astro` file.

**Never hardcode a raw value in a component.** No `padding: 24px`, no
`color: #333`, no `font-size: 1.125rem`. Use a token. If the token you need
does not exist, add it to `tokens.css` first, then use it. This is the only
thing keeping the site visually consistent across sessions — the drift it
prevents is the reason Tailwind was not needed.

Custom properties do not work inside `@media` queries. Breakpoints are
written literally: `40rem` / `48rem` / `64rem` / `80rem`.

### Layout and direction

All pages render through `src/layouts/BaseLayout.astro`, which owns `<head>`,
the meta tags and the `lang`/`dir` attributes.

Use CSS logical properties for anything directional — `margin-inline`,
`padding-block`, `inset-inline-start` — not `margin-left` / `padding-top`.
This keeps the site ready for Arabic / right-to-left without a rewrite.

### Dependencies

Every dependency is maintenance the user cannot perform. Do not add one to
save yourself a small amount of work. If a dependency is genuinely needed,
say so in plain language and explain the trade-off before adding it.

### Brand colour rules

The palette lives in `src/styles/tokens.css`, named by role. Reference
`brand/brand-colors.png` is the source (kept out of `public/` so it is not
deployed).

The bright identity green `#13BA2E` only reaches **2.60:1** against white. It
is the brand's signature colour and it is unreadable as text. Measured ratios:

| Use                                   | Token                     | Ratio   |
| :------------------------------------ | :------------------------ | :------ |
| Body text                             | `--color-text`            | 17.5:1  |
| Muted text                            | `--color-text-muted`      | 6.9:1   |
| Button / link, white label            | `--color-brand-strong`    | 6.3:1   |
| Dark navy text on bright green panel  | `--color-on-brand`        | 6.7:1   |
| Bright green as text                  | — never                   | 2.6:1   |

Rules:

- Never put `--color-brand` on text, and never put white text on it. It is for
  fills, shapes, the logo and decorative accents only.
- Buttons and links use `--color-brand-strong` with `--color-text-on-brand`,
  hovering to `--color-brand-hover`.
- When a panel is filled with `--color-brand`, its text is `--color-on-brand`
  (the dark navy), never white.
- Keep body text at 4.5:1 or better. If a new colour pairing is introduced,
  measure it before using it rather than guessing.

### Fonts and licensing

`--font-body` and `--font-heading` in `tokens.css` are the only place fonts are
set. Changing those two values changes the whole site.

Two fonts supplied in October 2026 (Francker W06 Semibold, FSP DEMO - Marzano
Black) were checked and are **not licensed for this site** — see
`brand/fonts/_unlicensed-do-not-ship/README.md`. They are kept for reference
only and must never be moved into `public/` or referenced from CSS.

Before using any font on this site, verify it is licensed for web embedding:

- Read the `Copyright`, `License` and `fsType` fields inside the font binary,
  not the text file bundled with a download. `fsType = 4` means preview/print
  only and forbids web use.
- Treat "free font" aggregator sites (onlinewebfonts.com, webfontfree.com,
  dafont, ffonts, etc.) as unreliable — they relabel commercial fonts as free.
- Safe sources: Google Fonts, Fontsource, and anything under the SIL Open Font
  License. A purchased web licence from the foundry is also fine.

Nothing in `public/` is private — it is published to the live domain exactly as
it sits. Never put source files, archives, brand reference material or
unlicensed assets there.

### Page structure and where content lives

The landing page is `src/pages/index.astro`, which assembles four components:
`Hero` (headline, seats counter, signup form), `Projects`, `Faq`, `SiteFooter`.

Content the user is likely to want changed is kept out of markup, in `src/data/`:

| What                                  | File                   |
| :------------------------------------ | :--------------------- |
| Seats number, webinar date, meta, site info | `config.ts`       |
| The three A/B hero headlines + subhead| `hooks.ts`             |
| Project video list, titles, blurbs    | `projects.ts`          |
| Phone country codes                   | `countries.ts`         |

FAQ questions live inside `Faq.astro` and footer links inside `SiteFooter.astro`;
both are marked as placeholders.

### Hero headline A/B test

Three headlines rotate. An inline script at the top of `Hero.astro` picks one
per browsing session, stores it in `sessionStorage` under `markaz:hook`, and
sets `data-hook="A|B|C"` on `<html>`. CSS shows only the matching `<span>`
inside the single `<h1>`.

It runs before the headline is parsed, so there is no visible swap. With
JavaScript off, headline A shows. The chosen variant is submitted with the form
as `hook_variant` — without that, the test produces no data.

### The signup form

The form POSTs JSON to `/api/subscribe`, which runs as a Cloudflare function.
That route writes the row to Google Sheets (a hard failure, reported to the
visitor) and then creates the Brevo contact (best effort — the row is already
safe, so a Brevo failure must never show an error or make someone submit twice).

Before anything is written, `src/lib/email-check.ts` rejects addresses that
cannot receive mail: bad syntax, a throwaway provider, or a domain with no mail
server. **Its bias is to accept** — a rejected real lead costs more than a
bounced fake one, so every uncertain case passes. Do not "tighten" it without
reading the reasoning in that file.

Secrets are read with `const { env } = await import("cloudflare:workers")`.
Never `import.meta.env` — Astro replaces that at build time and bakes the
private key into the bundle. (`locals.runtime.env` was the old way and now
throws; Astro 7 removed it.)

### Video

`public/videos/` holds web-compressed copies plus a poster image each.
Untouched originals are in `media-source/`, which is not published — never
reference that folder from the site. Videos use `preload="none"`, so a visitor
downloads one only when they press play.

Re-compress new videos before adding them (H.264, max 1280px wide, CRF ~27,
`-movflags +faststart`), add a poster frame, then list them in `projects.ts`.
