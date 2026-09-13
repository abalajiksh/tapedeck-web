# spec/

`openapi.yaml` here is a **copy**. The original lives at the root of the
application repo, [`abksh/tapedeck`](https://codeberg.org/abksh/tapedeck), and
this copy is written by the `tapedeck-spec-sync` Jenkins job on every release
tag.

**Do not edit it here.** The next release overwrites the file, and your change
disappears with no warning. Anything wrong in the spec — a missing endpoint, a
wrong schema, a description that no longer matches the handler — is fixed
upstream, where the `the_spec_and_the_router_describe_the_same_api` test can
check it against the real router.

## Why a copy rather than a fetch

The site could read the spec from Codeberg at build time, the way
`src/lib/version.server.js` reads the version. It deliberately doesn't.

A failed version lookup hides a chip. A failed spec fetch would leave
`/api/` with nothing to render, and every route here is prerendered with
`strict: true` — so a Codeberg outage during a Cloudflare build would fail the
deploy. Vendoring makes the build hermetic: it touches no network, and the API
reference is as reliable as the rest of the site.

Two things fall out of that, both worth having. The spec is versioned in git, so
a release's API changes show up as a reviewable diff. And the sync job's push is
what triggers the Cloudflare build, so no separate deploy hook is needed on the
path that matters.

## Refreshing it by hand

If the job hasn't run, or you want the site to describe a specific release:

```bash
curl -fsSL -o spec/openapi.yaml https://codeberg.org/abksh/tapedeck/raw/tag/v0.115.1/openapi.yaml
```

Then `bun run build`. The build parses this file and fails, naming the problem,
if it is malformed — so a truncated download cannot quietly ship.

`src/lib/openapi.server.js` is what reads it.
