# The plugin registry

Every folder in here becomes a card on [/plugins](https://tapedeck.cc/plugins/)
and, when it has a `README.md`, a page of its own at `/plugins/<folder-name>/`.

**Adding a plugin is adding a folder.** Nothing else in the site is edited — the
listing, the category filter and the routes are all derived from what is here at
build time.

This file is the field-by-field reference. For the fork-and-pull-request walk
through, see [Adding your plugin to the site](../README.md#adding-your-plugin-to-the-site)
in the root README.

## Layout

```
plugins/
  my-plugin/
    plugin.json     required
    README.md       optional — its presence is what earns a detail page
    settings.png    optional — any images that README points at
```

The folder name is the URL slug, so keep it lowercase and hyphenated.

## `plugin.json`

```json
{
  "name": "fooyin-tapeout",
  "by": "by abalajiksh",
  "kind": "Player plugin",
  "category": "Players",
  "status": "dev",
  "summary": "One paragraph. This is the card body.",
  "adds": "What it contributes that the plain ListenBrainz path cannot",
  "link": "https://github.com/abalajiksh/fooyin-tapeout",
  "linkLabel": "View on GitHub",
  "order": 10
}
```

| Field | | |
| --- | --- | --- |
| `name` | required | Display name |
| `kind` | required | Small uppercase label on the card — "Player plugin", "Server plugin", "Analysis", "Mobile", "Scrobble client", "Site integration" |
| `category` | required | Which filter tab it appears under. `Players`, `Servers`, `Analysis` and `Apps` are ordered first; any other value is appended to the filter row automatically |
| `status` | required | One of `shipped`, `dev`, `untested`, `soon`, `planned` — see below |
| `summary` | required | The card body, one paragraph |
| `by` | optional | Author or provenance line under the name |
| `adds` | optional | The "What it adds" line |
| `link` | optional | Absolute `http(s)` URL to the repo or project |
| `linkLabel` | optional | Defaults to "View on GitHub" when `link` is set |
| `order` | optional | Explicit sort position. Without it, entries sort by status then name — but if *any* entry has one, that ordering takes over, so set it on all of them or none |

### Statuses

Say the true one. The page's whole premise is that the status is honest.

| | |
| --- | --- |
| `shipped` | Works today |
| `dev` | Being written now |
| `untested` | Built, but never run against the real thing |
| `soon` | Next in the queue; no code yet |
| `planned` | Intended, not started |

## `README.md`

Plain Markdown — headings, lists, tables, code blocks and links all render. It
becomes the body of `/plugins/<slug>/`, below the card details, so start with
the prose rather than repeating the plugin's name as an `# H1`.

Omit the file entirely and the plugin still appears in the listing; its card
just links straight out to `link` instead of inward.

### Screenshots

Put the image file in the plugin's own folder and reference it by bare filename:

```markdown
![A screenshot of the plugin's settings page](settings.png)
```

`png`, `jpg`, `webp`, `avif`, `svg` and `gif` are picked up. Vite fingerprints
each one into the build, so **write the filename, never a `/`-rooted URL** — the
deployed path is not the one you typed. Absolute `http(s)` URLs are left alone,
though an image hosted elsewhere breaks the promise that the site makes no
third-party request, so ship the file.

A filename that isn't in the folder fails the build and names itself, on the
same reasoning as everything else here: a screenshot that 404s on the deployed
site is worse than a build that stops.

Images are rendered full-width in the prose column, which is 760px wide — size
them for that and crop out the desktop around the window.

## It fails the build, not the page

`plugin.json` is read by Vite at build time. A missing required field, an
unknown status, or a relative `link` fails `bun run build` with the offending
path named — so a broken entry can't reach the deployed site.
