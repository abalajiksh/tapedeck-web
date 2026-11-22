/* How Tapedeck is tested, for the /quality/ page.
 *
 * Hand-maintained. The numbers here are from one named release rather than
 * "currently", because a figure with no release attached to it goes quietly
 * wrong between deploys and nobody notices. When you update them, update
 * AS_OF in the same edit — a stale number under a current release number is
 * worse than an old release number, which at least tells the reader how old
 * the claim is.
 *
 * Deliberately not here: the spec-fuzzing findings count. It is a real part of
 * the pipeline and it is being worked through, but a raw failure count with no
 * triage behind it reads as either alarming or boastful depending on which way
 * it moved, and neither is informative. It goes on the page when the number
 * means something. */

export const AS_OF = { version: '0.134.0', date: '22 November 2026' };

/** The media lab: real media servers, pinned versions, every release. */
export const LAB_SERVERS = [
	{ name: 'Jellyfin', version: '12.4.0', port: '8096' },
	{ name: 'Emby', version: '4.10.2.0', port: '8096' },
	{ name: 'Plex Media Server', version: '1.43.5', port: '32400' },
	{ name: 'Navidrome', version: '0.64.2', port: '4533' }
];

/** What the lab is actually asked to prove, as opposed to merely exercise. */
export const LAB_CHECKS = [
	{
		title: 'Every listen lands with its owner',
		body: 'Each server has two people on it, each a separate Tapedeck member with a source of their own. A play by one must never appear in the other’s history — which is the kind of thing that works perfectly against a stub and fails against a server that scopes its API differently from how you assumed.'
	},
	{
		title: 'With the format the server read',
		body: 'Not the format the test asked for: the one the server reports having decoded. Codec, sample rate, bit depth, channels and bitrate, per server, across every codec in the library — which is how it came out that one server reports bitrates in bits and another in kilobits, and that a lossy file arrives carrying a bit depth that is its decoder’s output rather than anything in the file.'
	},
	{
		title: 'A track on repeat counts twice',
		body: 'Looping one track is the oldest way to break a scrobbler: the item never changes, so a naive threshold either counts it once or counts it forever. Each server is driven through a loop, a rewind, a pause past the threshold and a skip, and the count has to come out right for all four.'
	},
	{
		title: 'And a skip is not a listen',
		body: 'Skips are stored and never counted — not in a chart, not in a total, and above all not forwarded, because a skip arriving on your Last.fm is a wrong scrobble on a record you cannot correct. The lab plays tracks partway on purpose to check that holds on a real server.'
	}
];

/** The suite itself. */
export const SUITE = [
	['983', 'tests in the SQLite pass, with the real media servers'],
	['884', 'in the Postgres pass, against a throwaway Postgres'],
	['3', 'browsers weekly — Chromium, Firefox and WebKit']
];

export const LAYERS = [
	{
		kicker: 'Every pull request',
		title: 'A throwaway instance, built from your change',
		body: 'The guard starts the branch in a disposable container, runs the smoke suite against it, reports which database migrations the change adds, and checks the house rules as machine-readable patterns rather than as a style document nobody rereads. A failure closes the pull request with the reason attached, so nothing waits on a human to notice.'
	},
	{
		kicker: 'Every release',
		title: 'The whole suite, both databases, real servers',
		body: 'Not a subset and not a smoke test: every end-to-end test, on SQLite and on Postgres, with the media lab in the loop. The release does not go out until all of that is green, and a failure there stops the tag rather than being noted and shipped anyway.'
	},
	{
		kicker: 'Every release',
		title: 'And on the hardware it claims to run on',
		body: 'The arm64 build is cross-compiled and then actually started on a Raspberry Pi, where a release tag runs the suite as well. A binary that builds for ARM and will not run on one is not a port.'
	},
	{
		kicker: 'Every week',
		title: 'Three browsers, and the unit tests twice',
		body: 'The weekly run puts the interface through Chromium, Firefox and WebKit rather than only Chromium, and runs the Rust tests for both database builds plus the ones that need a live Postgres. Most of what it finds is in the tests rather than the product, which is the point of running it separately from the gate.'
	},
	{
		kicker: 'Continuously',
		title: 'And the code read by things that are not me',
		body: 'Static analysis on every change, dependency and container scanning that files what it finds as issues rather than printing it into a log, and the API description checked against the running server’s actual answers. One person writing this needs more readers than one person can be.'
	}
];

/** The honest part. A testing page that only lists what passes is advertising. */
export const LIMITS = [
	{
		title: 'Roon has no real server behind it',
		body: 'It is the one source still built from declared types and vendored documentation. There is no Roon Core in the lab, and until there is, its card on the Features page says untested and means it.'
	},
	{
		title: 'The lab tests playback, not ratings',
		body: 'Turning a server’s star ratings into loves is verified end to end on Navidrome only. The Plex, Jellyfin and Emby walks are pinned by tests against captured responses — which is better than nothing and is not the same as having been run.'
	},
	{
		title: 'Pinned versions are a snapshot',
		body: 'The lab runs one version of each server, and a media server can change its API in a point release. The weekly run is what is meant to catch that, and a version newer than the one listed here has not been tested until the lab moves to it.'
	},
	{
		title: 'A green suite is not a correct program',
		body: 'Everything on this page describes what has been checked. The list of things known to be wrong and not yet fixed is kept on the pages that make the claims — the limits at the foot of the home page, and the status on every source and plugin.'
	}
];
