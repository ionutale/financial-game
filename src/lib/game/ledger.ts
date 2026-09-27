/**
 * The Ledger Line (fun-pass ticket 04, design §3.3): the one-line account,
 * inside a Feedback, of what a Choice actually moved — the changed balances
 * and Free Time, with signs.
 *
 * Derived at the Month Screen edge by diffing the two RunStates the reducer
 * already returns: no new field, no economy recomputation, and automatically
 * truthful for insurance, the Save→Debt cascade and Threads. Changed entries
 * only — a Choice that moved nothing earns no line. Nothing here is
 * persisted, and the final values are always in the DOM.
 */

import type { RunState } from './types';

/** The accounts the line can name, in reading order. */
export type LedgerEntryKey = 'cash' | 'need' | 'want' | 'save' | 'fund' | 'debt' | 'freeTime';

export interface LedgerEntry {
	key: LedgerEntryKey;
	/** The signed movement in game units (hours for `freeTime`). */
	amount: number;
}

type Balance = Pick<RunState, 'cash' | 'pots' | 'savings' | 'fund' | 'debt' | 'freeTime'>;

/**
 * The Save entry is the Save envelope plus the savings account — one account
 * to the player, whether a plan month drew on the envelope or a Stage-up cost
 * drew on real savings. Debt is signed upward when it grows, so
 * `Save −◈20 · Debt +◈15` reads as the cascade biting.
 */
export function ledgerEntries(before: Balance, after: Balance): LedgerEntry[] {
	const movements: Array<[LedgerEntryKey, number]> = [
		['cash', after.cash - before.cash],
		['need', after.pots.need - before.pots.need],
		['want', after.pots.want - before.pots.want],
		['save', after.pots.save + after.savings - (before.pots.save + before.savings)],
		['fund', after.fund - before.fund],
		['debt', after.debt - before.debt],
		['freeTime', after.freeTime - before.freeTime]
	];
	return movements
		.filter(([, amount]) => amount !== 0)
		.map(([key, amount]) => ({ key, amount }));
}
