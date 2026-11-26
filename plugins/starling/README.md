Starling is a client for your deck, not a second deck: everything it shows comes
from your Tapedeck over its API, and nothing it keeps is the record.

**It was called Tapehead** until October 2026. The repository moved with the
name, to [`codeberg.org/abksh/starling`](https://codeberg.org/abksh/starling);
anything older that says Tapehead means this.

**Status: 0.3.0.** The phone app runs on Android and on iPhone, and the
scrobbler is on Android. There is no signed release to download yet — it is
built from source, and the Android debug build installs beside a release one.
The Fire TV app comes later.

## What it does today

- **Now Rolling** — what is on the deck, on a cassette whose reels turn while it
  plays, with a heart to love it and the words following along underneath;
  today's and this week's counters, the lossless share, and the latest listens.
- **The Shelf** — your records, tapes and discs, each one's sides with their
  tracklists and play counts. **Add one** by scanning the barcode on the sleeve
  (zxing-cpp on Android, the camera's own reader on iPhone) or by typing its
  catalogue number, or its artist and title.
- **Play a record from the phone** — start a side and the phone keeps its clock,
  shows it on Tapedeck's Now Playing, says when the side has finished, records a
  listen for every track, and then offers to turn it over. On Android it carries
  on with the phone locked, as a notification with Pause and Skip; an iPhone
  keeps the side's clock but reports it only while the app is open.
- **History** — every listen, newest first, grouped by day, with covers and
  fidelity badges (FLAC 24/96, AAC, DSD64, Vinyl…).
- **Top Charts** over a week, a month, a year or all time; **Statistics**;
  **Loved**, with un-love and re-love in place; and **Settings** — the account,
  a sign-out that revokes this phone's token, and the licences.

## Signing in

You give it your deck's address, a username and a password, once. It trades that
sign-in for an API token named after the phone, keeps only the token, and never
stores the password. Each device then shows up by name under Settings → API
Tokens on the deck, where it can be revoked on its own.

Plain `http`, a self-signed certificate (trusted once you have checked its
fingerprint) and an optional home-network address, used whenever it answers, are
all supported — because a deck on your own LAN is the normal case, not the
awkward one.

The Fire TV app will pair instead, with a short code approved from the phone or
the web UI, because nobody should type a password with a remote.

## Scrobbling, on Android

Switch it on in Settings → Scrobbling. It needs **notification access**, which
is how Android lets an app see other apps' media sessions; it reads no
notifications. On Android 13 and later, an APK installed from a file has that
switch greyed out until you choose *Allow restricted settings* on Starling's App
info page.

- **You choose the apps.** The first time an app plays music, a notification
  asks whether to scrobble it. Nothing is sent from it until you say yes; a
  listen it finished while you decided is sent then.
- **A listen counts when your Tapedeck says it does** — its own setting (half
  the track or four minutes, by default), read from the server, never hardcoded.
  Only time spent playing counts, and the listen goes as soon as it counts
  rather than at the end of the track, because the server uses the same rule to
  tell a listen from a skip.
- **What is sent**: artist, title, album, length, the player's name and version,
  and the output device. It also announces what is playing, with the playhead,
  so Now Playing shows the right position.
- **The output device is the point.** `AudioDeviceInfo` says which output the
  audio actually left through — a USB DAC, wired headphones, Bluetooth, the
  speaker — which is the device rung of Tapedeck's signal-chain ladder. Map an
  output to a chain once and every listen through it gets that chain.
- **What is not sent, because Android does not expose it**: the codec, sample
  rate or bit depth another app is decoding, and the Bluetooth codec (LDAC,
  aptX, AAC). Starling sends nothing rather than a guess.
- **Offline**, listens wait in a small database on the phone and go when the
  deck can be reached; ones more than a day old are sent as imports, so they are
  stored without being forwarded as if live. Signing out deletes them.
- **Check with the server** (Settings) shows which output and chain the track
  playing now would be filed under, and stores nothing.
- **Using [Pano Scrobbler](/plugins/pano-scrobbler/) too?** Turn off its
  Tapedeck account for the apps Starling handles, or each listen arrives twice.

An iPhone cannot scrobble other apps: iOS does not let one app see what another
is playing. The play-tracking rules and per-app fixes are adapted from
[Pano Scrobbler](https://github.com/kawaiiDango/pano-scrobbler) (GPL-3.0).

## One codebase, three screens

Kotlin Multiplatform with Compose Multiplatform: `:mobile-ui` holds the phone
screens and both platforms draw them, `:core:network` is a Tapedeck API client
generated from the deck's own OpenAPI document, and `:core:designsystem` is the
Organic theme this site uses. The iPhone app is an Xcode project around the
shared framework; Xcode runs Gradle itself to build it.

The API client is generated from a **pinned release** of the spec, committed
with the app, so moving to a newer Tapedeck shows up in review as a diff of the
API — and a release that adds a response shape the client cannot decode stops
the build instead of shipping a model that fails on every response.

No Google Play Services anywhere, so it runs on a Fire TV or a de-Googled tablet
as it does on a phone.

The source is on [Codeberg](https://codeberg.org/abksh/starling), under
AGPL-3.0.
