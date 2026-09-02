Pano Scrobbler is the primary ingest client for Tapedeck, and the inspiration
for a good deal of it. Nothing is installed on the Tapedeck side — it already
speaks the ListenBrainz Core API that Tapedeck implements.

## Setup

1. Mint a token in Tapedeck under **Settings**.
2. In Pano Scrobbler, add a **custom ListenBrainz server** pointing at your
   Tapedeck URL.
3. Paste the token.

That is the whole configuration.

## What it covers

Walkman, Android, and desktop Linux via MPRIS.

## Getting attribution for free

Issue **one token per app** and give each token a default signal chain in
Tapedeck. Listens then arrive already attributed to the right chain, and the
client itself needs no further configuration.
