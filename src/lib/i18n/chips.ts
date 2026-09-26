/**
 * Effect Chips (ticket 03): mechanically derived from the Choice's data, so no
 * card can hide a cost in its label or leak an outcome into one. Presentation
 * only — the loop never reads these strings.
 */
import { formatMoney } from '$lib/game/economy';
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

	if (choice.freeTime) {
		const hours = Math.abs(choice.freeTime);
		chips.push((choice.freeTime > 0 ? '+' : '\u2212') + hours + 'h');
	}

	if (choice.sets?.bnpl) {
		chips.push(message('chip_bnpl', { count: choice.sets.bnpl, amount: formatMoney(30, locale) }));
	}

	return chips;
}
