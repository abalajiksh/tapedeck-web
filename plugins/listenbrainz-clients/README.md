Tapedeck implements the ListenBrainz Core API endpoints a scrobble client
actually exercises, so these three work today with a URL and a token — nothing
Tapedeck-specific to install.

| Client | Covers |
| --- | --- |
| **Web Scrobbler** | Listening in the browser |
| **multi-scrobbler** | An aggregator in front of several sources |
| **mpdscribble** | MPD |

## Setup

Point the client's ListenBrainz API URL at your Tapedeck instance and paste a
token minted in **Settings**. Auth is `Authorization: Token <token>`.

## One token per app

Issue a separate token for each client and give each token a **default signal
chain**. Every listen that arrives on that token inherits the chain, so
attribution costs the client no configuration at all — which matters for clients
that have no field for it in the first place.

## What you don't get

These clients submit the ListenBrainz wire format, which has no field for the
decoded format, the output device or the real signal path. Those arrive only
from a Tapedeck-aware plugin. Quality metadata is never backfilled, so a listen
submitted this way stays untagged on that dimension.
