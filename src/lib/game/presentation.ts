/**
 * Presentation rules that must not be left to an author's prose (ticket 03).
 * Cost chips are derived mechanically from the effect data, so no card can
 * hide a cost in its label or leak an outcome into one.
 */

import { formatMoney } from './economy';
import type { Choice } from './types';

export function chipsFor(choice: Choice, insured: boolean): string[] {
	const chips: string[] = [];

	const cost = choice.insuredCost !== undefined && insured ? choice.insuredCost : (choice.cost ?? 0);
	if (choice.insuredCost !== undefined && insured && cost === 0) {
		chips.push('covered');
	} else if (cost > 0) {
		chips.push('\u2212' + formatMoney(cost));
	}

	if (choice.gain) chips.push('+' + formatMoney(choice.gain));

	if (choice.freeTime) {
		const hours = Math.abs(choice.freeTime);
		chips.push((choice.freeTime > 0 ? '+' : '\u2212') + hours + 'h');
	}

	if (choice.sets?.bnpl) chips.push(`${choice.sets.bnpl} \u00d7 ${formatMoney(30)}`);

	return chips;
}
