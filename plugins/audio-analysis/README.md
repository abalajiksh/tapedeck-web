**Vafþrúðnir** is the giant Odin travels to see in the *Vafþrúðnismál* to find
out what he does not already know. Spelled `Vafthrudnir` everywhere it has to be
typed.

The Genre Map and Playlist Lab today are built on
[Every Noise at Once](https://everynoise.com), which places **artists**. That is
a real map and a useful one, but it means every track by one artist shares the
same six sound coordinates — the four listening axes are all that separate them.
Tapedeck says so rather than dressing it up as per-recording audio analysis.

It is a placeholder. This is the replacement.

## The state of it, plainly

**Early, and no longer hypothetical.** There is code, it builds, and two of the
three parts work:

- **The library health checker runs.** As a service with its own web UI
  (`vafthrudnir serve`) and from the command line (`scan`, `report`, `check`):
  it keeps an inventory of your library folders in SQLite, notices new, changed,
  deleted and moved files — on Linux as they happen, through inotify, and
  everywhere on a timer — and checks each new or changed one in its own child
  process.
- **The analysis runs per file.** `vafthrudnir analyze FILE` decodes a file once
  and runs twelve versioned extractors plus a Chromaprint fingerprint over it,
  with time series on the file's own timeline.
- **Nothing reaches Tapedeck yet.** Analysis results are not stored, not
  scheduled by `scan` or `serve`, and not sent to a deck. The Genre Map and
  Playlist Lab have not moved, and the manifold view stays parked until they do.

There is no release and no package: you build it, with CMake and a pinned
dependency tree that `deps/deps.sh` fetches, verifies and builds once.

## What it is

A C++ companion that reads your own audio files and produces **per-file,
pure-DSP descriptors** — no machine learning anywhere in it. That is the whole
design constraint rather than a detail: the features come out of signal
processing, so it runs on the kind of hardware Tapedeck itself runs on instead
of demanding a spare desktop. A deck on a Pi Zero 2 W should not need a second
machine with four cores and 8 GB of RAM to find out how its own music sounds.

[AudioMuse-AI](/plugins/audiomuse-ai/) reaches the same goal from the other
direction, with learned audio embeddings and the hardware that implies. It
exists today and Tapedeck can already connect to it; this is the route that asks
nothing extra of your hardware. They are different trades, not competitors.

## What it measures

Twelve extractors, each versioned and each reporting `ok`, `not_applicable` or
`failed` on its own, so one that cannot answer never costs you the other eleven.
The loudness meter runs at the file's own rate over every channel; the rest run
over a 44.1 kHz copy, from [Essentia](https://essentia.upf.edu) plus a few
heuristics of our own.

| Extractor | What it describes |
| --- | --- |
| **loudness** | Crête's meter: TT DR, integrated loudness (BS.1770 / R128), true peak, LRA, PLR, PSR |
| **spectral** | Brightness, spread, flux, roll-off, complexity, Bark and mel bands, spectral contrast, dissonance |
| **timbre** | MFCCs as one Gaussian — mean, covariance, inverse — for KL-style timbre distances |
| **harmonicity** | Inharmonicity, odd/even harmonics, tristimulus, pitch salience, percussive against harmonic energy |
| **onsets** | Onset rates (OnsetRate, SuperFlux) and how sharply onsets stand out |
| **rhythm** | BPM with octave-error correction, beats, BPM histogram, danceability, meter, rhythm transform |
| **tonal** | Tuning, key when three profiles agree, HPCP, chords and their entropy, temperament, NNLS chroma |
| **melody** | How much of the track has a lead line, its range, vibrato, the tonic |
| **stereo** | Width, L/R correlation, balance, panning shape |
| **structure** | Leading and trailing silence, fades, section count, how much sections differ or repeat |
| **arc** | How energy and brightness move from start to end |
| **fingerprint** | The Chromaprint fingerprint of the first 120 seconds, for an AcoustID lookup |

Descriptor names follow Essentia's `MusicExtractor` and AcousticBrainz wherever
one corresponds, so results stay comparable with that corpus rather than being a
private vocabulary. On a desktop x86-64 a four-minute track takes about a
minute, around half of it in `melody`.

**The loudness figures are Crête's**, ported to block processing rather than
reimplemented: `tests/parity/crete.py` agrees with Crête to 1e-6 on mono,
stereo and 5.1 files from 44.1 to 192 kHz. The fingerprint is bit-identical to
`fpcalc` on the files tried. Both scripts are in the repository, to run against
your own files.

**And the fingerprint pays for itself immediately**: 57% of a real listening
history carries no recording MBID, and a fingerprint is how those tracks get
one. That is a metadata win sitting inside an audio-analysis pass, available
because the file is being decoded anyway. (Vafthrudnir never calls AcoustID
itself — it produces the fingerprint and the lookup is the deck's.)

**Time series, not just numbers.** The waveform at 50 Hz and 5 Hz, momentary and
short-term loudness, DR per three-second block, energy and spectral centroid,
onsets, beats with downbeats and local tempo, chord changes, chroma, the key
over 15-second windows, section boundaries and silences — all on the file's own
timeline. `--series OUT` writes them in a compact binary form: about 110 KB for
four minutes.

**Fake-lossless detection is deliberately not in this list.** Spectral-cutoff
analysis is AudioCheckr's job — a separate, paused project — and letting this
become a second one by accident is a named risk rather than an oversight.

## What the health checker finds

The part you can use today, with no deck involved at all.

- **Defective files** — damaged data, a FLAC whose audio doesn't match its
  stored MD5, a file cut short.
- **Warnings** — clipping, dropouts, DC offset, mono stored as stereo, silence.
- **Duplicates**, by an audio hash that is identical for any two files that
  decode to the same audio, whatever their format or their tags.
- **Files it could not check**, kept apart from the ones it checked and passed:
  formats this build cannot decode, and codecs FFmpeg does not recognise at all.

`serve` listens on 127.0.0.1 unless you tell it otherwise, and the first visit
sets the UI's password. It never writes to your library folders.

## A companion, not part of the binary

It is a separate program, and a separate install. The reasons are practical
rather than legal — both Tapedeck and Essentia are AGPL-3.0, so there is no
friction in either direction. What argues against compiling it in is the arm
cross-compile and the engine tick: a Pi 4B running the household instance has
five seconds between ticks, and decoding a record inside that budget is not a
thing to attempt in-process.

Two further rules follow from the same caution, and both are in the code. Each
file is analysed in **its own child process**, because FFmpeg and Essentia can
abort on a damaged file and one bad record must not take down the queue. And
decoding is **streamed in blocks**: holding a whole track in memory costs about
1.8 GB for ten minutes of 24/192 stereo, which rules out the Pi, a 40-minute
raga and single-file album images all at once.

## How it will talk to the deck

This part is designed and not yet built — the description below is the plan, and
nothing in it runs today.

**Vafthrudnir asks for work; Tapedeck never pushes it.** It leases a batch of
jobs, heartbeats the long ones, and submits results as JSON over HTTP. One
mechanism covers every deployment, survives either side restarting, and keeps
the deck's side down to a few indexed queries — which is what matters when the
deck is on a Pi.

Results are written to a local SQLite outbox before they are sent and deleted
only once the deck has acknowledged them, so an upgrade or an outage loses
nothing and re-analyses nothing. Re-running after a crash, a retag or a library
move is free, because results are keyed on a hash of the **decoded audio**
rather than the file's bytes or its path.

**Your media-server credentials never leave Tapedeck.** A job carries the paths
the servers reported — Plex's `Part.file`, Jellyfin's `Path`, Navidrome's
equivalent — and Vafthrudnir rewrites them through its own map to find the file
on disk. Where there is genuinely no shared storage, it streams the bytes
through the deck as a last resort.

That map is per media server, because every party sees a different path for the
same file: a container on a NAS, a deck elsewhere, and Plex reporting its own
view of both. So the deck sends a few real paths, Vafthrudnir searches its
library roots and **proposes** the prefix pair, and an admin confirms it —
preview then apply, the same rule the metadata sanitiser follows. A path that
maps but cannot be read is reported as a permissions problem rather than a
mapping one, because those are different answers and one shrug covering both is
the bug this codebase keeps fixing.

## What it will not do

**Absolute, per-file features only.** Normalisation, dimensionality reduction
and similarity stay in Tapedeck. Anything computed relative to the library goes
stale the moment the library changes, and if Vafthrudnir produced it, every new
album would invalidate every stored result. Nothing it reports is scaled against
the rest of your library, and that is why.

It analyses **files**, not recordings. One recording can exist as a FLAC and an
MP3, a 24/96 and a CD master; deciding which file represents the recording is
the deck's join to make, and keeping it out of here is deliberate.

## Where the coordinates come from

| | |
| --- | --- |
| **Today** | Six axes from Every Noise, through the artist. Four from your own listening — era, familiarity, hour of day, recency. |
| **Next** | Per-recording features computed from the file itself, by a companion sitting beside your library. |

When it lands, a track gets its own position rather than inheriting its
artist's, and "similar" stops meaning "by someone adjacent".

Tracks with no place on the map are dropped and counted, never parked in the
middle. That rule survives the change.
