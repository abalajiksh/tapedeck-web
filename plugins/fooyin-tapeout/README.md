fooyin is a Qt music player with a plugin API that exposes the decode path —
which is exactly the part a scrobble normally loses. `fooyin-tapeout` is a
native Tapedeck plugin that reads it and submits it with the listen.

## Status

In development, and **not yet tested**. It is listed here because the work is
underway, not because there is a release to install.

In the meantime fooyin scrobbles to Tapedeck today over the generic
ListenBrainz path: point fooyin's ListenBrainz scrobbler at your Tapedeck URL
and paste a token. You get the listen; you don't get the fields below.

## What it adds over the generic path

- **The decoded format** — the codec, bit depth and sample rate fooyin actually
  decoded, rather than what a filename implies. Tapedeck cannot recover this
  after the fact: a listen that arrives without `tapedeck_audio` stays
  permanently untagged.
- **The output device** — which sink the audio left through.
- **Chain tagging** — enough device identity for the signal-chain ladder to
  resolve the physical playback path rather than guessing.
