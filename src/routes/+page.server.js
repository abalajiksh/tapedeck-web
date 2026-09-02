import { latestVersion } from '$lib/version.server.js';

// Runs at build time only — the route is prerendered.
export async function load() {
	return { version: await latestVersion() };
}
