import { formatMoney, formatMoneyExact, goalTarget, savedTowardGoal } from '$lib/game/economy';
import { conceptCoverage, coverageAcross } from '$lib/game/journal';
import { outcomeBand, turningPoints } from '$lib/game/metrics';
import { earnedMilestones, longestInsideBudgetMonths, yearInReview } from '$lib/game/milestones';
import { bandLabel, conceptLabel, flagText, milestoneLabel } from '$lib/i18n/game-text';
import { expect, expectNoAxeViolations, seedRun, test, waitForHydration } from './helpers';
import {
	CHIP_RUN,
	DONE_STUDY_RUN,
	DONE_WORK_RUN,
	EVENT_RUN,
	FEEDBACK_RUN,
	FINAL_MONTH_RUN,
	MILESTONE_RUN,
	NO_BUDGET_RUN,
	PLAN_RUN,
	STAGE_UP_RUN
} from './seed';

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
		/* Gamification ticket 02: the Year in Review is a Stage-up thing, never
		   part of the month loop (ADR-0003). */
		await expect(page.getByRole('region', { name: /in review$/ })).toHaveCount(0);
		await expectNoAxeViolations(page, 'the Plan step');
	});

	test('month screen: the goal ticks are decoration and the value stays text', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'Plan the month' })).toBeVisible();

		/* Gamification ticket 06: four quarter ticks at 25 / 50 / 75 / 100 %,
		   hidden from assistive tech. The bar's accessible reading is unchanged:
		   it is still the money text the HUD already shows, and no progressbar
		   role (or other new semantics) was introduced. */
		const ticks = page.locator('#goal-ticks');
		await expect(ticks).toHaveAttribute('aria-hidden', 'true');
		await expect(ticks.locator('span')).toHaveCount(4);
		await expect(page.getByRole('progressbar')).toHaveCount(0);
		await expect(
			page.getByText(
				`${formatMoneyExact(savedTowardGoal(PLAN_RUN), 'en')} / ${formatMoney(goalTarget(PLAN_RUN), 'en')}`
			)
		).toBeVisible();

		await expectNoAxeViolations(page, 'the Plan step with the goal ticks');
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

	test('month screen: the Milestone line rides the close’s labelled region', async ({ page }) => {
		await seedRun(page, MILESTONE_RUN);
		const close = page.getByRole('region', { name: 'Month 1 closes' });
		await expect(close).toBeVisible();
		/* Gamification ticket 01: plain text inside the existing region — no new
		   live region, nothing to dismiss, and the meaning is in the words, not a
		   colour. */
		await expect(close).toContainText('Milestone: First month inside budget');
		await expectNoAxeViolations(page, 'the month close with a Milestone line');
	});

	test('month screen: stats sheet', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		await expect(page.getByRole('dialog', { name: 'Where the money is' })).toBeVisible();
		// No month closed yet, so the Milestone list is honestly empty.
		await expect(page.getByText('No milestones yet.')).toBeVisible();
		await expectNoAxeViolations(page, 'the Stats Sheet');
	});

	test('month screen: stats sheet states Concept Coverage without spoilers', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		const coverage = page.getByRole('region', { name: 'Concept coverage' });
		await expect(coverage).toBeVisible();

		/* Gamification ticket 03: all eight Concepts, each in a text state —
		   stage 1's two Introduced, nothing played, six locked and unnamed. */
		await expect(coverage.getByRole('listitem')).toHaveCount(8);
		await expect(coverage.getByText('needs vs wants')).toBeVisible();
		await expect(coverage.getByText('earning & work')).toBeVisible();
		await expect(coverage.getByText('Introduced')).toHaveCount(2);
		await expect(coverage.getByText('Experienced')).toHaveCount(0);
		await expect(coverage.getByText('Not yet')).toHaveCount(6);
		/* Locked Concepts reveal no more than the Stage-up banner already has. */
		await expect(
			coverage.getByText(/budgeting & tracking|saving & goals|interest & compounding|credit & debt/)
		).toHaveCount(0);
		await expect(
			coverage.getByText(/investing & risk|taxes, insurance & scams/)
		).toHaveCount(0);
		await expectNoAxeViolations(page, 'the Stats Sheet with Concept Coverage');
	});

	test('month screen: stats sheet marks a played Concept Experienced', async ({ page }) => {
		await seedRun(page, MILESTONE_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		const coverage = page.getByRole('region', { name: 'Concept coverage' });
		await expect(coverage).toBeVisible();

		/* Month 1 played birthday_gift, which carries needs vs wants. */
		await expect(coverage.getByText('needs vs wants')).toBeVisible();
		await expect(coverage.getByText('Experienced')).toHaveCount(1);
		await expect(coverage.getByText('Introduced')).toHaveCount(1);
		await expect(coverage.getByText('Not yet')).toHaveCount(6);
		await expect(coverage.getByText('investing & risk')).toHaveCount(0);
		await expectNoAxeViolations(page, 'the Stats Sheet with an Experienced Concept');
	});

	test('month screen: stats sheet lists earned Milestones in text', async ({ page }) => {
		await seedRun(page, MILESTONE_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		const sheet = page.getByRole('dialog', { name: 'Where the money is' });
		await expect(sheet).toBeVisible();
		await expect(sheet.getByText('Milestones', { exact: true })).toBeVisible();
		// Names, never a count and never a checklist.
		await expect(sheet.getByText('First month inside budget')).toBeVisible();
		await expect(sheet.getByText('First money into Save')).toBeVisible();
		await expectNoAxeViolations(page, 'the Stats Sheet with Milestones');
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

		/* Gamification ticket 02: the Stage-up carries year 4's Year in Review,
		   with the numbers the stored record actually holds. */
		const review = yearInReview(STAGE_UP_RUN, 4);
		const recap = page.getByRole('region', { name: 'Year 4 in review' });
		await expect(recap).toBeVisible();
		await expect(recap.getByText('Net worth')).toBeVisible();
		await expect(recap.getByText(formatMoney(review.netWorth as number, 'en'))).toBeVisible();
		await expect(recap.getByText('The year’s change')).toBeVisible();
		await expect(recap.getByText(`+${formatMoney(review.change as number, 'en')}`)).toBeVisible();
		await expect(recap.getByText('Months inside budget')).toBeVisible();
		await expect(
			recap.getByText(`${review.monthsInsideBudget} / 12`, { exact: true })
		).toBeVisible();

		/* Purely retrospective: the Fork's own deposit moves live money, and the
		   closed year's headline must not budge. */
		await page.getByRole('button', { name: /Work — full time/ }).click();
		await expect(recap.getByText(formatMoney(review.netWorth as number, 'en'))).toBeVisible();

		await expectNoAxeViolations(page, 'the Stage-up screen with its Year in Review');
	});

	test('the Money Story: milestones, coverage, the final year and the inside-budget line', async ({
		page
	}) => {
		await seedRun(page, FINAL_MONTH_RUN);
		await page.getByRole('button', { name: 'Next month' }).click();
		await expect(page.getByRole('heading', { name: 'Five years, in one page.' })).toBeVisible();

		/* Gamification ticket 04: the Run's Milestones as names — never a count,
		   never a checklist; the same derivation the Stats Sheet lists. */
		const milestones = earnedMilestones(FINAL_MONTH_RUN);
		expect(milestones.length).toBeGreaterThan(0);
		const milestoneList = page.getByRole('region', { name: 'Milestones', exact: true });
		await expect(milestoneList).toBeVisible();
		await expect(milestoneList.getByRole('listitem')).toHaveCount(milestones.length);
		for (const { id } of milestones) {
			await expect(milestoneList.getByText(milestoneLabel(id))).toBeVisible();
		}

		/* Concept Coverage: all eight Concepts, the same states the Stats Sheet
		   shows, with no locked Concept naming itself. */
		const coverage = conceptCoverage(FINAL_MONTH_RUN);
		const coverageList = page.getByRole('region', { name: 'Concept coverage' });
		await expect(coverageList).toBeVisible();
		await expect(coverageList.getByRole('listitem')).toHaveCount(coverage.length);
		for (const entry of coverage) {
			await expect(coverageList.getByText(conceptLabel(entry.concept))).toBeVisible();
		}

		/* The year-5 review, the recap no Stage-up carries, in the Stage-up's
		   own shape: money headline, behavioural line, the year's Milestones. */
		const review = yearInReview(FINAL_MONTH_RUN, 5);
		const recap = page.getByRole('region', { name: 'Year 5 in review' });
		await expect(recap).toBeVisible();
		await expect(recap.getByText('Net worth')).toBeVisible();
		await expect(recap.getByText(formatMoney(review.netWorth as number, 'en'))).toBeVisible();
		await expect(recap.getByText('The year’s change')).toBeVisible();
		const change = review.change as number;
		await expect(
			recap.getByText(
				change < 0
					? `\u2212${formatMoney(Math.abs(change), 'en')}`
					: `+${formatMoney(change, 'en')}`
			)
		).toBeVisible();
		await expect(recap.getByText('Months inside budget')).toBeVisible();
		await expect(recap.getByText(`${review.monthsInsideBudget} / 12`, { exact: true })).toBeVisible();
		for (const id of review.milestones) {
			await expect(recap.getByText(milestoneLabel(id))).toBeVisible();
		}

		/* The retrospective line: prose from the month history, not a meter. */
		const longest = longestInsideBudgetMonths(FINAL_MONTH_RUN);
		expect(longest).toBeGreaterThan(1);
		await expect(
			page.getByText(`Your longest run inside your own budget was ${longest} months.`)
		).toBeVisible();

		/* Gamification ticket 05: the way into the Journal, after the record and
		   before "What next". */
		await expect(page.getByRole('link', { name: 'Open your Journal' })).toHaveAttribute(
			'href',
			'/journal'
		);

		/* Story-first order: the numbers, then the Run's record, then what next.
		   Kickers are uppercased by CSS, and innerText reports what is rendered. */
		const order = await page.evaluate(() => {
			const text = document.body.innerText;
			return [
				'THE NUMBERS',
				'MILESTONES',
				'CONCEPT COVERAGE',
				'YEAR 5 IN REVIEW',
				'Your longest run',
				'YOUR JOURNAL',
				'WHAT NEXT'
			].map((needle) => text.indexOf(needle));
		});
		expect(order.every((at) => at >= 0), `missing a block: ${order.join(', ')}`).toBe(true);
		expect(order).toEqual([...order].sort((a, b) => a - b));

		await expectNoAxeViolations(page, 'the Money Story with its additions');
	});

	test('the Money Story: the inside-budget line reads sensibly with no clean month', async ({
		page
	}) => {
		await seedRun(page, NO_BUDGET_RUN);
		await page.getByRole('button', { name: 'Next month' }).click();
		await expect(page.getByRole('heading', { name: 'Five years, in one page.' })).toBeVisible();

		/* Gamification ticket 04: zero is an answer the copy must own — no
		   "0 months", no blame, no counter. */
		await expect(
			page.getByText(
				'No month closed inside your own budget this time — the plan and the month never quite agreed.'
			)
		).toBeVisible();
		await expectNoAxeViolations(page, 'the Money Story with no inside-budget month');
	});

	test('privacy policy', async ({ page }) => {
		await page.goto('/privacy');
		await expect(page.getByRole('heading', { name: 'What the game knows about you.' })).toBeVisible();
		await expectNoAxeViolations(page, 'the privacy policy');
	});

	test('settings', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByRole('heading', { name: 'Your data, your call.' })).toBeVisible();
		/* Gamification ticket 05: the quiet way into the Journal. */
		await expect(page.getByRole('link', { name: 'Your Journal' })).toHaveAttribute(
			'href',
			'/journal'
		);
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

	test('the Journal: an honest empty state', async ({ page }) => {
		await page.goto('/journal');
		await expect(page.getByRole('heading', { name: 'The life so far, kept.' })).toBeVisible();

		/* Gamification ticket 05: a first-time player has nothing to fake. */
		await expect(page.getByText('No chapters yet.')).toBeVisible();
		await expect(page.getByRole('heading', { name: /^Chapter/ })).toHaveCount(0);
		const numbers = page.getByRole('definition');
		await expect(numbers).toHaveCount(2);
		await expect(numbers.nth(0)).toHaveText('0');
		await expect(numbers.nth(1)).toHaveText('0 / 8');

		/* The eight Concepts still read as a curriculum, without naming the
		   ones no Run has opened. */
		await expect(
			page.getByRole('region', { name: 'Concept coverage' }).getByRole('listitem')
		).toHaveCount(8);
		await expect(page.getByText('No milestones yet.')).toBeVisible();
		await expectNoAxeViolations(page, 'the empty Journal');
	});

	test('the Journal: Chapters in the order lived, coverage and collected Milestones', async ({
		page
	}) => {
		/*
		 * Two finished Runs, archived by the game's own write path: the Study
		 * Run lived first, the Work Run second — so the archive holds both
		 * paths and the cross-Run `both_paths` recognition lands.
		 */
		await seedRun(page, DONE_STUDY_RUN);
		await seedRun(page, DONE_WORK_RUN);
		await page.goto('/journal');
		await expect(page.getByRole('heading', { name: 'The life so far, kept.' })).toBeVisible();

		/* Story-first: Chapter 1 is the Run lived first, Chapter 2 the next.
		   Chronological, never ranked. */
		const first = page.getByRole('region', { name: 'Chapter 1' });
		const second = page.getByRole('region', { name: 'Chapter 2' });
		await expect(first).toBeVisible();
		await expect(second).toBeVisible();
		await expect(first.getByText(`seed ${DONE_STUDY_RUN.seed}`)).toBeVisible();
		await expect(second.getByText(`seed ${DONE_WORK_RUN.seed}`)).toBeVisible();
		await expect(first.getByText(bandLabel(outcomeBand(DONE_STUDY_RUN)))).toBeVisible();
		await expect(second.getByText(bandLabel(outcomeBand(DONE_WORK_RUN)))).toBeVisible();

		/* Each Chapter carries its own Turning Points and Milestones. */
		for (const [chapter, run] of [
			[first, DONE_STUDY_RUN],
			[second, DONE_WORK_RUN]
		] as const) {
			for (const id of earnedMilestones(run).map((milestone) => milestone.id)) {
				await expect(chapter.getByText(milestoneLabel(id))).toBeVisible();
			}
			for (const moment of turningPoints(run)) {
				const text = flagText(moment.kind, moment.month);
				if (text) await expect(chapter.getByText(text)).toBeVisible();
			}
		}

		/* The header counts, the eight-Concept union, and the collected
		   Milestones — including both_paths, now that both paths are lived. */
		const met = coverageAcross([DONE_STUDY_RUN, DONE_WORK_RUN]).filter(
			(entry) => entry.state === 'experienced'
		).length;
		const numbers = page.getByRole('definition');
		await expect(numbers.nth(0)).toHaveText('2');
		await expect(numbers.nth(1)).toHaveText(`${met} / 8`);
		await expect(
			page.getByRole('region', { name: 'Concept coverage' }).getByRole('listitem')
		).toHaveCount(8);

		const collected = page.getByRole('region', { name: 'Milestones collected' });
		const union = new Set(
			[...earnedMilestones(DONE_STUDY_RUN), ...earnedMilestones(DONE_WORK_RUN)].map(
				(milestone) => milestone.id
			)
		);
		for (const id of union) await expect(collected.getByText(milestoneLabel(id))).toBeVisible();
		await expect(collected.getByText(milestoneLabel('both_paths'))).toBeVisible();

		await expectNoAxeViolations(page, 'the populated Journal');
	});

	test('the Journal: the route and its entry links carry the locale', async ({ page }) => {
		await page.goto('/journal');
		await expect(page.getByRole('heading', { name: 'The life so far, kept.' })).toBeVisible();

		/* Like every app page, the route is localized in all three locales. */
		const origin = new URL(page.url()).origin;
		const alternates = page.locator('head link[rel="alternate"][hreflang]');
		await expect(alternates).toHaveCount(4);
		expect(
			await alternates.evaluateAll((links) =>
				links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')])
			)
		).toEqual([
			['en', `${origin}/journal`],
			['it', `${origin}/it/journal`],
			['ro', `${origin}/ro/journal`],
			['x-default', `${origin}/journal`]
		]);

		/* Settings' quiet link, and the route in Italian. */
		await page.goto('/it/settings');
		await expect(page.getByRole('heading', { name: 'I tuoi dati, la tua scelta.' })).toBeVisible();
		const italian = page.getByRole('link', { name: 'Il tuo diario' });
		await expect(italian).toHaveAttribute('href', '/it/journal');
		await italian.click();
		await expect(
			page.getByRole('heading', { name: 'La vita fin qui, tenuta in ordine.' })
		).toBeVisible();
		expect(new URL(page.url()).pathname).toBe('/it/journal');
		await expect(page.locator('html')).toHaveAttribute('lang', 'it');
		await expectNoAxeViolations(page, 'the Journal in Italian');

		/* Romanian too: the link is built from the canonical path. */
		await page.goto('/ro/settings');
		await expect(page.getByRole('link', { name: 'Jurnalul tău' })).toHaveAttribute(
			'href',
			'/ro/journal'
		);

		/* The Money Story's "Your Journal" section localizes the same way: the
		   Run finished in English, read in Italian, links into Italian. */
		await seedRun(page, FINAL_MONTH_RUN);
		await page.goto('/it');
		await page.getByRole('button', { name: 'Mese prossimo' }).click();
		await expect(page.getByRole('heading', { name: 'Cinque anni, in una pagina.' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Apri il tuo diario' })).toHaveAttribute(
			'href',
			'/it/journal'
		);
		await expectNoAxeViolations(page, 'the Money Story in Italian with its Journal link');
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
