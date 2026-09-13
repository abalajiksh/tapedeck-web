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
- **Loves, from your star ratings.** Rate a track past the threshold and
  Tapedeck loves it, and mirrors that out to Last.fm and ListenBrainz. Drop the
  rating and the love is withdrawn.

It runs alongside your other scrobbling services rather than replacing them.

### It follows the deck's rule for when a listen counts

Half the track or four minutes is only the *default*. It has been a per-user
setting in Tapedeck for a long time, because that convention fits a three-minute
pop song far better than a forty-minute raga — and until recently no scrobble
client could learn the number, so every one of them hardcoded Last.fm's
convention and silently disagreed with the setting.

Tapeout reads it and obeys it. That is not tidiness. Tapedeck applies the same
threshold in reverse to decide what was a **skip**, so a client that submits
later than the rule banks a listen *and* leaves a skip behind it, and one that
submits earlier writes a listen the listener's own setting says never happened.

### Two things that come out of your files

Both are **off by default** and both need a token with the `write` scope.

- **Lyrics** — embedded tags and `.lrc` sidecars, offered as the track starts,
  so the words are there without waiting on Tapedeck's LRCLIB backfill. They are
  your tagging of the pressing you actually played, and anything you corrected
  in Tapedeck is never overwritten: the route refuses to write over an edited
  row.
- **Cover art** — the embedded front cover, original bytes, for records Tapedeck
  has no artwork for. Tapeout asks first and reads the file only if the answer
  is no, so the common case costs one small request rather than a megabyte of
  JPEG.

Tapedeck grew the two routes these need in **0.115.0**. Against an older deck
each ticked box costs a 404 per track and nothing worse.

## Requirements

fooyin 0.12.6 or newer **and its development files**, Qt 6.4+, CMake 3.19+ and a
C++23 compiler.

Any Tapedeck will take the listens, but three versions matter: **0.114.0** is
where the last of the MusicBrainz ids stopped being dropped on arrival,
**0.115.0** added the lyrics and cover-art routes, and **0.115.1** added the
endpoint that reports the scrobble threshold. **0.115.1 or newer** gets all of
it.

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

Everything lives on one page: **fooyin → Settings → Integrations → Tapedeck**.
Tick **Enabled**, enter your Tapedeck address, and then take the short path.

**Pair, don't paste.** Press **Pair…**, and fooyin shows a short code you
approve in Tapedeck under Settings → Connections. The token arrives already
carrying `submit read write` — every scope the plugin can use. A token minted by
hand cannot have scopes added to it later, which is how a hand-pasted one ends
up quietly unable to send loves. Pasting a `submit` token and pressing **Test**
still works; **Test** reports who the token belongs to, which Tapedeck it
reached, and warns about missing scopes rather than leaving you to find out from
a 403.

Nothing is submitted until **Enabled** is ticked, so a passing **Test** alone
will not produce listens.

Each thing Tapeout contributes is its own switch, so you can send the listens
without the hardware detail if you would rather. **Signal chain** is a picker fed
from the chains you actually have, not a free-text field — leave it unset and
Tapedeck resolves the chain from the output device, which is the arrangement
worth having.

**Preview current track** submits what is playing as a dry run: Tapedeck
resolves everything, stores nothing, and reports your quality score, **which
rung of the chain ladder won**, whether the listen would be forwarded onward,
and whether it would be deduplicated. None of that is visible from an ordinary
successful submit, which is why guessing at a chain was the old way to get it
wrong.

The token is stored in plaintext in `~/.config/fooyin/fooyin.conf`, the same way
fooyin's own scrobbler stores its credentials.

**Turn fooyin's built-in ListenBrainz service off** if it points at the same
Tapedeck instance. Both submit the same listen at the same timestamp, Tapedeck
deduplicates them, and whichever arrives second is dropped — so leaving both on
risks discarding the richer payload.

## What Tapedeck does with it

Everything Tapeout sends is now stored. That took work on the Tapedeck end:
until **0.114.0** the release-group, release-track, work and album-artist ids
were accepted and dropped, and release-group had in fact been parsed and thrown
away for months across three separate sources.

The last three of those only ever come from a tagging client — no media server
surfaces them and no backfill goes looking — so on any other source they are
not late, they are unavailable. **Work** is the one that repays the most:
one composition spans dozens of recordings by different performers, and nothing
else relates them.

Tapeout omits an empty id rather than sending a blank, so a missing field always
means "not tagged", never "tagged empty". Nothing backfills listens submitted
before 0.114.0 — the ids were never written, so there is nothing to recover.

Loves are the one thing Tapeout deliberately does *not* reconcile at startup. A
love can also come from Tapedeck's own UI or from a Last.fm pull, and a bulk
pass would read every one of those as unstarred in fooyin and take it away. It
reacts to ratings you change while fooyin is running; star a track again if you
want an existing rating pushed.

## Licence

MIT. Note that fooyin itself is GPL-3.0, so a *distributed binary* of the plugin
is a combined work and is effectively GPL-3.0; the source is MIT.
