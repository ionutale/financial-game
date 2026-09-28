import { describe, expect, it } from 'vitest';
import { createRun } from './loop';
import {
	MAX_REFLECTIONS,
	REFLECTION_IDS,
	reflectionsFor,
	type Reflection,
	type ReflectionId
} from './reflections';
import type { MonthSnapshot, RunState } from './types';

/**
 * Reflections (fun-pass ticket 11, design §3.7): ≤ 4 personal observations
 * derived from the Run's own record for the Money Story — a streak year, where
 * the wants went, the interest the bank paid, tally facts. Table-driven and
 * fixture-based like the Milestone tests, and held to the review rule the
 * module documents: never an imperative, never a general law, never live.
 */

/** A month row with only the fields a fixture cares about set. */
function row(month: number, patch: Partial<MonthSnapshot> = {}): MonthSnapshot {
	return {
		month,
		netWorth: 0,
		savings: 0,
		debt: 0,
		income: 0,
		saved: 0,
		spentNeed: 0,
		spentWant: 0,
		interest: 0,
		insideBudget: false,
		...patch
	};
}

function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

const idsOf = (run: RunState): ReflectionId[] => reflectionsFor(run).map((r) => r.id);

const paramsOf = (run: RunState, id: ReflectionId): Record<string, number> | undefined =>
	reflectionsFor(run).find((r) => r.id === id)?.params;

describe('the Reflection catalogue', () => {
	it('names the candidates in precedence order', () => {
		expect(REFLECTION_IDS).toEqual([
			'packed_lunch',
			'best_year',
			'the_leak',
			'bank_interest',
			'saved_months'
		]);
	});

	it('caps the Money Story at four observations', () => {
		expect(MAX_REFLECTIONS).toBe(4);
	});
});

describe('each observation derives its own fact', () => {
	it('tallies the lunches packed', () => {
		const run = withState({
			log: [
				{ month: 2, card: 'canteen_week', choice: 'pack' },
				{ month: 4, card: 'canteen_week', choice: 'buy' }
			]
		});
		expect(idsOf(run)).toEqual(['packed_lunch']);
		expect(paramsOf(run, 'packed_lunch')).toEqual({ times: 1 });
	});

	it('reads the year with the most months inside budget, earliest on a tie', () => {
		// Year 1: 2 clean months. Year 3: 6. Year 4: 6 — the tie goes to year 3.
		const clean = (start: number, months: number) =>
			Array.from({ length: months }, (_, i) => row(start + i, { insideBudget: true }));
		const run = withState({
			history: [...clean(1, 2), ...clean(25, 6), ...clean(37, 6)]
		});
		expect(paramsOf(run, 'best_year')).toEqual({ year: 3, months: 6 });
	});

	it('does not call half a year a streak year', () => {
		const run = withState({
			history: Array.from({ length: 5 }, (_, i) => row(i + 1, { insideBudget: true }))
		});
		expect(idsOf(run)).not.toContain('best_year');
	});

	it('finds the year the wants ran heaviest, earliest on a tie', () => {
		const run = withState({
			history: [
				row(1, { spentWant: 30 }),
				row(2, { spentWant: 40 }),
				row(13, { spentWant: 50 }),
				row(14, { spentWant: 70 })
			]
		});
		expect(paramsOf(run, 'the_leak')).toEqual({ year: 2, amount: 120 });
	});

	it('sums the interest the bank paid across the whole record', () => {
		const run = withState({
			history: [
				row(1, { interest: 0.12 }),
				row(2, { interest: 0 }),
				row(3, { interest: 1.5 })
			]
		});
		expect(paramsOf(run, 'bank_interest')).toEqual({ amount: 1.62 });
	});

	it('counts the months money actually went into Save', () => {
		const run = withState({
			history: [row(1, { saved: 10 }), row(2), row(3, { saved: 20 })]
		});
		expect(paramsOf(run, 'saved_months')).toEqual({ months: 2 });
	});
});

describe('precedence and the cap', () => {
	it('keeps the first four that fire, in catalogue order', () => {
		// Every candidate fires at once: the tally, the year, the leak, the
		// bank's interest — and the aggregate drops off the end.
		const packed = { month: 2, card: 'canteen_week', choice: 'pack' } as const;
		const run = withState({
			log: [packed],
			history: [
				...Array.from({ length: 6 }, (_, i) => row(i + 1, { insideBudget: true, saved: 10 })),
				row(7, { spentWant: 250, interest: 0.4 })
			]
		});
		expect(idsOf(run)).toEqual(['packed_lunch', 'best_year', 'the_leak', 'bank_interest']);
		expect(REFLECTION_IDS.filter((id) => id !== 'saved_months')).toHaveLength(MAX_REFLECTIONS);
	});

	it('shows the aggregate when nothing more personal fires', () => {
		const run = withState({ history: [row(1, { saved: 10 })] });
		expect(idsOf(run)).toEqual(['saved_months']);
	});
});

describe('empty, legacy and deterministic records', () => {
	it('reads a fresh Run as no observations at all', () => {
		expect(reflectionsFor(createRun())).toEqual([]);
	});

	it('earns nothing and throws nothing on a record missing history and log', () => {
		const bare = withState({
			history: undefined as unknown as RunState['history'],
			log: undefined as unknown as RunState['log']
		});
		expect(() => reflectionsFor(bare)).not.toThrow();
		expect(reflectionsFor(bare)).toEqual([]);
	});

	it('ignores log entries whose card is not in the current deck', () => {
		const run = withState({ log: [{ month: 1, card: 'not_a_card_any_more', choice: 'x' }] });
		expect(reflectionsFor(run)).toEqual([]);
	});

	it('reads an out-of-order history by month', () => {
		const run = withState({
			history: [row(2, { spentWant: 90 }), row(1, { spentWant: 10 })]
		});
		expect(paramsOf(run, 'the_leak')).toEqual({ year: 1, amount: 100 });
	});

	it('is deterministic: the same record reads the same twice, and is not mutated', () => {
		const run = withState({
			log: [{ month: 2, card: 'canteen_week', choice: 'pack' }],
			history: [row(1, { insideBudget: true, saved: 10 }), row(2, { interest: 0.1 })]
		});
		const before = structuredClone(run);
		const first = reflectionsFor(run);
		const second = reflectionsFor(run);
		expect(second).toEqual(first);
		expect(run).toStrictEqual(before);
	});

	it('returns structured facts only — no prose, no band, no rank', () => {
		const run = withState({ history: [row(1, { saved: 10 })] });
		const reflections = reflectionsFor(run);
		for (const reflection of reflections as Reflection[]) {
			expect(Object.keys(reflection).sort()).toEqual(['id', 'params']);
		}
	});
});
