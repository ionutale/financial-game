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
