import { describe, expect, it, vi } from 'vitest';
import { CARDS, cardById } from '$lib/game/cards';
import { cardLineKey, choiceReactionKey } from './card-keys';
import { hasMessage, message } from './messages';
import { cardLines, chosenFeedback, chosenFeedbackParts, choiceFeedback, feedbackParts } from './card-text';

/**
 * The Reaction/Why seam (ADR-0004, ticket 01). A Choice may author an optional
 * `card_<id>_choice_<choice>_reaction` beside its `_feedback` (now the Why);
 * with no reaction authored the Feedback resolves to today's exact single
 * paragraph, so old saves and unauthored cards render byte for byte as before.
 */

describe('the Reaction/Why seam (ADR-0004, ticket 01)', () => {
	it('derives the reaction key from the immutable ids, beside the feedback key', () => {
		expect(choiceReactionKey('two_wants', 'game')).toBe('card_two_wants_choice_game_reaction');
	});

	it('resolves an unauthored Choice to today’s single paragraph: no Reaction, the Why alone', async () => {
		// After the copy waves every deck Choice authors a Reaction, so the
		// fallback is pinned against a catalogue that lacks the key: the
		// resolver must still hand back `{ reaction: null, why }`, which is the
		// component's byte-for-byte single-paragraph branch. This is the seam's
		// promise for an older catalogue or a Choice authored without one.
		vi.resetModules();
		vi.doMock('./messages', async () => {
			const actual = await vi.importActual<typeof import('./messages')>('./messages');
			return {
				...actual,
				hasMessage: (key: string) =>
					key.endsWith('_reaction') ? false : actual.hasMessage(key)
			};
		});
		try {
			const { feedbackParts: freshFeedbackParts } = await import('./card-text');
			const card = cardById('scam_opportunity');
			const choice = card?.choices.find((c) => c.id === 'in');
			if (!card || !choice) throw new Error('fixture card scam_opportunity/in moved');

			expect(hasMessage(choiceReactionKey(card.id, choice.id))).toBe(true);
			expect(freshFeedbackParts(card, choice)).toEqual({
				reaction: null,
				why: choiceFeedback(card, choice)
			});
		} finally {
			vi.doUnmock('./messages');
			vi.resetModules();
		}
	});

	it('resolves the first authored Reaction (fun-pass ticket 02)', () => {
		// The present path: the_allowance/spend carries a `_reaction` beside its
		// Why, so the Feedback becomes Reaction + Why (ADR-0004).
		const card = cardById('the_allowance');
		const choice = card?.choices.find((c) => c.id === 'spend');
		if (!card || !choice) throw new Error('fixture card the_allowance/spend moved');
		expect(hasMessage(choiceReactionKey('the_allowance', 'spend'))).toBe(true);

		const parts = feedbackParts(card, choice);
		expect(parts.reaction).not.toBeNull();
		expect(parts.reaction).not.toBe(parts.why);
		expect(chosenFeedbackParts(card, 'spend')).toEqual(parts);
	});

	it('falls back for every Choice without a Reaction — the seam changes nothing there', () => {
		for (const card of CARDS) {
			for (const choice of card.choices) {
				const parts = feedbackParts(card, choice);
				expect(parts.why, `${card.id}/${choice.id} Why differs from the shipped Feedback`).toBe(
					chosenFeedback(card, choice.id)
				);
				if (!hasMessage(choiceReactionKey(card.id, choice.id))) {
					expect(parts.reaction, `${card.id}/${choice.id} unexpectedly authored a Reaction`).toBeNull();
				} else {
					expect(parts.reaction, `${card.id}/${choice.id} Reaction resolved empty`).toBeTruthy();
				}
			}
		}
	});

	it('resolves nothing until a Choice is made', () => {
		const card = cardById('the_allowance') ?? null;
		expect(chosenFeedbackParts(null, 'spend')).toBeNull();
		expect(chosenFeedbackParts(card, null)).toBeNull();
		expect(chosenFeedbackParts(card, 'not_a_choice')).toBeNull();
	});

	it('resolves a formatted card’s lines in reading order, and none for a plain card (ticket 05)', () => {
		const formatted = cardById('meal_deal');
		const plain = cardById('two_wants');
		if (!formatted || !plain) throw new Error('fixture cards moved');

		expect(cardLines(formatted)).toEqual([
			message(cardLineKey('meal_deal', 1)),
			message(cardLineKey('meal_deal', 2)),
			message(cardLineKey('meal_deal', 3))
		]);
		expect(cardLines(plain)).toEqual([]);
	});
});
