/**
 * Presentation rules that must not be left to an author's prose (ticket 03).
 * Cost chips are derived mechanically from the effect data, so no card can
 * hide a cost in its label or leak an outcome into one.
 */

import { expectedIncome, formatMoney, obligationsFor } from './economy';
import type { Choice, RunState } from './types';

export function chipsFor(choice: Choice, insured: boolean): string[] {
	const chips: string[] = [];

	const cost = choice.insuredCost !== undefined && insured ? choice.insuredCost : (choice.cost ?? 0);
	if (choice.insuredCost !== undefined && insured && cost === 0) {
		chips.push('covered');
	} else if (cost > 0) {
		chips.push('\u2212' + formatMoney(cost));
	}

	if (choice.gain) chips.push('+' + formatMoney(choice.gain));

	if (choice.freeTime) {
		const hours = Math.abs(choice.freeTime);
		chips.push((choice.freeTime > 0 ? '+' : '\u2212') + hours + 'h');
	}

	if (choice.sets?.bnpl) chips.push(`${choice.sets.bnpl} \u00d7 ${formatMoney(30)}`);

	return chips;
}

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
	// Before the Fork is chosen the obligation depends on that choice, so the
	// pre-fork month is suppressed rather than lied about (tickets 17 and 18).
	if (run.stage === 5 && run.path === null) return null;

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
