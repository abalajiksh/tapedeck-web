/**
 * The latest released Tapedeck version, read from Codeberg's tag list at build
 * time.
 *
 * Build time rather than in the reader's browser: the site otherwise makes no
 * third-party request (the fonts are self-hosted), and a version chip is not
 * worth handing every visitor's IP to Codeberg for. The cost is that it is only
 * as fresh as the last deploy — see README for how to trigger one on release.
 *
 * Returns null rather than throwing on any failure. A missing version hides the
 * chip; a wrong version is worse than no version, and a Codeberg outage must
 * never fail the build.
 */

const TAGS_URL = 'https://codeberg.org/api/v1/repos/abksh/tapedeck/tags?limit=50';

/** Compare "v1.2.3" style tags numerically, so 0.103.0 sorts above 0.99.0. */
function compareSemver(a, b) {
	const parse = (t) => t.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
	const [aa, bb] = [parse(a), parse(b)];
	for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
		const d = (aa[i] ?? 0) - (bb[i] ?? 0);
		if (d) return d;
	}
	return 0;
}

let cached;

export async function latestVersion() {
	// Prerendering calls this once per page that asks; only fetch once.
	if (cached !== undefined) return cached;

	try {
		const res = await fetch(TAGS_URL, {
			headers: { accept: 'application/json' },
			signal: AbortSignal.timeout(8000)
		});
		if (!res.ok) throw new Error(`Codeberg returned ${res.status}`);

		const tags = await res.json();
		if (!Array.isArray(tags)) throw new Error('unexpected response shape');

		// Codeberg does not return tags in semver order, so sort rather than
		// trusting the first entry.
		const versions = tags
			.map((t) => t?.name)
			.filter((n) => typeof n === 'string' && /^v?\d+\.\d+/.test(n))
			.sort(compareSemver);

		cached = versions.at(-1)?.replace(/^v/, '') ?? null;
	} catch (e) {
		console.warn(`[version] could not read the latest tag, omitting it: ${e.message}`);
		cached = null;
	}
	return cached;
}
