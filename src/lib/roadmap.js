/** Prose lists for the Plugins page. These are narrative, not registry entries —
 *  they have no repo, no install and no detail page, so they stay as data rather
 *  than earning a folder under /plugins. */

export const APPS = [
	{ name: 'macOS', status: 'planned', body: 'A client for your deck, or a standalone instance on that machine. Same UI, same data model.' },
	{ name: 'Windows', status: 'planned', body: 'As above — the desktop apps share one core rather than each reimplementing the screens.' },
	{ name: 'Apple TV', status: 'planned', body: 'For the room the hi-fi is actually in. Reading the deck, the shelf and the reports on a screen across the room.' },
	{ name: 'Fire TV', status: 'planned', body: 'The same, on the other box people have under the television.' },
	{ name: 'Android', status: 'planned', body: 'History, barcode scanning onto the shelf, and direct scrobbling with the output device attached.' },
	{ name: 'Docker', status: 'dev', body: 'A container image for the server, for hosts the Linux packages do not cover — and for anyone who would rather run a container than a service.' }
];

export const ROADMAP = [
	{ status: 'dev', title: 'Docker deployment', body: 'A published container image. The Linux packages already spare openSUSE, Fedora, Debian, Ubuntu and Arch a Rust toolchain; this is for everywhere else.' },
	{ status: 'dev', title: 'Audio analysis plugin', body: 'Multidimensional features from real files, via Plex, Jellyfin and the OpenSubsonic API — replacing the Every Noise placeholder behind the Genre Map and Playlist Lab.' },
	{ status: 'dev', title: 'Player plugins', body: 'fooyin (Tapeout) works today on Fedora and wants reports from other platforms, a Navidrome plugin is under way, SONE for TIDAL on Linux is queued.' },
	{ status: 'planned', title: 'Android app', body: 'Browse, scan a barcode onto the shelf, and scrobble directly — contributing the one thing only Android can: which output device the audio actually left through.' },
	{ status: 'planned', title: 'Desktop and TV apps', body: 'macOS, Windows, Apple TV and Fire TV — each usable as a client or as a standalone instance, with users and secrets shared between instances and the self-hosted server as the source of truth.' },
	{ status: 'planned', title: 'Federating outward', body: 'Actors, WebFinger, outbox and a signature-verifying inbox already serve. Sending is what remains, and identity has to be right before anyone caches a copy of it.' },
	{ status: 'planned', title: 'Spotify as a source', body: 'OAuth and a recently-played backfill. Its history endpoint reports when a track ended, so the duration has to be subtracted on read.' },
	{ status: 'planned', title: 'Network streamers', body: 'One discovery layer over SSDP/UPnP AVTransport, OpenHome, Google Cast and vendor APIs — so a streamer works because open protocols are supported, not because someone wrote a driver for that exact box.' }
];
