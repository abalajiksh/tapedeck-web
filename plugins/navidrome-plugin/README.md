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

## The deck's half is already built

Since **v0.125.0** a Navidrome source can be put into **plugin mode** from
Settings, which mints a token for the plugin and switches that source's polling
off in the same move. You are never running both halves by accident, and the
awkward "remember to disable the poll source" step is gone.

What plugin mode also buys is that a listen submitted with that token, naming a
Navidrome song, is stored as **this server's** — so cover art, the album and
artist pages and the rest of the library features work for it, exactly as they
do for a polled listen. The stored login is still used for those. A listen from
a plain `td_` token cannot be attributed that way, which is the real reason the
mode exists rather than it being a tidier switch.

Minting again replaces the token and the old one stops working. Turn plugin mode
off and polling picks up from where it stopped, with the plays the plugin
already sent recognised as duplicates rather than imported a second time.

**What is left is the Navidrome side**: the plugin itself. The deck is waiting
for it.

The full field reference is in `docs/plugin-api.md` in the server repo.
