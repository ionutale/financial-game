/**
 * The spine (ticket 03): fixed beats at known Turns that guarantee every
 * Teachable Moment lands, whatever the seeded draw does. A card named here is
 * played at that month and is never drawn at random — give it weight 0.
 */
export const SPINE: Record<number, string> = {
	1: 'the_allowance', // Stage 1 opens: money arrives for the first time
	13: 'phone_plan', // Stage 2: the first recurring Obligation
	25: 'first_payslip', // Stage 3: effort becomes a wage
	37: 'bnpl_offer', // Stage 4: credit arrives, and it is not a card
	50: 'first_taxed_payslip', // Stage 5: the deduction reveal
	51: 'first_statement', // Stage 5: the card's first statement (ticket 03's teachable moment)
	53: 'scam_opportunity', // Stage 5: the scam, guaranteed (ticket 03)
	55: 'the_crash' // Stage 5: the risk half of investing
};

export function spineCardId(month: number): string | undefined {
	return SPINE[month];
}
