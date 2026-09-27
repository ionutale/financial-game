/**
 * The Card Formats (fun-pass ticket 05, design §3.6): the diegetic shape a
 * card's own words are arranged into — `message` (chat/text threads), `paper`
 * (documents: payslips, statements), `receipt` (itemised blocks).
 *
 * This map lives outside the deck and holds arrangement only: a format and how
 * many `card_<id>_line_<n>` lines the arrangement adds to the card. Every word
 * stays in the message catalogue, keyed by the card's own id, so changing a
 * format (or its line count) changes the shape of the card and never its
 * words, choices or meaning. The markup lives in `EventStep.svelte`;
 * `forms.test.ts` is the gate that the map, the deck and the three catalogues
 * agree.
 */
export type CardFormat = 'message' | 'paper' | 'receipt';

export interface CardForm {
	/** The diegetic arrangement the card's own words are set into. */
	format: CardFormat;
	/** How many `card_<id>_line_<n>` lines the arrangement adds, n = 1..lines. */
	lines: number;
}

/** Every format the map may name, for the gate and the component. */
export const CARD_FORMAT_IDS: CardFormat[] = ['message', 'paper', 'receipt'];

/**
 * The cards with a Card Format, chosen where the fiction is already a message
 * or a document. Everything else keeps the plain card.
 */
export const CARD_FORMS = {
	// message — the card's fiction is a chat thread or a text
	refund_text: { format: 'message', lines: 1 },
	scam_opportunity: { format: 'message', lines: 1 },
	app_tip: { format: 'message', lines: 1 },
	app_vanishes: { format: 'message', lines: 1 },
	// fun-pass ticket 07: the cast's own lines arrive as messages
	mum_late_pay: { format: 'message', lines: 1 },
	priya_shift_swap: { format: 'message', lines: 1 },
	ravi_needs_cover: { format: 'message', lines: 1 },
	danny_flat_night: { format: 'message', lines: 1 },

	// paper — the card's fiction is a document: a payslip, a statement
	first_taxed_payslip: { format: 'paper', lines: 2 },
	payslip_error: { format: 'paper', lines: 1 },
	first_statement: { format: 'paper', lines: 2 },
	quarterly_interest: { format: 'paper', lines: 1 },
	savings_milestone: { format: 'paper', lines: 1 },

	// receipt — the card's fiction itemises what the money went on
	meal_deal: { format: 'receipt', lines: 3 },
	subscription_creep: { format: 'receipt', lines: 4 },
	payday_drain: { format: 'receipt', lines: 3 }
} as const satisfies Record<string, CardForm>;

/** The card's format and line count, or null for the plain card. */
export function cardFormFor(cardId: string): CardForm | null {
	return (CARD_FORMS as Record<string, CardForm>)[cardId] ?? null;
}
