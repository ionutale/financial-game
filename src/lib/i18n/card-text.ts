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
	choiceLabelKey
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
