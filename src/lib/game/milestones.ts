/**
 * Milestones (gamification ticket 01). A Milestone is a one-time, event-shaped
 * recognition derived from the Run's stored record — `history`, `log` and
 * `flags` — never from a live rate or a running behavioural aggregate, and it
 * grants nothing: no money, no interest, no score, no Free Time, no unlock.
 * Nothing is persisted (ADR-0002): an id fires in the month its condition first
 * holds, derived by comparison, and old saves render by construction.
 *
 * Pure and dependency-light, in the `metrics.ts` / `stats.ts` tradition.
 *
 * Deliberately absent: `survived_a_shortfall` and `insured_and_claimed` — the
 * record does not carry those signals yet (spec, "Deferred").
 */

import { GOAL_TARGET, STUDY_BUFFER } from './economy';
import { computeMetrics } from './metrics';
import type { MonthSnapshot, RunState } from './types';

/** The v1 catalogue, in the order the design lists it. */
export const MILESTONE_IDS = [
	'first_budget_month',
	'quarter_inside_budget',
	'half_year_inside_budget',
	'first_saved',
	'first_interest',
	'goal_reached',
	'debt_cleared',
	'first_pay',
	'not_fooled',
	'weathered_the_crash',
	'payslip_read',
	'fork_chosen'
] as const;

export type MilestoneId = (typeof MILESTONE_IDS)[number];

/** One earned Milestone, and the month its condition first held. */
export interface EarnedMilestone {
	id: MilestoneId;
	month: number;
}

/** Catalogue position, the tie-break for two Milestones first true in one month. */
const ORDER = new Map<MilestoneId, number>(MILESTONE_IDS.map((id, index) => [id, index]));

/** The record, oldest first. A legacy save may have no history at all. */
function months(run: Pick<RunState, 'history'>): MonthSnapshot[] {
	return [...(run.history ?? [])].sort((a, b) => a.month - b.month);
}

const log = (run: Pick<RunState, 'log'>) => run.log ?? [];
const flags = (run: Pick<RunState, 'flags'>) => run.flags ?? [];

/** The first month a row satisfies a condition, or null. */
function firstMonth(h: MonthSnapshot[], holds: (r: MonthSnapshot) => boolean): number | null {
	for (const month of h) if (holds(month)) return month.month;
	return null;
}

/** The month a run of `length` consecutive inside-budget months completes. */
function firstStreakMonth(h: MonthSnapshot[], length: number): number | null {
	let streak = 0;
	let previous: number | null = null;
	for (const month of h) {
		if (!month.insideBudget) streak = 0;
		else if (previous !== null && month.month === previous + 1) streak += 1;
		else streak = 1;
		previous = month.month;
		if (streak >= length) return month.month;
	}
	return null;
}

/** The first month a card was played with one of `choices` (any choice if omitted). */
function firstPlayed(run: Pick<RunState, 'log'>, card: string, choices?: string[]): number | null {
	let found: number | null = null;
	for (const entry of log(run)) {
		if (entry.card !== card) continue;
		if (choices && !choices.includes(entry.choice)) continue;
		if (found === null || entry.month < found) found = entry.month;
	}
	return found;
}

/** The Fork is resolved in the log (the choice) and/or the flags (the moment). */
function forkMonth(run: Pick<RunState, 'log' | 'flags'>): number | null {
	const played = firstPlayed(run, 'the_fork', ['study', 'work']);
	let flagged: number | null = null;
	for (const flag of flags(run)) {
		if (flag.kind !== 'fork:study' && flag.kind !== 'fork:work') continue;
		if (flagged === null || flag.month < flagged) flagged = flag.month;
	}
	if (played === null) return flagged;
	if (flagged === null) return played;
	return Math.min(played, flagged);
}

/**
 * The Named Goal's target, mirroring `metrics.ts` (`goalProgress` is savings
 * plus Fund): the Study path saves a Buffer, the Work path the full target.
 */
function namedGoalTarget(run: Pick<RunState, 'path'>): number {
	return run.path === 'study' ? STUDY_BUFFER : GOAL_TARGET;
}

/**
 * Every Milestone earned so far, oldest first. A condition that never held in
 * the stored record simply does not appear.
 */
export function earnedMilestones(run: RunState): EarnedMilestone[] {
	const h = months(run);
	const target = namedGoalTarget(run);

	const candidates: Array<[MilestoneId, number | null]> = [
		['first_budget_month', firstMonth(h, (r) => r.insideBudget)],
		['quarter_inside_budget', firstStreakMonth(h, 3)],
		['half_year_inside_budget', firstStreakMonth(h, 6)],
		['first_saved', firstMonth(h, (r) => r.saved > 0)],
		['first_interest', firstMonth(h, (r) => r.interest > 0)],
		['goal_reached', firstMonth(h, (r) => r.savings >= target)],
		['debt_cleared', debtClearedMonth(h)],
		['first_pay', firstPlayed(run, 'first_payslip')],
		['not_fooled', firstPlayed(run, 'scam_opportunity', ['check', 'block'])],
		['weathered_the_crash', firstPlayed(run, 'the_crash', ['hold', 'buy'])],
		['payslip_read', firstPlayed(run, 'first_taxed_payslip', ['read'])],
		['fork_chosen', forkMonth(run)]
	];

	return candidates
		.filter((candidate): candidate is [MilestoneId, number] => candidate[1] !== null)
		.map(([id, month]) => ({ id, month }))
		.sort((a, b) => a.month - b.month || (ORDER.get(a.id) ?? 0) - (ORDER.get(b.id) ?? 0));
}

/** Debt returned to zero after having been above zero. */
function debtClearedMonth(h: MonthSnapshot[]): number | null {
	let owed = false;
	for (const month of h) {
		if (month.debt > 0) owed = true;
		else if (owed) return month.month;
	}
	return null;
}

/**
 * The ids first true in the last closed month — the Month Close line. The month
 * is derived from the record, not assumed to be `run.month - 1`, so a missed
 * close cannot retro-announce an older month.
 */
export function milestonesNewThisMonth(run: RunState): MilestoneId[] {
	const h = months(run);
	if (h.length === 0) return [];
	const latest = h[h.length - 1].month;
	return earnedMilestones(run)
		.filter((milestone) => milestone.month === latest)
		.map((milestone) => milestone.id);
}

/** The ids first true within a year, sliced exactly like `metrics.ts`. */
export function milestonesForYear(run: RunState, year: number): MilestoneId[] {
	const from = (year - 1) * 12 + 1;
	const to = from + 11;
	return earnedMilestones(run)
		.filter((milestone) => milestone.month >= from && milestone.month <= to)
		.map((milestone) => milestone.id);
}

/** One closed year as the Stage-up Card's Year in Review reports it (ticket 02). */
export interface YearInReview {
	year: number;
	/** Net worth at the year's close, or null when the record does not cover it. */
	netWorth: number | null;
	/** The year's movement against the previous close (the ◈60 start for year 1). */
	change: number | null;
	/** Months closed inside both envelopes, out of twelve. */
	monthsInsideBudget: number;
	/** The ids first true within the year. */
	milestones: MilestoneId[];
}

/** Every Run starts at 14 with ◈60 — the Money Story's opening figure. */
const STARTING_NET_WORTH = 60;

/**
 * The Year in Review for one closed year: the money headline from the stored
 * month history, the metrics' own inside-budget count, and the year's
 * Milestones. Purely retrospective — it reads the record and never the live
 * balance, so the Fork's deposit cannot move the numbers it reports.
 */
export function yearInReview(run: RunState, year: number): YearInReview {
	const h = months(run);
	const atClose = (month: number) => h.find((row) => row.month === month)?.netWorth ?? null;

	const netWorth = atClose(year * 12);
	// Year 1 measures from the Run's start, so the recap and the Money Story agree.
	const baseline = year === 1 ? STARTING_NET_WORTH : atClose((year - 1) * 12);

	return {
		year,
		netWorth,
		change: netWorth === null || baseline === null ? null : netWorth - baseline,
		// The metrics read `history` directly; hand them the legacy-safe rows.
		monthsInsideBudget: computeMetrics({ ...run, history: h }).adherenceByYear[year - 1] ?? 0,
		milestones: milestonesForYear(run, year)
	};
}

/**
 * The review a Stage-up Card carries: the year just closed, which is
 * `stage - 1` — the Stage-up that opens stage N opens year N, so stages 2–5
 * carry years 1–4 and the Fork carries year 4→5. Null at stage 1, whose
 * opening has no closed year behind it, and null in every other phase: the
 * recap is a Stage-up thing and can never appear mid-month (ADR-0003).
 */
export function stageUpReview(run: RunState): YearInReview | null {
	if (run.phase !== 'stage_up' || run.stage < 2) return null;
	return yearInReview(run, run.stage - 1);
}

/** The longest run of consecutive months inside budget — the retrospective line. */
export function longestInsideBudgetMonths(run: Pick<RunState, 'history'>): number {
	let longest = 0;
	let streak = 0;
	let previous: number | null = null;
	for (const month of months(run)) {
		if (!month.insideBudget) streak = 0;
		else if (previous !== null && month.month === previous + 1) streak += 1;
		else streak = 1;
		previous = month.month;
		longest = Math.max(longest, streak);
	}
	return longest;
}
