import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cardById } from './cards';
import { applyAction, createRun } from './loop';
import { THREADS, threadDue } from './threads';
import { cardSituationKey, cardTitleKey, choiceFeedbackKey, choiceLabelKey, choiceReactionKey } from '$lib/i18n/card-keys';
import { threadChip } from '$lib/i18n/game-text';
import type { RunState } from './types';

/**
 * The villain cards (fun-pass ticket 08, ADR-0007). The player is the seller:
 * a Stage-4 phone-shop shift that sells a friend the four-payment split, and a
 * Stage-5 referral that pays for bringing friends in. The fiction is tempting
 * and normal, never evil; a Thread carries the buyer's consequence back; the
 * game records no wrong-choice flag and never tells the player off.
 *
 * Three seams are pinned here and in `deck.test.ts`:
 *   - the plant/resolve through the **real reducer** (the buyer's consequence
 *     is a real Thread, never narration),
 *   - the **fence** over the copy (no shaming, no maxim, no telling-off; a
 *     Reaction beside every Why; the two Response budgets),
 *   - the **frozen effect vocabulary** (`deck.test.ts`: no new fields, verbs
 *     or state — the deck-shape fixture).
 */

/** The villain pairs: plant choice, its Thread, and the resolve card. */
const VILLAIN_PAIRS = [
	{
		plant: 'phone_shop_shift',
		choice: 'split',
		thread: 'split_sold',
		resolve: 'split_comes_due',
		stage: 4
	}
] as const;

/** The gains the fence allows a villain card: small, per ADR-0007. */
const MAX_VILLAIN_GAIN = 25;

/** A fresh Run dropped into a Stage, its Stage-up resolved (the ticket-02 shape). */
function atStage(stage: number): RunState {
	let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage });
	if (s.phase === 'stage_up' && s.card && s.card.id !== 'the_fork') {
		s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
		s = applyAction(s, { type: 'CONTINUE' });
	}
	return s;
}

/** Deals a specific card and takes a specific Choice. */
function take(s: RunState, cardId: string, choiceId: string): RunState {
	s = applyAction(s, { type: 'FORCE_CARD', id: cardId });
	s = applyAction(s, { type: 'CONFIRM_PLAN' });
	return applyAction(s, { type: 'CHOOSE', choiceId });
}

const catalogues = Object.fromEntries(
	(['en', 'it', 'ro'] as const).map((locale) => [
		locale,
		JSON.parse(
			readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
		) as Record<string, string>
	])
);

/** Every villain string the fence reads, with the scope it is held to. */
function villainStrings(locale: 'en' | 'it' | 'ro'): Array<{ key: string; scope: string; text: string }> {
	const catalogue = catalogues[locale];
	const rows: Array<{ key: string; scope: string; text: string }> = [];
	for (const pair of VILLAIN_PAIRS) {
		for (const id of [pair.plant, pair.resolve]) {
			const card = cardById(id);
			// A missing villain card is a broken fixture, not an empty fence.
			if (!card) throw new Error(`villain fixture names a card the deck does not carry: ${id}`);
			rows.push({ key: cardTitleKey(id), scope: 'title', text: catalogue[cardTitleKey(id)] });
			rows.push({ key: cardSituationKey(id), scope: 'situation', text: catalogue[cardSituationKey(id)] });
			for (const choice of card.choices) {
				rows.push({
					key: choiceLabelKey(id, choice.id),
					scope: 'label',
					text: catalogue[choiceLabelKey(id, choice.id)]
				});
				rows.push({
					key: choiceFeedbackKey(id, choice.id),
					scope: 'why',
					text: catalogue[choiceFeedbackKey(id, choice.id)]
				});
				rows.push({
					key: choiceReactionKey(id, choice.id),
					scope: 'reaction',
					text: catalogue[choiceReactionKey(id, choice.id)]
				});
			}
		}
	}
	return rows;
}

const words = (text: string) => text.trim().split(/\s+/).length;

describe('the villain pairs (fun-pass ticket 08, ADR-0007)', () => {
	it('names real deck cards, a real plant, Thread and resolve', () => {
		for (const pair of VILLAIN_PAIRS) {
			const plant = cardById(pair.plant);
			const resolve = cardById(pair.resolve);
			expect(plant, `${pair.plant} is not in the deck`).toBeDefined();
			expect(resolve, `${pair.resolve} is not in the deck`).toBeDefined();
			if (!plant || !resolve) continue;

			const choice = plant.choices.find((c) => c.id === pair.choice);
			expect(choice?.sets?.thread, `${pair.plant}/${pair.choice} plants`).toBe(pair.thread);
			expect(THREADS[pair.thread], `${pair.thread} is not a known Thread`).toBeDefined();
			expect(resolve.resolves, `${pair.resolve} resolves`).toBe(pair.thread);
			expect(resolve.requires ?? [], `${pair.resolve} requires`).toContain(`thread:${pair.thread}`);
			expect(plant.stages, `${pair.plant} stage`).toContain(pair.stage);
		}
	});

	it('keeps every villain gain small (ADR-0007: small gains, costlier Thread)', () => {
		for (const pair of VILLAIN_PAIRS) {
			for (const id of [pair.plant, pair.resolve]) {
				const card = cardById(id);
				expect(card, `${id} is not in the deck`).toBeDefined();
				for (const choice of card?.choices ?? []) {
					expect(choice.gain ?? 0, `${id}/${choice.id} pays too much`).toBeLessThanOrEqual(
						MAX_VILLAIN_GAIN
					);
				}
			}
		}
	});
});

describe('the villain Thread through the real reducer', () => {
	it('plants the buyer’s consequence, counts it down, and resolves it', () => {
		const pair = VILLAIN_PAIRS[0];
		const planted = take(atStage(pair.stage), pair.plant, pair.choice);

		expect(planted.thread).toEqual({ id: pair.thread, since: 37 });
		expect(threadChip(planted)).toBe('The phone you sold — the third payment in 3 months');

		// Three months on, the resolve card is dealt, and playing it ends the Thread.
		let s = applyAction(planted, { type: 'CONTINUE' });
		for (let i = 0; i < 3; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(40);
		expect(threadDue(s.thread!)).toBe(s.month);

		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(s.card?.id).toBe(pair.resolve);
		s = applyAction(s, { type: 'CHOOSE', choiceId: s.card!.choices[0].id });
		expect(s.thread).toBeNull();
		expect(threadChip(s)).toBeNull();
	});

	it('records no wrong-choice flag — a villain Choice logs like any other', () => {
		for (const pair of VILLAIN_PAIRS) {
			const card = cardById(pair.plant);
			expect(card, `${pair.plant} is not in the deck`).toBeDefined();
			if (!card) continue;
			for (const choice of card.choices) {
				const before = atStage(pair.stage);
				const after = take(before, pair.plant, choice.id);
				expect(after.flags, `${pair.plant}/${choice.id} raised a flag`).toEqual(before.flags);
				expect(after.log.at(-1)).toEqual({
					month: before.month,
					card: pair.plant,
					choice: choice.id
				});
			}
		}
	});
});

describe('the villain fence (spec: no shaming, no maxim, no telling-off)', () => {
	const SHAMING =
		/\b(?:greed|greedy|shame|ashamed|shameful|guilt|guilty|fault|blame|wrong|selfish|exploit|exploited|predatory|sucker|fool|fooled|idiot|stupid)\b/i;
	const MAXIM = /\b(?:always|never|should|shouldn’t|shouldn't|remember|the point|this game)\b/i;

	it('answers every villain Choice with a Reaction beside its Why', () => {
		for (const pair of VILLAIN_PAIRS) {
			for (const id of [pair.plant, pair.resolve]) {
				const card = cardById(id);
				expect(card, `${id} is not in the deck`).toBeDefined();
				for (const choice of card?.choices ?? []) {
					for (const locale of ['en', 'it', 'ro'] as const) {
						const catalogue = catalogues[locale];
						expect(
							typeof catalogue[choiceFeedbackKey(id, choice.id)],
							`${locale}: ${id}/${choice.id} has no Why`
						).toBe('string');
						expect(
							typeof catalogue[choiceReactionKey(id, choice.id)],
							`${locale}: ${id}/${choice.id} has no Reaction`
						).toBe('string');
					}
				}
			}
		}
	});

	it('holds every villain string to no shaming and no maxim — in the moment and in the Why', () => {
		for (const { key, text } of villainStrings('en')) {
			expect(typeof text, `${key} is missing`).toBe('string');
			expect(SHAMING.test(text), `${key} shames: ${text}`).toBe(false);
			expect(MAXIM.test(text), `${key} carries a maxim: ${text}`).toBe(false);
			expect(text.includes('!'), `${key} shouts: ${text}`).toBe(false);
		}
	});

	it('keeps the Reaction and Why budgets (≲15 words / ≲40 words) in every locale', () => {
		for (const locale of ['en', 'it', 'ro'] as const) {
			for (const { key, scope, text } of villainStrings(locale)) {
				if (scope === 'reaction') expect(words(text), `${key}: ${text}`).toBeLessThanOrEqual(15);
				if (scope === 'why') expect(words(text), `${key}: ${text}`).toBeLessThanOrEqual(40);
			}
		}
	});

	it('leaves no villain string empty and no exclamation mark anywhere ×3', () => {
		for (const locale of ['en', 'it', 'ro'] as const) {
			for (const { key, text } of villainStrings(locale)) {
				expect(text.length, `${locale}: ${key} is empty`).toBeGreaterThan(0);
				expect(text.includes('!'), `${locale}: ${key} shouts`).toBe(false);
			}
		}
	});
});
