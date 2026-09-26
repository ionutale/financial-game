import { describe, expect, it } from 'vitest';
import { applyAction, createRun, pickCard, requiresSatisfied } from './loop';
import { CARDS } from './cards';
import { THREADS, threadDue } from './threads';
import { threadChip } from '$lib/i18n/game-text';
import type { RunState } from './types';

/** A fresh Run dropped into a Stage, the way the test scaffolding does it. */
function atStage(stage: number, month?: number): RunState {
	const s = applyAction(createRun(), { type: 'JUMP_STAGE', stage });
	return month === undefined ? s : { ...s, month };
}

/** Deals a specific card and takes a specific Choice. */
function take(s: RunState, cardId: string, choiceId: string): RunState {
	s = applyAction(s, { type: 'FORCE_CARD', id: cardId });
	s = applyAction(s, { type: 'CONFIRM_PLAN' });
	return applyAction(s, { type: 'CHOOSE', choiceId });
}

describe('planting a Thread', () => {
	it('sets the live Thread and shows the chip counting down', () => {
		const s = take(atStage(3), 'evening_course', 'enrol');
		expect(s.thread).toEqual({ id: 'course_enrolled', since: 25 });
		expect(threadChip(s)).toBe('The course \u2014 certificate in 3 months');
		expect(threadChip({ ...s, month: 26 })).toBe('The course \u2014 certificate in 2 months');
		expect(threadChip({ ...s, month: 27 })).toBe('The course \u2014 certificate in 1 month');
		expect(threadChip({ ...s, month: 28 })).toBe('The course \u2014 certificate this month');
	});

	it('never lets a second plant deal while one is live', () => {
		const s = take(atStage(3), 'lend_to_friend', 'lend');
		expect(s.thread?.id).toBe('friend_loan');
		for (let seed = 1; seed <= 40; seed++) {
			expect(pickCard({ ...s, seed })?.id, `seed ${seed}`).not.toBe('evening_course');
		}
	});

	it('never plants a Thread that cannot fall due before the Run ends', () => {
		const late = atStage(5, 59); // 59 + the app's 2 months lands past month 60
		for (let seed = 1; seed <= 40; seed++) {
			expect(pickCard({ ...late, seed })?.id, `seed ${seed}`).not.toBe('app_tip');
		}
	});
});

describe('resolving a Thread', () => {
	it('deals the resolve card once due, and playing it ends the Thread', () => {
		let s = take(atStage(3), 'evening_course', 'enrol');
		s = applyAction(s, { type: 'CONTINUE' });
		for (let i = 0; i < 3; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(28);
		expect(threadDue(s.thread!)).toBe(28);

		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(s.card?.id).toBe('course_pays_off');

		s = applyAction(s, { type: 'CHOOSE', choiceId: 'ask' });
		expect(s.thread).toBeNull();
		expect(threadChip(s)).toBeNull();
	});
});

describe('requires', () => {
	it('evaluates the named conditions against the Run', () => {
		const bare = atStage(3);
		expect(requiresSatisfied(bare, ['credit_card_open'])).toBe(false);
		expect(requiresSatisfied(bare, ['bnpl_active'])).toBe(false);
		expect(requiresSatisfied(bare, ['has_debt'])).toBe(false);
		expect(requiresSatisfied(bare, ['insured'])).toBe(false);
		expect(requiresSatisfied(bare, ['thread:course_enrolled'])).toBe(false);
		expect(requiresSatisfied(bare, ['not_a_condition'])).toBe(false);
		expect(requiresSatisfied(bare, [])).toBe(true);
		expect(requiresSatisfied(bare, undefined)).toBe(true);

		const open = {
			...bare,
			score: 600,
			bnpl: { amount: 30, monthsLeft: 3 },
			debt: 10,
			insurance: true,
			thread: { id: 'course_enrolled', since: 25 }
		};
		expect(
			requiresSatisfied(open, [
				'credit_card_open',
				'bnpl_active',
				'has_debt',
				'insured',
				'thread:course_enrolled'
			])
		).toBe(true);
	});
});

describe('the deck’s Threads and gates', () => {
	it('names only known Threads and conditions', () => {
		const conditions = new Set(['credit_card_open', 'bnpl_active', 'has_debt', 'insured']);
		for (const card of CARDS) {
			for (const r of card.requires ?? []) {
				const known = conditions.has(r) || (r.startsWith('thread:') && r.slice(7) in THREADS);
				expect(known, `${card.id} requires ${r}`).toBe(true);
			}
			if (card.resolves) expect(card.resolves in THREADS, `${card.id} resolves`).toBe(true);
			for (const choice of card.choices) {
				if (choice.sets?.thread) {
					expect(choice.sets.thread in THREADS, `${card.id}/${choice.id}`).toBe(true);
				}
			}
		}
	});

	it('gives every Thread a plant, a resolve, and coverage to every due Stage', () => {
		for (const [id, spec] of Object.entries(THREADS)) {
			const plants = CARDS.filter((c) => c.choices.some((ch) => ch.sets?.thread === id));
			expect(plants.length, `${id} needs a plant`).toBeGreaterThan(0);
			const resolves = CARDS.filter((c) => c.resolves === id);
			expect(resolves.length, `${id} needs a resolve`).toBeGreaterThan(0);

			for (const plant of plants) {
				for (const stage of plant.stages) {
					for (let m = (stage - 1) * 12 + 1; m <= Math.min(stage * 12, 60 - spec.months); m++) {
						const due = m + spec.months;
						const dueStage = Math.min(5, Math.floor((due - 1) / 12) + 1);
						const covered = resolves.some((r) => r.stages.includes(dueStage));
						expect(covered, `${id} planted m${m} due m${due} (S${dueStage})`).toBe(true);
					}
				}
			}
		}
	});
});
