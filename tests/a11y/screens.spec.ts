import { expect, test } from '@playwright/test';
import { expectNoAxeViolations, seedRun } from './helpers';
import { CHIP_RUN, EVENT_RUN, FEEDBACK_RUN, PLAN_RUN, STAGE_UP_RUN } from './seed';

/**
 * The screens ticket 14 commits to, audited against the WCAG 2.2 AA tag set.
 * Each test first proves the right screen rendered — a 500 or a wrong phase
 * must fail loudly, not produce an empty axe run.
 */
test.describe('axe: WCAG 2.2 AA screens', () => {
	test('intro / home', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'You are 14.' })).toBeVisible();
		await expectNoAxeViolations(page, 'the intro');
	});

	test('month screen: plan', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'Plan the month' })).toBeVisible();
		await expectNoAxeViolations(page, 'the Plan step');
	});

	test('month screen: event and feedback', async ({ page }) => {
		await seedRun(page, EVENT_RUN);
		await expect(page.locator('h2')).not.toHaveText('Plan the month');
		await expectNoAxeViolations(page, 'the event step');

		await page.locator('section button').first().click();
		await expect(page.getByText('What happened')).toBeVisible();
		await expectNoAxeViolations(page, 'the feedback');
	});

	test('month screen: month close', async ({ page }) => {
		await seedRun(page, FEEDBACK_RUN);
		await page.getByRole('button', { name: 'Continue' }).click();
		await expect(page.getByText('Month 1 closes')).toBeVisible();
		await expectNoAxeViolations(page, 'the month close');
	});

	test('month screen: stats sheet', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		await expect(page.getByRole('dialog', { name: 'Where the money is' })).toBeVisible();
		await expectNoAxeViolations(page, 'the Stats Sheet');
	});

	test('month screen: state chips', async ({ page }) => {
		await seedRun(page, CHIP_RUN);
		await expect(page.getByText('BNPL')).toBeVisible();
		await expectNoAxeViolations(page, 'the month screen with state chips');
	});

	test('month screen: stage-up (the Fork)', async ({ page }) => {
		await seedRun(page, STAGE_UP_RUN);
		await expect(page.getByText('A new stage')).toBeVisible();
		await expectNoAxeViolations(page, 'the Stage-up screen');
	});

	test('privacy policy', async ({ page }) => {
		await page.goto('/privacy');
		await expect(page.getByRole('heading', { name: 'What the game knows about you.' })).toBeVisible();
		await expectNoAxeViolations(page, 'the privacy policy');
	});

	test('settings', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByRole('heading', { name: 'Your data, your call.' })).toBeVisible();
		await expectNoAxeViolations(page, 'Settings');
	});
});
