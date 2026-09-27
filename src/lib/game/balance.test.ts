/**
 * The balance + variety harness (fun-pass ticket 06, spec §"Harness").
 *
 * The safety net under ADR-0005's living deck: content may grow, but it must
 * not drift the bands. This suite drives ~100 seeded Runs per scripted policy —
 * an **impulse** player and a **steady** player — through the **real reducer**
 * (`loop.ts` + `rng.ts` + `cards.ts`), and asserts what the current deck does
 * against values recorded here:
 *
 *   - the Outcome-Band distribution (ahead / treading / behind),
 *   - the final-net-worth spread (p10 / median / p90),
 *   - the year-5 obligations-to-income ratio (closes 49–60),
 *   - the variety metric: mean pairwise overlap (Jaccard) of the cards two
 *     Runs drew — a ceiling. More content lowers it; a change that makes Runs
 *     more samey raises it.
 *
 * A red band REJECTS a card. It never retunes the economy: the draw, the RNG,
 * the reducer and every economy number stay put, and the offending content
 * answers to this suite. When a deck change is genuinely accepted, re-record:
 * run `pnpm vitest run src/lib/game/balance.test.ts`, read the measured values
 * out of the failure messages, paste them below, and update the deck
 * fingerprint.
 */

import { createHash } from 'node:crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import { CARDS } from './cards';
import { expectedIncome, netWorth, obligationsFor } from './economy';
import { RUN_MONTHS, applyAction, createRun } from './loop';
import { outcomeBand, type OutcomeBand } from './metrics';
import type { Card, Choice, RunState } from './types';

/* -------------------------------------------------------------------------- */
/* Recorded from the current deck (fun-pass ticket 06, before any content     */
/* change). Re-record only when a deck change is accepted.                    */
/* -------------------------------------------------------------------------- */

/** sha256 of the deck's structural content (`JSON.stringify(CARDS)`), first 12. */
const RECORDED_DECK = '49bdadb3bbaf';

/** How far an accepted content change may drift a recorded value. */
const DRIFT = {
	/** Runs per band, out of 100. */
	bands: 3,
	/** ±20% of each recorded net-worth percentile. */
	netWorth: 0.2,
	/** Absolute, on the year-5 obligations-to-income ratio. */
	ratio5: 0.05,
	/** Absolute, on the mean drawn-card overlap (a ceiling: variety may grow). */
	overlap: 0.02
};

const BANDS: OutcomeBand[] = ['ahead', 'treading', 'behind'];

interface RecordedPolicy {
	bands: Record<OutcomeBand, number>;
	netWorth: { p10: number; median: number; p90: number };
	ratio5: number;
	overlap: number;
}

const RECORDED: Record<PolicyId, RecordedPolicy> = {
	impulse: {
		bands: { ahead: 0, treading: 0, behind: 100 },
		netWorth: { p10: -2501, median: -2267, p90: -1861 },
		ratio5: 0.80421875,
		overlap: 0.7369624601172884
	},
	steady: {
		bands: { ahead: 100, treading: 0, behind: 0 },
		netWorth: { p10: 14422.877732846704, median: 14592.592380537179, p90: 14762.293729277168 },
		ratio5: 0.6779797979797968,
		overlap: 0.778906469537268
	}
};

/* -------------------------------------------------------------------------- */
/* The scripted policies                                                      */
/* -------------------------------------------------------------------------- */

type PolicyId = 'impulse' | 'steady';

interface Plan {
	hours: number;
	need: number;
	want: number;
}

interface Policy {
	id: PolicyId;
	plan(s: RunState): Plan;
	/** The Choice ids in the order this player would take them (best first). */
	rank(card: Card): string[];
}

/**
 * Impulse — spends what is in front of them, never works a shift, leaves the
 * future to deal with itself. Ranks by the immediate money movement: a purchase
 * beats no purchase, a bigger purchase beats a smaller one, money in hand beats
 * both; pay-later and dipping into the red are the temptation.
 */
const impulse: Policy = {
	id: 'impulse',
	plan: (s) => {
		const hours = 0;
		return { hours, need: 0, want: expectedIncome({ ...s, hours }) };
	},
	rank: (card) =>
		[...card.choices]
			.sort(
				(a, b) =>
					buying(b) - buying(a) ||
					(b.cost ?? 0) - (a.cost ?? 0) ||
					(b.gain ?? 0) - (a.gain ?? 0) ||
					temptation(b) - temptation(a) ||
					(a.freeTime ?? 0) - (b.freeTime ?? 0)
			)
			.map((c) => c.id)
};

/**
 * Steady — works a steady schedule, covers the month's fixed costs in the plan
 * and saves the rest. Ranks by what protects the future: no pay-later, no
 * overdraft, a known small cost to delete an unknown big one (insurance), then
 * the cheaper option, then the one that pays.
 */
const steady: Policy = {
	id: 'steady',
	plan: (s) => {
		const hours = Math.min(30, Math.floor(s.freeTimeMax / 2));
		const income = expectedIncome({ ...s, hours });
		const need = Math.min(income, obligationsFor(s));
		return { hours, need, want: Math.min(income - need, 20) };
	},
	rank: (card) =>
		[...card.choices]
			.sort(
				(a, b) =>
					reckless(a) - reckless(b) ||
					covered(b) - covered(a) ||
					(a.cost ?? 0) - (b.cost ?? 0) ||
					(b.gain ?? 0) - (a.gain ?? 0) ||
					Math.abs(a.freeTime ?? 0) - Math.abs(b.freeTime ?? 0)
			)
			.map((c) => c.id)
};

const buying = (c: Choice) => ((c.cost ?? 0) > 0 ? 1 : 0);
const temptation = (c: Choice) => (c.sets?.bnpl || c.sets?.overdraft ? 1 : 0);
const reckless = (c: Choice) => (c.sets?.bnpl || c.sets?.overdraft ? 1 : 0);
const covered = (c: Choice) => (c.sets?.insurance ? 1 : 0);

const POLICIES: Policy[] = [impulse, steady];

/* -------------------------------------------------------------------------- */
/* The driver                                                                 */
/* -------------------------------------------------------------------------- */

interface Played {
	state: RunState;
	/** The year-5 closes, for the obligations-to-income ratio. */
	year5: { obligations: number; income: number };
}

/** One seeded Run per policy, from the reducer alone. */
function play(policy: Policy, seed: number): Played {
	let s = createRun(seed);
	const year5 = { obligations: 0, income: 0 };

	while (s.phase !== 'done') {
		// A Stage opens with its Stage-up card, before the month can be planned.
		if (s.phase === 'stage_up') {
			s = choose(s, policy);
			s = applyAction(s, { type: 'CONTINUE' });
			continue;
		}
		if (s.phase !== 'plan') throw new Error(`harness stuck at month ${s.month} (${s.phase})`);

		const plan = policy.plan(s);
		s = applyAction(s, { type: 'SET_HOURS', hours: plan.hours });
		s = applyAction(s, { type: 'SET_NEED', amount: plan.need });
		s = applyAction(s, { type: 'SET_WANT', amount: plan.want });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		if (s.phase !== 'event' || !s.card) throw new Error(`no card at month ${s.month}`);

		s = choose(s, policy);
		s = applyAction(s, { type: 'CONTINUE' });

		if (s.month > RUN_MONTHS - 12) {
			year5.obligations += s.close?.obligations ?? 0;
			year5.income += s.close?.income ?? 0;
		}
		s = applyAction(s, { type: 'NEXT_MONTH' });
	}
	return { state: s, year5 };
}

/** The policy's first choice the reducer accepts; throws if none is left. */
function choose(s: RunState, policy: Policy): RunState {
	for (const id of policy.rank(s.card as Card)) {
		const next = applyAction(s, { type: 'CHOOSE', choiceId: id });
		if (next.chosen === id) return next;
	}
	throw new Error(`no feasible choice for ${s.card?.id}`);
}

/* -------------------------------------------------------------------------- */
/* Recording                                                                  */
/* -------------------------------------------------------------------------- */

interface RunResult {
	seed: number;
	band: OutcomeBand;
	netWorth: number;
	/** Year-5 obligations over the year's landed income. */
	ratio5: number;
	/** Every card this Run drew, deduplicated. */
	drawn: string[];
}

const SEEDS = Array.from({ length: 100 }, (_, i) => i + 1);

function results(policy: Policy): RunResult[] {
	return SEEDS.map((seed) => {
		const { state, year5 } = play(policy, seed);
		return {
			seed,
			band: outcomeBand(state),
			netWorth: netWorth(state),
			ratio5: year5.income > 0 ? year5.obligations / year5.income : Number.NaN,
			drawn: [...new Set(state.log.map((entry) => entry.card))]
		};
	});
}

const percentile = (values: number[], p: number) => {
	const sorted = [...values].sort((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.round((sorted.length - 1) * p))];
};

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** Mean pairwise Jaccard overlap of the cards two Runs drew: the variety metric. */
function meanOverlap(runs: RunResult[]): number {
	const sets = runs.map((run) => new Set(run.drawn));
	let sum = 0;
	let pairs = 0;
	for (let i = 0; i < runs.length; i++) {
		for (let j = i + 1; j < runs.length; j++) {
			let shared = 0;
			for (const card of sets[i]) if (sets[j].has(card)) shared++;
			sum += shared / (sets[i].size + sets[j].size - shared);
			pairs++;
		}
	}
	return sum / pairs;
}

/** The deck the assertions actually ran against, for every failure message. */
function deckNote(): string {
	const fingerprint = createHash('sha256').update(JSON.stringify(CARDS)).digest('hex').slice(0, 12);
	return `deck ${fingerprint} (bands recorded from ${RECORDED_DECK})`;
}

/* -------------------------------------------------------------------------- */
/* The assertions                                                             */
/* -------------------------------------------------------------------------- */

let measured: Record<PolicyId, RunResult[]>;

beforeAll(() => {
	measured = { impulse: results(impulse), steady: results(steady) };
}, 30_000);

describe('the balance harness', () => {
	it('is deterministic: the same seed deals the same life', () => {
		for (const policy of POLICIES) {
			const first = play(policy, 42);
			const second = play(policy, 42);
			expect(second.state.log, `${policy.id}: log`).toEqual(first.state.log);
			expect(netWorth(second.state), `${policy.id}: net worth`).toBe(netWorth(first.state));
			expect(second.state.history, `${policy.id}: history`).toEqual(first.state.history);
		}
	});

	it('ran against the deck the bands were recorded from', () => {
		expect(
			createHash('sha256').update(JSON.stringify(CARDS)).digest('hex').slice(0, 12),
			'the deck changed — run the suite, check the drift is accepted, then re-record the bands and this fingerprint'
		).toBe(RECORDED_DECK);
	});

	it('keeps the Outcome-Band distribution inside the recorded bands', () => {
		for (const policy of POLICIES) {
			const runs = measured[policy.id];
			expect(runs, `${policy.id}: one Run per seed`).toHaveLength(SEEDS.length);

			for (const band of BANDS) {
				const count = runs.filter((run) => run.band === band).length;
				const recorded = RECORDED[policy.id].bands[band];
				const message = `${policy.id}: ${band} runs — ${deckNote()}`;
				expect(count, message).toBeGreaterThanOrEqual(recorded - DRIFT.bands);
				expect(count, message).toBeLessThanOrEqual(recorded + DRIFT.bands);
			}
		}
	});

	it('keeps the final-net-worth spread inside the recorded band', () => {
		for (const policy of POLICIES) {
			const netWorths = measured[policy.id].map((run) => run.netWorth);
			const recorded = RECORDED[policy.id].netWorth;

			for (const at of [0.1, 0.5, 0.9] as const) {
				const value = percentile(netWorths, at);
				const expected = recorded[at === 0.1 ? 'p10' : at === 0.5 ? 'median' : 'p90'];
				const slack = Math.abs(expected) * DRIFT.netWorth;
				const message = `${policy.id}: p${at * 100} net worth ${Math.round(value)} — ${deckNote()}`;
				expect(value, message).toBeGreaterThanOrEqual(expected - slack);
				expect(value, message).toBeLessThanOrEqual(expected + slack);
			}
		}
	});

	it('keeps the year-5 obligations-to-income ratio inside the recorded band', () => {
		for (const policy of POLICIES) {
			const value = mean(measured[policy.id].map((run) => run.ratio5));
			const recorded = RECORDED[policy.id].ratio5;
			const message = `${policy.id}: year-5 ratio ${value.toFixed(3)} — ${deckNote()}`;
			expect(value, message).toBeGreaterThanOrEqual(recorded - DRIFT.ratio5);
			expect(value, message).toBeLessThanOrEqual(recorded + DRIFT.ratio5);
		}
	});

	it('keeps the variety metric under the recorded threshold', () => {
		for (const policy of POLICIES) {
			const overlap = meanOverlap(measured[policy.id]);
			const ceiling = RECORDED[policy.id].overlap + DRIFT.overlap;
			const message = `${policy.id}: mean drawn-card overlap ${overlap.toFixed(4)} — ${deckNote()}`;
			expect(overlap, message).toBeLessThanOrEqual(ceiling);
			// Overlap is a fraction of two card sets: it can never reach one.
			expect(overlap, message).toBeLessThan(1);
		}
	});
});
