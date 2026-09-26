import { describe, expect, it } from 'vitest';
import { chipsFor, planWarning, workHintVisible } from './presentation';
import { CARDS, cardById } from './cards';
import { applyAction, createRun } from './loop';
import type { Choice, RunState } from './types';

/** A fresh Run dropped into a given Stage by the test scaffolding. */
function atStage(stage: number): RunState {
	return applyAction(createRun(), { type: 'JUMP_STAGE', stage });
}

function choice(cardId: string, choiceId: string): Choice {
	const c = cardById(cardId)?.choices.find((x) => x.id === choiceId);
	if (!c) throw new Error(`no ${cardId}/${choiceId}`);
	return c;
}

describe('cost chips', () => {
	it('shows a money cost and an hours cost together', () => {
		expect(chipsFor({ id: 'x', label: 'x', cost: 25, freeTime: -6, feedback: '' }, false)).toEqual([
			'\u2212\u25c825',
			'\u22126h'
		]);
	});

	it('shows earnings and BNPL instalments', () => {
		expect(chipsFor(choice('extra_shift', 'take'), false)).toEqual(['+\u25c880', '\u221212h']);
		expect(chipsFor(choice('bnpl_trainers', 'bnpl'), false)).toEqual(['4 \u00d7 \u25c830']);
	});

	it('replaces a shock cost with "covered" once insured', () => {
		const shock = choice('phone_cracked', 'ack');
		expect(chipsFor(shock, false)).toEqual(['\u2212\u25c8120']);
		expect(chipsFor(shock, true)).toEqual(['covered']);
	});

	it('says so when a choice costs nothing now', () => {
		expect(chipsFor(choice('bnpl_trainers', 'skip'), false)).toEqual([]);
	});
});

describe('every card', () => {
	it('gives each Choice a visible difference from its siblings', () => {
		// Under ticket 03's reveal model costs are visible and outcomes are not,
		// so two Choices that chip identically are a coin flip, not a decision.
		const offenders: string[] = [];
		for (const card of CARDS) {
			const signatures = card.choices.map((c) => chipsFor(c, false).join(' | '));
			if (new Set(signatures).size !== card.choices.length) offenders.push(card.id);
		}
		expect(offenders).toEqual([]);
	});
});

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

	it('stays quiet before the Fork is chosen, when the obligation is not yet real', () => {
		expect(planWarning(atStage(5))).toBeNull();
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
