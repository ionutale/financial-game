import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from './loop';
import { ledgerEntries } from './ledger';
import type { RunState } from './types';

/**
 * The Ledger Line (fun-pass ticket 04, design §3.3): the account inside a
 * Feedback of what a Choice actually moved — derived by diffing the two
 * RunStates the reducer returns, so it is automatically truthful for
 * insurance, the Save→Debt cascade and Threads. Changed entries only, in
 * ledger order.
 */

/** A Run with just the balances the ledger reads, for pure before/after cases. */
function balances(
	overrides: Partial<Pick<RunState, 'cash' | 'pots' | 'savings' | 'fund' | 'debt' | 'freeTime'>>
): RunState {
	return { ...createRun(), ...overrides };
}

describe('the Ledger Line (fun-pass ticket 04)', () => {
	it('is empty when the Choice moved nothing', () => {
		const run = balances({});
		expect(ledgerEntries(run, structuredClone(run))).toEqual([]);
	});

	it('lists only the entries that changed, in ledger order', () => {
		const before = balances({});
		const after = balances({ cash: before.cash + 80, freeTime: before.freeTime - 14 });
		expect(ledgerEntries(before, after)).toEqual([
			{ key: 'cash', amount: 80 },
			{ key: 'freeTime', amount: -14 }
		]);
	});

	it('reads the cascade as Save first, then Debt', () => {
		const before = balances({ pots: { need: 20, want: 0, save: 20 } });
		const after = balances({ pots: { need: 20, want: 0, save: 0 }, debt: 15 });
		expect(ledgerEntries(before, after)).toEqual([
			{ key: 'save', amount: -20 },
			{ key: 'debt', amount: 15 }
		]);
	});

	it('treats the Save envelope and the savings account as one Save entry', () => {
		// A plan month drains the Save envelope; a Stage-up cost draws on real
		// savings. Both are the same account to the player: Save.
		const before = balances({ pots: { need: 0, want: 0, save: 10 }, savings: 90 });
		const after = balances({ pots: { need: 0, want: 0, save: 0 }, savings: 80 });
		expect(ledgerEntries(before, after)).toEqual([{ key: 'save', amount: -20 }]);
	});

	it('names the Need and Want envelopes and the Fund when they move', () => {
		const before = balances({ pots: { need: 30, want: 40, save: 0 }, fund: 0 });
		const after = balances({ pots: { need: 20, want: 40, save: 0 }, fund: 100 });
		expect(ledgerEntries(before, after)).toEqual([
			{ key: 'need', amount: -10 },
			{ key: 'fund', amount: 100 }
		]);
	});

	it('signs Debt upward when it grows and downward when it is paid', () => {
		const owed = balances({ debt: 40 });
		const paid = balances({ debt: 25 });
		expect(ledgerEntries(owed, paid)).toEqual([{ key: 'debt', amount: -15 }]);
	});

	it('reads a real Choice: the odd job pays cash and costs hours', () => {
		// odd_job / take: ◈30 in, fourteen hours out (the design's own shape).
		let s = runActions(createRun(), { type: 'FORCE_CARD', id: 'odd_job' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		const before = s;
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'take' });
		expect(ledgerEntries(before, s)).toEqual([
			{ key: 'cash', amount: 30 },
			{ key: 'freeTime', amount: -14 }
		]);
	});

	it('reads a real cascade: a Save cost that overflows into Debt', () => {
		// A Stage-3 evening of hours funds a ◈20 Save envelope, and the ◈40 loan
		// overruns it: Save first, then Debt — exactly what the Feedback's
		// cascade sentence describes in prose.
		let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage: 3 });
		s = applyAction(s, { type: 'CHOOSE', choiceId: s.card!.choices[0].id });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'SET_HOURS', hours: 2 });
		s = applyAction(s, { type: 'FORCE_CARD', id: 'lend_to_friend' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		const before = s;
		expect(before.pots.save).toBe(20);

		s = applyAction(s, { type: 'CHOOSE', choiceId: 'lend' });
		expect(ledgerEntries(before, s)).toEqual([
			{ key: 'save', amount: -20 },
			{ key: 'debt', amount: 20 }
		]);
	});

	it('reads a real Choice that spends an envelope the plan funded', () => {
		// A want cost the Want envelope covers is still a movement: the player
		// sees where the money actually came from.
		let s = runActions(
			createRun(),
			{ type: 'SET_WANT', amount: 40 },
			{ type: 'FORCE_CARD', id: 'two_wants' },
			{ type: 'CONFIRM_PLAN' }
		);
		const before = s;
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'game' });
		expect(ledgerEntries(before, s)).toEqual([{ key: 'want', amount: -40 }]);
	});
});
