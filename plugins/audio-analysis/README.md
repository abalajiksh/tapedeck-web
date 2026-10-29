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

There is an architecture, argued and written down. **There is no code, no
release and nothing to install**, and the repository is empty. It is listed here
because the Genre Map and Playlist Lab both name it as what comes next, and
because the manifold view is parked until it exists — not because there is
something to try.

Several decisions are still open, and they are the interesting ones: whether the
loudness meters come from Crete or from Essentia, whether one worker can serve
several decks, and whether the work list is everything you have listened to or
the whole library.

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

| Group | Some of what comes out |
| --- | --- |
| **Rhythm** | BPM and its confidence, beat count, onset rate, danceability — by detrended fluctuation analysis, not a model |
| **Tonal** | Key, scale and strength under several profiles, tuning frequency, chord histogram and change rate, dissonance |
| **Spectral** | MFCCs and their covariance, mel and Bark band statistics, centroid, spread, flux, rolloff, flatness, spectral complexity |
| **Structure** | Intro and outro silence, fades, and the effective duration against the one the container claims |
| **Quality** | Clipping runs, DC offset, stereo correlation and width, mono sold as stereo |
| **Dynamics** | Dynamic range, measured by the same code as Crete so the two agree |

Descriptor names follow AcousticBrainz and Essentia's `MusicExtractor` wherever
one corresponds, so results stay comparable with that corpus rather than being
a private vocabulary.

**And an AcoustID fingerprint**, which is the one that pays for itself
immediately: 57% of a real listening history carries no recording MBID, and a
fingerprint is how those tracks get one. That is a metadata win sitting inside
an audio-analysis pass, available because the file is being decoded anyway.

**Fake-lossless detection is deliberately not in this list.** Spectral-cutoff
analysis is AudioCheckr's job — a separate, paused project — and letting this
become a second one by accident is a named risk rather than an oversight.

## A companion, not part of the binary

It is a separate program, and a separate install. The reasons are practical
rather than legal — both Tapedeck and Essentia are AGPL-3.0, so there is no
friction in either direction. What argues against compiling it in is the arm
cross-compile and the engine tick: a Pi 4B running the household instance has
five seconds between ticks, and decoding a record inside that budget is not a
thing to attempt in-process.

Two further rules follow from the same caution. Each file is analysed in **its
own child process**, because FFmpeg and Essentia can abort on a damaged file and
one bad record must not take down the queue. And decoding is **streamed in
blocks** from the first commit: holding a whole track in memory costs about
1.8 GB for ten minutes of 24/192 stereo, which rules out the Pi, a 40-minute
raga, and single-file album images all at once.

## How it talks to the deck

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
album would invalidate every stored result.

It analyses **files**, not recordings. One recording can exist as a FLAC and an
MP3, a 24/96 and a CD master; deciding which file represents the recording is
the deck's join to make, and keeping it out of here is deliberate.

## Where the coordinates come from

| | |
| --- | --- |
| **Today** | Six axes from Every Noise, through the artist. Four from your own listening — era, familiarity, hour of day, recency. |
| **Next** | Per-recording features computed from the file itself, via a companion sitting beside your Plex, Jellyfin or OpenSubsonic library. |

When it lands, a track gets its own position rather than inheriting its
artist's, and "similar" stops meaning "by someone adjacent".

Tracks with no place on the map are dropped and counted, never parked in the
middle. That rule survives the change.
