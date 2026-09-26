/**
 * The Stats Sheet's numbers (ticket 20). Pure derivations only: the sheet
 * itself is UI state, never part of RunState, and nothing here is persisted.
 */

import { cardById } from './cards';
import { formatMoney, formatMoneyExact, obligationsFor } from './economy';
import { THREADS, threadChip } from './threads';
import type { RunState } from './types';

/** How a row's figure reads: Debt is down, a missing card is quiet. */
export type StatsTone = 'ink' | 'muted' | 'down';

export interface StatsRow {
	key: 'savings' | 'fund' | 'debt' | 'score';
	label: string;
	/** Display-ready: money is formatted here, the score is a bare figure. */
	value: string;
	tone: StatsTone;
}

/** One Thread that resolved, and the month it did. */
export interface ThreadArc {
	label: string;
	month: number;
}

export interface StatsSheet {
	rows: StatsRow[];
	obligations: number;
	/** The live Thread's countdown chip (ticket 03), or null. */
	liveThread: string | null;
	/** Resolved Threads, newest first. */
	history: ThreadArc[];
}

/**
 * Thread history from the play log: a card that `resolves` a Thread contributes
 * its label and the month it was played. Sorted newest first.
 */
export function threadHistory(run: Pick<RunState, 'log'>): ThreadArc[] {
	const arcs: ThreadArc[] = [];
	for (const entry of run.log ?? []) {
		const spec = cardById(entry.card)?.resolves;
		const thread = spec ? THREADS[spec] : undefined;
		if (thread) arcs.push({ label: thread.label, month: entry.month });
	}
	return arcs.sort((a, b) => b.month - a.month);
}

/** Everything the Stats Sheet shows, derived from the Run in one place. */
export function statsSheet(run: RunState): StatsSheet {
	return {
		rows: [
			// Ticket 15: the detail view keeps the decimals on Savings and Fund —
			// rounding away the monthly interest hides the compounding lesson.
			{ key: 'savings', label: 'Savings', value: formatMoneyExact(run.savings), tone: 'ink' },
			{ key: 'fund', label: 'Fund', value: formatMoneyExact(run.fund), tone: 'ink' },
			{
				key: 'debt',
				label: 'Debt',
				value: formatMoney(run.debt),
				tone: run.debt > 0 ? 'down' : 'ink'
			},
			{
				key: 'score',
				label: 'Credit score',
				value: run.score === null ? 'No card yet' : String(run.score),
				tone: run.score === null ? 'muted' : 'ink'
			}
		],
		obligations: obligationsFor(run),
		// Old saves predate the thread field; `?? null` keeps them openable.
		liveThread: threadChip({ thread: run.thread ?? null, month: run.month }),
		history: threadHistory(run)
	};
}
