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
import { CARDS, cardById } from './cards';
import { expectedIncome, netWorth, obligationsFor } from './economy';
import { RUN_MONTHS, applyAction, createRun } from './loop';
import { outcomeBand, type OutcomeBand } from './metrics';
import type { Card, Choice, RunState } from './types';

/* -------------------------------------------------------------------------- */
/* Recorded from the current deck (fun-pass ticket 06, before any content     */
/* change). Re-record only when a deck change is accepted.                    */
/*                                                                            */
/* Ticket 10 (the Repayment, ADR-0006) is the one instrument change, ruled by */
/* the orchestrator: no metric constant below was re-recorded. The steady     */
/* policy's `reckless` predicate was refined instead, so the card's           */
/* sanctioned six-month Repayment is read as debt servicing, not as the       */
/* shop's count-only temptation (see the predicate and its pin test) —        */
/* flagging it made steady pay the ◈300 in full, overdraw the month's         */
/* envelopes by ◈20 and flip 87/100 Runs to `behind`. Only the deck           */
/* fingerprint below moved.                                                   */
/* -------------------------------------------------------------------------- */

/** sha256 of the deck's structural content (`JSON.stringify(CARDS)`), first 12. */
const RECORDED_DECK = 'd046cb929f27';

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
	/** Runs out of 100 that saw at least two Threads return a consequence. */
	consequences: number;
}

const RECORDED: Record<PolicyId, RecordedPolicy> = {
	// Ticket 09 (Fund wiring) re-recorded the impulse spread only, with the
	// orchestrator's ruling — ADR-0006's repair in the harness: the wired deck
	// refuses the old debt-financed `the_fund/open` (400) and `the_crash/buy`
	// (200) for a saver-less impulse Run, so its final net worth moves ~+600.
	// The draw is bit-identical; bands, ratios, overlap and consequences are
	// unchanged. Every other constant below is byte-identical to ticket 06/08.
	impulse: {
		bands: { ahead: 0, treading: 0, behind: 100 },
		netWorth: { p10: -1720, median: -1417, p90: -1034 },
		ratio5: 0.80421875,
		overlap: 0.7369624601172884,
		consequences: 100
	},
	steady: {
		bands: { ahead: 100, treading: 0, behind: 0 },
		netWorth: { p10: 14422.877732846704, median: 14592.592380537179, p90: 14762.293729277168 },
		ratio5: 0.6779797979797968,
		overlap: 0.778906469537268,
		consequences: 78
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
 * and saves the rest. Ranks by what protects the future: no count-only
 * pay-later (the shop's free-now instalments), no overdraft, a known small cost
 * to delete an unknown big one (insurance), then the cheaper option, then the
 * one that pays.
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

/**
 * The steady policy's “no pay-later” rule, refined by ticket 10's ruling after
 * the harness caught the Repayment.
 *
 * The rule flags the **count-only** instalment form (`sets.bnpl: 4` — the
 * shop's “nothing now, four payments later”) and any overdraft: those are the
 * temptations the policy avoids. It deliberately does NOT flag the card's
 * **named-amount** Repayment (`sets.bnpl: { amount, months }`, ticket 10):
 * that Choice pays ◈15 today and carries the balance over six months — debt
 * servicing, not purchase financing. Flagging it made the steady policy pay
 * the ◈300 in full instead; a category draw cannot reach the savings account,
 * so the payment overdrew the month's Need+Save envelopes by ◈20 and flipped
 * 87/100 Runs to `behind` — a policy artifact, not economic drift (the draw
 * and every economy number are unchanged). Pinned below: the three shipped
 * temptations stay flagged, the Repayment is not, and no other Choice's
 * flagged state moves — so no other card's steady order changes.
 */
// Count-only `bnpl` is the pay-later temptation (flagged); the named-amount
// form is debt servicing — the ticket-10 Repayment (not flagged), keyed to the
// representation, so a named-amount financing choice would still need review.
const reckless = (c: Choice) =>
	(typeof c.sets?.bnpl === 'number' || c.sets?.overdraft ? 1 : 0);
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
	/** Threads planted, and Threads whose consequence actually returned. */
	threads: { planted: number; resolved: number };
}

const SEEDS = Array.from({ length: 100 }, (_, i) => i + 1);

/**
 * The Threads a finished Run planted and saw return, from the real log: a
 * Choice that carries `sets.thread` plants one; a played resolve card returns
 * its consequence. Both are read from the stored record alone.
 */
function threadStats(state: RunState): { planted: number; resolved: number } {
	const planted = new Set<string>();
	const resolved = new Set<string>();
	for (const entry of state.log) {
		const card = cardById(entry.card);
		if (!card) continue;
		const choice = card.choices.find((c) => c.id === entry.choice);
		if (choice?.sets?.thread) planted.add(choice.sets.thread);
		if (card.resolves) resolved.add(card.resolves);
	}
	return { planted: planted.size, resolved: resolved.size };
}

function results(policy: Policy): RunResult[] {
	return SEEDS.map((seed) => {
		const { state, year5 } = play(policy, seed);
		return {
			seed,
			band: outcomeBand(state),
			netWorth: netWorth(state),
			ratio5: year5.income > 0 ? year5.obligations / year5.income : Number.NaN,
			drawn: [...new Set(state.log.map((entry) => entry.card))],
			threads: threadStats(state)
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

	it('keeps the refined reckless predicate to the card Repayment alone', () => {
		// Ticket 10's ruling, pinned: the shop's count-only instalments stay the
		// temptation the steady policy avoids (nothing now, payments later).
		for (const id of ['bnpl_trainers/bnpl', 'bnpl_offer/use', 'bnpl_pressure/split']) {
			const [cardId, choiceId] = id.split('/');
			const choice = cardById(cardId)?.choices.find((c) => c.id === choiceId);
			if (!choice) throw new Error(`temptation fixture moved: ${id}`);
			expect(reckless(choice), `${id} must stay flagged`).toBe(1);
		}
		// The card's Repayment — a real ◈15 today, the balance over six months —
		// is debt servicing, not temptation.
		const repayment = cardById('minimum_payment')?.choices.find((c) => c.id === 'minimum');
		if (!repayment) throw new Error('the Repayment fixture moved');
		expect(reckless(repayment), 'the Repayment must not be flagged').toBe(0);
		expect(steady.rank(cardById('minimum_payment') as Card)[0]).toBe('minimum');
		// Deck-wide: no other Choice's flagged state moves, so no other card's
		// steady order can — the order is the flags plus fixed fields.
		const before = (c: Choice) => (c.sets?.bnpl || c.sets?.overdraft ? 1 : 0);
		for (const card of CARDS)
			for (const choice of card.choices) {
				if (card.id === 'minimum_payment' && choice.id === 'minimum') continue;
				expect(reckless(choice), `${card.id}/${choice.id}: flagged state`).toBe(before(choice));
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

	it('sees consequences return: the median Run sees two or more Threads back', () => {
		for (const policy of POLICIES) {
			const runs = measured[policy.id];
			const atLeastTwo = runs.filter((run) => run.threads.resolved >= 2).length;
			const resolved = runs.map((run) => run.threads.resolved).sort((a, b) => a - b);
			const recorded = RECORDED[policy.id].consequences;
			const message = `${policy.id}: runs with two consequences back ${atLeastTwo}/100 — ${deckNote()}`;
			expect(atLeastTwo, message).toBeGreaterThanOrEqual(recorded - DRIFT.bands);
			expect(atLeastTwo, message).toBeLessThanOrEqual(recorded + DRIFT.bands);
			// The ticket's rule, stated on the sample: a typical Run sees at
			// least two consequences return (median), and the sample is not
			// empty of returns.
			expect(
				resolved[Math.floor(resolved.length / 2)],
				`${policy.id}: median consequences returned — ${deckNote()}`
			).toBeGreaterThanOrEqual(2);
			expect(atLeastTwo, message).toBeGreaterThan(0);
		}
	});
});
