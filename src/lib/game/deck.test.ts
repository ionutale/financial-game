import { describe, expect, it } from 'vitest';
import { CARDS, cardById } from './cards';
import { applyAction, createRun, requiresSatisfied } from './loop';
import { turnRng } from './rng';
import { SPINE } from './spine';
import { STAGES } from './economy';
import type { RunState } from './types';

/** Plays a Run taking the first affordable Choice every month. */
function play(state: RunState, months: number): RunState {
	let s = state;
	for (let i = 0; i < months; i++) {
		// A Stage-up opens the month first (the Fork, on entering Stage 5).
		if (s.phase === 'stage_up' && s.card) {
			s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
			s = applyAction(s, { type: 'CONTINUE' });
		}
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
/** The month's drawn card — a Stage-up entry rides the same month (ticket 02). */
const playedAt = (s: RunState, month: number) =>
	s.log.find((l) => l.month === month && cardById(l.card)?.kind !== 'stage_up')?.card;

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
			const card = cardById(id);
			if (spineIds.has(id)) expect(SPINE[month]).toBe(id);
			else if (card?.kind === 'stage_up') {
				// A Stage-up opens its Stage before the month's Plan (ticket 02):
				// dealt by `startMonth`, never drawn at random, weight 0.
				expect(month, `${id} dealt at month ${month}`).toBe((Math.min(...card.stages) - 1) * 12 + 1);
				expect(card.weight ?? 1).toBe(0);
			} else expect(card?.weight ?? 1).toBeGreaterThan(0);
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

	it('serves every Concept of every Stage at least twice, across seeds', () => {
		for (const seed of [8, 555, 2024, 31337]) {
			const s = play(createRun(seed), 60);
			for (let stage = 1; stage <= 5; stage++) {
				const from = (stage - 1) * 12 + 1;
				const counts = new Map<string, number>();
				for (const entry of s.log.filter((l) => l.month >= from && l.month <= from + 11)) {
					const concept = cardById(entry.card)?.concept;
					if (concept) counts.set(concept, (counts.get(concept) ?? 0) + 1);
				}
				for (const concept of STAGES[stage].concepts) {
					expect(counts.get(concept) ?? 0, `seed ${seed} S${stage} ${concept}`).toBeGreaterThanOrEqual(2);
				}
			}
		}
	});
});

describe('a whole Run', () => {
	it('keeps enough cards that cannot have been seen before a Stage (ticket 19)', () => {
		for (let stage = 1; stage <= 5; stage++) {
			const spineBeats = Object.keys(SPINE).filter(
				(month) => Math.floor((Number(month) - 1) / 12) + 1 === stage
			).length;
			const draws = 12 - spineBeats;
			for (const path of [null, 'study', 'work'] as const) {
				// Guaranteed unseen: no earlier Stage could have consumed it (its minimum
				// Stage is this one). Guaranteed eligible: no gate, no Thread card (a live
				// Thread blocks plants), and the branch fits. This floor is what a Stage
				// can always deal, so it must cover its random draws.
				const floor = CARDS.filter(
					(c) =>
						(c.weight ?? 1) > 0 &&
						Math.min(...c.stages) === stage &&
						c.requires === undefined &&
						c.resolves === undefined &&
						!c.choices.some((ch) => ch.sets?.thread) &&
						(c.branch === undefined || c.branch === 'shared' || c.branch === path)
				).length;
				expect(floor, `Stage ${stage}, path ${path ?? 'shared'}: ${floor} < ${draws}`).toBeGreaterThanOrEqual(draws);
			}
		}
	});

	it('never deals a card whose rules are unmet, across full Runs (ticket 19)', () => {
		// The playtest policy: work the wage years, allocate 50/30/20, first affordable choice.
		for (const seed of [2024, 8, 777]) {
			let s = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });
			while (s.phase !== 'done') {
				if (s.phase === 'stage_up' && s.card) {
					s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
					s = applyAction(s, { type: 'CONTINUE' });
				}
				const hours = s.stage === 3 || s.stage === 4 ? 35 : 0;
				s = applyAction(s, { type: 'SET_HOURS', hours });
				s = applyAction(s, { type: 'SET_NEED', amount: Math.round(s.income * 0.5) });
				s = applyAction(s, { type: 'SET_WANT', amount: Math.round(s.income * 0.3) });
				s = applyAction(s, { type: 'CONFIRM_PLAN' });
				if (!s.card) break;
				const dealt = s.card;
				expect(requiresSatisfied(s, dealt.requires), `seed ${seed} m${s.month} ${dealt.id} requires`).toBe(true);
				expect(
					!dealt.resolves || dealt.resolves === s.thread?.id,
					`seed ${seed} m${s.month} ${dealt.id} resolves`
				).toBe(true);
				const affordable = dealt.choices.find((c) => {
					const h = c.freeTime ?? 0;
					return !(h < 0 && Math.abs(h) > s.freeTime);
				});
				s = applyAction(s, { type: 'CHOOSE', choiceId: (affordable ?? dealt.choices[0]).id });
				s = applyAction(s, { type: 'CONTINUE' });
				if (s.phase !== 'done') s = applyAction(s, { type: 'NEXT_MONTH' });
			}
		}
	});

	it('plays sixty months to the end without stalling', () => {
		const s = play(createRun(8), 60);
		expect(s.month).toBe(61);
		expect(s.phase).toBe('done');
		// Sixty months plus one Stage-up per Stage 2–5 (fun-pass ticket 02).
		expect(s.log).toHaveLength(64);
	});
});

/**
 * Fun-pass ticket 08: the villain cards use the existing effect vocabulary only
 * — no new fields, verbs or state. This is the fixture over the deck shape that
 * pins it: a card may carry only the fields the loop already applies, a Choice
 * only the shipped effect fields, `sets` only the shipped verbs, and `createRun`
 * only the stored state old saves already render. A new field would have to be
 * added here first — which is exactly the review this pin exists to force.
 */
describe('the deck shape (ADR-0005: content grows, the vocabulary is frozen)', () => {
	const CARD_FIELDS = [
		'id',
		'kind',
		'stages',
		'concept',
		'branch',
		'weight',
		'teaches',
		'requires',
		'resolves',
		'choices'
	];
	const CHOICE_FIELDS = ['id', 'cost', 'gain', 'freeTime', 'category', 'insuredCost', 'sets'];
	const SET_VERBS = ['insurance', 'bnpl', 'path', 'overdraft', 'minimumStreak', 'thread'];

	it('carries no card, choice or set field the loop cannot apply', () => {
		for (const card of CARDS) {
			for (const key of Object.keys(card)) {
				expect(CARD_FIELDS, `${card.id} carries ${key}`).toContain(key);
			}
			for (const choice of card.choices) {
				for (const key of Object.keys(choice)) {
					expect(CHOICE_FIELDS, `${card.id}/${choice.id} carries ${key}`).toContain(key);
				}
				for (const verb of Object.keys(choice.sets ?? {})) {
					expect(SET_VERBS, `${card.id}/${choice.id} sets ${verb}`).toContain(verb);
				}
			}
		}
	});

	it('keeps the stored Run shape frozen — no new state', () => {
		expect(Object.keys(createRun()).sort()).toEqual(
			[
				'age',
				'bnpl',
				'card',
				'cascade',
				'cash',
				'chosen',
				'close',
				'debt',
				'flags',
				'forcedCard',
				'freeTime',
				'freeTimeMax',
				'fund',
				'history',
				'hours',
				'income',
				'inflationIndex',
				'insurance',
				'lastPlan',
				'log',
				'month',
				'need',
				'netWorthAtStart',
				'obligations',
				'path',
				'phase',
				'pots',
				'saveAlloc',
				'savings',
				'score',
				'seed',
				'showIntro',
				'spent',
				'stage',
				'thread',
				'want',
				'workHintDone'
			].sort()
		);
	});
});
