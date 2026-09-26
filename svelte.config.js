import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// Pinned rather than inferred: the local toolchain runs Node 26, which Vercel's
			// runtime list does not include. Ticket 06 needs the Node.js runtime (the MongoDB
			// driver cannot run on Edge).
			runtime: 'nodejs22.x'
		})
		// Region co-location with MongoDB Atlas is pinned in vercel.json
		// ("regions": ["fra1"] — Frankfurt), not here (ticket 12).
	}
};

export default config;
