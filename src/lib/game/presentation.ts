/**
 * Presentation rules that must not be left to an author's prose (ticket 03).
 * The shortfall warning is arithmetic only. Cost chips live in `$lib/i18n/chips`
 * because they are locale-formatted text (ticket 26).
 */

import { cardById } from './cards';
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

/**
 * Fun-pass ticket 02: the Cold Open moved “how a month works” to where it is
 * needed. The hint shows on the first Plan step — month 1, before any plan has
 * been confirmed — in the shipped Wage-Hint pattern, and retires itself: once
 * the plan is confirmed the record says so (self-retiring, no new state).
 */
export function firstMonthHintVisible(run: Pick<RunState, 'month' | 'lastPlan'>): boolean {
	return run.month === 1 && run.lastPlan === null;
}

/**
 * Taught once, trusted after (ADR-0004, ticket 01): is the Run's current card
 * the first played card carrying its Concept? True at the Teachable Moment, so
 * the Why renders open there and collapsed at every later card.
 *
 * Pure and derived: the log and the deck answer it, no state is added. The
 * card's own entry (written when the Choice is taken) is not an earlier
 * encounter; an unknown card id in a legacy log carries no Concept and is
 * skipped, and a save without a log is read as a Run that has met nothing.
 * A card with no Concept of its own teaches nothing, so it never opens the Why.
 */
export function isFirstEncounter(run: Pick<RunState, 'log' | 'card'>): boolean {
	const card = run.card;
	const concept = card?.concept;
	if (!card || !concept) return false;

	// The draw deals a card at most once, so the current card's id marks its
	// own entry; every other entry is earlier than this meeting.
	for (const entry of run.log ?? []) {
		if (entry.card === card.id) continue;
		if (cardById(entry.card)?.concept === concept) return false;
	}
	return true;
}
