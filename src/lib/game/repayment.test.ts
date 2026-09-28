/**
 * The Repayment (fun-pass ticket 10, ADR-0006): the card's minimum payment
 * becomes a real six-month Repayment through the shipped recurring-payment
 * state (`RunState.bnpl`, `{ amount, monthsLeft }`).
 *
 * The stored shape is unchanged — old saves keep behaving — and a Choice may
 * now name its own per-payment amount (`sets.bnpl` as `{ amount, months }`)
 * beside the shipped count-only form (four payments of the shop's ◈30).
 */
import { describe, expect, it } from 'vitest';
import { applyAction, closeMonth, createRun } from './loop';
import type { RunState } from './types';

/** A fresh Run dropped into a Stage, its Stage-up resolved, like the others. */
function atStage(stage: number, month?: number): RunState {
	let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage });
	if (s.phase === 'stage_up' && s.card) {
		s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
		s = applyAction(s, { type: 'CONTINUE' });
	}
	return month === undefined ? s : { ...s, month };
}

/** Deals a specific card and takes a specific Choice. */
function take(s: RunState, cardId: string, choiceId: string): RunState {
	s = applyAction(s, { type: 'FORCE_CARD', id: cardId });
	s = applyAction(s, { type: 'CONFIRM_PLAN' });
	return applyAction(s, { type: 'CHOOSE', choiceId });
}

/** One close on a copy of the state — the loop's own settle path. */
function closed(s: RunState): RunState {
	return closeMonth(structuredClone(s));
}

/** What a close actually took for the recurring payment. */
function paidFor(s: RunState): number {
	const bnpl = s.close?.bnpl;
	return bnpl ? bnpl.fromCash + bnpl.fromSavings + bnpl.toDebt : 0;
}

describe('the minimum payment', () => {
	it('becomes a six-month Repayment when the Choice is taken', () => {
		const s = take(atStage(4), 'minimum_payment', 'minimum');
		expect(s.bnpl).toEqual({ amount: 47.5, monthsLeft: 6 });
		// The statement's ◈300: ◈15 now, the rest carried across the six months.
		expect(15 + (s.bnpl?.amount ?? 0) * (s.bnpl?.monthsLeft ?? 0)).toBeCloseTo(300);
	});

	it('is charged at each close, six times, then ends', () => {
		let s = take(atStage(4), 'minimum_payment', 'minimum');
		let total = 0;
		for (let month = 0; month < 6; month++) {
			s = closed(s);
			expect(s.close?.bnpl, `close ${month + 1}: the Repayment did not pay`).not.toBeNull();
			total += paidFor(s);
		}
		expect(total).toBeCloseTo(285);
		expect(s.bnpl).toBeNull();
	});

	it('is not a one-off fee: the balance stays alive across the six months', () => {
		const s = take(atStage(4), 'minimum_payment', 'minimum');
		const first = closed(s);
		expect(first.bnpl).toEqual({ amount: 47.5, monthsLeft: 5 });
		// The month after the first payment is still carrying the repayment.
		const second = closed(first);
		expect(second.bnpl).toEqual({ amount: 47.5, monthsLeft: 4 });
	});

	it('is refused when there is nothing to repay — no card, no Choice', () => {
		const s = atStage(4);
		expect(s.bnpl).toBeNull();
	});
});

describe('legacy tolerance (the shipped BNPL-shaped save)', () => {
	it('keeps a stored save’s amount and count behaving exactly as shipped', () => {
		const legacy: RunState = {
			...atStage(4),
			phase: 'resolve',
			bnpl: { amount: 30, monthsLeft: 2 }
		};
		const first = closed(legacy);
		expect(first.bnpl).toEqual({ amount: 30, monthsLeft: 1 });
		expect(paidFor(first)).toBe(30);

		const second = closed(first);
		expect(second.bnpl).toBeNull();
		expect(paidFor(second)).toBe(30);
	});

	it('still starts the shop’s instalments from a count-only Choice, at ◈30', () => {
		const s = take(atStage(3), 'bnpl_trainers', 'bnpl');
		expect(s.bnpl).toEqual({ amount: 30, monthsLeft: 4 });
	});

	it('accepts a pre-bnpl save (field absent) without touching it', () => {
		const old = atStage(4);
		delete (old as Partial<RunState>).bnpl;
		const after = closed(old);
		expect(after.bnpl).toBeUndefined();
		expect(after.close?.bnpl).toBeNull();
	});
});
