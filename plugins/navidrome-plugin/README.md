Tapedeck already supports Navidrome as a **polled** source: the poll engine asks
Navidrome what has been played since it last looked, over Navidrome's native API
or Subsonic. That works, and it needs nothing installed on the Navidrome side.

This plugin is the tighter integration — the **push** path.

## Why push beats poll here

A plugin runs inside the server, so it knows things a poll of
`/api/scrobble/?from=` can never return:

- the **transcoding decision** — whether the FLAC on disk was served as FLAC or
  degraded on the way out
- the **exact file** being served
- the **client app and player** that asked for it

Audio quality metadata is the one dimension Tapedeck can never backfill. A
listen that arrives without it is permanently untagged, which is precisely why
this is worth doing rather than leaving the poll source to it.

## Coexisting with the poll source

Run one or the other for a given user, not both — the poll source and the plugin
would otherwise submit the same play twice. Tapedeck dedups listens, but the
cleaner arrangement is to disable the Navidrome poll source once the plugin is
submitting.

The full field reference is in `docs/plugin-api.md` in the server repo.
