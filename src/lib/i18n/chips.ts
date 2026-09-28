/**
 * Effect Chips (ticket 03): mechanically derived from the Choice's data, so no
 * card can hide a cost in its label or leak an outcome into one. Presentation
 * only — the loop never reads these strings.
 */
import { formatMoney, formatMoneyExact } from '$lib/game/economy';
import { RECURRING_AMOUNT } from '$lib/game/loop';
import { getLocale } from '$lib/paraglide/runtime';
import type { Choice } from '$lib/game/types';
import { message } from './messages';

export function chipsFor(choice: Choice, insured: boolean): string[] {
	const locale = getLocale();
	const chips: string[] = [];

	const cost = choice.insuredCost !== undefined && insured ? choice.insuredCost : (choice.cost ?? 0);
	if (choice.insuredCost !== undefined && insured && cost === 0) {
		chips.push(message('chip_covered'));
	} else if (cost > 0) {
		chips.push('\u2212' + formatMoney(cost, locale));
	}

	if (choice.gain) chips.push('+' + formatMoney(choice.gain, locale));

	// A Fund deposit chips as the money it moves: the Save envelope loses it
	// (fun-pass ticket 09), so the amount is never hidden in the label.
	if (choice.sets?.fund !== undefined) {
		chips.push('\u2212' + formatMoney(choice.sets.fund, locale));
	}

	if (choice.freeTime) {
		const hours = Math.abs(choice.freeTime);
		chips.push((choice.freeTime > 0 ? '+' : '\u2212') + hours + 'h');
	}

	if (choice.sets?.bnpl) {
		// The recurring payment's terms (ticket 10): the count-only shop form
		// pays ◈30 a month; the card's Repayment names its own amount, shown
		// exactly so the schedule never rounds into a different number.
		const terms =
			typeof choice.sets.bnpl === 'number'
				? { months: choice.sets.bnpl, amount: RECURRING_AMOUNT }
				: { months: choice.sets.bnpl.months, amount: choice.sets.bnpl.amount };
		chips.push(
			message('chip_bnpl', { count: terms.months, amount: formatMoneyExact(terms.amount, locale) })
		);
	}

	return chips;
}
