import AxeBuilder from '@axe-core/playwright';
import { test as base, expect, type Page } from '@playwright/test';
import type { RunState } from '$lib/game/types';

/** WCAG 2.2 AA, the tag set axe itself documents for that level. */
export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * The layout stamps `data-hydrated="true"` on `<html>` once the client has
 * mounted. Until then the server HTML is visible but inert: a click or keypress
 * lands on markup with no Svelte listener attached, and the interaction is
 * silently lost. Every test must wait for this before touching the page.
 */
export async function waitForHydration(page: Page) {
	await page.waitForFunction(() => document.documentElement.dataset.hydrated === 'true');
}

/**
 * The suite's `test`, with hydration-aware navigation: every explicit
 * `page.goto()` resolves only after the document has hydrated, so no test —
 * current or future — can interact with pre-hydration markup. (Navigations
 * triggered by a click are the test's own concern; the tests that follow one
 * with another interaction use links, whose default behaviour is the correct
 * navigation even before hydration.)
 */
export const test = base.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		const goto = page.goto.bind(page);
		page.goto = async (url, options) => {
			const response = await goto(url, options);
			await waitForHydration(page);
			return response;
		};
		await use(page);
	}
});

export { expect };

/** Run axe on the current page and fail with the violations, if any. */
export async function expectNoAxeViolations(page: Page, screen: string) {
	const results = await new AxeBuilder({ page }).withTags(WCAG_22_AA).analyze();

	const report = results.violations
		.map((violation) => {
			const nodes = violation.nodes
				.map((node) => `      ${node.target.join(' ')}\n        ${node.failureSummary ?? ''}`)
				.join('\n');
			return `  ${violation.id} [${violation.impact}] — ${violation.help}\n${nodes}`;
		})
		.join('\n');

	expect(
		results.violations,
		`axe found ${results.violations.length} violation(s) on ${screen}:\n${report}`
	).toEqual([]);
}

/**
 * Store a RunState the way the game stores one, then load `/`.
 *
 * The first request mints the anonymous profile cookie; the write then lands
 * under that profile. `/api/run` is the real save path — no test-only server
 * seam was added (ticket 24).
 */
export async function seedRun(page: Page, state: RunState) {
	await page.goto('/privacy');
	const response = await page.request.post('/api/run', { data: { state } });
	expect(response.ok(), `seeding the run failed: ${response.status()}`).toBeTruthy();
	await page.goto('/');
	// The fixture already waits; this keeps seedRun honest if it is ever used
	// with the base `test`, since callers press Enter on the very next line.
	await waitForHydration(page);
}

/**
 * Horizontal overflow in CSS pixels. WCAG 1.4.10 for the reflow proxy: a
 * 320px viewport is what a 1280px window becomes at 400% zoom.
 */
export async function horizontalOverflow(page: Page): Promise<number> {
	return page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth
	);
}
