/* Client setup snippets for the Docs page, transcribed from the design file. */

export const CLIENTS = [
	{
		label: 'Pano Scrobbler',
		name: 'Pano Scrobbler',
		steps: [
			'Settings → Scrobble services',
			'Add a custom ListenBrainz server',
			'URL: http://your-server:8080',
			'Token: your td_ token'
		],
		note: 'This one client covers a Walkman, an Android phone and desktop Linux via MPRIS.',
		code: `Settings
  └─ Scrobble services
       └─ Add custom ListenBrainz
            URL:   http://your-server:8080
            Token: td_…

✓ validate-token returns your username`
	},
	{
		label: 'fooyin',
		name: 'fooyin',
		steps: [
			'Settings → Integrations → Scrobbling → Services',
			'Add a custom ListenBrainz service',
			'URL: http://your-server:8080',
			'Tick Relay listens on that token in Tapedeck'
		],
		note: 'This is the generic path. Tapeout, a native fooyin plugin, now works and sends the decoded format, the output device and real skips as well — see the plugins page. On this path fooyin labels every scrobble it sends as an import, so its listens arrive but go no further until Relay listens is ticked. Leave it off if fooyin already scrobbles to Last.fm directly, or you will get each listen twice.',
		code: `Settings
  └─ Integrations
       └─ Scrobbling → Services
            Add custom ListenBrainz
            URL:   http://your-server:8080
            Token: td_…

Tapedeck → Settings → API Tokens
  ☑ Relay listens`
	},
	{
		label: 'Tapeout',
		name: 'fooyin + Tapeout',
		steps: [
			'Build and install the plugin against fooyin 0.12.6+',
			'Settings → Integrations → Tapedeck',
			'Tick Enabled, paste the URL and a submit token, press Test',
			"Turn fooyin's own ListenBrainz service off"
		],
		note: "The native plugin, and the richer of the two paths: the format fooyin actually decoded, the output device, skips submitted as skips, and the MusicBrainz ids a generic scrobbler drops. Nothing is sent until Enabled is ticked, so a passing Test alone produces no listens. Run only one of the two paths — both submit the same listen at the same timestamp, and the second one in is deduplicated away, which can be the richer one. Working on Fedora 44; other platforms are untested rather than unsupported.",
		code: `Settings
  └─ Integrations
       └─ Tapedeck
            ☑ Enabled
            URL:   http://your-server:8080
            Token: td_…

✓ Test → token valid, scope: submit`
	},
	{
		label: 'curl',
		name: 'Anything that can POST',
		steps: [
			'Mint a token with the submit scope',
			'POST a ListenBrainz-shaped body',
			'Retry on 503 — dedup makes it safe',
			'403 means a missing scope, not a bad token'
		],
		note: "The same path an external client takes is the path the Import screen's paste box uses — there is no parallel code free to drift from the real one.",
		code: `curl -X POST http://localhost:8080/1/submit-listens \\
  -H "Authorization: Token td_…" \\
  -H "Content-Type: application/json" \\
  -d '{"listen_type":"single","payload":[…]}'`
	}
];

export const SUBMIT = `{
  "listen_type": "single",
  "payload": [{
    "listened_at": 1712000000,
    "track_metadata": {
      "artist_name": "Simon & Garfunkel",
      "track_name": "The Sound of Silence",
      "release_name": "Wednesday Morning, 3 A.M.",
      "additional_info": {
        "submission_client": "tapedeck-test",
        "duration_ms": 210000,
        "tapedeck_audio": {
          "format_type": "pcm", "codec": "FLAC",
          "sample_rate": 44100, "bit_depth": 16,
          "channels": 2, "is_lossless": true
        },
        "tapedeck_device": {
          "player_name": "fooyin", "platform": "linux",
          "machine_id": "desktop-001",
          "output_device": "Schiit Mimir"
        },
        "tapedeck_chain": { "chain_id": "desktop-reference" }
      }
    }
  }]
}`;

export const SCOPES = [
	['submit', 'POST /1/submit-listens and nothing else — what every scrobble client holds'],
	['read', 'History, stats, loves, notes, now-playing, chains, gear'],
	['write', 'Loves, notes, and editing or deleting a listen'],
	['all', 'read + write']
];
