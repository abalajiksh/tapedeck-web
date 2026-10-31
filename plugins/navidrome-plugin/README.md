Tapedeck has always supported Navidrome as a **polled** source: the poll engine
asks Navidrome what has been played since it last looked, over Navidrome's
native API or Subsonic. That works, and it needs nothing installed on the
Navidrome side.

This is the other half — the **push** path, and it is written and released.
It is a third-party plugin by [princefred](https://codeberg.org/princefred),
AGPL-3.0 like the deck, and not affiliated with the Navidrome project.

## What it carries that a poll cannot

A plugin runs inside the server, so it knows things a poll of
`/api/scrobble/?from=` can never return. Alongside the track and MusicBrainz
IDs it sends:

| Field | What it is |
| --- | --- |
| `tapedeck_audio` | Format, codec, bitrate, sample rate, bit depth, channels and the lossless verdict, from Navidrome's own `getSong` |
| `tapedeck_device` | The client app — Navidrome's `playerId` as `machine_id` — so the listen can be bound to a signal chain |
| `tapedeck_playback` | The real playhead on now-playing, pause and resume included, rather than a clock running on regardless |
| `tapedeck_source` | Navidrome's id for the played file, so the deck can fetch cover art from that server |

Optionally it also sends **the lyrics in your files**, synced or plain, which
appear in the reader as "Words via Navidrome" — once per track, after the
scrobble. Tapedeck never overwrites a lyric you corrected by hand.

One Navidrome can feed several decks: the mapping is per user, so user A's plays
go to server X while users B and C go to server Y.

## Plugin mode is the half that ships with the deck

Since **v0.125.0** a Navidrome source can be put into **plugin mode** from
Settings → Sources, which mints a token for the plugin and switches that
source's polling off in the same move. You are never running both halves by
accident.

What plugin mode also buys is that a listen submitted with that token, naming a
Navidrome song, is stored as **this server's** — so cover art, the album and
artist pages and the rest of the library features work for it, exactly as they
do for a polled listen. The stored login is still used for those. A token from
Settings → API Tokens works too, but the deck can then only place a song id if
that user has exactly one Navidrome source.

Minting again replaces the token and the old one stops working. Turn plugin mode
off and polling picks up from where it stopped, with the plays the plugin
already sent recognised as duplicates rather than imported a second time.

## Installing it

1. Take `tapedeck.ndp` from the plugin's
   [releases](https://codeberg.org/princefred/tapedeck-for-navidrome/releases),
   drop it in Navidrome's plugins folder (`<DataFolder>/plugins`) and press
   **Rescan**.
2. In each user's Tapedeck, under **Settings → Sources**, add or edit their
   Navidrome, tick *Listens come from the Tapedeck plugin in Navidrome*, and
   save. The token is shown once.
3. In Navidrome's plugin settings, add a row per user: their Navidrome username,
   their Tapedeck URL and that token. Use the **final** `https://` URL — a
   redirect turns the POST into a GET, which fails and is dropped.
4. Grant those users under the plugin's user access. The mapping and the grant
   are both needed.
5. Enable the plugin.

Before trusting it, submit exactly what the plugin sends with `?dry_run=1`:
Tapedeck stores nothing and reports whether it read `tapedeck_audio` and
`tapedeck_device`, the quality score it computed, which rung of the chain ladder
attributed it, and what dedup would do. The plugin's README has the ready-made
`curl`.

## Three things to turn off, or listens lose their details

Tapedeck keeps whichever copy of a listen arrives first and drops the rest as
duplicates — so a bare copy that wins throws away everything the plugin added.

- **Put the Navidrome source in plugin mode** rather than leaving it polling. A
  polling source races the plugin.
- **Don't point Navidrome's built-in ListenBrainz scrobbler at Tapedeck.**
- If Tapedeck forwards that user's listens on to Last.fm or ListenBrainz, turn
  off Navidrome's own scrobbling for them, or those services get every play
  twice.

## Known limits

- **No transcode detection.** The `delivery_*` fields are never sent, so a FLAC
  degraded on the way out still reports as the FLAC on disk. This was the
  original argument for a plugin and it is the one thing not in v1 — setting
  those fields wrongly would lower the quality score on a guess, which is worse
  than leaving them empty.
- **Navidrome decides when a play counts**, not Tapedeck's per-user
  scrobble-settings threshold.
- **Tokens are typed in by hand** — no device-code pairing and no chain picker
  yet. The admin filling in the config can see every user's token: fine for a
  household, but know it.
- **The lyrics option needs `write` scope**, and a `write` token can also edit or
  delete that user's Tapedeck data. Only tick it if the user wants lyrics sent.
- Retries happen on network errors, 5xx and 429. A 4xx or a rejected listen is
  logged and dropped, because retrying would block that user's later scrobbles.

Building it yourself needs Go 1.25+ and `zip`; TinyGo is optional and produces a
smaller plugin. The field reference for everything above is `docs/plugin-api.md`
in the server repo.
