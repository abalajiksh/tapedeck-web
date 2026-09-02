# tapedeck-web

**This is only the website.** It is the marketing site for
**[Tapedeck](https://codeberg.org/abksh/tapedeck)** — a self-hosted music
intelligence hub written in Rust — and it lives at
[tapedeck.cc](https://tapedeck.cc).

The program itself is not in this repository. Issues and pull requests about
Tapedeck the *software* belong on Codeberg:

**→ https://codeberg.org/abksh/tapedeck**

What is here is a static SvelteKit build deployed to Cloudflare Pages, and the
registry of plugins and clients the site lists.

---

## Adding your plugin to the site

Written something that talks to a Tapedeck deck? Get it listed. **Adding a
plugin is adding a folder** — you don't have to touch any site code, and you
don't need to understand SvelteKit.

### 1. Fork this repository

Fork [`abalajiksh/tapedeck-web`](https://github.com/abalajiksh/tapedeck-web) on
GitHub, then clone your fork:

```bash
git clone git@github.com:YOUR-USERNAME/tapedeck-web.git
```

### 2. Add a folder under `plugins/`

The folder name becomes the URL, so keep it lowercase and hyphenated:

```
plugins/
  my-plugin/
    plugin.json     required — the card details
    README.md       optional — its presence is what earns a page of its own
```

A minimal `plugin.json`:

```json
{
  "name": "my-plugin",
  "by": "by your-handle",
  "kind": "Player plugin",
  "category": "Players",
  "status": "dev",
  "summary": "One paragraph describing what it is. This becomes the card body.",
  "adds": "What it contributes that the plain ListenBrainz path cannot",
  "link": "https://github.com/you/my-plugin",
  "linkLabel": "View on GitHub"
}
```

Every field, the category list and the five statuses are documented in
**[`plugins/README.md`](plugins/README.md)**. Copy an existing folder if that's
easier — [`plugins/fooyin-tapeout/`](plugins/fooyin-tapeout/) is a good model.

Add a `README.md` alongside it and your plugin gets its own page at
`/plugins/my-plugin/` with that Markdown as the body — install steps, caveats,
whatever a reader needs. Leave it out and the card simply links straight to your
repo instead.

### 3. Check it builds

```bash
bun install && bun run build
```

A missing field, an unknown status or a relative link **fails the build** with
your file named, so this catches mistakes before review does. If you'd rather
just look at it:

```bash
bun run dev
```

### 4. Open a pull request

Push the branch to your fork and open a PR against `main` here. Once it's
merged, Cloudflare Pages rebuilds and your plugin is on the site.

### A note on statuses

The Plugins page says what is actually true about each entry, including the
things that aren't finished, and that is the point of it. Pick the honest one:
`shipped` only if it works today; `untested` if it is built but has never run
against the real thing; `dev`, `soon` or `planned` otherwise. A status can
always be upgraded in a later PR.

You don't need permission to open the PR, and it doesn't have to be a
first-party plugin — third-party clients are listed here too.

---

## Working on the site itself

Bun only; there is no npm lockfile.

```bash
bun install
```

```bash
bun run dev
```

```bash
bun run build
```

`build/` is the deployable output — plain HTML, CSS and JS. Preview it with
`bun run preview`.

### Deploying

Cloudflare, via Workers Builds connected to this GitHub repo:

| Setting | Value |
| --- | --- |
| Build command | `bun install && bun run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |

There is no "output directory" field in that flow — `wrangler.jsonc` is what
points at `build/`. It declares no `main`, so this deploys as **static assets
with no Worker script**: Cloudflare serves the prerendered files directly.

Every route is prerendered (`prerender = true` in `src/routes/+layout.js`),
which is why this uses `@sveltejs/adapter-static` rather than
`adapter-cloudflare` — nothing here needs a Worker at request time.

### Layout

```
plugins/            the plugin registry — one folder per plugin
src/
  fonts.css         self-hosted @font-face rules
  app.css           the Organic design system, verbatim
  site.css          site-level theme overrides (light and dark)
  pages.css         layout utilities shared by the content pages
  app.html          shell; resolves the theme before first paint
  lib/              components, the plugin loader, page copy
  routes/           one folder per page
static/             favicon, Cloudflare `_headers`
wrangler.jsonc      tells wrangler that build/ is the asset directory
```

### The version number

The version in the hero and in the Docs env example is **not hard-coded** — it
is the highest tag on
[the Codeberg repo](https://codeberg.org/abksh/tapedeck/tags), read at build
time by `src/lib/version.server.js`.

It is read at build time rather than in the reader's browser because the site
otherwise makes no third-party request, and a version chip isn't worth handing
every visitor's IP to Codeberg for. If the lookup fails the version is simply
omitted — a missing version beats a wrong one, and a Codeberg outage never fails
the build.

The practical consequence: **it is only as fresh as the last deploy.** Every push
here and every merged plugin PR refreshes it. If you tag a release on Codeberg
and want the site to follow without a commit here, trigger a rebuild of the
Cloudflare project from the release pipeline.

### The 404 page

`static/404.html` is deliberately a plain, self-contained page rather than the
SvelteKit fallback shell — the shell renders blank without JavaScript. It is the
one file that repeats design-token values instead of reading them, because it
can't reference the fingerprinted app CSS; keep it in step if the palette moves.

`src/app.css` is the source of truth for colour, type, spacing and radii — take
values from its `var(--color-*)`, `var(--font-*)`, `var(--space-*)` and
`var(--radius-*)` tokens rather than hard-coding them.

Caprasimo and Figtree are served from `static/fonts/`, so the site makes no
third-party request. See the header comment in `src/fonts.css` for how to
refresh them.

## Licence

See [LICENSE](LICENSE).
