import { listPlugins, listCategories, STATUS } from '$lib/plugins.server.js';
import { APPS, ROADMAP } from '$lib/roadmap.js';

// Runs at build time only (the route is prerendered), so `marked` and the
// filesystem globbing stay out of the browser bundle.
export function load() {
	return {
		plugins: listPlugins(),
		categories: listCategories(),
		status: STATUS,
		apps: APPS,
		roadmap: ROADMAP
	};
}
