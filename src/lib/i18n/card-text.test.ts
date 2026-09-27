import { describe, expect, it } from 'vitest';
import { CARDS, cardById } from '$lib/game/cards';
import { choiceReactionKey } from './card-keys';
import { hasMessage } from './messages';
import {
	chosenFeedback,
	chosenFeedbackParts,
	choiceFeedback,
	choiceReaction,
	feedbackParts
} from './card-text';

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

	it('resolves an unauthored card to today’s single paragraph: no Reaction, the Why alone', () => {
		const card = cardById('two_wants');
		const choice = card?.choices.find((c) => c.id === 'game');
		if (!card || !choice) throw new Error('fixture card two_wants/game moved');

		expect(feedbackParts(card, choice)).toEqual({
			reaction: null,
			why: choiceFeedback(card, choice)
		});
		expect(choiceReaction(card, choice)).toBeNull();
		expect(chosenFeedbackParts(card, 'game')).toEqual({
			reaction: null,
			why: chosenFeedback(card, 'game')
		});
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
});
