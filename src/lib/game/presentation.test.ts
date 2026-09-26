import { describe, expect, it } from 'vitest';
import { planWarning, workHintVisible } from './presentation';
import { applyAction, createRun } from './loop';
import type { RunState } from './types';

/** A fresh Run dropped into a given Stage by the test scaffolding. */
function atStage(stage: number): RunState {
	return applyAction(createRun(), { type: 'JUMP_STAGE', stage });
}

describe('the shortfall warning (ticket 17)', () => {
	it('names the gap when the plan cannot cover this month', () => {
		// Stage 3 opens with no allowance: 0h earns nothing and 120 is due.
		expect(planWarning(atStage(3))).toEqual({
			due: 120,
			income: 0,
			gap: 120,
			source: 'debt'
		});
	});

	it('counts cash and savings before the gap becomes debt', () => {
		const covered = atStage(3);
		covered.cash = 60;
		covered.savings = 60;
		expect(planWarning(covered)?.source).toBe('savings');
	});

	it('goes quiet as soon as the plan covers the fixed costs', () => {
		const planned = applyAction(atStage(3), { type: 'SET_HOURS', hours: 12 });
		expect(planWarning(planned)).toBeNull();
	});
});

describe('the Stage-3 work hint (ticket 17)', () => {
	it('shows on an empty Stage 3–4 plan and hides once hours are set', () => {
		expect(workHintVisible(atStage(3))).toBe(true);
		expect(workHintVisible(applyAction(atStage(4), { type: 'SET_HOURS', hours: 5 }))).toBe(false);
	});

	it('never returns once retired', () => {
		const retired = atStage(3);
		retired.workHintDone = true;
		expect(workHintVisible(retired)).toBe(false);
	});

	it('stays off outside the wage Stages', () => {
		expect(workHintVisible(createRun())).toBe(false);
		expect(workHintVisible(atStage(5))).toBe(false);
	});
});
