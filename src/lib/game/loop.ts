/**
 * The month loop, as a pure reducer. Ticket 04.
 * `(state, action) => state` — no DOM, no timers, no database.
 */

import { CARDS, cardById } from './cards';
import {
	INFLATION_MONTHLY,
	SAVINGS_MONTHLY,
	STUDENT_LOAN,
	expectedIncome,
	netWorth,
	obligationsFor,
	stageOf
} from './economy';
import { turnRng } from './rng';
import { spineCardId } from './spine';
import type { Action, Card, Category, DrawResult, PayResult, RunState } from './types';

export const RUN_MONTHS = 60;

function clone<T>(value: T): T {
	return structuredClone(value);
}

/** Draw a cost from a category's pot. Overflow comes from Save, then Debt. */
export function drawFromPot(s: RunState, category: Category, amount: number): DrawResult {
	const fromPot = Math.min(s.pots[category] ?? 0, amount);
	s.pots[category] -= fromPot;

	let rest = amount - fromPot;
	let fromSave = 0;
	let toDebt = 0;
	if (rest > 0) {
		fromSave = Math.min(s.pots.save, rest);
		s.pots.save -= fromSave;
		rest -= fromSave;
		toDebt = rest;
		s.debt += toDebt;
	}
	return { fromPot, fromSave, toDebt };
}

/** Pay from real money: cash, then savings, then debt. */
export function payFromCash(s: RunState, amount: number): PayResult {
	const fromCash = Math.min(s.cash, amount);
	s.cash -= fromCash;

	let rest = amount - fromCash;
	const fromSavings = Math.min(s.savings, rest);
	s.savings -= fromSavings;
	rest -= fromSavings;

	s.debt += rest;
	return { fromCash, fromSavings, toDebt: rest };
}

/** Cards already dealt this Run — a card plays at most once (ticket 03). */
function played(s: RunState): Set<string> {
	return new Set(s.log.map((entry) => entry.card));
}

/**
 * Which card this Turn deals.
 *
 * 1. The **spine** wins: fixed beats guarantee every Teachable Moment lands.
 * 2. Otherwise a **seeded weighted draw** from the Stage's pool, with concepts
 *    behind their quota of two boosted, so a Stage cannot skip a Concept.
 * 3. Weight 0 means spine-only; a card already played never returns.
 */
export function pickCard(s: RunState): Card | null {
	if (s.forcedCard) {
		const forced = cardById(s.forcedCard);
		s.forcedCard = null;
		return forced ?? null;
	}

	const seen = played(s);

	const spineId = spineCardId(s.month);
	if (spineId && !seen.has(spineId)) {
		const spine = cardById(spineId);
		if (spine) return spine;
	}

	const stageConcepts = new Set(stageOf(s).concepts);
	let pool = CARDS.filter(
		(c) =>
			c.stages.includes(s.stage) &&
			(c.weight ?? 1) > 0 &&
			!seen.has(c.id) &&
			(c.branch === undefined || c.branch === 'shared' || c.branch === s.path)
	);

	// A long Stage can exhaust its pool; repeating beats stalling.
	if (pool.length === 0) {
		pool = CARDS.filter((c) => c.stages.includes(s.stage) && (c.weight ?? 1) > 0);
	}
	if (pool.length === 0) return null;

	const counts = new Map<string, number>();
	for (const id of seen) {
		const concept = cardById(id)?.concept;
		if (concept) counts.set(concept, (counts.get(concept) ?? 0) + 1);
	}

	const weights = pool.map((c) => {
		const behind =
			c.concept && stageConcepts.has(c.concept) && (counts.get(c.concept) ?? 0) < 2;
		return (c.weight ?? 1) * (behind ? 3 : 1);
	});

	const random = turnRng(s.seed, s.month);
	const total = weights.reduce((sum, w) => sum + w, 0);
	let roll = random() * total;
	for (let i = 0; i < pool.length; i++) {
		roll -= weights[i];
		if (roll <= 0) return pool[i];
	}
	return pool[pool.length - 1];
}

export function createRun(seed = 1): RunState {
	return {
		month: 1,
		stage: 1,
		age: 14,
		path: null,

		cash: 60,
		pots: { need: 0, want: 0, save: 0 },
		savings: 0,
		fund: 0,
		debt: 0,
		score: null,

		freeTimeMax: 100,
		freeTime: 100,
		hours: 0,
		income: 0,

		need: 0,
		want: 0,
		saveAlloc: 0,
		spent: { need: 0, want: 0 },

		insurance: false,
		bnpl: null,
		obligations: 0,
		inflationIndex: 1,
		netWorthAtStart: 60,

		phase: 'plan',
		card: null,
		chosen: null,
		feedback: null,
		cascade: null,
		close: null,
		log: [],
		forcedCard: null,
		lastPlan: null,
		showIntro: true,
		seed,
		flags: []
	};
}

/** Open a month: obligations and Free Time refreshed, plan and card cleared. */
export function startMonth(s: RunState): RunState {
	const st = stageOf(s);
	s.netWorthAtStart = netWorth(s);
	s.obligations = obligationsFor(s);
	s.freeTimeMax = st.freeTime;
	s.freeTime = st.freeTime - s.hours;
	s.income = 0;
	s.need = 0;
	s.want = 0;
	s.saveAlloc = 0;
	s.spent = { need: 0, want: 0 };
	s.pots = { need: 0, want: 0, save: 0 };
	s.phase = 'plan';
	s.card = null;
	s.chosen = null;
	s.feedback = null;
	s.cascade = null;
	s.close = null;
	return s;
}

/** Resolve the month: envelopes settle, obligations pay, interest credits. */
export function closeMonth(s: RunState): RunState {
	const netWorthBefore = s.netWorthAtStart;

	// Unspent envelopes come back to cash; the Save envelope lands in savings.
	s.cash += s.pots.need + s.pots.want;
	s.pots.need = 0;
	s.pots.want = 0;
	s.savings += s.pots.save;
	s.pots.save = 0;

	const obligations = s.obligations;
	const obligationCascade = payFromCash(s, obligations);

	let bnpl: PayResult | null = null;
	if (s.bnpl && s.bnpl.monthsLeft > 0) {
		bnpl = payFromCash(s, s.bnpl.amount);
		s.bnpl.monthsLeft -= 1;
		if (s.bnpl.monthsLeft === 0) s.bnpl = null;
	}

	const interest = s.savings * SAVINGS_MONTHLY;
	s.savings += interest;

	// Prices drift up for next month.
	s.inflationIndex *= 1 + INFLATION_MONTHLY;

	s.close = {
		income: s.income,
		spentNeed: s.spent.need,
		spentWant: s.spent.want,
		obligations,
		obligationCascade,
		bnpl,
		interest,
		netWorthBefore,
		netWorthAfter: netWorth(s),
		monthChange: netWorth(s) - netWorthBefore,
		adherence: { need: s.spent.need <= s.need, want: s.spent.want <= s.want },
		nextObligations: obligationsFor(s)
	};
	return s;
}

export function applyAction(state: RunState, action: Action): RunState {
	const s = clone(state);

	switch (action.type) {
		case 'SET_HOURS': {
			s.hours = Math.max(0, Math.min(action.hours, s.freeTimeMax));
			s.freeTime = s.freeTimeMax - s.hours;
			s.income = expectedIncome(s);
			s.saveAlloc = Math.max(0, s.income - s.need - s.want);
			return s;
		}

		case 'SET_NEED': {
			const income = expectedIncome(s);
			s.need = Math.max(0, Math.min(action.amount, income - s.want));
			s.saveAlloc = Math.max(0, income - s.need - s.want);
			return s;
		}

		case 'SET_WANT': {
			const income = expectedIncome(s);
			s.want = Math.max(0, Math.min(action.amount, income - s.need));
			s.saveAlloc = Math.max(0, income - s.need - s.want);
			return s;
		}

		case 'REPEAT_PLAN': {
			if (!s.lastPlan) return s;
			s.hours = Math.max(0, Math.min(s.lastPlan.hours, s.freeTimeMax));
			s.freeTime = s.freeTimeMax - s.hours;
			s.income = expectedIncome(s);
			s.need = Math.max(0, Math.min(s.lastPlan.need, s.income));
			s.want = Math.max(0, Math.min(s.lastPlan.want, s.income - s.need));
			s.saveAlloc = Math.max(0, s.income - s.need - s.want);
			return s;
		}

		case 'CONFIRM_PLAN': {
			if (s.phase !== 'plan') return s;
			s.income = expectedIncome(s);
			s.saveAlloc = Math.max(0, s.income - s.need - s.want);

			// Remember the plan so next month can repeat it.
			s.lastPlan = { hours: s.hours, need: s.need, want: s.want };

			// Income lands, then the plan is moved into envelopes.
			s.cash += s.income;
			s.pots = { need: s.need, want: s.want, save: s.saveAlloc };
			s.cash -= s.pots.need + s.pots.want + s.pots.save;

			s.freeTime = s.freeTimeMax - s.hours;
			s.card = pickCard(s);
			s.phase = 'event';
			return s;
		}

		case 'CHOOSE': {
			if (s.phase !== 'event' || !s.card || s.chosen) return s;
			const choice = s.card.choices.find((c) => c.id === action.choiceId);
			if (!choice) return s;

			const hoursNeeded = Math.abs(choice.freeTime ?? 0);
			// Time is hard: money can be borrowed, hours cannot.
			if ((choice.freeTime ?? 0) < 0 && hoursNeeded > s.freeTime) return s;

			const insured = choice.insuredCost !== undefined && s.insurance;
			const cost = insured ? (choice.insuredCost as number) : (choice.cost ?? 0);

			if (choice.gain) s.cash += choice.gain;

			s.cascade = cost > 0 ? drawFromPot(s, choice.category ?? 'want', cost) : null;
			// Only Need and Want are "spending" for adherence; drawing on Save is the cascade.
			if (cost > 0 && (choice.category === 'need' || choice.category === 'want')) {
				s.spent[choice.category] += cost;
			}
			if (choice.freeTime) s.freeTime += choice.freeTime;

			if (choice.sets?.insurance) s.insurance = true;
			if (choice.sets?.bnpl) s.bnpl = { amount: 30, monthsLeft: choice.sets.bnpl };
			if (choice.sets?.overdraft) {
				// Ticket 01: borrowing without agreeing to it costs a fee.
				s.debt += 15;
				s.flags.push({ month: s.month, kind: 'overdraft' });
			}
			if (choice.sets?.minimumStreak) {
				s.flags.push({ month: s.month, kind: 'minimum_payment' });
			}
			if (choice.sets?.path) {
				s.path = choice.sets.path;
				s.freeTimeMax = stageOf(s).freeTime;
				s.obligations = obligationsFor(s);
				if (s.path === 'study') s.debt += STUDENT_LOAN;
				s.flags.push({ month: s.month, kind: `fork:${s.path}` });
			}

			s.chosen = choice.id;
			s.feedback = choice.feedback;
			s.log.push({ month: s.month, card: s.card.id, choice: choice.id });
			return s;
		}

		case 'CONTINUE': {
			if (s.phase !== 'event' || !s.chosen) return s;
			closeMonth(s);
			s.phase = 'resolve';
			return s;
		}

		case 'NEXT_MONTH': {
			s.month += 1;
			if (s.month > RUN_MONTHS) {
				s.phase = 'done';
				return s;
			}
			const year = Math.floor((s.month - 1) / 12) + 1;
			if (year !== s.stage) {
				s.stage = Math.min(5, year);
				s.age = stageOf({ stage: s.stage, path: null }).age;
			}
			return startMonth(s);
		}

		case 'JUMP_STAGE': {
			s.stage = Math.max(1, Math.min(5, action.stage));
			s.age = stageOf({ stage: s.stage, path: null }).age;
			s.month = (s.stage - 1) * 12 + 1;
			s.hours = 0;
			return startMonth(s);
		}

		case 'FORCE_CARD': {
			s.forcedCard = action.id;
			return s;
		}

		case 'DISMISS_INTRO': {
			s.showIntro = false;
			return s;
		}

		case 'RESET':
			return startMonth(createRun());

		default:
			return s;
	}
}

/** Convenience for driving the loop in tests and the shell. */
export function runActions(state: RunState, ...actions: Action[]): RunState {
	return actions.reduce((s, a) => applyAction(s, a), state);
}
