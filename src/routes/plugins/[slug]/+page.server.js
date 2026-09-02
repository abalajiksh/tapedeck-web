import { error } from '@sveltejs/kit';
import { getPlugin, listPlugins, STATUS } from '$lib/plugins.server.js';

// Tell the prerenderer which slugs exist — without this it would only find the
// ones the listing links to, and a plugin whose card doesn't link inward
// (no README) would silently 404.
export function entries() {
	return listPlugins()
		.filter((p) => p.hasPage)
		.map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const plugin = getPlugin(params.slug);
	if (!plugin || !plugin.hasPage) {
		error(404, 'No such plugin');
	}
	return { plugin, status: STATUS[plugin.status] };
}
