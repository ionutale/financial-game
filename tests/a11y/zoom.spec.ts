import type { Page } from '@playwright/test';
import { expect, horizontalOverflow, seedRun, test } from './helpers';
import { FEEDBACK_RUN, PLAN_RUN } from './seed';

/**
 * Automated proxies for two of ticket 14's four manual passes.
 *
 * The real passes are played by a human, per release. These catch the
 * regressions a tool genuinely can: a layout that starts scrolling sideways
 * under zoom, and a month the keyboard cannot be driven through.
 */
test.describe('zoom and reflow (proxy checks)', () => {
	/* A 320px viewport is what a 1280px window becomes at 400% zoom (1.4.10). */
	test.use({ viewport: { width: 320, height: 800 } });

	const SCREENS: Array<[string, (page: Page) => Promise<void>, string]> = [
		[
			'the intro',
			async (page) => {
				await page.goto('/');
			},
			'You are 14.'
		],
		[
			'the Plan step',
			async (page) => {
				await seedRun(page, PLAN_RUN);
			},
			'Plan the month'
		],
		[
			'the month close',
			async (page) => {
				await seedRun(page, FEEDBACK_RUN);
				await page.getByRole('button', { name: 'Continue' }).click();
			},
			'Month 1 closes'
		],
		[
			'the privacy policy',
			async (page) => {
				await page.goto('/privacy');
			},
			'What the game knows about you.'
		],
		[
			'Settings',
			async (page) => {
				await page.goto('/settings');
			},
			'Your data, your call.'
		]
	];

	for (const [name, open, heading] of SCREENS) {
		test(`${name} reflows without horizontal scrolling`, async ({ page }) => {
			await open(page);
			await expect(page.getByText(heading).first()).toBeVisible();
			/* Fonts change text metrics; measure the final layout, not a race. */
			await page.evaluate(() => document.fonts.ready);

			const atNarrow = await horizontalOverflow(page);
			expect(
				atNarrow,
				`${name} scrolls sideways by ${atNarrow}px at a 320px viewport (400% zoom equivalent)`
			).toBeLessThanOrEqual(1);

			/* Text-only resize (1.4.4): root font at 200% — catches rem-sized boxes. */
			await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
			const atTextZoom = await horizontalOverflow(page);
			expect(
				atTextZoom,
				`${name} scrolls sideways by ${atTextZoom}px with text at 200%`
			).toBeLessThanOrEqual(1);
		});
	}
});

test.describe('keyboard-only (smoke)', () => {
	test('the intro, the plan and the card can be driven from the keyboard', async ({ page }) => {
		await page.goto('/');

		/* Next ×2, then Start month 1 — reached only by Tab, activated by Enter. */
		await tabUntil(page, `['Next', 'Start month 1'].includes(document.activeElement?.textContent?.trim() ?? '')`);
		await page.keyboard.press('Enter');
		await tabUntil(page, `['Next', 'Start month 1'].includes(document.activeElement?.textContent?.trim() ?? '')`);
		await page.keyboard.press('Enter');
		await tabUntil(page, `document.activeElement?.textContent?.trim() === 'Start month 1'`);
		await page.keyboard.press('Enter');

		/* Plan step: the work-hours range is labelled and arrow keys move it. */
		const hours = page.getByRole('slider', { name: 'Work hours' });
		await tabUntil(page, `document.activeElement === document.getElementById('work-hours')`);
		await page.keyboard.press('ArrowRight');
		await expect(hours).toHaveValue('1');

		/* The plan can be started with Enter, and the card screen follows. */
		await tabUntil(page, `document.activeElement?.textContent?.includes('Start the month') ?? false`);
		await page.keyboard.press('Enter');
		await expect(page.getByRole('heading', { name: 'Plan the month' })).toHaveCount(0);

		/* At least one Choice is reachable, and it is the focused element. */
		await tabUntil(page, `document.activeElement?.matches('section button') ?? false`);
	});
});

/** Press Tab until the browser-side expression is true; fail after `max`. */
async function tabUntil(page: Page, expression: string, max = 20) {
	for (let i = 0; i < max; i++) {
		await page.keyboard.press('Tab');
		if (await page.evaluate(expression)) return;
	}
	throw new Error(`keyboard did not reach "${expression}" within ${max} tabs`);
}
