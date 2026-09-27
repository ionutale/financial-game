/**
 * The Threads (ticket 03): a consequence one card plants and a later card
 * resolves. `months` is the deadline after which the resolve card is dealt no
 * matter what. Player-facing names live in the message catalogue (ticket 26);
 * a Thread id is what the loop and the Run ever carry.
 */

import type { ThreadState } from './types';

export interface ThreadSpec {
	/** Months from plant to deadline. */
	months: number;
}

export const THREADS: Record<string, ThreadSpec> = {
	course_enrolled: { months: 3 },
	friend_loan: { months: 3 },
	risky_tip: { months: 2 },
	// Fun-pass ticket 07: the cast's consequences. Named where they belong to a
	// person — Mum's week, Priya's shift, Ravi's weekend, Grandma's boxes — and
	// the trip, which belongs to the group.
	mum_shop: { months: 2 },
	trip_tally: { months: 3 },
	priya_swap: { months: 3 },
	grandma_visit: { months: 2 },
	ravi_cover: { months: 3 }
};

/** The month a Thread falls due. */
export function threadDue(thread: Pick<ThreadState, 'id' | 'since'>): number {
	return thread.since + (THREADS[thread.id]?.months ?? 0);
}
