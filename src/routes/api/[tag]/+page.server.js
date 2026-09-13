import { error } from '@sveltejs/kit';
import { getTag, listTags, specInfo } from '$lib/openapi.server.js';

// Tell the prerenderer which tags exist. The index links to every one of them,
// so this is belt and braces — but an undeclared tag reaching the listing by a
// different route later should not 404, and this is what guarantees it.
export function entries() {
	return listTags().map((t) => ({ tag: t.slug }));
}

export function load({ params }) {
	const tag = getTag(params.tag);
	if (!tag) error(404, 'No such API area');

	return {
		tag,
		version: specInfo().version,
		siblings: listTags()
	};
}
