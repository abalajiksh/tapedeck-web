import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			// Screenshots live in the plugin registry folders, and the vendored
			// OpenAPI document in spec/ — both sit outside the paths SvelteKit
			// puts on the dev server's allow list by default. The production
			// build inlines or fingerprints them and never asks the dev server
			// for anything, so this only exists to stop `bun run dev` serving a
			// 403 where the built site serves the file.
			allow: ['plugins', 'spec']
		}
	}
});
