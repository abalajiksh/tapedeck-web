/* The public demo's shared login, and the house rules for it.
 *
 * These are deliberately in one file: the account lives on the demo server and
 * is created by hand there, so when it is rotated this is the only thing the
 * site has to change. Nothing here is a secret — the whole point is that
 * everyone gets the same one — but it is still the admin account, which is why
 * RULES says so first and loudest.
 */

export const DEMO_URL = 'https://demo.tapedeck.cc';

export const ACCOUNT = {
	username: 'demo',
	password: 'platter-tape-reel-3083'
};

/* The time the whole database is dropped and rebuilt, as the server runs it.
 * The timer names the zone rather than an offset, so it stays 02:00 local
 * through both CET and CEST — which is why this does not say "CET". */
export const RESET_AT = '02:00 Berlin time';

export const RULES = [
	{
		n: 1,
		tone: 'warn',
		title: 'Never connect an account of yours to this login',
		body: "It is the admin account and everybody who opens this page gets it. A Last.fm or ListenBrainz token you paste into it, or a Plex, Navidrome, Jellyfin or Emby password, is handed to every stranger reading the same page — and listens would be forwarded to your real public record under a session you don't control.",
		body2:
			'Nothing on the demo needs a credential of yours to be worth looking at: it already holds years of listening, a shelf, chains, notes and reports.'
	},
	{
		n: 2,
		tone: 'do',
		title: 'Make your own account and use that',
		body: 'Settings → Users → Add user, as the admin, then sign in as the one you made. Its history, chains, loves and liner notes are yours alone — isolation per user is a real feature here rather than a courtesy, so this is also the honest way to see it working.',
		body2:
			'If you want to connect something of your own to try the scrobble proxy, connect it there, on an account only you have the password to — and remember it is still a public server.'
	},
	{
		n: 3,
		tone: 'do',
		title: 'When you are done, just leave it',
		body: `There is nothing to clean up and nothing to delete. The whole database is dropped and rebuilt from the seed every night at ${RESET_AT}, so your account, your listens and anything you connected are gone by morning.`,
		body2:
			'Which also means a demo you come back to tomorrow is the one everybody else sees — if you broke something, it fixed itself overnight.'
	}
];

export const NOTES = [
	[
		'It is the real binary',
		'Not a mock-up and not a video. The same package the install page gives you, running on a passively-cooled Raspberry Pi Zero 2 W with 512 MB of RAM — which is the hardware claim being demonstrated as much as the software is.'
	],
	[
		'It is a public server',
		"Treat everything you type into it as public, because it is. Don't paste a token, a password, an API key or anything else you would not put on a web page."
	],
	[
		'Admin screens are live',
		'Users, sources, connections, the operations log and the backup endpoint all work, because an admin account that could not reach them would be a tour rather than a demo. The nightly reset is what makes that safe to offer.'
	]
];
