import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from './loop';
import { computeMetrics, outcomeBand, turningPoints } from './metrics';
import type { RunState } from './types';

/** A Run with specific values, for exercising the pure metric functions. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

/** A Run at Stage 5, past the Fork's stage-up and ready to plan (ticket 18). */
function atStage5(): RunState {
	let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage: 5 });
	s = applyAction(s, { type: 'CHOOSE', choiceId: 'study' });
	return applyAction(s, { type: 'CONTINUE' });
}

describe('the outcome band', () => {
	it('is Behind when the floor is missed', () => {
		expect(outcomeBand(withState({ savings: 500 }))).toBe('behind');
	});

	it('is Treading water between the floor and the goal', () => {
		expect(outcomeBand(withState({ savings: 2000 }))).toBe('treading');
	});

	it('is Ahead when the goal is met cleanly', () => {
		expect(outcomeBand(withState({ savings: 4200 }))).toBe('ahead');
	});

	it('drops a goal-met Run that still owes money to Treading water', () => {
		expect(outcomeBand(withState({ savings: 4200, debt: 100 }))).toBe('treading');
	});

	it('drops a goal-met Run with a weak score to Treading water', () => {
		expect(outcomeBand(withState({ savings: 4200, score: 610 }))).toBe('treading');
	});

	it('lets the Study path keep the loan and still be Ahead', () => {
		expect(outcomeBand(withState({ path: 'study', savings: 1200, debt: 3000 }))).toBe('ahead');
	});

	it('puts a Study Run that borrowed beyond the loan Behind', () => {
		expect(outcomeBand(withState({ path: 'study', savings: 1200, debt: 3500 }))).toBe('behind');
	});
});

describe('the history', () => {
	it('records one row per closed month', () => {
		const s = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' }
		);
		expect(s.history).toHaveLength(1);
		expect(s.history[0].month).toBe(1);
		expect(s.history[0].netWorth).toBeCloseTo(100.1, 6); // ◈60 held + ◈40 earned + interest
		expect(s.history[0].insideBudget).toBe(true);
	});

	it('marks a month that went past an envelope', () => {
		const s = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'SET_WANT', amount: 0 },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'buy' },
			{ type: 'CONTINUE' }
		);
		expect(s.history[0].insideBudget).toBe(false);
	});
});

describe('the credit score', () => {
	it('is issued when the Run reaches Stage 5, and not before', () => {
		expect(createRun().score).toBeNull();
		const s5 = atStage5();
		expect(s5.score).toBe(600);
		expect(s5.flags.some((f) => f.kind === 'card_issued')).toBe(true);
	});

	it('rises on a clean month and falls hard on an overdraft', () => {
		const s5 = atStage5();

		const clean = runActions(
			s5,
			{ type: 'FORCE_CARD', id: 'first_taxed_payslip' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'read' },
			{ type: 'CONTINUE' }
		);
		expect(clean.score).toBe(608);

		const dipped = runActions(
			s5,
			{ type: 'FORCE_CARD', id: 'rent_due' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'delay' },
			{ type: 'CONTINUE' }
		);
		expect(dipped.score).toBe(560);
	});
});

describe('the turning points', () => {
	it('names the flagged moments in order', () => {
		const s = withState({
			flags: [
				{ month: 12, kind: 'card_issued' },
				{ month: 34, kind: 'minimum_payment' },
				{ month: 47, kind: 'overdraft' }
			]
		});
		const moments = turningPoints(s);
		expect(moments.map((m) => m.month)).toEqual([12, 34, 47]);
		expect(moments[1].text).toContain('minimum');
	});

	it('spreads a long list across the whole Run rather than truncating it', () => {
		const flags = Array.from({ length: 12 }, (_, i) => ({
			month: i * 4 + 1,
			kind: 'overdraft'
		}));
		const moments = turningPoints(withState({ flags }));
		expect(moments).toHaveLength(6);
		expect(moments[0].month).toBe(1);
		expect(moments[5].month).toBe(45);
	});

	it('ignores flags it has no words for', () => {
		expect(turningPoints(withState({ flags: [{ month: 3, kind: 'nonsense' }] }))).toEqual([]);
	});
});

describe('the metrics', () => {
	it('summarises a Run from its history', () => {
		const s = withState({
			history: [
				{ month: 1, netWorth: 100, savings: 40, debt: 0, income: 40, saved: 40, spentNeed: 0, spentWant: 0, interest: 0, insideBudget: true },
				{ month: 2, netWorth: 140, savings: 80, debt: 0, income: 40, saved: 40, spentNeed: 0, spentWant: 20, interest: 0.1, insideBudget: false },
				{ month: 3, netWorth: 90, savings: 80, debt: 60, income: 40, saved: 0, spentNeed: 60, spentWant: 0, interest: 0.2, insideBudget: true }
			]
		});
		const m = computeMetrics(s);

		expect(m.adherenceTotal).toBe(2);
		expect(m.adherenceByYear[0]).toBe(2);
		expect(m.savingsRate).toBeCloseTo(80 / 120, 4);
		expect(m.wantShare).toBeCloseTo(20 / 120, 4);
		expect(m.debtTaken).toBe(60); // the increase, not the closing balance
		expect(m.peakDebt).toBe(60);
		expect(m.trajectory).toEqual([100, 140, 90]);
	});

	it('compares year one against year five', () => {
		const rows = Array.from({ length: 60 }, (_, i) => ({
			month: i + 1,
			netWorth: 100 + i,
			savings: 0,
			debt: 0,
			income: 100,
			saved: i < 12 ? 10 : 30,
			spentNeed: 0,
			spentWant: 0,
			interest: 0,
			insideBudget: i < 12 ? false : true
		}));
		const m = computeMetrics(withState({ history: rows }));
		const saved = m.comparisons.find((c) => c.label === 'Income saved');

		expect(saved?.y1).toBeCloseTo(0.1, 4);
		expect(saved?.y5).toBeCloseTo(0.3, 4);
		expect(m.comparisons[0].y1).toBe(0);
		expect(m.comparisons[0].y5).toBe(12);
	});
});
