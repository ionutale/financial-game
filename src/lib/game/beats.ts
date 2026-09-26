/**
 * The beat map (ticket 30): which moments get an illustration.
 *
 * Ticket 13's direction is typographic-first, illustrated at the beats — never
 * per Event Card, because a deck of 80+ cards is a deck of 80+ drawings no
 * author can make. The `spine.ts` beats plus the Fork therefore map to exactly
 * ten flat-vector pieces: nine card beats and the Money Story's closing panel.
 *
 * The keys are card ids, so a beat missing from this map is a silent missing
 * picture; `beats.test.ts` asserts the map covers every spine beat exactly once
 * and that each piece has alt text in all three catalogues.
 */
export type BeatArtId =
	| 'allowance'
	| 'phone_plan'
	| 'first_payslip'
	| 'bnpl_offer'
	| 'first_taxed_payslip'
	| 'first_statement'
	| 'scam'
	| 'crash'
	| 'fork'
	| 'money_story';

/** Card beat → art. Every spine beat, plus the Stage-5 Fork's Stage-up card. */
export const BEAT_ART = {
	the_allowance: 'allowance',
	phone_plan: 'phone_plan',
	first_payslip: 'first_payslip',
	bnpl_offer: 'bnpl_offer',
	first_taxed_payslip: 'first_taxed_payslip',
	first_statement: 'first_statement',
	scam_opportunity: 'scam',
	the_crash: 'crash',
	the_fork: 'fork'
} as const satisfies Record<string, BeatArtId>;

/** The Money Story is not a card, so its panel is named directly. */
export const MONEY_STORY_BEAT: BeatArtId = 'money_story';

/** Every piece the map can produce, for the catalogue and drawing gates. */
export const BEAT_ART_IDS: BeatArtId[] = [
	...new Set<BeatArtId>([...Object.values(BEAT_ART), MONEY_STORY_BEAT])
];

/** The art for a card id, or null for the 70+ cards that stay typographic. */
export function beatArtFor(cardId: string): BeatArtId | null {
	return (BEAT_ART as Record<string, BeatArtId>)[cardId] ?? null;
}

/** The alt-text catalogue key for one piece. */
export function beatAltKey(beat: BeatArtId): string {
	return `beat_art_${beat}_alt`;
}
