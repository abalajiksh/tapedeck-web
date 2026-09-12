/* Source, format and reliability copy for the Features page, transcribed from
   the design file. */

export const SOURCES = [
	{
		name: 'Plex',
		status: 'Tested',
		ok: true,
		body: 'Polled directly — no webhooks, no Plex Pass — with live Now Playing on the dashboard and a scrobble threshold that is yours: half the track or four minutes by default, changed in Settings and pushed to running sources without a restart.',
		body2: 'Plex also keeps a play history, and Tapedeck walks it. That catches plays that finished between polls, and it pages back rather than reading one screenful — a source unreachable for an hour catches up instead of losing the gap.',
		facts: [
			['Backfill', 'Yes — walks Plex history, paged'],
			['Audio quality', 'From session metadata'],
			['Device → chain', 'Yes'],
			['MusicBrainz IDs', 'From the library where present']
		]
	},
	{
		name: 'Navidrome',
		status: 'Tested',
		ok: true,
		body: 'Signs in as you and pulls your play history — Navidrome keeps its own, so this backfills listens from before Tapedeck existed and then keeps up live.',
		body2: "Uses both of Navidrome's APIs: the native one for history and Subsonic for now-playing. Subsonic hashes password plus salt on every request, so it needs the account password rather than a token — encrypted at rest like every other stored credential.",
		facts: [
			['Backfill', 'Yes — native history API'],
			['Audio quality', 'Partial'],
			['MusicBrainz IDs', 'Yes, from your library'],
			['Known gap', 'Artist portraits not wired']
		]
	},
	{
		name: 'Jellyfin',
		status: 'Tested',
		ok: true,
		body: 'Polled on the shared media-browser client, with live now-playing and your own scrobble threshold. Cover art comes from the exact file that was played, proxied by Tapedeck so the browser never holds LAN credentials.',
		body2: 'Jellyfin keeps no history a scrobbler can read, so its listens start from when you connect.',
		facts: [
			['Backfill', 'No — starts from connection'],
			['Audio quality', 'From session metadata'],
			['Device → chain', 'Yes'],
			['Artist portraits', 'Wired']
		]
	},
	{
		name: 'Emby',
		status: 'Untested',
		ok: false,
		body: 'Jellyfin is a 2018 fork of Emby, so they are one protocol with an /emby/ prefix and Tapedeck drives both from one client. But Emby has developed independently for seven years and this source has never run against a real server.',
		body2: 'The fields at risk fail silently rather than erroring: if Emby spells them differently you get listens with no codec, no device and no MusicBrainz IDs, with nothing in the log to say so. A captured /emby/Sessions response is what would close it for good.',
		facts: [
			['Backfill', 'No'],
			['Confidence', 'Built from docs and a reference'],
			['Risk', 'Silent field-name mismatch'],
			['What would fix it', 'One captured session response']
		]
	},
	{
		name: 'Roon',
		status: 'Untested',
		ok: false,
		body: 'A source of its own rather than a streamer driver: one Core owns many zones, which makes it server-shaped like Plex. It is the only way to see RAAT playback, which no other protocol exposes.',
		body2: "Two limits of the API, not of Tapedeck: it carries no signal path — the Lossless / High Quality verdict stays inside Roon's own client — and no MusicBrainz IDs or structured metadata, only rendered display strings. A Roon listen holds less detail than a Plex one.",
		facts: [
			['Setup', 'Enable the extension in Roon'],
			['Credential', 'Roon issues its own'],
			['Metadata', 'Display strings only'],
			['Signal path', 'Not exposed by the API']
		]
	},
	{
		name: 'Scrobble clients',
		status: 'Tested',
		ok: true,
		body: 'Anything speaking the ListenBrainz Core API: Pano Scrobbler across Walkman, Android and desktop Linux via MPRIS; Web Scrobbler; multi-scrobbler; mpdscribble; fooyin — which also has a native plugin, Tapeout, that carries the decoded format and the output device the generic path has no field for.',
		body2: 'Issue one token per app and give each a default chain — attribution then costs the client no configuration at all, and the chain can be repointed later without re-issuing the credential.',
		facts: [
			['Setup', 'A URL and a td_ token'],
			['Extended fields', 'Quality, device, chain, session'],
			['fooyin note', 'Tapeout is the native path; the generic one needs Relay listens'],
			['Scope needed', 'submit']
		]
	}
];

export const FORMATS = [
	{ label: 'DSD128', base: 95 },
	{ label: 'DSD64', base: 92 },
	{ label: 'FLAC 24/192', base: 90 },
	{ label: 'FLAC 24/96', base: 85 },
	{ label: 'FLAC 16/44.1', base: 80 },
	{ label: 'AAC 256', base: 55 },
	{ label: 'MP3 320', base: 52 }
];

export const LINKS = [
	{ label: 'Wired / USB', pen: 0, note: 'Nothing between the file and the DAC.' },
	{
		label: 'LDAC 990k',
		pen: -8,
		transcode: true,
		note: 'Bluetooth at its best still re-encodes, and the penalty says so.'
	},
	{ label: 'aptX', pen: -11, transcode: true, note: 'A lossy link on top of whatever the file was.' },
	{
		label: 'SBC',
		pen: -15,
		transcode: true,
		note: "The worst common case — this is the one people don't notice happening."
	},
	{
		label: 'Transcoded to AAC',
		pen: -10,
		transcode: true,
		note: "Your server decided the client couldn't take the original."
	}
];

export const RELIABILITY = [
	{
		title: 'Durable ingest',
		body: "Listens are written to SQLite — WAL mode with a busy timeout, so concurrent writers wait rather than error — before the API returns. If one can't be persisted, submit-listens returns a retryable 503 and dedup makes the retry safe."
	},
	{
		title: 'At-least-once forwarding',
		body: "Each pending listen tracks which sinks have accepted it, so a retry only re-sends to the ones that haven't. A flaky Last.fm won't get duplicates because ListenBrainz was down."
	},
	{
		title: "One dead service can't stall the rest",
		body: 'Retries are budgeted separately for rate-limited and unreachable, and after three consecutive failures a service is skipped until a single probe finds it back. The flush is bounded against the poll tick.'
	},
	{
		title: 'Graceful shutdown',
		body: "On SIGTERM the HTTP server drains in-flight requests, then the poll engine finishes its tick and exits. Even a hard SIGKILL can't corrupt the database; pending scrobbles resume on restart."
	},
	{
		title: 'Backups you can take while running',
		body: 'A consistent VACUUM INTO snapshot of the whole database from the Settings screen or one endpoint, plus /health for uptime monitoring and admin-only Prometheus metrics.'
	},
	{
		title: 'Login throttling',
		body: 'Repeated failed logins from an IP are rate-limited — eight tries in five minutes with Retry-After on block — to blunt online guessing. Argon2 already makes each attempt expensive.'
	}
];
