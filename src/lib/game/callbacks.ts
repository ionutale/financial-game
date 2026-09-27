/**
 * Callbacks (fun-pass ticket 07, design §3.4): the world remembering something
 * the player did. A Callback is an authored, derived line attached to the card
 * being dealt — "The first allowance went the same way." — read from the Run's
 * stored record (`log`, `flags`, the live balance and cover), never persisted,
 * never a number, never a maxim, never a lesson. Pure and legacy-safe, in the
 * `milestones.ts` tradition: a record missing any collection reads as a Run
 * that remembers nothing.
 *
 * At most one line per card: the specs are ordered, the derivation answers with
 * the first that fires, and `callbackFired` exists for the tests to pin the cap
 * and the order. Stage-up cards carry none — the banner is the moment, not a
 * memory.
 */

import type { Card, Choice, RunState } from './types';

/** The v1 catalogue, in the order the answers are preferred. */
export const CALLBACK_IDS = [
	'first_spent',
	'first_kept',
	'checked_the_message',
	'carrying_a_balance',
	'cover_is_on',
	'the_minimum_file',
	'sold_before',
	'overdraft_taste',
	'lent_before',
	'asked_and_it_moved',
	'danny_still_talking'
] as const;

export type CallbackId = (typeof CALLBACK_IDS)[number];

/** The stored record a Callback reads; every field is tolerated missing. */
type CallbackRecord = Pick<RunState, 'log' | 'flags' | 'debt' | 'insurance'>;

const logOf = (run: { log?: RunState['log'] }) => run.log ?? [];
const flagsOf = (run: { flags?: RunState['flags'] }) => run.flags ?? [];

/** The first month a card was played with one of `choices` (any, if omitted). */
function played(
	run: { log?: RunState['log'] },
	card: string,
	choices?: readonly string[]
): boolean {
	for (const entry of logOf(run)) {
		if (entry.card !== card) continue;
		if (choices && !choices.includes(entry.choice)) continue;
		return true;
	}
	return false;
}

const anyChoice = (card: Card, holds: (choice: Choice) => boolean) =>
	card.choices.some((choice) => holds(choice));

const costCard = (card: Card) => anyChoice(card, (c) => (c.cost ?? 0) > 0);
const gainCard = (card: Card) => anyChoice(card, (c) => (c.gain ?? 0) > 0);
const payLaterCard = (card: Card) =>
	anyChoice(card, (c) => Boolean(c.sets?.bnpl || c.sets?.overdraft));

interface CallbackSpec {
	id: CallbackId;
	/** The memory holds and this card is its moment. */
	fires(run: CallbackRecord, card: Card): boolean;
}

const CALLBACKS: readonly CallbackSpec[] = [
	{
		id: 'first_spent',
		fires: (run, card) => played(run, 'the_allowance', ['spend']) && costCard(card)
	},
	{
		id: 'first_kept',
		fires: (run, card) => played(run, 'the_allowance', ['keep']) && costCard(card)
	},
	{
		id: 'checked_the_message',
		fires: (run, card) =>
			played(run, 'scam_opportunity', ['check', 'block']) &&
			(card.kind === 'scam' || card.concept === 'tax_insurance_scams')
	},
	{
		id: 'carrying_a_balance',
		fires: (run, card) => (run.debt ?? 0) > 0 && payLaterCard(card)
	},
	{
		id: 'cover_is_on',
		fires: (run, card) => run.insurance === true && card.kind === 'shock'
	},
	{
		id: 'the_minimum_file',
		fires: (run, card) =>
			flagsOf(run).some((flag) => flag.kind === 'minimum_payment') && card.concept === 'credit'
	},
	{
		id: 'sold_before',
		fires: (run, card) => played(run, 'sell_games', ['sell']) && gainCard(card)
	},
	{
		id: 'overdraft_taste',
		fires: (run, card) =>
			flagsOf(run).some((flag) => flag.kind === 'overdraft') && costCard(card)
	},
	{
		id: 'lent_before',
		fires: (run, card) => played(run, 'lend_to_friend', ['lend']) && card.id === 'lend_returns'
	},
	{
		id: 'asked_and_it_moved',
		fires: (run, card) =>
			(played(run, 'ask_for_rise', ['ask']) || played(run, 'payslip_error', ['query'])) &&
			gainCard(card)
	},
	{
		id: 'danny_still_talking',
		fires: (run, card) => played(run, 'app_tip') && card.concept === 'investing'
	}
];

/** Every memory this card is a moment for, in catalogue order (for the tests). */
export function callbackFired(run: CallbackRecord, card: Card): CallbackId[] {
	if (card.kind === 'stage_up') return [];
	return CALLBACKS.filter((spec) => spec.fires(run, card)).map((spec) => spec.id);
}

/**
 * The one Callback line the dealt card carries, or null. Deterministic: the
 * first spec in catalogue order whose memory holds; no state is added and the
 * record is never mutated.
 */
export function callbackFor(run: CallbackRecord, card: Card | null | undefined): CallbackId | null {
	if (!card) return null;
	return callbackFired(run, card)[0] ?? null;
}
