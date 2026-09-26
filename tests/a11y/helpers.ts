import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import type { RunState } from '$lib/game/types';

/** WCAG 2.2 AA, the tag set axe itself documents for that level. */
export const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

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
