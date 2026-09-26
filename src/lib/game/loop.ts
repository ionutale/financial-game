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
import { THREADS, threadDue } from './threads';
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
 * The `requires` vocabulary (ticket 03): named conditions a card can demand of
 * the Run before it is drawable. Unknown conditions are never satisfied.
 */
export function requiresSatisfied(s: RunState, requires?: string[]): boolean {
	for (const condition of requires ?? []) {
		if (condition === 'credit_card_open') {
			if (s.score === null) return false;
		} else if (condition === 'bnpl_active') {
			if (!s.bnpl) return false;
		} else if (condition === 'has_debt') {
			if (s.debt <= 0) return false;
		} else if (condition === 'insured') {
			if (!s.insurance) return false;
		} else if (condition.startsWith('thread:')) {
			if (s.thread?.id !== condition.slice(7)) return false;
		} else {
			return false;
		}
	}
	return true;
}

/** A Thread that could not fall due before month 60 is never planted. */
function plantsBeyondRun(s: RunState, card: Card): boolean {
	return card.choices.some((choice) => {
		const id = choice.sets?.thread;
		return id !== undefined && s.month + THREADS[id].months > RUN_MONTHS;
	});
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
	const liveThread = s.thread?.id ?? null;
	let pool = CARDS.filter(
		(c) =>
			c.stages.includes(s.stage) &&
			(c.weight ?? 1) > 0 &&
			!seen.has(c.id) &&
			(c.branch === undefined || c.branch === 'shared' || c.branch === s.path) &&
			requiresSatisfied(s, c.requires) &&
			// A resolve card waits for its own Thread; a plant waits for a free slot.
			(!c.resolves || c.resolves === liveThread) &&
			(!liveThread || !c.choices.some((ch) => ch.sets?.thread)) &&
			!plantsBeyondRun(s, c)
	);

	// A long Stage can exhaust its pool; repeating beats stalling.
	if (pool.length === 0) {
		pool = CARDS.filter((c) => c.stages.includes(s.stage) && (c.weight ?? 1) > 0);
	}
	if (pool.length === 0) return null;

	// A planted Thread cannot dangle: once due, its resolve card is dealt.
	const due = s.thread;
	if (due && s.month >= threadDue(due)) {
		const resolve = pool.find((c) => c.resolves === due.id);
		if (resolve) return resolve;
		// Impossible with a healthy deck (see threads.test.ts); drop rather than stall.
		s.thread = null;
	}

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
		workHintDone: false,
		seed,
		flags: [],
		thread: null,
		history: []
	};
}

/** Open a month: obligations and Free Time refreshed, plan and card cleared. */
export function startMonth(s: RunState): RunState {
	const st = stageOf(s);
	s.netWorthAtStart = netWorth(s);

	// The card is issued when the Run reaches Stage 5 (ticket 02: BNPL builds no
	// score, the card does). Nothing moves until then.
	if (s.stage === 5 && s.score === null) {
		s.score = 600;
		s.flags.push({ month: s.month, kind: 'card_issued' });
	}

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
	const savedThisMonth = s.pots.save;
	s.cash += s.pots.need + s.pots.want;
	s.pots.need = 0;
	s.pots.want = 0;
	s.savings += savedThisMonth;
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

	const adherence = { need: s.spent.need <= s.need, want: s.spent.want <= s.want };

	// The Credit Score moves on this month's behaviour (ticket 01, simplified:
	// utilisation needs a card balance the model does not carry yet).
	if (s.score !== null) {
		const kinds = s.flags.filter((f) => f.month === s.month).map((f) => f.kind);
		if (kinds.includes('overdraft')) s.score -= 40;
		else if (kinds.includes('minimum_payment')) s.score -= 5;
		else s.score += 8;
		s.score = Math.max(300, Math.min(850, s.score));
	}

	// The Money Story's raw material (ticket 05).
	s.history.push({
		month: s.month,
		netWorth: netWorth(s),
		savings: s.savings + s.fund,
		debt: s.debt,
		income: s.income,
		saved: savedThisMonth,
		spentNeed: s.spent.need,
		spentWant: s.spent.want,
		interest,
		insideBudget: adherence.need && adherence.want
	});

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
		adherence,
		nextObligations: obligationsFor(s)
	};
	return s;
}

export function applyAction(state: RunState, action: Action): RunState {
	const s = clone(state);

	switch (action.type) {
		case 'SET_HOURS': {
			s.hours = Math.max(0, Math.min(action.hours, s.freeTimeMax));
			// The Stage-3 hint has done its job once hours have been set (ticket 17).
			if (s.hours > 0) s.workHintDone = true;
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

			// Threads (tickets 03): a Choice can plant one; a resolve card ends it.
			if (choice.sets?.thread && !s.thread) {
				s.thread = { id: choice.sets.thread, since: s.month };
			}
			if (s.card.resolves && s.thread?.id === s.card.resolves) s.thread = null;

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

		case 'NEW_RUN':
			return startMonth(createRun(action.seed));

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
