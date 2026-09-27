import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CARDS } from '../game/cards';
import { MILESTONE_IDS } from '../game/milestones';
import {
	CARD_KEY_PREFIX,
	cardOddsKey,
	cardSituationKey,
	cardTitleKey,
	choiceFeedbackKey,
	choiceLabelKey
} from './card-keys';

/**
 * Gate 3 of ticket 07/26, extended by ticket 01: the keys Paraglide cannot
 * type-check because they are derived from domain ids at runtime. Enumerates
 * the deck and the Milestone catalogue, asserts every card, choice and
 * Milestone key exists in all three locales, that interpolation parameters
 * agree across locales, and that no orphan `card_*` or `milestone_*` key
 * exists. Also asserts the three catalogues carry exactly the same key set, so
 * a missing UI string in `it`/`ro` fails here as well.
 */

const LOCALES = ['en', 'it', 'ro'] as const;
type Locale = (typeof LOCALES)[number];

interface Variant {
	declarations?: string[];
	selectors?: string[];
	match: Record<string, string>;
}
type MessageValue = string | Variant[];

const catalogues = Object.fromEntries(
	LOCALES.map((locale) => [
		locale,
		JSON.parse(
			readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
		) as Record<string, MessageValue>
	])
) as Record<Locale, Record<string, MessageValue>>;

const en = catalogues.en;

/** The mandatory deck keys: title and situation, plus label and feedback per Choice. */
function mandatoryDeckKeys(): string[] {
	const keys: string[] = [];
	for (const card of CARDS) {
		keys.push(cardTitleKey(card.id), cardSituationKey(card.id));
		for (const choice of card.choices) {
			keys.push(choiceLabelKey(card.id, choice.id), choiceFeedbackKey(card.id, choice.id));
		}
	}
	return keys;
}

/** The whole `card_*` key space the deck can legitimately author. */
function allowedCardKeys(): Set<string> {
	const allowed = new Set(mandatoryDeckKeys());
	for (const card of CARDS) allowed.add(cardOddsKey(card.id));
	return allowed;
}

function placeholders(text: string): string[] {
	return [...new Set([...text.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((m) => m[1]))].sort();
}

/** The parameters a message declares: placeholders, or the inputs of a variant. */
function params(value: MessageValue): string[] {
	if (typeof value === 'string') return placeholders(value);
	const inputs = value.flatMap((variant) =>
		(variant.declarations ?? [])
			.filter((declaration) => declaration.startsWith('input '))
			.map((declaration) => declaration.replace(/^input\s+/, '').split(/\s+/)[0])
	);
	return [...new Set(inputs)].sort();
}

const MILESTONE_KEY_PREFIX = 'milestone_';

describe('the milestone catalogue’s message keys (ticket 01)', () => {
	it('has every milestone key in all three locales', () => {
		for (const id of MILESTONE_IDS) {
			for (const locale of LOCALES) {
				expect(
					typeof catalogues[locale][`${MILESTONE_KEY_PREFIX}${id}`],
					`${locale} is missing ${MILESTONE_KEY_PREFIX}${id}`
				).toBe('string');
			}
		}
	});

	it('has no orphan milestone_* key in any locale', () => {
		const allowed = new Set(MILESTONE_IDS.map((id) => `${MILESTONE_KEY_PREFIX}${id}`));
		for (const locale of LOCALES) {
			for (const key of Object.keys(catalogues[locale])) {
				if (!key.startsWith(MILESTONE_KEY_PREFIX)) continue;
				expect(allowed.has(key), `orphan key in ${locale}: ${key}`).toBe(true);
			}
		}
	});
});

describe('the deck’s message keys (ticket 07, gate 3)', () => {
	it('derives unique keys: card and choice ids never collide', () => {
		const cards = new Set<string>();
		for (const card of CARDS) {
			expect(cards.has(card.id), `duplicate card id ${card.id}`).toBe(false);
			cards.add(card.id);
			const choices = new Set<string>();
			for (const choice of card.choices) {
				expect(choices.has(choice.id), `duplicate choice ${card.id}/${choice.id}`).toBe(false);
				choices.add(choice.id);
			}
		}
	});

	it('has every card and choice key in all three locales', () => {
		for (const key of mandatoryDeckKeys()) {
			for (const locale of LOCALES) {
				expect(typeof catalogues[locale][key], `${locale} is missing ${key}`).toBe('string');
			}
		}
	});

	it('has no orphan card_* key in any locale', () => {
		const allowed = allowedCardKeys();
		for (const locale of LOCALES) {
			for (const key of Object.keys(catalogues[locale])) {
				if (!key.startsWith(CARD_KEY_PREFIX)) continue;
				expect(allowed.has(key), `orphan key in ${locale}: ${key}`).toBe(true);
			}
		}
	});

	it('carries exactly the same keys in every locale', () => {
		const reference = Object.keys(en).sort();
		for (const locale of LOCALES) {
			expect(Object.keys(catalogues[locale]).sort(), `${locale} key set`).toEqual(reference);
		}
	});

	it('leaves no message empty', () => {
		for (const locale of LOCALES) {
			for (const [key, value] of Object.entries(catalogues[locale])) {
				const length = typeof value === 'string' ? value.length : value.length;
				expect(length, `${locale}: ${key} is empty`).toBeGreaterThan(0);
			}
		}
	});

	it('matches interpolation parameters across locales', () => {
		for (const [key, value] of Object.entries(en)) {
			const reference = params(value);
			for (const locale of ['it', 'ro'] as const) {
				expect(params(catalogues[locale][key]), `${locale}: ${key}`).toEqual(reference);
			}
		}
	});

	it('uses only declared inputs inside variant branches', () => {
		for (const [key, value] of Object.entries(en)) {
			if (typeof value === 'string') continue;
			const inputs = new Set(params(value));
			for (const variant of value) {
				for (const text of Object.values(variant.match)) {
					for (const param of placeholders(text)) {
						expect(inputs.has(param), `${key}: {${param}} is not a declared input`).toBe(true);
					}
				}
			}
		}
	});
});
