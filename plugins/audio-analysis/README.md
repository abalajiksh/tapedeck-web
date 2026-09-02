The Genre Map and Playlist Lab today are built on
[Every Noise at Once](https://everynoise.com), which places **artists**. That is
a real map and a useful one, but it means every track by one artist shares the
same six sound coordinates — the four listening axes are all that separate them.
Tapedeck says so rather than dressing it up as per-recording audio analysis.

It is a placeholder. This plugin is the replacement.

## How it works

The plugin sits **beside your library** — reachable through Plex, Jellyfin or
the OpenSubsonic API — and computes multidimensional features from the actual
audio files. The server keeps the coordinates; the plugin does the decoding,
near the files, where the bandwidth already is.

## Where the coordinates come from

| | |
| --- | --- |
| **Today** | Six axes from Every Noise, through the artist. Four from your own listening — era, familiarity, hour of day, recency. |
| **Next** | Per-recording features computed from the file itself, via a plugin sitting beside your Plex, Jellyfin or OpenSubsonic library. |

When it lands, a track gets its own position rather than inheriting its
artist's, and "similar" stops meaning "by someone adjacent".

Tracks with no place on the map are dropped and counted, never parked in the
middle. That rule survives the change.
