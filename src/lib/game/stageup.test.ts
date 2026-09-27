import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from './loop';
import { STUDENT_LOAN } from './economy';
import { chosenFeedback } from '$lib/i18n/card-text';
import { stageUpReview } from './milestones';
import type { RunState } from './types';

/** A Run dropped into Stage 4 (month 37), ready to walk into Stage 5. */
function atStage4(): RunState {
	return applyAction(createRun(), { type: 'JUMP_STAGE', stage: 4 });
}

/** A Run dropped at Stage 5's opening month, where the Fork waits. */
function atFork(): RunState {
	return applyAction(createRun(), { type: 'JUMP_STAGE', stage: 5 });
}

function take(s: RunState, choiceId: string): RunState {
	return applyAction(s, { type: 'CHOOSE', choiceId });
}

/**
 * Plays a whole Run, resolving every Stage-up as it opens, and records each
 * Stage-up's stage, card and Year in Review (fun-pass ticket 02).
 */
function playWholeRun(seed: number): {
	run: RunState;
	stageUps: Array<{ stage: number; card: string; year: number; netWorth: number | null }>;
} {
	const stageUps: Array<{ stage: number; card: string; year: number; netWorth: number | null }> = [];
	let s = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });

	for (let month = 1; month <= 60; month++) {
		// A Stage-up card opens its Stage before that month can be planned.
		if (s.phase === 'stage_up' && s.card) {
			const review = stageUpReview(s);
			stageUps.push({
				stage: s.stage,
				card: s.card.id,
				year: review?.year ?? -1,
				netWorth: review?.netWorth ?? null
			});
			s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
			s = applyAction(s, { type: 'CONTINUE' });
		}

		s = applyAction(s, { type: 'SET_HOURS', hours: 0 });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		if (!s.card) break;
		const affordable = s.card.choices.find((c) => {
			const hours = c.freeTime ?? 0;
			return !(hours < 0 && Math.abs(hours) > s.freeTime);
		});
		s = applyAction(s, { type: 'CHOOSE', choiceId: (affordable ?? s.card.choices[0]).id });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'NEXT_MONTH' });
	}

	return { run: s, stageUps };
}

describe('the stage-up at every Stage (fun-pass ticket 02)', () => {
	it('opens stages 2–5 with a Stage-up carrying the year just closed', () => {
		// The design's fix for the missing interstitials: the Year in Review
		// fires every year, not only at the Fork, because stages 2–4 now have
		// their own Stage-up cards — content only, dealt by the shipped reducer.
		const { run, stageUps } = playWholeRun(20260926);
		expect(stageUps.map((up) => ({ stage: up.stage, card: up.card, year: up.year }))).toEqual([
			{ stage: 2, card: 'the_second_year', year: 1 },
			{ stage: 3, card: 'the_third_year', year: 2 },
			{ stage: 4, card: 'the_fourth_year', year: 3 },
			{ stage: 5, card: 'the_fork', year: 4 }
		]);
		// Every review reads a real closed year from the stored record.
		for (const up of stageUps) expect(up.netWorth, `stage ${up.stage}`).not.toBeNull();
		expect(run.phase).toBe('done');
	});
});

describe('the Stage-5 stage-up (ticket 18)', () => {
	it('deals the Fork before the Stage’s first Plan, on the natural transition', () => {
		let s = atStage4();
		for (let i = 0; i < 12; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(49);
		expect(s.stage).toBe(5);
		expect(s.phase).toBe('stage_up');
		expect(s.card?.id).toBe('the_fork');
	});

	it('resolves the path before the month can be planned', () => {
		let s = take(atFork(), 'work');
		expect(s.path).toBe('work');
		expect(s.phase).toBe('stage_up');
		// The Feedback comes from the catalogue through the chosen card + choice
		// (ticket 26) — no prose is stored on the Run.
		expect(chosenFeedback(s.card, s.chosen)).toBeTruthy();
		expect(s.log.at(-1)).toEqual({ month: 49, card: 'the_fork', choice: 'work' });

		s = applyAction(s, { type: 'CONTINUE' });
		expect(s.phase).toBe('plan');
		expect(s.card).toBeNull();

		s = runActions(s, { type: 'SET_HOURS', hours: 0 }, { type: 'CONFIRM_PLAN' });
		expect(s.card).not.toBeNull();
		expect(s.card?.id).not.toBe('the_fork');
	});

	it('pays the work deposit from cash, then savings, then debt', () => {
		const fromCash = take({ ...atFork(), cash: 1000, savings: 0, debt: 0 }, 'work');
		expect([fromCash.cash, fromCash.savings, fromCash.debt]).toEqual([350, 0, 0]);

		const fromSavings = take({ ...atFork(), cash: 100, savings: 1000, debt: 0 }, 'work');
		expect([fromSavings.cash, fromSavings.savings, fromSavings.debt]).toEqual([0, 450, 0]);

		const toDebt = take({ ...atFork(), cash: 100, savings: 100, debt: 0 }, 'work');
		expect([toDebt.cash, toDebt.savings, toDebt.debt]).toEqual([0, 0, 450]);
	});

	it('still carries the Student Loan for the study path', () => {
		const s = take(atFork(), 'study');
		expect(s.path).toBe('study');
		expect(s.debt).toBe(STUDENT_LOAN);
	});
});
