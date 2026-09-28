import { describe, expect, it } from 'vitest';
import { cardById } from './cards';
import {
	firstMonthHintVisible,
	insuranceAbsorbed,
	isFirstEncounter,
	planWarning,
	workHintVisible
} from './presentation';
import { applyAction, createRun, runActions } from './loop';
import type { Card, RunState } from './types';

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

describe('the first-month Plan hint (fun-pass ticket 02)', () => {
	it('shows on month 1 before the first plan is confirmed, and retires itself', () => {
		// The Cold Open moved “how a month works” to where it is needed: a hint
		// on the first Plan step, derived from the record (month 1, no confirmed
		// plan yet) like the Wage Hint — self-retiring, no new state.
		expect(firstMonthHintVisible(createRun())).toBe(true);

		const confirmed = runActions(createRun(), { type: 'CONFIRM_PLAN' });
		expect(confirmed.lastPlan).not.toBeNull();
		expect(firstMonthHintVisible(confirmed)).toBe(false);

		// A later month without a plan (a legacy save) never sees it again.
		expect(firstMonthHintVisible({ ...confirmed, month: 2, lastPlan: null })).toBe(false);
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

/** A Run holding a card, with only the log entries the fixture names. */
function withLog(cardId: string, log: RunState['log']): Pick<RunState, 'log' | 'card'> {
	return { card: cardById(cardId) ?? null, log };
}

describe('the first encounter (ADR-0004, ticket 01)', () => {
	it('opens the Why on the first played card carrying the Concept', () => {
		expect(
			isFirstEncounter(withLog('birthday_gift', [{ month: 1, card: 'birthday_gift', choice: 'skip' }]))
		).toBe(true);
	});

	it('counts the card’s own log entry as the encounter, not as something earlier', () => {
		// While the Feedback renders the card has just been logged; a first play
		// must not treat its own entry as a previous meeting.
		expect(isFirstEncounter(withLog('two_wants', [{ month: 1, card: 'two_wants', choice: 'game' }]))).toBe(
			true
		);
		// Before the Choice is taken the entry is absent — same answer.
		expect(isFirstEncounter(withLog('two_wants', []))).toBe(true);
	});

	it('collapses the Why once an earlier card carried the Concept', () => {
		// two_wants and birthday_gift are both needs_vs_wants.
		expect(
			isFirstEncounter(
				withLog('birthday_gift', [
					{ month: 1, card: 'two_wants', choice: 'game' },
					{ month: 4, card: 'birthday_gift', choice: 'skip' }
				])
			)
		).toBe(false);
	});

	it('ignores earlier cards of other Concepts', () => {
		// odd_job is earning_work; it does not front-run needs_vs_wants.
		expect(
			isFirstEncounter(
				withLog('birthday_gift', [
					{ month: 1, card: 'odd_job', choice: 'take' },
					{ month: 4, card: 'birthday_gift', choice: 'skip' }
				])
			)
		).toBe(true);
	});

	it('teaches nothing for a card with no Concept, or no card at all', () => {
		// The Fork is a Stage-up card and carries no Concept of its own.
		expect(isFirstEncounter(withLog('the_fork', [{ month: 49, card: 'the_fork', choice: 'work' }]))).toBe(
			false
		);
		expect(isFirstEncounter({ card: null, log: [] })).toBe(false);
	});

	it('stays readable over unknown card ids and a legacy save with no log', () => {
		expect(
			isFirstEncounter(
				withLog('two_wants', [
					{ month: 1, card: 'a_card_the_deck_no_longer_carries', choice: 'x' },
					{ month: 2, card: 'two_wants', choice: 'game' }
				])
			)
		).toBe(true);
		const legacy = { card: cardById('two_wants') ?? null } as Pick<RunState, 'log' | 'card'>;
		expect(isFirstEncounter(legacy)).toBe(true);
	});

	it('reads the same answer from a real Run’s log', () => {
		let s = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'two_wants' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'game' }
		);
		expect(s.card?.id).toBe('two_wants');
		expect(isFirstEncounter(s)).toBe(true);

		s = runActions(
			s,
			{ type: 'CONTINUE' },
			{ type: 'NEXT_MONTH' },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' }
		);
		expect(s.log.map((entry) => entry.card)).toEqual(['two_wants', 'birthday_gift']);
		expect(isFirstEncounter(s)).toBe(false);
	});
});

/**
 * The covered moment (fun-pass ticket 11, design §3.6): when insurance
 * actually absorbs a shock, the world answers with a dedicated line — the
 * payoff for a decision made months earlier. Pure derivation: the card, the
 * taken Choice and the cover flag; nothing else.
 */
describe('the covered shock (fun-pass ticket 11)', () => {
	/** The cracked phone dealt at month 1, with the cover held or not. */
	function shockRun(insured: boolean): RunState {
		const run = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'phone_cracked' },
			{ type: 'CONFIRM_PLAN' }
		);
		return { ...run, insurance: insured };
	}

	it('fires when the cover takes a shock the Run had insured against', () => {
		const taken = applyAction(shockRun(true), { type: 'CHOOSE', choiceId: 'ack' });
		expect(taken.cascade).toBeNull();
		expect(insuranceAbsorbed(taken)).toBe(true);
	});

	it('stays quiet before the Choice is taken', () => {
		expect(insuranceAbsorbed(shockRun(true))).toBe(false);
	});

	it('stays quiet without the cover — the bill is the month’s own', () => {
		const taken = applyAction(shockRun(false), { type: 'CHOOSE', choiceId: 'ack' });
		expect(insuranceAbsorbed(taken)).toBe(false);
	});

	it('fires for the burst pipe’s emergency call too, and never twice', () => {
		const run = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'burst_pipe' },
			{ type: 'CONFIRM_PLAN' }
		);
		const insured = { ...run, insurance: true };
		const taken = applyAction(insured, { type: 'CHOOSE', choiceId: 'call_now' });
		expect(insuranceAbsorbed(taken)).toBe(true);
		// Not every insurance-bearing Choice absorbs: taping it costs the same
		// with or without cover.
		const taped = applyAction(insured, { type: 'CHOOSE', choiceId: 'tape_it' });
		expect(insuranceAbsorbed(taped)).toBe(false);
	});

	it('does not fire where the cover changes nothing', () => {
		const card: Card = {
			id: 'a_shock_the_cover_does_not_move',
			kind: 'shock',
			stages: [1],
			choices: [{ id: 'pay', cost: 40, insuredCost: 40 }]
		};
		const run = { card, chosen: 'pay', insurance: true } as Pick<
			RunState,
			'card' | 'chosen' | 'insurance'
		>;
		expect(insuranceAbsorbed(run)).toBe(false);
	});

	it('throws nothing on a legacy record with no card, no Choice or no cover field', () => {
		expect(insuranceAbsorbed({ card: null, chosen: null, insurance: true })).toBe(false);
		expect(
			insuranceAbsorbed({ card: cardById('phone_cracked') ?? null, chosen: 'gone', insurance: true })
		).toBe(false);
		const legacy = { card: cardById('phone_cracked') ?? null, chosen: 'ack' } as Pick<
			RunState,
			'card' | 'chosen' | 'insurance'
		>;
		expect(insuranceAbsorbed(legacy)).toBe(false);
	});
});
