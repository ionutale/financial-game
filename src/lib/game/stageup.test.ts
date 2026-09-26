import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from './loop';
import { STUDENT_LOAN } from './economy';
import { chosenFeedback } from '$lib/i18n/card-text';
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
