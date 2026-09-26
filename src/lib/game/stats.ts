/**
 * The Stats Sheet's numbers (ticket 20). Pure derivations only: the sheet
 * itself is UI state, never part of RunState, and nothing here is persisted.
 *
 * Values stay raw — money in game units, the score as a bare figure. Labels and
 * formatting are the sheet component's job, through the catalogue and the
 * active locale (ticket 26).
 */

import { cardById } from './cards';
import { obligationsFor } from './economy';
import { THREADS, threadDue } from './threads';
import type { RunState } from './types';

/** How a row's figure reads: Debt is down, a missing card is quiet. */
export type StatsTone = 'ink' | 'muted' | 'down';

export interface StatsRow {
	key: 'savings' | 'fund' | 'debt' | 'score';
	/** Savings, Fund and Debt in game units; the Credit score, or null for no card. */
	value: number | null;
	tone: StatsTone;
}

/** One Thread that resolved, and the month it did. */
export interface ThreadArc {
	id: string;
	month: number;
}

/** The live Thread's countdown, in the chip's terms. */
export interface LiveThread {
	id: string;
	/** Months until due: ≤ 0 reads as "this month" (ticket 04). */
	months: number;
}

export interface StatsSheet {
	rows: StatsRow[];
	obligations: number;
	liveThread: LiveThread | null;
	/** Resolved Threads, newest first. */
	history: ThreadArc[];
}

/**
 * Thread history from the play log: a card that `resolves` a Thread contributes
 * its id and the month it was played. Sorted newest first.
 */
export function threadHistory(run: Pick<RunState, 'log'>): ThreadArc[] {
	const arcs: ThreadArc[] = [];
	for (const entry of run.log ?? []) {
		const resolves = cardById(entry.card)?.resolves;
		if (resolves && THREADS[resolves]) arcs.push({ id: resolves, month: entry.month });
	}
	return arcs.sort((a, b) => b.month - a.month);
}

/** Everything the Stats Sheet shows, derived from the Run in one place. */
export function statsSheet(run: RunState): StatsSheet {
	// Old saves predate the thread field, and a save can name a Thread the current
	// deck no longer carries; both stay openable rather than throwing.
	const thread = run.thread ?? null;
	const live = thread && THREADS[thread.id] ? thread : null;
	return {
		rows: [
			{ key: 'savings', value: run.savings, tone: 'ink' },
			{ key: 'fund', value: run.fund, tone: 'ink' },
			{ key: 'debt', value: run.debt, tone: run.debt > 0 ? 'down' : 'ink' },
			{ key: 'score', value: run.score, tone: run.score === null ? 'muted' : 'ink' }
		],
		obligations: obligationsFor(run),
		liveThread: live ? { id: live.id, months: threadDue(live) - run.month } : null,
		history: threadHistory(run)
	};
}
