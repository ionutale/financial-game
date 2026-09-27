import { formatMoney, formatMoneyExact, goalTarget, savedTowardGoal } from '$lib/game/economy';
import { castFor } from '$lib/game/cast';
import { conceptCoverage, coverageAcross } from '$lib/game/journal';
import { outcomeBand, turningPoints } from '$lib/game/metrics';
import { earnedMilestones, longestInsideBudgetMonths, yearInReview } from '$lib/game/milestones';
import { bandLabel, castName, conceptLabel, flagText, milestoneLabel } from '$lib/i18n/game-text';
import { expect, expectNoAxeViolations, seedRun, test, waitForHydration } from './helpers';
import {
	CHIP_RUN,
	CLOSE_DEBT_FUND_RUN,
	CALLBACK_RUN,
	CAST_RUN,
	DONE_STUDY_RUN,
	DONE_WORK_RUN,
	EVENT_RUN,
	FEEDBACK_RUN,
	FINAL_MONTH_RUN,
	FUND_BLOCKED_RUN,
	FUND_CRASH_RUN,
	FUNDED_RUN,
	LEDGER_RUN,
	MESSAGE_RUN,
	MILESTONE_RUN,
	NO_BUDGET_RUN,
	PAPER_RUN,
	PLAN_RUN,
	RECEIPT_RUN,
	REPEAT_PLAN_RUN,
	RISK_RUN,
	SCAM_RUN,
	SHOCK_RUN,
	STAGE_2_UP_RUN,
	STAGE_UP_RUN,
	VILLAIN_REFERRAL_RUN,
	VILLAIN_SHIFT_RUN,
	WHY_COLLAPSED_RUN,
	WHY_OPEN_RUN
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

		/* Fun-pass ticket 02: one Cold Open scene. The old three screens are
		   gone, and the privacy line, the language switcher and the sound
		   toggle are all still surfaced in it. */
		await expect(page.getByRole('link', { name: 'Privacy policy' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
		await expect(page.getByRole('group', { name: 'Language' })).toBeVisible();
		await expect(page.getByRole('switch', { name: 'Sound effects' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Start month 1' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Next' })).toHaveCount(0);
		await expectNoAxeViolations(page, 'the intro');
	});

	test('month screen: plan', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();
		/* Gamification ticket 02: the Year in Review is a Stage-up thing, never
		   part of the month loop (ADR-0003). */
		await expect(page.getByRole('region', { name: /in review$/ })).toHaveCount(0);
		await expectNoAxeViolations(page, 'the Plan step');
	});

	test('month screen: the HUD is You / The money / The world, with a date line', async ({
		page
	}) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();

		/* Fun-pass ticket 04: bands, not a dashboard — and one authored Life
		   Line for the Stage, text only. */
		const you = page.getByRole('group', { name: 'You' });
		await expect(you).toBeVisible();
		await expect(you.getByText('Age 14 · Year 1 · September')).toBeVisible();
		await expect(you.getByText('Pocket Money')).toBeVisible();
		await expect(
			you.getByText('School, the bus pass, and evenings nobody has claimed yet.')
		).toBeVisible();
		await expect(page.getByRole('group', { name: 'The money' })).toBeVisible();
		await expect(page.getByRole('group', { name: 'The world' })).toBeVisible();

		/* The plain month counter is gone from the month screen: the date line
		   replaced it, and nothing was removed with it. */
		await expect(page.getByText('Month 1 of 60')).toHaveCount(0);
		await expect(page.getByText('Net worth', { exact: true })).toBeVisible();
		await expect(page.getByText('Cash', { exact: true })).toBeVisible();
		await expect(page.getByText('Free time', { exact: true })).toBeVisible();

		await expectNoAxeViolations(page, 'the HUD with its bands and date line');
	});

	test('month screen: the goal ticks are decoration and the value stays text', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();

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

	test('month screen: month one suggests a plan — one tap, never automatic', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();

		/* Fun-pass ticket 02: “how a month works” is just-in-time, on the first
		   Plan step, and retires itself once the first plan is confirmed. */
		await expect(page.getByText('How a month works')).toBeVisible();

		/* The suggested chip has done nothing by itself. */
		const ranges = page.locator('input[type="range"]');
		await expect(ranges.nth(1)).toHaveValue('0'); // Need
		await expect(ranges.nth(2)).toHaveValue('0'); // Want

		const chip = page.getByRole('button', { name: 'Suggested: 50 / 30 / 20' });
		await expect(chip).toBeVisible();
		await chip.click();

		/* One tap fills the envelopes: 50% and 30% of the ◈40 allowance (the
		   range's step=5 grid shows the 12 as 10; the RunState holds 12). */
		await expect(ranges.nth(1)).toHaveValue('20');
		await expect(ranges.nth(2)).toHaveValue('10');
		await expectNoAxeViolations(page, 'month one with the suggested plan applied');
	});

	test('month screen: a last plan makes Repeat primary, sliders behind “Change the plan”', async ({
		page
	}) => {
		await seedRun(page, REPEAT_PLAN_RUN);
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();

		/* The last plan is shown as a receipt, Repeat is the one action, and
		   nothing is planned until the player chooses to change it. */
		await expect(page.getByText('Last month’s plan')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Keep last month' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Change the plan' })).toBeVisible();
		await expect(page.locator('input[type="range"]')).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Go' })).toHaveCount(0);

		await page.getByRole('button', { name: 'Change the plan' }).click();
		await expect(page.locator('#work-hours')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Go' })).toBeVisible();

		await expectNoAxeViolations(page, 'the Plan step with a last plan');
	});

	test('month screen: Keep last month starts the month in one tap', async ({ page }) => {
		await seedRun(page, REPEAT_PLAN_RUN);
		await page.getByRole('button', { name: 'Keep last month' }).click();

		/* The two shipped actions — REPEAT_PLAN then CONFIRM_PLAN — composed by
		   the UI: the Plan step is done and the month's card follows. */
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toHaveCount(0);
		await expect(page.locator('section button').first()).toBeVisible();
		await expectNoAxeViolations(page, 'the month after one-tap repeat');
	});

	test('month screen: event and feedback', async ({ page }) => {
		await seedRun(page, EVENT_RUN);
		await expect(page.locator('h2')).not.toHaveText('The month ahead');
		await expectNoAxeViolations(page, 'the event step');

		await page.locator('section button').first().click();
		await expect(page.getByText('How it went')).toBeVisible();
		await expectNoAxeViolations(page, 'the feedback');
	});

	test('month screen: the Reaction, and the Why open at a first encounter', async ({ page }) => {
		await seedRun(page, WHY_OPEN_RUN);

		/* Fun-pass ticket 02: the Reaction shows what the world did… */
		await expect(page.getByText('How it went')).toBeVisible();
		await expect(page.getByText('The thing is yours. ◈40 is already gone.')).toBeVisible();

		/* …and “Why it happened” is a disclosure, open at the Concept's first
		   encounter (ADR-0004: taught once, trusted after). The first encounter
		   is also the Concept's Teachable Moment, so its Why carries the one
		   Rule of Thumb (fun-pass ticket 03). */
		const why = page.locator('details');
		await expect(why).toHaveCount(1);
		expect(await why.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
		await expect(why.getByText('Why it happened')).toBeVisible();
		await expect(why.getByText(/Nothing is asking for it yet/)).toBeVisible();
		await expect(why.getByText(/Every hour you sell is an hour you cannot buy back/)).toBeVisible();

		await expectNoAxeViolations(page, 'the Feedback with the Why open');
	});

	test('month screen: the Why stays collapsed once the Concept has been met', async ({ page }) => {
		await seedRun(page, WHY_COLLAPSED_RUN);

		/* The same card, with an earlier earning & work card in the log: the
		   Reaction still renders, the Why waits behind its summary. */
		await expect(page.getByText('The thing is yours. ◈40 is already gone.')).toBeVisible();
		const why = page.locator('details');
		await expect(why).toHaveCount(1);
		expect(await why.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
		await expect(why.getByText(/Nothing is asking for it yet/)).toBeHidden();

		/* The disclosure still opens by hand, natively. */
		await why.getByText('Why it happened').click();
		await expect(why.getByText(/Nothing is asking for it yet/)).toBeVisible();

		await expectNoAxeViolations(page, 'the Feedback with the Why collapsed');
	});

	test('month screen: the Ledger Line names what the Choice actually moved', async ({ page }) => {
		await seedRun(page, LEDGER_RUN);

		/* Fun-pass ticket 04: one tap spends the planned Want envelope. */
		await page.locator('section button').first().click();

		/* The changed entries only, with the sign and the word: ◈40 left the
		   Want envelope, and nothing else moved — so nothing else is listed. */
		const ledger = page.locator('#ledger-line');
		await expect(ledger).toBeVisible();
		await expect(ledger).toHaveText('Want −◈40');
		/* Decoration only: the flash is a class, the meaning is the text. */
		await expect(ledger).toHaveClass(/money-flash/);
		/* It rides the Feedback's existing polite region. */
		await expect(page.locator('[aria-live="polite"] #ledger-line')).toHaveCount(1);

		await expectNoAxeViolations(page, 'the Feedback with the Ledger Line');
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
		const heading = page.getByRole('heading', { name: 'Month 1, done' });
		await expect(page.getByRole('region', { name: 'Month 1, done' })).toBeVisible();
		await expect(heading).toBeFocused();
		await expect(heading).toHaveAttribute('tabindex', '-1');

		/* The heading is not a tab stop: Tab moves on to the close's action. */
		await page.keyboard.press('Tab');
		await expect(page.getByRole('button', { name: 'Next' })).toBeFocused();

		await expectNoAxeViolations(page, 'the month close');
	});

	test('month screen: the Milestone line rides the close’s labelled region', async ({ page }) => {
		await seedRun(page, MILESTONE_RUN);
		const close = page.getByRole('region', { name: 'Month 1, done' });
		await expect(close).toBeVisible();
		/* Gamification ticket 01: plain text inside the existing region — no new
		   live region, nothing to dismiss, and the meaning is in the words, not a
		   colour. */
		await expect(close).toContainText('Milestone: First month inside budget');
		await expectNoAxeViolations(page, 'the month close with a Milestone line');
	});

	test('month screen: the close is a receipt, grouped In / Out / Next month', async ({ page }) => {
		await seedRun(page, MILESTONE_RUN);
		const close = page.getByRole('region', { name: 'Month 1, done' });
		await expect(close).toBeVisible();

		/* Fun-pass ticket 04: the same rows, no figures removed, grouped. */
		await expect(close.getByText('In', { exact: true })).toBeVisible();
		await expect(close.getByText('Income landed')).toBeVisible();
		await expect(close.getByText('Interest credited', { exact: true })).toBeVisible();
		await expect(close.getByText('Out', { exact: true })).toBeVisible();
		await expect(close.getByText('Spent on needs')).toBeVisible();
		await expect(close.getByText('Spent on wants')).toBeVisible();
		await expect(close.getByText('Obligations paid')).toBeVisible();
		await expect(close.getByText('Next month', { exact: true })).toBeVisible();
		await expect(close.getByText('Next month’s obligations')).toBeVisible();

		/* A Run with no Debt and no Fund shows neither row — absent, not zeroed. */
		await expect(close.getByText('Debt', { exact: true })).toHaveCount(0);
		await expect(close.getByText('Fund', { exact: true })).toHaveCount(0);

		await expectNoAxeViolations(page, 'the receipt close without Debt or Fund');
	});

	test('month screen: the receipt carries a Debt line and a Fund row when they exist', async ({
		page
	}) => {
		await seedRun(page, CLOSE_DEBT_FUND_RUN);
		const close = page.getByRole('region', { name: 'Month 1, done' });
		await expect(close).toBeVisible();

		await expect(close.getByText('Debt', { exact: true })).toBeVisible();
		await expect(close.getByText(formatMoney(CLOSE_DEBT_FUND_RUN.debt, 'en'))).toBeVisible();
		await expect(close.getByText('Fund', { exact: true })).toBeVisible();
		await expect(close.getByText(formatMoneyExact(CLOSE_DEBT_FUND_RUN.fund, 'en'))).toBeVisible();

		await expectNoAxeViolations(page, 'the receipt close with a Debt line and a Fund row');
	});

	test('month screen: stats sheet', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		await expect(page.getByRole('dialog', { name: 'Where the money is' })).toBeVisible();
		// No month closed yet, so the Milestone list is honestly empty.
		await expect(page.getByText('No milestones yet.')).toBeVisible();
		// No Fund holds money, so its row is absent — never a dead zero
		// (fun-pass ticket 09, AC4; the close's own rule).
		const sheet = page.getByRole('dialog', { name: 'Where the money is' });
		await expect(sheet.getByText('Fund', { exact: true })).toHaveCount(0);
		await expectNoAxeViolations(page, 'the Stats Sheet');
	});

	test('month screen: stats sheet states Concept Coverage without spoilers', async ({ page }) => {
		await seedRun(page, PLAN_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		const coverage = page.getByRole('region', { name: 'What money’s shown you' });
		await expect(coverage).toBeVisible();

		/* Gamification ticket 03, display words fun-pass ticket 02: all eight
		   Concepts, each in a text state — stage 1's two “coming up”, nothing
		   played, six “later” and unnamed. */
		await expect(coverage.getByRole('listitem')).toHaveCount(8);
		await expect(coverage.getByText('needs vs wants')).toBeVisible();
		await expect(coverage.getByText('earning & work')).toBeVisible();
		await expect(coverage.getByText('coming up')).toHaveCount(2);
		await expect(coverage.getByText('met')).toHaveCount(0);
		await expect(coverage.getByText('later')).toHaveCount(6);
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
		const coverage = page.getByRole('region', { name: 'What money’s shown you' });
		await expect(coverage).toBeVisible();

		/* Month 1 played birthday_gift, which carries needs vs wants. */
		await expect(coverage.getByText('needs vs wants')).toBeVisible();
		await expect(coverage.getByText('met')).toHaveCount(1);
		await expect(coverage.getByText('coming up')).toHaveCount(1);
		await expect(coverage.getByText('later')).toHaveCount(6);
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

		/* Fun-pass ticket 02: the Stage-up reads as a life moment — its Year
		   Beat and “What you'll meet”, not a curriculum list. */
		await expect(
			page.getByText('Eighteen. School is behind you, and the money gets real.')
		).toBeVisible();
		await expect(
			page.getByText('What you’ll meet: investing & risk · taxes, insurance & scams')
		).toBeVisible();

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

		/* Fun-pass ticket 05 (design §3.6): the Stage-up card is a poster — the
		   title is display type — and the avatar gains presence, larger, beside
		   the Year in Review. Decoration only: the words carry the review. */
		const poster = page.getByRole('heading', { name: 'School is over' });
		expect(
			parseFloat(await poster.evaluate((el) => getComputedStyle(el).fontSize)),
			'the stage-up title is not display type'
		).toBeGreaterThanOrEqual(28);

		const hudAvatar = page.locator('header svg').first();
		const stageAvatar = recap.locator('svg');
		await expect(stageAvatar).toHaveCount(1);
		await expect(stageAvatar).toHaveAttribute('aria-hidden', 'true');
		const [hudBox, stageBox] = await Promise.all([
			hudAvatar.boundingBox(),
			stageAvatar.boundingBox()
		]);
		if (!hudBox || !stageBox) throw new Error('an avatar is missing');
		expect(stageBox.height, 'the Stage-up avatar is no larger than the HUD’s').toBeGreaterThan(
			hudBox.height
		);

		await expectNoAxeViolations(page, 'the Stage-up screen with its Year in Review');
	});

	test('month screen: the Stage-2 Stage-up carries year 1 in review', async ({ page }) => {
		await seedRun(page, STAGE_2_UP_RUN);
		await expect(page.getByText('A new stage')).toBeVisible();

		/* Fun-pass ticket 02: the missing interstitial, now content — the Stage's
		   Year Beat, “What you'll meet”, and the year 1 recap the Fork used to
		   be the only Stage-up to carry. */
		await expect(
			page.getByText('Fifteen. A phone bill in your own name, and a month that has to be planned.')
		).toBeVisible();
		await expect(page.getByText('What you’ll meet: budgeting & tracking · saving & goals')).toBeVisible();

		const review = yearInReview(STAGE_2_UP_RUN, 1);
		const recap = page.getByRole('region', { name: 'Year 1 in review' });
		await expect(recap).toBeVisible();
		await expect(recap.getByText('Net worth')).toBeVisible();
		await expect(recap.getByText(formatMoney(review.netWorth as number, 'en'))).toBeVisible();
		await expect(recap.getByText('Months inside budget')).toBeVisible();
		await expect(
			recap.getByText(`${review.monthsInsideBudget} / 12`, { exact: true })
		).toBeVisible();

		/* The interstitial still resolves: one tap, then the month's Plan. */
		await page.getByRole('button', { name: 'Start the year' }).click();
		await page.getByRole('button', { name: 'Continue' }).click();
		await expect(page.getByRole('heading', { name: 'The month ahead' })).toBeVisible();

		await expectNoAxeViolations(page, 'the Stage-2 Stage-up with its Year in Review');
	});

	test('the Money Story: milestones, coverage, the final year and the inside-budget line', async ({
		page
	}) => {
		await seedRun(page, FINAL_MONTH_RUN);
		await page.getByRole('button', { name: 'Next' }).click();
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
		const coverageList = page.getByRole('region', { name: 'What the five years showed you' });
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
				'WHAT THE FIVE YEARS SHOWED YOU',
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
		await page.getByRole('button', { name: 'Next' }).click();
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

	test('settings: the cue bank is previewable while sound is off', async ({ page }) => {
		await page.goto('/settings');
		const toggle = page.getByRole('switch', { name: 'Sound effects' });
		await expect(toggle).toHaveAttribute('aria-checked', 'false');

		/* Fun-pass ticket 04: seven small previews, one per cue, each a 44px
		   target. */
		const previews = page.getByRole('group', { name: 'Hear the cues' });
		await expect(previews.getByRole('button')).toHaveCount(7);
		for (const button of await previews.getByRole('button').all()) {
			const box = await button.boundingBox();
			if (!box) throw new Error('a cue preview is not rendered');
			expect(box.height, 'a cue preview is under 44px tall').toBeGreaterThanOrEqual(44);
		}

		/* Previews play while the game is muted, and never un-mute it: the
		   toggle above stays the source of truth. */
		for (const name of ['A choice', 'A card arrives', 'A thread pays off', 'The crash']) {
			await previews.getByRole('button', { name }).click();
		}
		await expect(toggle).toHaveAttribute('aria-checked', 'false');
		await expect(toggle).toContainText('Off');

		await expectNoAxeViolations(page, 'Settings with the cue previews');
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
			page.getByRole('region', { name: 'What you’ve met' }).getByRole('listitem')
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

			/* Fun-pass ticket 07: the Cast derives from the Chapter's own log —
			   the people the Run met, in the order it met them, nothing stored. */
			const cast = castFor(run);
			expect(cast.length, 'the gate run met nobody').toBeGreaterThan(0);
			await expect(chapter.getByText(cast.map(castName).join(' · '))).toBeVisible();
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
			page.getByRole('region', { name: 'What you’ve met' }).getByRole('listitem')
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
		await page.getByRole('button', { name: 'Avanti' }).click();
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

/**
 * Fun-pass ticket 05: Card kind identity is typography only (shock top rule and
 * tight leading; scam message framing with a weighted sender line; risk-moment
 * odds promoted; decision plain; stage-up poster) and the Card Formats set a
 * card's own words into a diegetic shape (message / paper / receipt). One
 * screen per format family and per kind, with no axe excludes added.
 */
test.describe('fun-pass ticket 05: kind identity and Card Formats', () => {
	test('decision + message: a chat thread, with the card’s own words and choices', async ({
		page
	}) => {
		await seedRun(page, MESSAGE_RUN);

		/* The card's own words are the catalogue's words — the format adds the
		   thread, it never rewrites the card. */
		await expect(page.getByRole('heading', { name: 'Danny has an app' })).toBeVisible();
		await expect(
			page.getByText(
				'Danny has an app. His cousin turned ◈40 into ◈52 last month and has screenshots.'
			)
		).toBeVisible();
		await expect(
			page.getByText('Danny: Cousin sent the screenshots. I put in ◈40 on Tuesday.')
		).toBeVisible();

		/* Same choices as ever: the arrangement changed, not the decision. */
		await expect(page.getByRole('button', { name: /Put in ◈50/ })).toBeVisible();
		await expect(
			page.getByRole('button', { name: /Ask where the returns come from/ })
		).toBeVisible();

		/* The framing is typographic: the situation is a bubble in the thread. */
		await expect(
			page.getByText('Danny has an app. His cousin turned ◈40 into ◈52 last month')
		).toHaveClass(/rounded-2xl/);

		await expectNoAxeViolations(page, 'the message-format card');
	});

	test('scam: message framing with a weighted sender line', async ({ page }) => {
		await seedRun(page, SCAM_RUN);

		const sender = page.getByRole('heading', { name: 'We owe you' });
		await expect(sender).toBeVisible();
		await expect(page.getByText('Your call')).toBeVisible();
		await expect(
			page.getByText(
				'A text says the tax office owes you ◈240. The link asks for your bank details, and the deadline is today.'
			)
		).toBeVisible();
		await expect(
			page.getByText('You have ◈240 waiting. Confirm the bank details before the file closes today.')
		).toBeVisible();

		/* The sender line is weighted where a decision's title is not. */
		expect(await sender.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('700');

		await expectNoAxeViolations(page, 'the scam card');
	});

	test('shock: a top rule in the ink, and tight leading', async ({ page }) => {
		await seedRun(page, SHOCK_RUN);
		await expect(page.getByRole('heading', { name: 'The phone goes down' })).toBeVisible();
		await expect(page.getByText('Out of nowhere')).toBeVisible();

		const rule = page.locator('section > div[aria-hidden="true"]').first();
		await expect(rule).toBeVisible();
		const box = await rule.boundingBox();
		expect(box?.height ?? 0, 'the shock rule is not a rule').toBeGreaterThanOrEqual(3);

		/* The rule is the same ink as the words: typography, not colour. */
		const [ruleColour, ink] = await Promise.all([
			rule.evaluate((el) => getComputedStyle(el).backgroundColor),
			page.locator('h2').evaluate((el) => getComputedStyle(el).color)
		]);
		expect(ruleColour).toBe(ink);

		await expect(
			page.getByText('It slipped out of your hand on the stairs. The screen is a spiderweb.')
		).toHaveClass(/leading-snug/);

		await expectNoAxeViolations(page, 'the shock card');
	});

	test('risk-moment: the odds are promoted above the prose', async ({ page }) => {
		await seedRun(page, RISK_RUN);
		await expect(page.getByRole('heading', { name: 'Cover, or risk it' })).toBeVisible();

		const odds = page.getByText('About 1 in 3 of phones this age take a knock this year.');
		await expect(odds).toBeVisible();
		await expect(odds).toHaveClass(/figure/);

		/* Promoted, not appended: the odds read before the situation. */
		const order = await page.evaluate(() => {
			const text = document.body.innerText;
			return [
				text.indexOf('About 1 in 3 of phones this age take a knock this year.'),
				text.indexOf('Your phone is still in one piece')
			];
		});
		expect(order[0], 'the odds are missing').toBeGreaterThanOrEqual(0);
		expect(order[0], 'the odds are not promoted').toBeLessThan(order[1]);

		await expectNoAxeViolations(page, 'the risk-moment card');
	});

	test('paper: the card’s lines read as a document', async ({ page }) => {
		await seedRun(page, PAPER_RUN);
		await expect(page.getByRole('heading', { name: 'What is this line' })).toBeVisible();
		await expect(
			page.getByText('Your first full payslip shows a number you agreed to and a smaller number arriving.')
		).toBeVisible();

		const line = page.getByText('Withholding: the line between the two numbers.');
		await expect(line).toBeVisible();
		await expect(line).toHaveClass(/border-t/);
		await expect(page.getByText('Hours: every hour you agreed to.')).toBeVisible();

		await expectNoAxeViolations(page, 'the paper-format card');
	});

	test('receipt: the card’s lines are itemised', async ({ page }) => {
		await seedRun(page, RECEIPT_RUN);
		await expect(page.getByRole('heading', { name: 'The meal deal' })).toBeVisible();
		await expect(
			page.getByText('The meal deal is six: sandwich, drink, snack.', { exact: false })
		).toBeVisible();

		for (const item of ['Sandwich — ◈4', 'Drink — ◈1', 'Snack — ◈1']) {
			await expect(page.getByText(item)).toBeVisible();
		}
		await expect(page.getByText('Drink — ◈1')).toHaveClass(/border-dashed/);

		await expectNoAxeViolations(page, 'the receipt-format card');
	});
});

/**
 * Fun-pass ticket 07: the world's memory and its people. A Callback is one
 * derived line about something the Run did (no numbers, never a maxim); a cast
 * card carries the person's own line; a planted Thread shows up in the world
 * chip; a finished Chapter carries its Cast in the Journal. No excludes added.
 */
test.describe('fun-pass ticket 07: Callbacks, the Cast and named Threads', () => {
	test('month screen: a Callback remembers something the Run did', async ({ page }) => {
		await seedRun(page, CALLBACK_RUN);
		await expect(page.getByRole('heading', { name: 'Both, obviously' })).toBeVisible();

		/* The derived memory, in reading order and in the fiction. */
		await expect(page.getByText('Before now')).toBeVisible();
		await expect(page.getByText('The first allowance went the same way.')).toBeVisible();

		await expectNoAxeViolations(page, 'the card with a Callback');
	});

	test('month screen: a cast card carries Mum’s line, and the Thread chip follows', async ({
		page
	}) => {
		await seedRun(page, CAST_RUN);
		await expect(page.getByRole('heading', { name: 'Mum’s week' })).toBeVisible();

		/* The one line she gets, as a message (fun-pass ticket 07). */
		await expect(
			page.getByText('Mum: Can you get the shop this week? I’ll square it the moment it lands.')
		).toBeVisible();

		/* The Choice plants the Thread; the world chip counts it down. */
		await page.getByRole('button', { name: 'Cover the shop' }).click();
		await expect(page.getByText('Mum’s week — the square-up in 2 months')).toBeVisible();

		await expectNoAxeViolations(page, 'a cast card with a live Thread');
	});

	test('the Journal: a Chapter carries the Cast its log names', async ({ page }) => {
		await seedRun(page, DONE_STUDY_RUN);
		await page.goto('/journal');
		await expect(page.getByRole('heading', { name: 'The life so far, kept.' })).toBeVisible();

		const chapter = page.getByRole('region', { name: 'Chapter 1' });
		const cast = castFor(DONE_STUDY_RUN);
		expect(cast.length, 'the gate run met nobody').toBeGreaterThan(0);
		await expect(chapter.getByText('Who was there')).toBeVisible();
		await expect(chapter.getByText(cast.map(castName).join(' · '))).toBeVisible();

		await expectNoAxeViolations(page, 'the Journal with a Chapter’s Cast');
	});
});

/**
 * Fun-pass ticket 08: the villain cards (ADR-0007). The player is the seller;
 * the Thread carries the buyer's consequence back. One screen per card, no
 * excludes added.
 */
test.describe('fun-pass ticket 08: the villain cards', () => {
	test('month screen: the phone-shop shift sells the split, and the Thread follows', async ({
		page
	}) => {
		await seedRun(page, VILLAIN_SHIFT_RUN);
		await expect(page.getByRole('heading', { name: 'The Saturday shift' })).toBeVisible();
		await expect(
			page.getByText(
				'You pick up a Saturday at the phone shop. A mate walks in wanting the handset in the window, and the four-payment plan is the only way they leave with it today.'
			)
		).toBeVisible();

		/* The player is the seller: the Choice is theirs to offer. */
		await expect(page.getByRole('button', { name: 'Sell the four payments' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sell it paid in full' })).toBeVisible();

		/* The Choice plants the Thread; the world chip counts it down. */
		await page.getByRole('button', { name: 'Sell the four payments' }).click();
		await expect(page.getByText('The phone you sold — the third payment in 3 months')).toBeVisible();

		await expectNoAxeViolations(page, 'the phone-shop villain card with a live Thread');
	});

	test('month screen: the referral page pays for friends, and the Thread follows', async ({
		page
	}) => {
		await seedRun(page, VILLAIN_REFERRAL_RUN);
		await expect(page.getByRole('heading', { name: 'The referral page' })).toBeVisible();
		await expect(
			page.getByText(
				'The sign-up bonus cleared overnight: ◈25 paid for a friend who joined off your link. The referral page is one tap from the group chat, and two people there are asking what the app is.'
			)
		).toBeVisible();

		/* The player is the seller of the link, and the game flags nothing. */
		await expect(page.getByRole('button', { name: 'Post the link in the chat' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Leave it at the one' })).toBeVisible();

		await page.getByRole('button', { name: 'Post the link in the chat' }).click();
		await expect(page.getByText('The friend who joined — the check-in in 3 months')).toBeVisible();

		await expectNoAxeViolations(page, 'the referral villain card with a live Thread');
	});
});

/**
 * Fun-pass ticket 09: the Fund is wired. A deposit moves Save → Fund (blocked
 * when unaffordable, never borrowed), the crash is the month's real movement,
 * and the Stats Sheet's Fund row carries live money. No excludes added.
 */
test.describe('fun-pass ticket 09: the Fund is wired', () => {
	test('month screen: an unaffordable deposit is disabled with the reason in words', async ({
		page
	}) => {
		await seedRun(page, FUND_BLOCKED_RUN);
		await expect(page.getByRole('heading', { name: 'Something that actually grows' })).toBeVisible();

		/* The Save side holds ◈200; the ◈400 deposit is blocked, never Debt. */
		const open = page.getByRole('button', { name: /Put some in/ });
		await expect(open).toBeDisabled();
		await expect(
			open.getByText('Not enough in Savings — the Fund cannot borrow.')
		).toBeVisible();
		await expect(page.getByRole('button', { name: /Leave it in savings/ })).toBeEnabled();

		await expectNoAxeViolations(page, 'the Fund card with a blocked deposit');
	});

	test('month screen: the crash falls on a funded Fund, and the Ledger Line shows it', async ({
		page
	}) => {
		await seedRun(page, FUND_CRASH_RUN);
		await expect(page.getByRole('heading', { name: 'The market falls' })).toBeVisible();
		await expect(
			page.getByText(
				'Everything in the fund is down a quarter in two months. Everyone on the internet has an opinion and all of them are panicking.'
			)
		).toBeVisible();

		/* Holding takes the quarter: the Fund moves, visibly, in the Feedback. */
		await page.getByRole('button', { name: 'Hold it' }).click();
		await expect(page.locator('[aria-live="polite"] #ledger-line')).toHaveText('Fund −◈100');

		await expectNoAxeViolations(page, 'the crash answer with the Fund moving');
	});

	test('month screen: the Stats Sheet’s Fund row carries live money', async ({ page }) => {
		await seedRun(page, FUNDED_RUN);
		await page.getByRole('button', { name: 'Stats' }).click();
		const sheet = page.getByRole('dialog', { name: 'Where the money is' });
		await expect(sheet).toBeVisible();

		await expect(sheet.getByText('Fund', { exact: true })).toBeVisible();
		await expect(sheet.getByText(formatMoneyExact(FUNDED_RUN.fund, 'en'))).toBeVisible();

		await expectNoAxeViolations(page, 'the Stats Sheet with a live Fund row');
	});

	test('the Money Story: the Fund Milestones derive from the Run’s own record', async ({
		page
	}) => {
		await seedRun(page, FINAL_MONTH_RUN);
		await page.getByRole('button', { name: 'Next' }).click();
		await expect(page.getByRole('heading', { name: 'Five years, in one page.' })).toBeVisible();

		/* The gate run funded the Fund and held the crash, so the two new
		   Milestones land as names, derived — never a count. */
		const milestones = earnedMilestones(FINAL_MONTH_RUN).map((milestone) => milestone.id);
		expect(milestones).toContain('fund_opened');
		expect(milestones).toContain('rode_the_recovery');
		const list = page.getByRole('region', { name: 'Milestones', exact: true });
		await expect(list.getByText(milestoneLabel('fund_opened'))).toBeVisible();
		await expect(list.getByText(milestoneLabel('rode_the_recovery'))).toBeVisible();

		await expectNoAxeViolations(page, 'the Money Story with the Fund Milestones');
	});
});
