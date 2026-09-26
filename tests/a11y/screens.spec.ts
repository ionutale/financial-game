import { expect, expectNoAxeViolations, seedRun, test, waitForHydration } from './helpers';
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

	test('month screen: a spine beat carries its illustration and alt text', async ({ page }) => {
		await seedRun(page, EVENT_RUN);
		// Month 1's spine beat is the allowance; its alt text comes from the catalogue.
		const art = page.getByRole('img', {
			name: 'Three coins dropping into a wallet, the middle one highlighted.'
		});
		await expect(art).toBeVisible();
		await expectNoAxeViolations(page, 'a spine beat illustration');
	});

	test('month screen: month close', async ({ page }) => {
		await seedRun(page, FEEDBACK_RUN);
		await page.getByRole('button', { name: 'Continue' }).press('Enter');

		/*
		 * Ticket 25: the close announces itself. The region is labelled by its
		 * heading, and the heading takes focus when the close replaces the
		 * Feedback, so a screen reader reads it without navigation.
		 */
		const heading = page.getByRole('heading', { name: 'Month 1 closes' });
		await expect(page.getByRole('region', { name: 'Month 1 closes' })).toBeVisible();
		await expect(heading).toBeFocused();
		await expect(heading).toHaveAttribute('tabindex', '-1');

		/* The heading is not a tab stop: Tab moves on to the close's action. */
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: 'Next month' })).toBeFocused();

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
		// The Fork's illustration rides the Stage-up, above its banner (ticket 30).
		await expect(
			page.getByRole('img', {
				name: 'A path forking in two, one branch ending at a book and the other at a briefcase.'
			})
		).toBeVisible();
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

	test('settings: the sound toggle is off by default and remembers the choice', async ({
		page
	}) => {
		await page.goto('/settings');
		await expect(page.getByRole('heading', { name: 'Your data, your call.' })).toBeVisible();

		/* Ticket 30: a monochrome switch, its state on aria-checked and in words. */
		const toggle = page.getByRole('switch', { name: 'Sound effects' });
		await expect(toggle).toHaveAttribute('aria-checked', 'false');
		await expect(toggle).toContainText('Off');

		await toggle.click();
		await expect(toggle).toHaveAttribute('aria-checked', 'true');
		await expect(toggle).toContainText('On');
		await expectNoAxeViolations(page, 'Settings with sound on');

		/* The preference is localStorage, not RunState: a reload keeps it. */
		await page.reload();
		await waitForHydration(page);
		await expect(page.getByRole('switch', { name: 'Sound effects' })).toHaveAttribute(
			'aria-checked',
			'true'
		);

		// Back off for the rest of the context, and prove the toggle reverses.
		const reloaded = page.getByRole('switch', { name: 'Sound effects' });
		await reloaded.click();
		await expect(reloaded).toHaveAttribute('aria-checked', 'false');
	});

	test('settings: the language switcher, and hreflang for every locale', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByRole('heading', { name: 'Your data, your call.' })).toBeVisible();

		const origin = new URL(page.url()).origin;
		const alternates = page.locator('head link[rel="alternate"][hreflang]');
		await expect(alternates).toHaveCount(4);
		expect(
			await alternates.evaluateAll((links) =>
				links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')])
			)
		).toEqual([
			['en', `${origin}/settings`],
			['it', `${origin}/it/settings`],
			['ro', `${origin}/ro/settings`],
			['x-default', `${origin}/settings`]
		]);

		// Ticket 14: every control is a 44px touch target, named, and the
		// current language is carried by aria-current and weight, not colour alone.
		const group = page.getByRole('group', { name: 'Language' });
		await expect(group.getByRole('link', { name: 'English' })).toHaveAttribute(
			'aria-current',
			'true'
		);
		for (const name of ['English', 'Italiano', 'Română']) {
			const box = await group.getByRole('link', { name }).boundingBox();
			if (!box) throw new Error(`${name} is not rendered`);
			expect(box.height, `${name} is under 44px tall`).toBeGreaterThanOrEqual(44);
			expect(box.width, `${name} is under 44px wide`).toBeGreaterThanOrEqual(44);
		}

		await group.getByRole('link', { name: 'Italiano' }).click();
		await expect(page.getByRole('heading', { name: 'I tuoi dati, la tua scelta.' })).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/it/settings');
		await expect(page.locator('html')).toHaveAttribute('lang', 'it');
		// The set is generated from the canonical path, so the prefixed page
		// still points English at the unprefixed URL.
		await expect(page.locator('head link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
			'href',
			`${origin}/settings`
		);
		await expectNoAxeViolations(page, 'Settings in Italian');

		// The way back, with the controls named in the language now on screen.
		await page
			.getByRole('group', { name: 'Lingua' })
			.getByRole('link', { name: 'English' })
			.click();
		await expect(page.getByRole('heading', { name: 'Your data, your call.' })).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/settings');
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('settings in Italian: the privacy link stays Italian, with no locale hop', async ({ page }) => {
		await page.goto('/it/settings');
		await expect(page.getByRole('heading', { name: 'I tuoi dati, la tua scelta.' })).toBeVisible();

		// Ticket 29: the link itself carries the locale, so the markup — not a
		// middleware redirect — is what sends a reader of Italian to Italian.
		const privacy = page.getByRole('link', { name: 'Informativa sulla privacy' });
		await expect(privacy).toHaveAttribute('href', '/it/privacy');

		await privacy.click();
		await expect(page).toHaveURL(/\/it\/privacy$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'it');
		await expect(page.getByRole('heading', { name: 'Cosa sa il gioco di te.' })).toBeVisible();
		await expectNoAxeViolations(page, 'the privacy policy in Italian');
	});

	test('intro: the language switcher reaches Italian before the first month', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { name: 'You are 14.' })).toBeVisible();

		await page
			.getByRole('group', { name: 'Language' })
			.getByRole('link', { name: 'Italiano' })
			.click();
		await expect(page.getByRole('heading', { name: 'Hai 14 anni.' })).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/it');
		await expect(page.locator('html')).toHaveAttribute('lang', 'it');
		await expectNoAxeViolations(page, 'the Italian intro');
	});
});
