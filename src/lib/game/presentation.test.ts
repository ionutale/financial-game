import { describe, expect, it } from 'vitest';
import { chipsFor } from './presentation';
import { cardById } from './cards';
import type { Choice } from './types';

function choice(cardId: string, choiceId: string): Choice {
	const c = cardById(cardId)?.choices.find((x) => x.id === choiceId);
	if (!c) throw new Error(`no ${cardId}/${choiceId}`);
	return c;
}

describe('cost chips', () => {
	it('shows a money cost and an hours cost together', () => {
		expect(chipsFor({ id: 'x', label: 'x', cost: 25, freeTime: -6, feedback: '' }, false)).toEqual([
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

	it('says so when a choice costs nothing now', () => {
		expect(chipsFor(choice('bnpl_trainers', 'skip'), false)).toEqual([]);
	});
});
