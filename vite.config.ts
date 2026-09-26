import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		// Ticket 07's strategy: the URL wins, the cookie keeps a choice, the
		// browser's preference breaks ties, and `en` is the floor. Generated
		// output is gitignored and rebuilt on install, check and build.
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale']
		})
	],
	test: {
		include: ['src/**/*.test.ts']
	}
});
