/** Prose lists for the Plugins page. These are narrative, not registry entries —
 *  they have no repo, no install and no detail page, so they stay as data rather
 *  than earning a folder under /plugins. */

export const APPS = [
	{ name: 'macOS', status: 'planned', body: 'A client for your deck, or a standalone instance on that machine. Same UI, same data model.' },
	{ name: 'Windows', status: 'planned', body: 'As above — the desktop apps share one core rather than each reimplementing the screens.' },
	{ name: 'Apple TV', status: 'planned', body: 'For the room the hi-fi is actually in. Reading the deck, the shelf and the reports on a screen across the room.' },
	{ name: 'Android', status: 'dev', body: 'Starling: Now Rolling, the history, charts and loves, and the shelf — a record scanned on by its barcode, then played from the phone. At 0.3.0 it also scrobbles other apps, carrying the output the audio left through. Built from source; there is no signed release yet.' },
	{ name: 'iOS', status: 'dev', body: 'The same Starling screens on an iPhone, from the same Kotlin Multiplatform code. It keeps a side’s clock and reads everything the Android app does; it cannot scrobble other apps, because iOS does not let one app see what another is playing.' },
	{ name: 'Fire TV', status: 'planned', body: 'Starling again, as its own TV app: what is on the deck and its lyrics, across the room. Pairs with a code, so nobody types a password with a remote.' },
	{ name: 'Docker', status: 'shipped', body: 'Multi-arch images at ghcr.io/abalajiksh/tapedeck, published from every release tag — one for SQLite and one for Postgres, since the backend is fixed when the binary is compiled. For hosts the Linux packages do not cover, and for anyone who would rather run a container than a service.' }
];

export const ROADMAP = [
	{ status: 'dev', title: 'Vafthrudnir, the audio analysis companion', body: 'Rhythm, key, spectrum, structure and dynamics measured from your real files — pure DSP, no machine learning — replacing the Every Noise placeholder behind the Genre Map and Playlist Lab. The library health checker works today, as a service with its own web UI and from the command line, and twelve extractors plus an AcoustID fingerprint run per file. What is left is the part that reaches Tapedeck: storing the results, scheduling them, and handing them to the deck.' },
	{ status: 'dev', title: 'Player and server plugins', body: 'Tapedeck for Navidrome is released and pushing from inside the server; fooyin (Tapeout) works today on Fedora and wants reports from other platforms; SONE for TIDAL on Linux is queued. The gap left in both is transcode detection — neither yet says whether the file was degraded on the way out.' },
	{ status: 'dev', title: 'Starling, the phone app', body: 'At 0.3.0 the phone app runs on Android and iPhone — Now Rolling, the history, charts, loves and the shelf, with a record scanned on by its barcode and played from the phone — and the Android scrobbler contributes the one thing only Android can: which output the audio actually left through. Next are a signed release, then Fire TV. It was called Tapehead until October 2026.' },
	{ status: 'planned', title: 'Radio beyond German public broadcasting', body: "The nine ARD broadcasters work today, over RadioDNS and the stations' own streams. Commercial and worldwide stations are next. And an off-air feeder — RT+ over FM, DL+ over DAB, from an SDR on the Pi — is the exact source the internet stream currently stands in for; the air log already records which source each line came from." },
	{ status: 'planned', title: 'Desktop and Apple TV apps', body: 'macOS, Windows and Apple TV — each usable as a client or as a standalone instance, with users and secrets shared between instances and the self-hosted server as the source of truth.' },
	{ status: 'planned', title: 'Federating outward', body: 'Actors, WebFinger, outbox and a signature-verifying inbox already serve. Sending is what remains, and identity has to be right before anyone caches a copy of it.' },
	{ status: 'planned', title: 'Spotify as a source', body: 'OAuth and a recently-played backfill. Its history endpoint reports when a track ended, so the duration has to be subtracted on read.' },
	{ status: 'planned', title: 'Network streamers', body: 'One discovery layer over SSDP/UPnP AVTransport, OpenHome, Google Cast and vendor APIs — so a streamer works because open protocols are supported, not because someone wrote a driver for that exact box.' }
];
