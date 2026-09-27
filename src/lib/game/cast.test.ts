import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDS, cardById } from './cards';
import { CAST_APPEARANCES, CAST_IDS, castFor } from './cast';
import { createRun } from './loop';
import type { RunState } from './types';

/**
 * The Cast (fun-pass ticket 07, design §3.4): five recurring people — Priya,
 * Ravi, Danny, Mum, Grandma — each appearing two or three times per Run in
 * authored copy, their names identical in every locale, and a finished Run's
 * Cast derived from its log alone. Table-driven fixtures, in the deck's
 * tradition.
 */

/** A Run with specific fields, for exercising the derivation. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

const played = (card: string, month = 1) => ({ month, card, choice: 'x' });

describe('deriving a Run’s Cast from its log (fun-pass ticket 07)', () => {
	it('lists who appeared, in the order the Run first met them', () => {
		const run = withState({
			log: [
				played('odd_job', 1),
				played('mum_late_pay', 14),
				played('app_tip', 50),
				played('mum_pays_back', 16),
				played('grandma_windfall', 4)
			]
		});
		expect(castFor(run)).toEqual(['mum', 'danny', 'grandma']);
	});

	it('counts a person once however often they appear', () => {
		const run = withState({
			log: [played('mum_late_pay', 14), played('mum_late_week', 30), played('mum_pays_back', 16)]
		});
		expect(castFor(run)).toEqual(['mum']);
	});

	it('reads a fresh Run as nobody met yet', () => {
		expect(castFor(createRun())).toEqual([]);
	});

	it('tolerates a legacy record missing its log', () => {
		const run = withState({ log: undefined as unknown as RunState['log'] });
		expect(castFor(run)).toEqual([]);
	});

	it('skips log entries whose card the deck no longer carries and cards without a face', () => {
		const run = withState({
			log: [
				played('a_card_from_an_old_deck'),
				played('odd_job'),
				played('ravi_needs_cover', 40)
			]
		});
		expect(castFor(run)).toEqual(['ravi']);
	});

	it('leaves the record it reads untouched', () => {
		const run = withState({ log: [played('app_tip', 50)] });
		const before = structuredClone(run);
		castFor(run);
		expect(run).toStrictEqual(before);
	});
});

describe('the Cast catalogue (fun-pass ticket 07)', () => {
	it('is the five people, in the canonical order', () => {
		expect(CAST_IDS).toEqual(['priya', 'ravi', 'danny', 'mum', 'grandma']);
	});

	it('gives every person two or three authored appearances', () => {
		for (const id of CAST_IDS) {
			const appearances = CAST_APPEARANCES[id];
			expect(appearances.length, `${id} appearances`).toBeGreaterThanOrEqual(2);
			expect(appearances.length, `${id} appearances`).toBeLessThanOrEqual(3);
		}
	});

	it('names only real deck cards, each belonging to exactly one person', () => {
		const seen = new Map<string, string>();
		for (const id of CAST_IDS) {
			for (const cardId of CAST_APPEARANCES[id]) {
				expect(cardById(cardId), `${id}/${cardId} is not in the deck`).toBeDefined();
				expect(seen.has(cardId), `${cardId} is listed twice`).toBe(false);
				seen.set(cardId, id);
			}
		}
	});

	it('keeps the shipped appearances continuous (voice.md §7)', () => {
		// The deck's existing faces stay their deck's people; the mapping is
		// append-only around them.
		expect(CAST_APPEARANCES.priya).toContain('course_pays_off');
		expect(CAST_APPEARANCES.ravi).toContain('overtime_offer');
		expect(CAST_APPEARANCES.danny).toEqual(expect.arrayContaining(['app_tip', 'app_vanishes']));
		expect(CAST_APPEARANCES.grandma).toContain('grandma_windfall');
	});

	it('keeps the names identical in every locale', () => {
		const names: Record<string, Record<string, string>> = {};
		for (const locale of ['en', 'it', 'ro'] as const) {
			names[locale] = JSON.parse(
				readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
			) as Record<string, string>;
		}
		const canonical: Record<string, string> = {
			priya: 'Priya',
			ravi: 'Ravi',
			danny: 'Danny',
			mum: 'Mum',
			grandma: 'Grandma'
		};
		for (const id of CAST_IDS) {
			for (const locale of ['en', 'it', 'ro'] as const) {
				expect(names[locale][`cast_${id}`], `${locale}: cast_${id}`).toBe(canonical[id]);
			}
		}
	});
});
