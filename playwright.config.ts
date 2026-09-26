import { defineConfig, devices } from '@playwright/test';

/**
 * The axe gate (ticket 24). Playwright owns the browser *and* the app under
 * test: `pnpm a11y` builds first and starts the server itself, while running
 * this config directly (`pnpm a11y:axe`) starts it through `webServer` below.
 * The Vite preview server is the right server here — adapter-vercel leaves the
 * SvelteKit build output in place, so the production build is served locally
 * without the Vercel runtime (ticket 24).
 */

const PORT = Number(process.env.A11Y_PORT ?? 4173);
const BASE_URL = process.env.A11Y_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'tests/a11y',
	/* The Lighthouse gate is a separate script, not a Playwright test. */
	testMatch: '**/*.spec.ts',
	timeout: 60_000,
	fullyParallel: true,
	/* A retry that turns a violation green is a lie; failures stand. */
	retries: 0,
	reporter: [
		['list'],
		['json', { outputFile: 'reports/axe.json' }],
		['html', { open: 'never', outputFolder: 'reports/axe-html' }]
	],
	outputDir: 'test-results',
	use: {
		baseURL: BASE_URL,
		trace: 'retain-on-failure',
		/*
		 * Run the suite on the reduced-motion path. Axe samples computed
		 * opacity, and the month screen's 280ms entrance fade would otherwise
		 * be caught mid-animation as a phantom contrast failure; the finished
		 * state is the one that must pass. This also exercises the
		 * `prefers-reduced-motion` promise ticket 14 made.
		 */
		reducedMotion: 'reduce'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		/* Vite's bin directly, not `pnpm preview`: pnpm forks Vite as a
		   grandchild that survives shutdown and holds the port (and the
		   output pipe) open. */
		command: `${JSON.stringify(process.execPath)} node_modules/vite/bin/vite.js preview --port ${PORT} --strictPort`,
		url: `${BASE_URL}/privacy`,
		/* `pnpm a11y` starts the server and Lighthouse reuses it; standalone
		   runs of this config start and stop their own. */
		reuseExistingServer: true,
		timeout: 60_000,
		env: {
			...process.env,
			/* Preview is a production build and refuses to boot without the
			   pepper. Both values are throwaway: the in-process store is
			   opted into explicitly because no MONGODB_URI exists here, and a
			   production build refuses to fall back silently (ticket 32). */
			PROFILE_PEPPER: process.env.PROFILE_PEPPER ?? 'a11y-local-pepper',
			A11Y_MEMORY_STORE: '1'
		}
	}
});
