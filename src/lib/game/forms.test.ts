import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
	cardLineKey,
	cardOddsKey,
	cardSituationKey,
	cardTitleKey,
	choiceFeedbackKey,
	choiceLabelKey
} from '$lib/i18n/card-keys';
import { cardLines, cardSituation, cardTitle, choiceLabel } from '$lib/i18n/card-text';
import { message } from '$lib/i18n/messages';
import { CARDS, cardById } from './cards';
import { CARD_FORMS, CARD_FORMAT_IDS, cardFormFor } from './forms';

/**
 * The Card Formats gate (fun-pass ticket 05, design §3.6) — the beats test's
 * tradition for the other presentation map. The map holds arrangement only:
 * card ids, a format and a line count. The catalogues hold every word, and the
 * deck holds no format at all. Three places must agree, or a format ships
 * half-arranged: an entry whose card does not exist, a line the catalogue never
 * authored, or an authored `card_<id>_line_<n>` key no card reads.
 *
 * The fixture at the end pins the contract: a format adds lines; the card keeps
 * its own words and choices.
 */

const LOCALES = ['en', 'it', 'ro'] as const;
type Locale = (typeof LOCALES)[number];

const catalogues = Object.fromEntries(
	LOCALES.map((locale) => [
		locale,
		JSON.parse(
			readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
		) as Record<string, unknown>
	])
) as Record<Locale, Record<string, unknown>>;

/** Every `card_<id>_line_<n>` key the map currently authorises. */
function allowedLineKeys(): Set<string> {
	const allowed = new Set<string>();
	for (const [id, form] of Object.entries(CARD_FORMS)) {
		for (let n = 1; n <= form.lines; n++) allowed.add(cardLineKey(id, n));
	}
	return allowed;
}

const LINE_KEY_PATTERN = /^card_(.+)_line_(\d+)$/;

function placeholders(text: string): string[] {
	return [...new Set([...text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]))].sort();
}

describe('the Card Formats map (fun-pass ticket 05)', () => {
	it('arranges real cards, and only into the three known formats', () => {
		for (const [id, form] of Object.entries(CARD_FORMS)) {
			expect(cardById(id), `${id} has a format but the deck never deals it`).not.toBeNull();
			expect(CARD_FORMAT_IDS, `${id}: unknown format ${form.format}`).toContain(form.format);
			expect(Number.isInteger(form.lines), `${id}: lines is not an integer`).toBe(true);
			expect(form.lines, `${id}: a negative line count`).toBeGreaterThanOrEqual(0);
			expect(cardFormFor(id), `${id} does not resolve to its own map entry`).toEqual(form);
		}
	});

	it('leaves every other card the plain card', () => {
		expect(cardFormFor('two_wants')).toBeNull();
		expect(cardFormFor('')).toBeNull();
		expect(cardFormFor('not_a_card')).toBeNull();
	});

	it('resolves exactly the lines the map counts, from the catalogues', () => {
		for (const [id, form] of Object.entries(CARD_FORMS)) {
			const card = cardById(id);
			if (!card) throw new Error(`no card ${id}`);
			const lines = cardLines(card);
			expect(lines, `${id} resolves the wrong number of lines`).toHaveLength(form.lines);
			lines.forEach((line, index) => {
				expect(line, `${id} line ${index + 1} is empty`).toBe(
					message(cardLineKey(id, index + 1))
				);
				expect(line.trim().length, `${id} line ${index + 1} is blank`).toBeGreaterThan(0);
			});
		}
	});

	it('has every authored line in all three locales', () => {
		for (const key of allowedLineKeys()) {
			for (const locale of LOCALES) {
				const value = catalogues[locale][key];
				expect(typeof value, `${locale} is missing ${key}`).toBe('string');
				expect((value as string).trim().length, `${locale}: ${key} is empty`).toBeGreaterThan(0);
			}
		}
	});

	it('matches line placeholders across locales', () => {
		for (const key of allowedLineKeys()) {
			const reference = placeholders(catalogues.en[key] as string);
			for (const locale of ['it', 'ro'] as const) {
				expect(placeholders(catalogues[locale][key] as string), `${locale}: ${key}`).toEqual(
					reference
				);
			}
		}
	});

	it('has no orphan, gapped or over-long line key in any locale', () => {
		const allowed = allowedLineKeys();
		for (const locale of LOCALES) {
			for (const key of Object.keys(catalogues[locale])) {
				if (!key.startsWith('card_') || !key.includes('_line_')) continue;
				const match = LINE_KEY_PATTERN.exec(key);
				expect(match, `orphan line key in ${locale}: ${key}`).not.toBeNull();
				expect(allowed.has(key), `orphan line key in ${locale}: ${key}`).toBe(true);
			}
		}
	});

	it('keeps the deck’s schema untouched: no Card carries a format', () => {
		for (const card of CARDS) {
			expect('format' in card, `${card.id} carries a format in the deck`).toBe(false);
		}
	});
});

describe('a format is arrangement, not words (fun-pass ticket 05)', () => {
	it('pins the contract with a fixture: the card keeps its own words and choices', () => {
		const card = cardById('refund_text');
		if (!card) throw new Error('fixture card refund_text moved');
		const form = cardFormFor(card.id);
		if (!form) throw new Error('fixture card refund_text lost its format');

		/*
		 * Every word is keyed by the card's own id, so the arrangement cannot
		 * reach them: a format change is a change to the map alone, and the
		 * title, situation, odds, labels and Feedback stay the same.
		 */
		const ownKeys = new Set([
			cardTitleKey(card.id),
			cardSituationKey(card.id),
			cardOddsKey(card.id),
			...card.choices.flatMap((choice) => [
				choiceLabelKey(card.id, choice.id),
				choiceFeedbackKey(card.id, choice.id)
			])
		]);

		const lines = cardLines(card);
		expect(lines).toHaveLength(form.lines);
		lines.forEach((_line, index) => {
			expect(ownKeys.has(cardLineKey(card.id, index + 1)), 'a line shadows a card word').toBe(
				false
			);
		});

		expect(cardTitle(card)).toBe(message(cardTitleKey(card.id)));
		expect(cardSituation(card)).toBe(message(cardSituationKey(card.id)));
		expect(card.choices.map((choice) => choiceLabel(card, choice))).toEqual(
			card.choices.map((choice) => message(choiceLabelKey(card.id, choice.id)))
		);

		// A format is metadata only: the map holds a format and a count, no word.
		for (const entry of Object.values(CARD_FORMS)) {
			expect(Object.keys(entry).sort()).toEqual(['format', 'lines']);
		}
	});
});
