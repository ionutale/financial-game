/**
 * The economy, as numbers. Ticket 01.
 * One tunable config, so balancing never touches the cards.
 */

import type { PathId, RunState } from './types';

/** 3%/yr credited monthly. */
export const SAVINGS_MONTHLY = 0.0025;
/** 2.5%/yr drift on recurring living costs. */
export const INFLATION_MONTHLY = 0.0021;

export const GOAL_TARGET = 4000; // Work path Named Goal
export const STUDY_BUFFER = 1000; // Study path Named Goal
export const STUDENT_LOAN = 3000;

export interface StageSpec {
	age: number;
	name: string;
	/** Baseline income before any hours worked. */
	base: number;
	/** Pay per hour on the work slider. */
	rate: number;
	/** Free Time available before hours worked are deducted. */
	freeTime: number;
	/** Recurring Obligations at this Stage, before inflation. */
	obligations: number;
	/** The concepts that unlock at this Stage (tickets 02). */
	concepts: string[];
}

export const STAGES: Record<number, StageSpec> = {
	1: {
		age: 14,
		name: 'Pocket Money',
		base: 40,
		rate: 10,
		freeTime: 100,
		obligations: 0,
		concepts: ['needs_wants', 'earning_work']
	},
	2: {
		age: 15,
		name: 'First Budget',
		base: 40,
		rate: 10,
		freeTime: 90,
		obligations: 15,
		concepts: ['budgeting', 'saving_goals']
	},
	3: {
		age: 16,
		name: 'First Wage',
		base: 0,
		rate: 10,
		freeTime: 80,
		obligations: 120,
		concepts: ['interest']
	},
	4: {
		age: 17,
		name: 'First Credit',
		base: 0,
		rate: 10,
		freeTime: 70,
		obligations: 180,
		concepts: ['credit']
	},
	5: {
		age: 18,
		name: 'The Fork',
		base: 1600,
		rate: 12.5,
		freeTime: 60,
		obligations: 1150,
		concepts: ['investing', 'tax_insurance_scams']
	}
};

export interface PathSpec {
	base: number;
	obligations: number;
	freeTime: number;
}

export const PATHS: Record<PathId, PathSpec> = {
	work: { base: 1600, obligations: 1150, freeTime: 60 },
	study: { base: 900, obligations: 750, freeTime: 55 }
};

/** The Stage's economic profile, with the Fork applied once chosen. */
export function stageOf(state: Pick<RunState, 'stage' | 'path'>): StageSpec {
	const base = STAGES[state.stage];
	if (state.stage === 5 && state.path) {
		const p = PATHS[state.path];
		return { ...base, base: p.base, obligations: p.obligations, freeTime: p.freeTime };
	}
	return base;
}

/** Obligations drift upward with inflation across the run. */
export function obligationsFor(state: Pick<RunState, 'stage' | 'path' | 'inflationIndex'>): number {
	return Math.round(stageOf(state).obligations * state.inflationIndex);
}

/** Expected income = the Stage baseline plus hours worked at the rate. */
export function expectedIncome(state: Pick<RunState, 'stage' | 'path' | 'hours'>): number {
	const s = stageOf(state);
	return s.base + state.hours * s.rate;
}

export function goalTarget(state: Pick<RunState, 'stage' | 'path'>): number {
	return state.stage === 5 && state.path === 'study' ? STUDY_BUFFER : GOAL_TARGET;
}

/** Money the player can actually reach: cash plus what the envelopes hold. */
export function available(state: Pick<RunState, 'cash' | 'pots'>): number {
	return state.cash + state.pots.need + state.pots.want + state.pots.save;
}

/** Money still spendable this month — the Save envelope is earmarked, not spare. */
export function spendable(state: Pick<RunState, 'cash' | 'pots'>): number {
	return state.cash + state.pots.need + state.pots.want;
}

/** What counts toward the Named Goal: banked savings plus this month's earmark. */
export function savedTowardGoal(state: Pick<RunState, 'savings' | 'fund' | 'pots'>): number {
	return state.savings + state.fund + state.pots.save;
}

export function netWorth(
	state: Pick<RunState, 'cash' | 'pots' | 'savings' | 'fund' | 'debt'>
): number {
	return available(state) + state.savings + state.fund - state.debt;
}

/** The neutral currency glyph (ticket 01). Whole numbers, except where noted. */
export function formatMoney(n: number): string {
	return '\u25c8' + Math.round(n).toLocaleString('en-US');
}

/**
 * Ticket 15: interest and the balance it lands in are the one place decimals
 * survive. At 3%/yr a small balance earns ◈0.10 a month — rounded away, the
 * compounding lesson becomes invisible exactly when it is first taught.
 */
export function formatMoneyExact(n: number): string {
	const value = Math.round(n * 100) / 100;
	return '\u25c8' + value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}
