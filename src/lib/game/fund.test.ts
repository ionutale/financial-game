import { describe, expect, it } from 'vitest';
import { netWorth, saveTotal, savedTowardGoal } from './economy';
import { applyAction, createRun, runActions } from './loop';
import { CRASH_MONTH, marketFactor } from './market';
import { statsSheet } from './stats';
import type { RunState } from './types';

const SEED = 2024;

/** A Run at Stage 5 in the given month, before that month's Plan. */
function atStage5(month: number): RunState {
	let s = applyAction(createRun(SEED), { type: 'JUMP_STAGE', stage: 5 });
	s = runActions(s, { type: 'CHOOSE', choiceId: 'work' }, { type: 'CONTINUE' });
	while (s.month < month) s = applyAction(s, { type: 'NEXT_MONTH' });
	return s;
}

/** The month's card dealt, plan confirmed with the given envelopes. */
function dealt(month: number, patch: Partial<RunState> = {}, card = 'the_fund'): RunState {
	const planned = runActions(
		atStage5(month),
		{ type: 'SET_HOURS', hours: 0 },
		{ type: 'SET_NEED', amount: 400 },
		{ type: 'SET_WANT', amount: 400 },
		{ type: 'FORCE_CARD', id: card },
		{ type: 'CONFIRM_PLAN' }
	);
	return { ...planned, ...patch };
}

/** One month played to its close with a no-op card, through the reducer. */
function closeWithCard(s: RunState, month: number, card = 'birthday_gift'): RunState {
	let next = applyAction(s, { type: 'NEXT_MONTH' });
	if (next.month !== month) throw new Error(`expected month ${month}, got ${next.month}`);
	next = runActions(
		next,
		{ type: 'SET_HOURS', hours: 0 },
		{ type: 'FORCE_CARD', id: card },
		{ type: 'CONFIRM_PLAN' },
		{ type: 'CHOOSE', choiceId: 'skip' },
		{ type: 'CONTINUE' }
	);
	return next;
}

describe('the Fund deposit (sets.fund, ticket 09)', () => {
	it('moves money from the Save envelope into the Fund, as a move not a spend', () => {
		const before = dealt(49);
		expect(before.pots.save).toBe(800); // ◈1,600 income: 400 + 400 planned, 800 saved

		const after = applyAction(before, { type: 'CHOOSE', choiceId: 'open' });
		expect(after.fund).toBe(400);
		expect(after.pots.save).toBe(400);
		expect(after.savings).toBe(0);
		// The deposit is a move: nothing was borrowed, nothing was spent.
		expect(after.debt).toBe(before.debt);
		expect(netWorth(after)).toBe(netWorth(before));
	});

	it('takes from the savings account when the envelope is short', () => {
		const before = dealt(49, { savings: 400, pots: { need: 0, want: 0, save: 100 } });
		const after = applyAction(before, { type: 'CHOOSE', choiceId: 'open' });
		expect(after.fund).toBe(400);
		expect(after.pots.save).toBe(0);
		expect(after.savings).toBe(100); // 400 − 300 from the account
	});

	it('is affordable when Save covers it exactly', () => {
		const before = dealt(49, { savings: 0, pots: { need: 0, want: 0, save: 400 } });
		const after = applyAction(before, { type: 'CHOOSE', choiceId: 'open' });
		expect(after.fund).toBe(400);
		expect(after.pots.save).toBe(0);
	});

	it('is blocked when the Save money is not there — and never becomes Debt', () => {
		const before = dealt(49, { cash: 5000, savings: 100, pots: { need: 0, want: 0, save: 100 } });
		const after = applyAction(before, { type: 'CHOOSE', choiceId: 'open' });

		expect(after.chosen).toBeNull();
		expect(after.fund).toBe(0);
		expect(after.debt).toBe(before.debt);
		expect(after.cash).toBe(5000);
		expect(after.savings).toBe(100);
	});

	it('grows at the month close through the seeded market', () => {
		const bought = applyAction(dealt(49), { type: 'CHOOSE', choiceId: 'open' });
		const closed = applyAction(bought, { type: 'CONTINUE' });
		expect(closed.fund).toBeCloseTo(400 * marketFactor(SEED, 49), 6);
		// The month's history carries the Fund inside Savings, as shipped.
		expect(closed.history[closed.history.length - 1].savings).toBeCloseTo(closed.savings + closed.fund, 6);
	});
});

describe('the crash at month 55 (ticket 09)', () => {
	/** The crash card dealt, with a funded account. */
	function atCrash(patch: Partial<RunState> = {}): RunState {
		return dealt(CRASH_MONTH, patch, 'the_crash');
	}

	it('takes a quarter from the Fund when the Choice is taken', () => {
		const s = applyAction(atCrash({ fund: 400 }), { type: 'CHOOSE', choiceId: 'hold' });
		expect(s.fund).toBe(300);
		// And the month's close does not move it again.
		const closed = applyAction(s, { type: 'CONTINUE' });
		expect(closed.fund).toBe(300);
	});

	it('sells at the fallen value: the Fund lands in Savings, the loss locked', () => {
		const s = applyAction(atCrash({ fund: 400, savings: 1000, pots: { need: 0, want: 0, save: 0 } }), {
			type: 'CHOOSE',
			choiceId: 'sell'
		});
		expect(s.fund).toBe(0);
		expect(s.savings).toBe(1300); // 1,000 + the fallen 300
	});

	it('buys at the fallen price: the deposit lands after the fall', () => {
		const s = applyAction(atCrash({ fund: 400, savings: 1000, pots: { need: 0, want: 0, save: 0 } }), {
			type: 'CHOOSE',
			choiceId: 'buy'
		});
		expect(s.fund).toBe(500); // 300 left + 200 bought in
		expect(s.savings).toBe(800);
	});

	it('does not crash twice when an unaffordable buy is refused, then hold is taken', () => {
		const broke = atCrash({ fund: 400, cash: 5000, savings: 0, pots: { need: 0, want: 0, save: 0 } });
		const refused = applyAction(broke, { type: 'CHOOSE', choiceId: 'buy' });
		expect(refused.chosen).toBeNull();
		expect(refused.fund).toBe(400); // the guard runs before the crash

		const held = applyAction(refused, { type: 'CHOOSE', choiceId: 'hold' });
		expect(held.fund).toBe(300);
	});

	it('leaves a fund-free Run with a no-op crash', () => {
		const before = atCrash({ fund: 0, savings: 0 });
		const s = applyAction(before, { type: 'CHOOSE', choiceId: 'sell' });
		expect(s.fund).toBe(0);
		expect(s.savings).toBe(0);
		expect(s.debt).toBe(before.debt); // no fee, no borrowing for an empty sale
	});
});

describe('the recovery (ticket 09)', () => {
	it('restores a held Fund through the scripted months 56–58', () => {
		let s = runActions(
			dealt(CRASH_MONTH, { fund: 400 }, 'the_crash'),
			{ type: 'CHOOSE', choiceId: 'hold' },
			{ type: 'CONTINUE' }
		);
		expect(s.fund).toBe(300);

		s = closeWithCard(s, 56);
		expect(s.fund).toBeCloseTo(330, 6);
		s = closeWithCard(s, 57);
		expect(s.fund).toBeCloseTo(363, 6);
		s = closeWithCard(s, 58);
		// 0.75 × 1.1³ = 0.99825: restored to within a fifth of a per cent.
		expect(s.fund).toBeCloseTo(399.3, 6);
	});

	it('keeps a sold Fund out of the recovery', () => {
		let s = runActions(
			dealt(CRASH_MONTH, { fund: 400 }, 'the_crash'),
			{ type: 'CHOOSE', choiceId: 'sell' },
			{ type: 'CONTINUE' }
		);
		expect(s.fund).toBe(0);
		// The recovery multiplies only the Fund; a sold Fund stays sold.
		for (const month of [56, 57, 58]) {
			s = closeWithCard(s, month);
			expect(s.fund).toBe(0);
		}
	});

	it('lets a bought-in Fund ride the recovery from the fallen price', () => {
		let s = runActions(
			dealt(CRASH_MONTH, { fund: 400, savings: 1000, pots: { need: 0, want: 0, save: 0 } }, 'the_crash'),
			{ type: 'CHOOSE', choiceId: 'buy' },
			{ type: 'CONTINUE' }
		);
		s = closeWithCard(s, 56);
		s = closeWithCard(s, 57);
		s = closeWithCard(s, 58);
		expect(s.fund).toBeCloseTo(500 * 1.1 ** 3, 6);
	});
});

describe('legacy saves (ticket 09)', () => {
	/** An old save from before the Fund was wired: fund absent. */
	function legacy(): RunState {
		return { ...createRun(), fund: undefined as unknown as number };
	}

	it('treats an absent Fund as zero — never NaN — wherever the money is read', () => {
		const run = legacy();
		expect(netWorth(run)).toBe(60);
		expect(savedTowardGoal(run)).toBe(0);
		// No Fund row: the sheet shows the Fund only when it holds money (AC4).
		expect(statsSheet(run).rows.some((row) => row.key === 'fund')).toBe(false);
		expect(saveTotal(run)).toBe(0);
	});

	it('closes a month exactly as a zero-Fund Run does', () => {
		const closed = runActions(
			legacy(),
			{ type: 'SET_HOURS', hours: 0 },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' }
		);
		expect(closed.fund).toBeUndefined();
		expect(closed.history[0].savings).toBeCloseTo(40.1, 6);
		expect(netWorth(closed)).toBeCloseTo(100.1, 6);
	});
});
