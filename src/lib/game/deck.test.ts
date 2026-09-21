import { describe, expect, it } from 'vitest';
import { cardById } from './cards';
import { applyAction, createRun } from './loop';
import { turnRng } from './rng';
import { SPINE } from './spine';
import { STAGES } from './economy';
import type { RunState } from './types';

/** Plays a Run taking the first affordable Choice every month. */
function play(state: RunState, months: number): RunState {
	let s = state;
	for (let i = 0; i < months; i++) {
		s = applyAction(s, { type: 'SET_HOURS', hours: 0 });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		if (!s.card) break;
		const affordable = s.card.choices.find((c) => {
			const hours = c.freeTime ?? 0;
			return !(hours < 0 && Math.abs(hours) > s.freeTime);
		});
		s = applyAction(s, { type: 'CHOOSE', choiceId: (affordable ?? s.card.choices[0]).id });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'NEXT_MONTH' });
	}
	return s;
}

const cardsPlayed = (s: RunState) => s.log.map((l) => l.card);
const playedAt = (s: RunState, month: number) => s.log.find((l) => l.month === month)?.card;

describe('the seeded generator', () => {
	it('is deterministic for a seed and a turn', () => {
		const a = turnRng(42, 7);
		const b = turnRng(42, 7);
		expect([a(), a(), a()]).toEqual([b(), b(), b()]);
	});

	it('gives a different Turn a different stream', () => {
		expect(turnRng(42, 7)()).not.toBe(turnRng(42, 8)());
	});
});

describe('the spine', () => {
	it('deals its beats at their months whatever the seed', () => {
		for (const seed of [1, 99, 12345]) {
			const s = play(createRun(seed), 13);
			expect(playedAt(s, 1)).toBe('the_allowance');
			expect(playedAt(s, 13)).toBe('phone_plan');
		}
	});

	it('never draws a spine-only card at random', () => {
		const spineIds = new Set(Object.values(SPINE));
		const s = play(createRun(2024), 48);
		for (const [month, id] of s.log.map((l) => [l.month, l.card] as const)) {
			if (spineIds.has(id)) expect(SPINE[month]).toBe(id);
			else expect(cardById(id)?.weight ?? 1).toBeGreaterThan(0);
		}
	});
});

describe('the draw', () => {
	it('is reproducible: the same seed plays the same Run', () => {
		expect(cardsPlayed(play(createRun(555), 30))).toEqual(cardsPlayed(play(createRun(555), 30)));
	});

	it('differs between seeds, so a replay is a different life', () => {
		const a = cardsPlayed(play(createRun(555), 30));
		const b = cardsPlayed(play(createRun(556), 30));
		expect(a).not.toEqual(b);
	});

	it('does not repeat a card while its Stage still has unseen ones', () => {
		const s = play(createRun(31337), 6); // Stage 1 has six cards to draw from
		const stage1 = s.log.filter((l) => l.month <= 12).map((l) => l.card);
		expect(new Set(stage1).size).toBe(stage1.length);
	});

	it('serves every Concept of a Stage at least twice', () => {
		const s = play(createRun(31337), 12);
		const counts = new Map<string, number>();
		for (const id of cardsPlayed(s)) {
			const concept = cardById(id)?.concept;
			if (concept) counts.set(concept, (counts.get(concept) ?? 0) + 1);
		}
		for (const concept of STAGES[1].concepts) {
			expect(counts.get(concept) ?? 0, `concept ${concept}`).toBeGreaterThanOrEqual(2);
		}
	});
});

describe('a whole Run', () => {
	it('plays sixty months to the end without stalling', () => {
		const s = play(createRun(8), 60);
		expect(s.month).toBe(61);
		expect(s.phase).toBe('done');
		expect(s.log).toHaveLength(60);
	});
});
