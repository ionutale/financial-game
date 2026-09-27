import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cardById } from './cards';
import {
	CALLBACK_IDS,
	callbackFired,
	callbackFor,
	type CallbackId
} from './callbacks';
import { createRun } from './loop';
import type { RunState } from './types';

/**
 * Callbacks (fun-pass ticket 07, design §3.4): the world remembering something
 * the player did. Table-driven, fixture-based and legacy-safe, in the
 * `milestones.ts` tradition: given the stored record and the card being dealt,
 * which authored line (at most one) is derived.
 */

/** A Run with specific fields, for exercising the Callback predicates. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

const card = (id: string) => {
	const found = cardById(id);
	if (!found) throw new Error(`fixture card ${id} is not in the deck`);
	return found;
};

interface Case {
	name: string;
	run: RunState;
	card: string;
	expected: CallbackId | null;
}

const CASES: Case[] = [
	{
		name: 'the first allowance went on a thing, and a cost card arrives',
		run: withState({ log: [{ month: 1, card: 'the_allowance', choice: 'spend' }] }),
		card: 'two_wants',
		expected: 'first_spent'
	},
	{
		name: 'the first allowance stayed put',
		run: withState({ log: [{ month: 1, card: 'the_allowance', choice: 'keep' }] }),
		card: 'two_wants',
		expected: 'first_kept'
	},
	{
		name: 'the scam was checked once, and a message card arrives',
		run: withState({ log: [{ month: 53, card: 'scam_opportunity', choice: 'check' }] }),
		card: 'refund_text',
		expected: 'checked_the_message'
	},
	{
		name: 'a balance is carried and a pay-later card arrives',
		run: withState({ debt: 55 }),
		card: 'bnpl_trainers',
		expected: 'carrying_a_balance'
	},
	{
		name: 'cover is held and a shock arrives',
		run: withState({ insurance: true }),
		card: 'phone_cracked',
		expected: 'cover_is_on'
	},
	{
		name: 'the minimum payment is on the file and a credit card arrives',
		run: withState({ flags: [{ month: 51, kind: 'minimum_payment' }] }),
		card: 'score_check',
		expected: 'the_minimum_file'
	},
	{
		name: 'something was sold once and a card pays money',
		run: withState({ log: [{ month: 7, card: 'sell_games', choice: 'sell' }] }),
		card: 'subscription_creep',
		expected: 'sold_before'
	},
	{
		name: 'the overdraft has been felt and a cost card arrives',
		run: withState({ flags: [{ month: 40, kind: 'overdraft' }] }),
		card: 'two_wants',
		expected: 'overdraft_taste'
	},
	{
		name: 'a loan was made and its repayment is dealt',
		run: withState({ log: [{ month: 30, card: 'lend_to_friend', choice: 'lend' }] }),
		card: 'lend_returns',
		expected: 'lent_before'
	},
	{
		name: 'asking worked once and a card pays money',
		run: withState({ log: [{ month: 45, card: 'ask_for_rise', choice: 'ask' }] }),
		card: 'payslip_error',
		expected: 'asked_and_it_moved'
	},
	{
		name: 'Danny’s app was tried and an investing card arrives',
		run: withState({ log: [{ month: 52, card: 'app_tip', choice: 'in' }] }),
		card: 'the_fund',
		expected: 'danny_still_talking'
	},
	{
		name: 'nothing in the record: no callback',
		run: createRun(),
		card: 'two_wants',
		expected: null
	},
	{
		name: 'a legacy record with no log, flags or history',
		run: withState({
			log: undefined as unknown as RunState['log'],
			flags: undefined as unknown as RunState['flags'],
			history: undefined as unknown as RunState['history']
		}),
		card: 'phone_cracked',
		expected: null
	},
	{
		name: 'a log entry naming a card the deck no longer carries',
		run: withState({ log: [{ month: 3, card: 'a_card_from_an_old_deck', choice: 'gone' }] }),
		card: 'two_wants',
		expected: null
	}
];

describe('a Callback for the dealt card (fun-pass ticket 07)', () => {
	for (const { name, run, card: id, expected } of CASES) {
		it(name, () => {
			expect(callbackFor(run, card(id))).toBe(expected);
		});
	}

	it('never fires on a Stage-up card', () => {
		const run = withState({
			log: [{ month: 1, card: 'the_allowance', choice: 'spend' }],
			stage: 5
		});
		expect(callbackFor(run, card('the_fork'))).toBeNull();
		expect(callbackFor(run, card('the_second_year'))).toBeNull();
	});

	it('caps at one line per card: several memories, one answer', () => {
		// Two predicates hold at once (the first allowance was spent, and a
		// balance is carried); the derivation still answers with exactly one id,
		// the first in catalogue order.
		const run = withState({
			debt: 55,
			log: [{ month: 1, card: 'the_allowance', choice: 'spend' }]
		});
		const fired = callbackFired(run, card('bnpl_trainers'));
		expect(fired.length).toBeGreaterThan(1);
		expect(callbackFor(run, card('bnpl_trainers'))).toBe(fired[0]);
		expect(fired[0]).toBe('first_spent');
	});

	it('is deterministic: the same record and card answer the same', () => {
		const run = withState({
			debt: 55,
			insurance: true,
			flags: [{ month: 40, kind: 'overdraft' }],
			log: [{ month: 1, card: 'the_allowance', choice: 'spend' }]
		});
		const first = callbackFired(run, card('phone_cracked'));
		const second = callbackFired(run, card('phone_cracked'));
		expect(second).toEqual(first);
		expect(callbackFor(run, card('phone_cracked'))).toBe(first[0]);
	});

	it('reads catalogue order, not log order, for the first answer', () => {
		const forward = withState({
			log: [
				{ month: 1, card: 'the_allowance', choice: 'spend' },
				{ month: 7, card: 'sell_games', choice: 'sell' }
			]
		});
		const reversed = withState({ log: [...forward.log].reverse() });
		// cash_in_hand costs and pays: both memories hold, one answer, catalogue order.
		expect(callbackFor(forward, card('cash_in_hand'))).toBe('first_spent');
		expect(callbackFor(reversed, card('cash_in_hand'))).toBe('first_spent');
	});

	it('leaves the record it reads untouched', () => {
		const run = withState({ log: [{ month: 1, card: 'the_allowance', choice: 'spend' }] });
		const before = structuredClone(run);
		callbackFor(run, card('two_wants'));
		expect(run).toStrictEqual(before);
	});
});

/**
 * The catalogue half: every id has one authored line per locale, no orphan
 * `callback_*` key exists, and the derived copy keeps the ticket's rules — no
 * numbers, no money glyph, never a maxim.
 */
const LOCALES = ['en', 'it', 'ro'] as const;

const catalogues = Object.fromEntries(
	LOCALES.map((locale) => [
		locale,
		JSON.parse(
			readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
		) as Record<string, string>
	])
);

describe('the Callback catalogue (fun-pass ticket 07)', () => {
	it('caps the v1 catalogue at twelve lines', () => {
		expect(CALLBACK_IDS.length).toBeLessThanOrEqual(12);
		expect(new Set(CALLBACK_IDS).size).toBe(CALLBACK_IDS.length);
	});

	it('has every callback key in all three locales', () => {
		for (const id of CALLBACK_IDS) {
			for (const locale of LOCALES) {
				expect(
					typeof catalogues[locale][`callback_${id}`],
					`${locale} is missing callback_${id}`
				).toBe('string');
			}
		}
	});

	it('has no orphan callback_* key in any locale', () => {
		const allowed = new Set(CALLBACK_IDS.map((id) => `callback_${id}`));
		for (const locale of LOCALES) {
			for (const key of Object.keys(catalogues[locale])) {
				if (!key.startsWith('callback_')) continue;
				expect(allowed.has(key), `orphan key in ${locale}: ${key}`).toBe(true);
			}
		}
	});

	it('keeps the lines free of numbers and the money glyph', () => {
		for (const id of CALLBACK_IDS) {
			expect(catalogues.en[`callback_${id}`], `callback_${id}`).not.toMatch(/[0-9◈]/u);
		}
	});
});
