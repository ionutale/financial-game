/**
 * The deterministic key convention for card prose (ticket 07): keys are derived
 * from immutable card and choice ids, never from deck order. Kept dependency-free
 * so the deck-integrity test can build the exact same keys the components use.
 */
export const CARD_KEY_PREFIX = 'card_';

export const cardTitleKey = (cardId: string): string => `${CARD_KEY_PREFIX}${cardId}_title`;
export const cardSituationKey = (cardId: string): string =>
	`${CARD_KEY_PREFIX}${cardId}_situation`;
export const cardOddsKey = (cardId: string): string => `${CARD_KEY_PREFIX}${cardId}_odds`;
export const choiceLabelKey = (cardId: string, choiceId: string): string =>
	`${CARD_KEY_PREFIX}${cardId}_choice_${choiceId}_label`;
export const choiceFeedbackKey = (cardId: string, choiceId: string): string =>
	`${CARD_KEY_PREFIX}${cardId}_choice_${choiceId}_feedback`;
/** The optional Reaction (ADR-0004); absent means today's single-paragraph Feedback. */
export const choiceReactionKey = (cardId: string, choiceId: string): string =>
	`${CARD_KEY_PREFIX}${cardId}_choice_${choiceId}_reaction`;

/**
 * The optional extra line a Card Format arranges around the card (fun-pass
 * ticket 05); a card's arrangement and its line count live in `game/forms.ts`.
 */
export const cardLineKey = (cardId: string, line: number): string =>
	`${CARD_KEY_PREFIX}${cardId}_line_${line}`;

/**
 * A Callback's line (fun-pass ticket 07): the derived memory keyed by its
 * callback id; the ids live in `game/callbacks.ts`.
 */
export const CALLBACK_KEY_PREFIX = 'callback_';
export const callbackKey = (id: string): string => `${CALLBACK_KEY_PREFIX}${id}`;
