import { latestVersion } from '$lib/version.server.js';

// Build time only. Keeps the sample MUSICBRAINZ_USER_AGENT from naming a
// version that shipped years ago.
export async function load() {
	return { version: await latestVersion() };
}
