The Genre Map and Playlist Lab are built on
[Every Noise at Once](https://everynoise.com), which places **artists**. Every
track by one artist therefore shares the same six sound coordinates, and only
the four listening axes separate them. The fix is a vector per *recording*, and
Tapedeck cannot derive one from listens — it reads what your media server
reports about a play, never the audio.

There are two routes to that vector, and they are different trades rather than
competitors.

| | [Audio analysis plugin](/plugins/audio-analysis/) | AudioMuse-AI |
| --- | --- | --- |
| Approach | Pure DSP, no machine learning | Learned audio embeddings |
| Runs on | Low compute, beside your library | 4 cores and 8 GB of RAM |
| Who builds it | First-party | [NeptuneHub](https://github.com/NeptuneHub/AudioMuse-AI), third-party |

This page is the second one. If a spare desktop or NUC is not something you
have, the first-party plugin is the route that will not ask for one.

## What it computes

[AudioMuse-AI](https://github.com/NeptuneHub/AudioMuse-AI) — "amai" — points at
your media server, analyses the files themselves, and works out how each
recording sounds: a 200-dimension embedding, a second 512-dimension one, tempo,
key, scale, energy, a mood vector, and six continuous axes — danceable,
aggressive, happy, party, relaxed and sad.

## What Tapedeck does with it today

**Be clear about this: it is the connection, not a feature.** Settings →
Connections takes an address and an `API_TOKEN` — one connection for the whole
server, admin-only, stored encrypted. What you get is a **Test** button and a
**coverage** measurement. Nothing in Tapedeck reads the vectors yet: not the
Genre Map, not Playlist Lab, not anywhere else.

The measurement is the point, and it is deliberately the first thing built
rather than the last. Everything downstream rests on one number nobody had: how
much of a history can be joined to these vectors at all. It is reported in three
parts, kept separate, because collapsing them produces a figure that flatters
itself.

- **How much of your history could ever be matched.** A listen joins on a
  media-server track id, so one that arrived as a Spotify or Last.fm import has
  nothing to join on, however much gets analysed. On a real history that alone
  can be a third of it.
- **How much has actually been analysed**, across your most-played tracks and
  weighted by plays — a track played fifty times is worth fifty of one played
  once.
- **What share of your listening that sample was**, so the figure above is never
  read as a fact about the whole history.

That number differs enormously between a library streamed from a media server
and one assembled from imports, which is exactly why it decides whether the rest
is worth building.

## The join, and why it is cheap

Both applications talk to your media server independently, so a track id means
the same thing to both. The match is on that id — not on artist and title
strings, and not on MusicBrainz ids, which on a real history are missing from
more than half the listens.

A **Test** button exists because reachable and credentialled are separate
questions here: AudioMuse-AI answers its health check without a token, so a dead
service and a wrong token are distinguishable rather than arriving as the same
red light. They need completely different things doing about them.

## Before you set it up

**It wants 4 cores and 8 GB of RAM**, so it belongs on a desktop or a NUC — not
on the Pi that runs Tapedeck perfectly well. Connecting one changes nothing
about what Tapedeck itself needs: it is a separate application on a separate
machine, reached over HTTP.

**Tapedeck never starts an analysis.** You run that from AudioMuse-AI's own
screen; Tapedeck only reads what it has already worked out.

Unconfigured is a normal state, and everything works without it.
