/**
 * Card prose, resolved at render time (ticket 26). The deck carries ids and
 * effects only; this module maps a Card/Choice to its catalogue message. No
 * prose lives in TypeScript.
 */
import type { Card, Choice } from '$lib/game/types';
import {
	cardOddsKey,
	cardSituationKey,
	cardTitleKey,
	choiceFeedbackKey,
	choiceLabelKey,
	choiceReactionKey
} from './card-keys';
import { hasMessage, message } from './messages';

export function cardTitle(card: Card): string {
	return message(cardTitleKey(card.id));
}

export function cardSituation(card: Card): string {
	return message(cardSituationKey(card.id));
}

/** Odds are authored per card; `null` means the card shows no odds. */
export function cardOdds(card: Card): string | null {
	const key = cardOddsKey(card.id);
	return hasMessage(key) ? message(key) : null;
}

export function choiceLabel(card: Card, choice: Choice): string {
	return message(choiceLabelKey(card.id, choice.id));
}

export function choiceFeedback(card: Card, choice: Choice): string {
	return message(choiceFeedbackKey(card.id, choice.id));
}

/** The Feedback for the chosen Choice, or null while none is chosen. */
export function chosenFeedback(card: Card | null, chosen: string | null): string | null {
	if (!card || !chosen) return null;
	const choice = card.choices.find((c) => c.id === chosen);
	return choice ? choiceFeedback(card, choice) : null;
}

/**
 * The two parts of a Choice's Feedback (ADR-0004): the Reaction — what the
 * world did, in the fiction — and the Why, shown as "Why it happened". The
 * reaction key is optional: an unauthored Choice resolves to today's exact
 * single paragraph as the Why, with no Reaction above it.
 */
export interface FeedbackParts {
	/** The authored Reaction, or null when the Choice has none. */
	reaction: string | null;
	/** The Why; always today's `_feedback` paragraph. */
	why: string;
}

/** A Choice's Reaction, or null when none is authored. */
export function choiceReaction(card: Card, choice: Choice): string | null {
	const key = choiceReactionKey(card.id, choice.id);
	return hasMessage(key) ? message(key) : null;
}

/** A Choice's Feedback as its two parts, reaction first. */
export function feedbackParts(card: Card, choice: Choice): FeedbackParts {
	return { reaction: choiceReaction(card, choice), why: choiceFeedback(card, choice) };
}

/** The Feedback parts for the chosen Choice, or null while none is chosen. */
export function chosenFeedbackParts(
	card: Card | null,
	chosen: string | null
): FeedbackParts | null {
	if (!card || !chosen) return null;
	const choice = card.choices.find((c) => c.id === chosen);
	return choice ? feedbackParts(card, choice) : null;
}
