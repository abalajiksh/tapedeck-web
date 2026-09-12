fooyin is a Qt music player with a plugin API that exposes the decode path —
which is exactly the part a scrobble normally loses. `fooyin-tapeout` is a
native Tapedeck plugin that reads it and submits it with the listen.

fooyin's built-in scrobbler can already point at Tapedeck, because Tapedeck
speaks ListenBrainz. Tapeout exists for everything that wire format has no
field for.

## Status

**Early, but working.** Listens, skips, now-playing and the offline queue have
all been exercised against a real fooyin 0.12.6 and a live Tapedeck — including
a queue that survived an unreachable server and a restart and replayed with its
original timestamps intact, a track queued twice scrobbling twice, and
repeat-one scrobbling once per loop.

That is on **one configuration: Fedora 44 (Sway), x86-64**. fooyin itself ships
BSD, Debian, Windows and ARM builds, and Tapeout uses nothing beyond Qt and
fooyin's own APIs, so it should be portable — but none of that is verified.
Treat other platforms as untested rather than unsupported.

## What it adds over the generic path

- **Audio quality as fooyin actually decoded it** — codec, container, sample
  rate, bit depth, channels, lossless. fooyin is the decoder, so this is
  measured rather than inferred from a filename. Tapedeck cannot recover it
  after the fact: a listen that arrives without it stays permanently untagged.
- **The output device**, which Tapedeck learns and binds to a signal chain.
  Switch from speakers to a headphone DAC and the chain follows, without
  restating it per listen.
- **Skips, submitted as skips.** Tapedeck stores them and excludes them from
  every count.
- **The MusicBrainz ids a generic scrobbler drops** — recording, release,
  release-group, release-track, **work** and artist/album-artist, plus ISRC,
  wherever the file carries them. The work id is the one that ties every
  performance of the same piece together, which matters most for classical.

It runs alongside your other scrobbling services rather than replacing them.

## Requirements

fooyin 0.12.6 or newer **and its development files**, Qt 6.4+, CMake 3.19+ and a
C++23 compiler.

Fedora packages the headers as `fooyin-devel` in the official repositories. No
other distribution currently packages fooyin at all — its `.deb`, AppImage,
Flatpak, FreeBSD and Windows builds ship the application and no headers — so
everywhere else you have to build fooyin from source first. Flatpak and AppImage
installs cannot load third-party plugins at all: one is sandboxed under its own
prefix, the other is a read-only image.

```bash
cmake -B build && cmake --build build
sudo cmake --install build
```

`sudo` is needed because fooyin's CMake config hardcodes the plugin directory to
an absolute path under fooyin's *own* prefix, and fooyin has no per-user plugin
directory to install into instead. `cmake --install` always gets the path right
because it reads it from fooyin's config.

The plugin is ABI-coupled to fooyin and nothing catches a mismatch at load time,
so rebuild it whenever fooyin is upgraded.

Full build instructions, including the Debian and Ubuntu path, are in the
[repository README](https://github.com/abalajiksh/fooyin-tapeout#building).

## Setting it up

**fooyin → Settings → Integrations → Tapedeck.** Tick **Enabled**, enter your
Tapedeck address and a token with the `submit` scope, then press **Test**.
Nothing is submitted until **Enabled** is ticked, so a passing **Test** alone
will not produce listens.

The token is stored in plaintext in `~/.config/fooyin/fooyin.conf`, the same way
fooyin's own scrobbler stores its credentials.

**Turn fooyin's built-in ListenBrainz service off** if it points at the same
Tapedeck instance. Both submit the same listen at the same timestamp, Tapedeck
deduplicates them, and whichever arrives second is dropped — so leaving both on
risks discarding the richer payload.

## What Tapedeck does with it, and what it doesn't yet

Tapeout sends more than Tapedeck currently stores. Recording, release and artist
ids land. The **release-group, release-track, work and album-artist ids are
columns being added to Tapedeck right now** — until that lands they are
submitted and dropped on the floor. That is a Tapedeck gap rather than a plugin
one, and release-group is the one worth waiting for: it is what groups a
reissue, a remaster and a regional edition into a single release.

Tapeout omits an empty id rather than sending a blank, so a missing field always
means "not tagged", never "tagged empty".

## Licence

MIT. Note that fooyin itself is GPL-3.0, so a *distributed binary* of the plugin
is a combined work and is effectively GPL-3.0; the source is MIT.
