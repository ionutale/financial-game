import { describe, expect, it } from 'vitest';
import { CARDS, cardById } from '$lib/game/cards';
import type { Choice } from '$lib/game/types';
import { chipsFor } from './chips';

function choice(cardId: string, choiceId: string): Choice {
	const c = cardById(cardId)?.choices.find((x) => x.id === choiceId);
	if (!c) throw new Error(`no ${cardId}/${choiceId}`);
	return c;
}

describe('cost chips', () => {
	it('shows a money cost and an hours cost together', () => {
		expect(chipsFor({ id: 'x', cost: 25, freeTime: -6 }, false)).toEqual([
			'\u2212\u25c825',
			'\u22126h'
		]);
	});

	it('shows earnings and BNPL instalments', () => {
		expect(chipsFor(choice('extra_shift', 'take'), false)).toEqual(['+\u25c880', '\u221212h']);
		expect(chipsFor(choice('bnpl_trainers', 'bnpl'), false)).toEqual(['4 \u00d7 \u25c830']);
	});

	it('replaces a shock cost with "covered" once insured', () => {
		const shock = choice('phone_cracked', 'ack');
		expect(chipsFor(shock, false)).toEqual(['\u2212\u25c8120']);
		expect(chipsFor(shock, true)).toEqual(['covered']);
	});

	it('shows a Fund deposit as the money the Save side moves', () => {
		expect(chipsFor(choice('the_fund', 'open'), false)).toEqual(['\u2212\u25c8400']);
		expect(chipsFor(choice('boring_fund', 'fund'), false)).toEqual(['\u2212\u25c850']);
		expect(chipsFor(choice('the_crash', 'buy'), false)).toEqual(['\u2212\u25c8200']);
	});

	it('says so when a choice costs nothing now', () => {
		expect(chipsFor(choice('bnpl_trainers', 'skip'), false)).toEqual([]);
	});
});

describe('every card', () => {
	it('gives each Choice a visible difference from its siblings', () => {
		// Under ticket 03's reveal model costs are visible and outcomes are not,
		// so two Choices that chip identically are a coin flip, not a decision.
		const offenders: string[] = [];
		for (const card of CARDS) {
			const signatures = card.choices.map((c) => chipsFor(c, false).join(' | '));
			if (new Set(signatures).size !== card.choices.length) offenders.push(card.id);
		}
		expect(offenders).toEqual([]);
	});
});

