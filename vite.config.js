import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			// Screenshots live in the plugin registry folders, which sit outside
			// the paths SvelteKit puts on the dev server's allow list by default.
			// The production build fingerprints them into `_app/immutable` and
			// never asks the dev server for anything, so this only exists to stop
			// `bun run dev` serving a 403 where the built site serves the image.
			allow: ['plugins']
		}
	}
});
