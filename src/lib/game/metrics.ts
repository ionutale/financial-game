/**
 * The Money Story's numbers (ticket 05). Computed at the end of a Run; never
 * shown during it, because a player who can see a score optimises the score.
 */

import { GOAL_TARGET, STUDENT_LOAN, STUDY_BUFFER, netWorth } from './economy';
import type { MonthSnapshot, RunState } from './types';

export type OutcomeBand = 'ahead' | 'treading' | 'behind';

export const BAND_LABEL: Record<OutcomeBand, string> = {
	ahead: 'Ahead',
	treading: 'Treading water',
	behind: 'Behind'
};

/**
 * The band is the result, not the behaviour: money, the path's goal, and the
 * score. Behaviour is what the you-vs-you comparison is for (ticket 05).
 */
export function outcomeBand(s: RunState): OutcomeBand {
	const study = s.path === 'study';
	const buffer = s.savings + s.fund;
	const net = netWorth(s);

	const goalMet = study ? buffer >= STUDY_BUFFER && s.debt <= STUDENT_LOAN : net >= GOAL_TARGET;
	const floorMet = study ? s.debt <= STUDENT_LOAN : net >= 1000;
	// On the Study path the loan is expected; anything beyond it is not.
	const clean = study ? s.debt <= STUDENT_LOAN : s.debt <= 0;
	const scoreOk = s.score === null || s.score >= 670;

	if (!floorMet) return 'behind';
	if (goalMet && clean && scoreOk) return 'ahead';
	return 'treading';
}

export interface Comparison {
	label: string;
	y1: number;
	y5: number;
	/** `months` is a count out of twelve; `rate` is a 0–1 fraction. */
	kind: 'months' | 'rate';
}

export interface RunMetrics {
	adherenceByYear: number[];
	adherenceTotal: number;
	savingsRate: number;
	wantShare: number;
	debtTaken: number;
	peakDebt: number;
	finalNetWorth: number;
	finalScore: number | null;
	goalProgress: number;
	goalTarget: number;
	trajectory: number[];
	comparisons: Comparison[];
}

const total = (rows: MonthSnapshot[], pick: (r: MonthSnapshot) => number) =>
	rows.reduce((sum, r) => sum + pick(r), 0);

function year(history: MonthSnapshot[], index: number): MonthSnapshot[] {
	const from = (index - 1) * 12 + 1;
	return history.filter((r) => r.month >= from && r.month <= from + 11);
}

export function computeMetrics(s: RunState): RunMetrics {
	const h = s.history;

	const adherenceByYear: number[] = [];
	for (let y = 1; y <= 5; y++) {
		adherenceByYear.push(year(h, y).filter((r) => r.insideBudget).length);
	}

	const income = total(h, (r) => r.income) || 1;
	const saved = total(h, (r) => r.saved);
	const want = total(h, (r) => r.spentWant);

	// Debt taken is the sum of the increases, not the final balance.
	let debtTaken = 0;
	let previous = 0;
	let peakDebt = 0;
	for (const row of h) {
		if (row.debt > previous) debtTaken += row.debt - previous;
		previous = row.debt;
		peakDebt = Math.max(peakDebt, row.debt);
	}

	const first = year(h, 1);
	const last = year(h, 5);
	const rate = (rows: MonthSnapshot[], pick: (r: MonthSnapshot) => number) => {
		const inc = total(rows, (r) => r.income);
		return inc > 0 ? total(rows, pick) / inc : 0;
	};
	const adherenceIn = (rows: MonthSnapshot[]) => rows.filter((r) => r.insideBudget).length;

	const study = s.path === 'study';

	return {
		adherenceByYear,
		adherenceTotal: h.filter((r) => r.insideBudget).length,
		savingsRate: saved / income,
		wantShare: want / income,
		debtTaken,
		peakDebt,
		finalNetWorth: netWorth(s),
		finalScore: s.score,
		goalProgress: s.savings + s.fund,
		goalTarget: study ? STUDY_BUFFER : GOAL_TARGET,
		trajectory: h.map((r) => r.netWorth),
		comparisons: [
			{
				label: 'Months inside budget',
				y1: adherenceIn(first),
				y5: adherenceIn(last),
				kind: 'months'
			},
			{ label: 'Income saved', y1: rate(first, (r) => r.saved), y5: rate(last, (r) => r.saved), kind: 'rate' },
			{
				label: 'Income spent on wants',
				y1: rate(first, (r) => r.spentWant),
				y5: rate(last, (r) => r.spentWant),
				kind: 'rate'
			}
		]
	};
}

export interface TurningPoint {
	month: number;
	text: string;
}

const FLAG_TEXT: Record<string, (month: number) => string> = {
	overdraft: (m) => `Month ${m}: you let the account go negative rather than wait.`,
	minimum_payment: (m) => `Month ${m}: you paid only the minimum, and the balance barely moved.`,
	card_issued: (m) => `Month ${m}: the card arrived, and with it a score to look after.`,
	'fork:study': (m) => `Month ${m}: you chose to study, and the loan went on the sheet.`,
	'fork:work': (m) => `Month ${m}: you chose to work, and paid a deposit on somewhere to live.`
};

/** Three to six moments, in order, named honestly and without judgement. */
export function turningPoints(s: RunState, limit = 6): TurningPoint[] {
	const known = s.flags
		.filter((f) => FLAG_TEXT[f.kind])
		.sort((a, b) => a.month - b.month)
		.map((f) => ({ month: f.month, text: FLAG_TEXT[f.kind](f.month) }));

	if (known.length <= limit) return known;

	// Spread the sample across the Run so the story is not all one year.
	const step = (known.length - 1) / (limit - 1);
	return Array.from({ length: limit }, (_, i) => known[Math.round(i * step)]);
}
