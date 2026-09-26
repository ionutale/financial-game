/**
 * Presentation rules that must not be left to an author's prose (ticket 03).
 * The shortfall warning is arithmetic only. Cost chips live in `$lib/i18n/chips`
 * because they are locale-formatted text (ticket 26).
 */

import { expectedIncome, obligationsFor } from './economy';
import type { RunState } from './types';

export interface PlanWarning {
	/** This month's Obligations, as far as the plan can know them. */
	due: number;
	/** Expected income as the plan currently stands. */
	income: number;
	/** The part of the Obligations that income does not cover. */
	gap: number;
	/** Where the gap lands when the month closes: on the buffer, or on Debt. */
	source: 'savings' | 'debt';
}

/**
 * Ticket 17: doing nothing is the worst plan, and the Plan step has to say so
 * before the month starts. This is arithmetic only — fixed costs against
 * expected income — and never mentions the month's card (ticket 04's reveal
 * model). Returns null when there is nothing to warn about.
 */
export function planWarning(run: RunState): PlanWarning | null {
	const due = obligationsFor(run);
	const income = expectedIncome(run);
	if (due <= income) return null;

	const gap = due - income;
	const buffer = run.cash + run.savings;
	return { due, income, gap, source: buffer >= gap ? 'savings' : 'debt' };
}

/**
 * Ticket 17: Stage 3 is where the allowance stops and the hours slider becomes
 * the income. The hint shows while the plan still has 0 hours in Stages 3–4 and
 * retires for good the first time the player sets hours (see SET_HOURS). The
 * shortfall warning carries the lesson from then on.
 */
export function workHintVisible(run: RunState): boolean {
	return !run.workHintDone && run.hours === 0 && (run.stage === 3 || run.stage === 4);
}
