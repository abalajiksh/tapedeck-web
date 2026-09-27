Tapehead is a client for your deck, not a second deck: everything it shows
comes from your Tapedeck over its API, and nothing it keeps is the record.

**Status: foundations only.** The build and the generated API client exist and
are tested; there are no screens yet, and nothing to install.

## What it is for

- **Phone and tablet** — the history, stats and loves, and the shelf, with a
  record added by scanning its barcode and matching it against MusicBrainz or
  Discogs.
- **Fire TV** — a separate app for the room the hi-fi is in: what is on the
  deck, with its lyrics, on a screen across the room.
- **iOS** — a companion for the history and the shelf.

No Google Play Services anywhere, so it runs on a Fire TV or a de-Googled
tablet as it does on a phone.

## Signing in

On the phone you give it the server URL, a username and a password — once. It
trades that sign-in for an API token named after the device, keeps only the
token, and never stores the password. Each device then shows up by name under
Settings → API Tokens, where it can be revoked on its own.

The TV pairs instead, with a short code approved from the phone or the web
UI, because nobody should type a password with a remote.

Since v0.120.0 a token reaches the shelf, charts, search and everything else
these screens read, not just the history.

## Scrobbling, later

A phone can already scrobble into Tapedeck today with no Tapehead at all:
[Pano Scrobbler](/plugins/pano-scrobbler/) pointed at the deck as a custom
ListenBrainz server. Tapehead's own scrobbler comes last, and for one reason —
Android's `AudioDeviceInfo` says which output the audio actually left through
(a USB DAC, Bluetooth, the speaker), which lands on the chain ladder's device
rung so the listen attributes itself.

What it will not report is the Bluetooth codec: LDAC or aptX is not exposed to
ordinary apps.

## Built against a pinned release

The API client is generated from Tapedeck's OpenAPI document at a named
release, currently v0.120.0. The spec is committed with the app, so moving to a
new Tapedeck release shows up in review as a diff of the API, and a release
that adds a response shape the client cannot decode stops the build rather
than shipping a model that fails on every response.

The source is on [Codeberg](https://codeberg.org/abksh/tapehead), under
AGPL-3.0.
