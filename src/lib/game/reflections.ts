/**
 * Reflections (fun-pass ticket 11, design §3.7): at most four personal
 * observations about the Run's own record, read once at the Money Story. A
 * Reflection is a **fact of what happened** — a streak year, where the wants
 * went, the interest the bank paid, a tally — derived from `history` and `log`
 * alone, never persisted, legacy-safe, deterministic. Pure and
 * dependency-light, in the `milestones.ts` / `callbacks.ts` tradition.
 *
 * **Review rule (no test can enforce):** every line is second person, past
 * tense, and about *this* Run's numbers. Never an imperative, never a general
 * law about money, never a live surface: the module is only read when the Run
 * is over, and nothing here may console, grade or instruct.
 *
 * Precedence is the catalogue order below; the cap is four. The specific,
 * countable facts come first (a packed lunch is one person's record, not
 * everyone's); the aggregate months-saved tally is last, so it shows exactly
 * when nothing more personal fired. The copy lives in the catalogues as
 * `reflection_<id>` and the values arrive as locale-independent numbers; the
 * i18n layer formats the money.
 */

import { cardById } from './cards';
import type { MonthSnapshot, RunState } from './types';

/** The candidate catalogue, in the order the observations are preferred. */
export const REFLECTION_IDS = [
	'packed_lunch',
	'best_year',
	'the_leak',
	'bank_interest',
	'saved_months'
] as const;

export type ReflectionId = (typeof REFLECTION_IDS)[number];

/** The Money Story shows at most this many. */
export const MAX_REFLECTIONS = 4;

/** One derived observation and the values its copy interpolates. */
export interface Reflection {
	id: ReflectionId;
	/**
	 * Locale-independent values; `amount` is money and is formatted by the i18n
	 * layer, every other value is a plain count or a year number. Zero
	 * placeholders means an unparameterised line.
	 */
	params: Record<string, number>;
}

/** The record, oldest first. A legacy save may have no history at all. */
function months(run: Pick<RunState, 'history'>): MonthSnapshot[] {
	return [...(run.history ?? [])].sort((a, b) => a.month - b.month);
}

const log = (run: Pick<RunState, 'log'>) => run.log ?? [];

/** The year window a month belongs to, one-based. */
const yearOf = (month: number) => Math.floor((month - 1) / 12) + 1;

/** The logged Choices matching a card and choice, whatever the month. */
function played(run: Pick<RunState, 'log'>, card: string, choices: readonly string[]): number {
	let count = 0;
	for (const entry of log(run)) {
		if (entry.card === card && choices.includes(entry.choice)) count += 1;
	}
	return count;
}

interface ReflectionSpec {
	id: ReflectionId;
	/** The fact, or null when the record does not carry it. */
	fact(run: RunState): Record<string, number> | null;
}

const SPECS: readonly ReflectionSpec[] = [
	{
		// A countable habit, when the week that could have been bought went packed.
		id: 'packed_lunch',
		fact: (run) => {
			const times = played(run, 'canteen_week', ['pack']);
			return times > 0 ? { times } : null;
		}
	},
	{
		// The best year the Run actually had: most months inside its own budget.
		id: 'best_year',
		fact: (run) => {
			const counts = new Map<number, number>();
			for (const month of months(run)) {
				if (!month.insideBudget) continue;
				const year = yearOf(month.month);
				counts.set(year, (counts.get(year) ?? 0) + 1);
			}

			let best: { year: number; months: number } | null = null;
			// Ascending year order, so an early tie wins.
			for (const [year, count] of [...counts.entries()].sort((a, b) => a[0] - b[0])) {
				if (count >= 6 && (!best || count > best.months)) best = { year, months: count };
			}
			return best;
		}
	},
	{
		// Where the wants went: the twelve months that took the most of them.
		id: 'the_leak',
		fact: (run) => {
			const totals = new Map<number, number>();
			for (const month of months(run)) {
				const year = yearOf(month.month);
				totals.set(year, (totals.get(year) ?? 0) + month.spentWant);
			}

			let heaviest: { year: number; amount: number } | null = null;
			for (const [year, amount] of [...totals.entries()].sort((a, b) => a[0] - b[0])) {
				if (amount > 0 && (!heaviest || amount > heaviest.amount)) heaviest = { year, amount };
			}
			return heaviest;
		}
	},
	{
		// The bank's own contribution, exact: interest is the one place decimals stay.
		id: 'bank_interest',
		fact: (run) => {
			const amount = months(run).reduce((sum, month) => sum + month.interest, 0);
			return amount > 0 ? { amount } : null;
		}
	},
	{
		// The aggregate tally: the months money actually reached the savings side.
		id: 'saved_months',
		fact: (run) => {
			const count = months(run).filter((month) => month.saved > 0).length;
			return count > 0 ? { months: count } : null;
		}
	}
];

/**
 * The four observations this Run's record earns, in precedence order. A record
 * missing its collections reads as a Run with nothing to observe.
 */
export function reflectionsFor(run: RunState): Reflection[] {
	const reflections: Reflection[] = [];
	for (const spec of SPECS) {
		const params = spec.fact(run);
		if (!params) continue;
		reflections.push({ id: spec.id, params });
		if (reflections.length === MAX_REFLECTIONS) break;
	}
	return reflections;
}
