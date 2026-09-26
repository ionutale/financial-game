/**
 * The Threads (ticket 03): a consequence one card plants and a later card
 * resolves. `payoff` is what the chip promises, never the outcome; `months` is
 * the deadline after which the resolve card is dealt no matter what.
 */

import type { RunState, ThreadState } from './types';

export interface ThreadSpec {
	/** What the chip calls the Thread. */
	label: string;
	/** What is coming, in one word — the chip's promise, not its outcome. */
	payoff: string;
	/** Months from plant to deadline. */
	months: number;
}

export const THREADS: Record<string, ThreadSpec> = {
	course_enrolled: { label: 'The course', payoff: 'certificate', months: 3 },
	friend_loan: { label: 'The money you lent', payoff: 'repayment', months: 3 },
	risky_tip: { label: 'The app', payoff: 'first payout', months: 2 }
};

/** The month a Thread falls due. */
export function threadDue(thread: Pick<ThreadState, 'id' | 'since'>): number {
	return thread.since + (THREADS[thread.id]?.months ?? 0);
}

/**
 * The persistent Month Screen chip (ticket 04), counting down. It names what is
 * coming, never what it will do.
 */
export function threadChip(run: Pick<RunState, 'thread' | 'month'>): string | null {
	if (!run.thread) return null;
	const spec = THREADS[run.thread.id];
	if (!spec) return null;
	const months = threadDue(run.thread) - run.month;
	const when = months > 1 ? `in ${months} months` : months === 1 ? 'in 1 month' : 'this month';
	return `${spec.label} \u2014 ${spec.payoff} ${when}`;
}
