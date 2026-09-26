#!/usr/bin/env node
/**
 * One command for both accessibility gates (ticket 24): build, serve the
 * production build, run axe (Playwright) and Lighthouse, then report.
 *
 * Serving choice: the Vite preview server (what `pnpm preview` runs) rather
 * than the Vercel CLI. adapter-vercel leaves the SvelteKit server output in
 * `.svelte-kit/output`, which is exactly what Vite preview serves, so the built
 * app runs locally without the Vercel runtime. Set A11Y_BASE_URL to audit an
 * already-running server instead.
 */
import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

const PORT = String(process.env.A11Y_PORT ?? 4173);
const EXTERNAL_BASE_URL = process.env.A11Y_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`;
const PROFILE_PEPPER = process.env.PROFILE_PEPPER ?? 'a11y-local-pepper';

/** Run a child to completion, forwarding its output; return its exit code. */
function run(command, args, env) {
	const result = spawnSync(command, args, {
		stdio: 'inherit',
		env: { ...process.env, ...env }
	});
	return result.status ?? 1;
}

async function waitForServer(url, timeoutMs = 60_000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// not up yet
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`the server at ${url} did not answer within ${timeoutMs}ms`);
}

let server = null;
let axeStatus = 1;
let lighthouseStatus = 1;

try {
	if (!EXTERNAL_BASE_URL) {
		const buildStatus = run('pnpm', ['build']);
		if (buildStatus !== 0) throw new Error('the build failed, so there is nothing to serve');

		// Detached so the whole process group can be stopped below. Vite runs
		// directly (no `pnpm preview` wrapper): a pnpm grandchild would survive
		// the kill and keep holding the port.
		server = spawn(
			process.execPath,
			['node_modules/vite/bin/vite.js', 'preview', '--port', PORT, '--strictPort'],
			{
				stdio: 'inherit',
				// Preview is a production build: the throwaway pepper satisfies
				// the same check, and A11Y_MEMORY_STORE is the explicit opt-in
				// that lets it use the in-process store without Atlas (ticket 32).
				env: { ...process.env, PROFILE_PEPPER, A11Y_MEMORY_STORE: '1' },
				detached: true
			}
		);
	}

	await waitForServer(`${BASE_URL}/privacy`);

	axeStatus = run('pnpm', ['exec', 'playwright', 'test'], {
		A11Y_BASE_URL: BASE_URL,
		PROFILE_PEPPER
	});
	lighthouseStatus = run(process.execPath, ['scripts/a11y/lighthouse.mjs'], {
		A11Y_BASE_URL: BASE_URL
	});
} catch (error) {
	console.error(`a11y: ${error instanceof Error ? error.message : error}`);
} finally {
	if (server?.pid) {
		try {
			process.kill(-server.pid, 'SIGTERM');
		} catch {
			// already gone
		}
	}
}

const results = [
	['axe (WCAG 2.2 AA)', axeStatus === 0],
	['Lighthouse accessibility', lighthouseStatus === 0]
];
console.log('\nAccessibility gates:');
for (const [name, passed] of results) {
	console.log(`  ${passed ? 'PASS' : 'FAIL'}  ${name}`);
}

process.exitCode = results.every(([, passed]) => passed) ? 0 : 1;
