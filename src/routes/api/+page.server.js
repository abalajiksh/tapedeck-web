import { specInfo, listTags, listOperations } from '$lib/openapi.server.js';

// Build time only. The spec is vendored at spec/openapi.yaml, so this touches
// no network — see spec/README.md for why it is a copy rather than a fetch.
export function load() {
	return {
		info: specInfo(),
		tags: listTags(),
		operations: listOperations()
	};
}
