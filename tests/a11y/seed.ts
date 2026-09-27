import { applyAction, createRun } from '$lib/game/loop';
import type { Action, PathId, RunState } from '$lib/game/types';

/**
 * Deterministic month screens for the axe gate (ticket 24).
 *
 * `/` mints a fresh random seed on every load, so the only way to audit the
 * month screen reproducibly is to build a RunState with a fixed seed through
 * the game's own reducer and store it with the game's own write API
 * (`POST /api/run`). `helpers.seedRun` does the storing.
 */
export const GATE_SEED = 20260926;

export function seededRun(...actions: Action[]): RunState {
	return actions.reduce((state, action) => applyAction(state, action), createRun(GATE_SEED));
}

/** The month screen, phase by phase. */
export const PLAN_RUN = seededRun({ type: 'DISMISS_INTRO' });

export const EVENT_RUN = seededRun({ type: 'DISMISS_INTRO' }, { type: 'CONFIRM_PLAN' });

/** Take the first Choice that the UI would not disable — feedback showing. */
export const FEEDBACK_RUN = applyAction(EVENT_RUN, {
	type: 'CHOOSE',
	choiceId: availableChoice(EVENT_RUN).id
});

/**
 * The Feedback disclosure, both states (fun-pass ticket 02). The month-1 spine
 * beat carries the first authored Reaction, so the Feedback is a Reaction plus
 * a Why: open at the Concept's first encounter (`WHY_OPEN_RUN`), collapsed once
 * an earlier earning & work card sits in the log (`WHY_COLLAPSED_RUN`).
 */
export const WHY_OPEN_RUN: RunState = applyAction(EVENT_RUN, {
	type: 'CHOOSE',
	choiceId: 'spend'
});

export const WHY_COLLAPSED_RUN: RunState = {
	...WHY_OPEN_RUN,
	log: [{ month: 1, card: 'odd_job', choice: 'take' }, ...WHY_OPEN_RUN.log]
};

/**
 * Month 2's Plan step: a last plan exists, so Repeat is the primary action and
 * the sliders wait behind "Change the plan" (fun-pass ticket 02).
 */
export const REPEAT_PLAN_RUN: RunState = seededRun(
	{ type: 'DISMISS_INTRO' },
	{ type: 'SET_HOURS', hours: 0 },
	{ type: 'SET_NEED', amount: 10 },
	{ type: 'SET_WANT', amount: 20 },
	{ type: 'FORCE_CARD', id: 'birthday_gift' },
	{ type: 'CONFIRM_PLAN' },
	{ type: 'CHOOSE', choiceId: 'skip' },
	{ type: 'CONTINUE' },
	{ type: 'NEXT_MONTH' }
);

/**
 * A Run with one clean month behind it (gamification ticket 01): month 1
 * closes inside both envelopes, funds Save and credits interest, so the Month
 * Close carries its first Milestones and the Stats Sheet lists them.
 */
export const MILESTONE_RUN: RunState = seededRun(
	{ type: 'DISMISS_INTRO' },
	{ type: 'FORCE_CARD', id: 'birthday_gift' },
	{ type: 'CONFIRM_PLAN' },
	{ type: 'CHOOSE', choiceId: 'skip' },
	{ type: 'CONTINUE' }
);

/**
 * The receipt's conditional tail (fun-pass ticket 04): the same real close,
 * carrying a Debt line and a Fund row. Old saves can hold both fields (the
 * Fund has always existed; Debt is any cascade month), so the gate must see
 * the rows they render.
 */
export const CLOSE_DEBT_FUND_RUN: RunState = { ...MILESTONE_RUN, debt: 45, fund: 250 };

/**
 * A month whose Choice spends a planned envelope (fun-pass ticket 04): the
 * Ledger Line is computed live at the Month Screen edge, so the gate has to
 * take the Choice itself — one tap that moves ◈40 out of Want and nothing else.
 */
export const LEDGER_RUN: RunState = seededRun(
	{ type: 'DISMISS_INTRO' },
	{ type: 'SET_WANT', amount: 40 },
	{ type: 'FORCE_CARD', id: 'two_wants' },
	{ type: 'CONFIRM_PLAN' }
);

/**
 * A Run played to the Stage-5 Fork through the real reducer (gamification
 * ticket 02), resolving every Stage-up on the way (fun-pass ticket 02), so the
 * Fork carries the year 4→5 Year in Review with real months behind it. The
 * plan is deck.test.ts's playtest policy: work the wage years, allocate half
 * and a third.
 */
function playedToFork(seed: number): RunState {
	let state = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });
	for (let month = 1; month <= 48; month++) {
		// A Stage-up card opens its Stage before that month can be planned.
		if (state.phase === 'stage_up' && state.card) {
			state = applyAction(state, { type: 'CHOOSE', choiceId: availableChoice(state).id });
			state = applyAction(state, { type: 'CONTINUE' });
		}
		const hours = state.stage === 3 || state.stage === 4 ? 35 : 0;
		state = applyAction(state, { type: 'SET_HOURS', hours });
		state = applyAction(state, { type: 'SET_NEED', amount: Math.round(state.income * 0.5) });
		state = applyAction(state, { type: 'SET_WANT', amount: Math.round(state.income * 0.3) });
		state = applyAction(state, { type: 'CONFIRM_PLAN' });
		state = applyAction(state, { type: 'CHOOSE', choiceId: availableChoice(state).id });
		state = applyAction(state, { type: 'CONTINUE' });
		state = applyAction(state, { type: 'NEXT_MONTH' });
	}
	return state;
}

/** Stage 5 opens with the Fork's Stage-up card (ticket 18). */
export const STAGE_UP_RUN = playedToFork(GATE_SEED);

/**
 * Stage 2 opens with its own Stage-up (fun-pass ticket 02): month 13's
 * interstitial, carrying year 1 in review — the recap that never fired before.
 */
export const STAGE_2_UP_RUN: RunState = (() => {
	let state = applyAction(createRun(GATE_SEED), { type: 'DISMISS_INTRO' });
	for (let month = 1; month <= 12; month++) {
		state = applyAction(state, { type: 'SET_HOURS', hours: 0 });
		state = applyAction(state, { type: 'SET_NEED', amount: Math.round(state.income * 0.5) });
		state = applyAction(state, { type: 'SET_WANT', amount: Math.round(state.income * 0.3) });
		state = applyAction(state, { type: 'CONFIRM_PLAN' });
		state = applyAction(state, { type: 'CHOOSE', choiceId: availableChoice(state).id });
		state = applyAction(state, { type: 'CONTINUE' });
		state = applyAction(state, { type: 'NEXT_MONTH' });
	}
	return state;
})();

/**
 * A Run played to the last close through the real reducer (gamification ticket
 * 04), so the Money Story renders its additions over a record the game actually
 * wrote: closed months behind the milestones, the coverage and the year-5
 * review. Same policy as `playedToFork`, carried through all sixty months.
 *
 * The fixture stops at month 60's `resolve`: the gate finishes the Run with a
 * "Next" click (fun-pass ticket 03's chrome), because a done state posted to
 * `/api/run` is archived and frees the active slot — the Money Story is the
 * last client-side screen.
 *
 * `fork` resolves the Stage-5 Fork by hand (ticket 05 needs both paths lived);
 * without it, the policy takes the first affordable Choice, which is Study.
 */
function playedToTheLastClose(seed: number, fork?: PathId): RunState {
	let state = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });
	for (let month = 1; month <= 60; month++) {
		// A Stage-up card is resolved before its month can be planned (ticket 18).
		if (state.phase === 'stage_up' && state.card) {
			state = applyAction(state, { type: 'CHOOSE', choiceId: gateChoice(state, fork) });
			state = applyAction(state, { type: 'CONTINUE' });
		}
		const hours = state.stage === 3 || state.stage === 4 ? 35 : 0;
		state = applyAction(state, { type: 'SET_HOURS', hours });
		state = applyAction(state, { type: 'SET_NEED', amount: Math.round(state.income * 0.5) });
		state = applyAction(state, { type: 'SET_WANT', amount: Math.round(state.income * 0.3) });
		state = applyAction(state, { type: 'CONFIRM_PLAN' });
		state = applyAction(state, { type: 'CHOOSE', choiceId: gateChoice(state, fork) });
		state = applyAction(state, { type: 'CONTINUE' });
		// The sixtieth close is where the gate takes over, one click from the Story.
		if (month < 60) state = applyAction(state, { type: 'NEXT_MONTH' });
	}
	return state;
}

/** One "Next" from the Money Story: sixty closed months behind it. */
export const FINAL_MONTH_RUN = playedToTheLastClose(GATE_SEED);

/**
 * The same Run finished: phase `done`, month 61. Posted to `/api/run` it is
 * archived and freed, so the Journal renders it as a Chapter (ticket 05).
 */
export const DONE_STUDY_RUN: RunState = applyAction(FINAL_MONTH_RUN, { type: 'NEXT_MONTH' });

/**
 * A Work Run played through the same loop to its finish, so the Journal has a
 * second Chapter and the two paths have both been lived — the `both_paths`
 * recognition. A different seed keeps the archive's own dedup happy.
 */
export const DONE_WORK_RUN: RunState = applyAction(playedToTheLastClose(GATE_SEED + 1, 'work'), {
	type: 'NEXT_MONTH'
});

/**
 * The retrospective line's zero case: the same last close with no month inside
 * budget in the record, so the copy must read sensibly when the answer is
 * "none".
 */
export const NO_BUDGET_RUN: RunState = {
	...FINAL_MONTH_RUN,
	history: FINAL_MONTH_RUN.history.map((row) => ({ ...row, insideBudget: false }))
};

/** A run carrying state chips (the BNPL pill), so their contrast is gated. */
export const CHIP_RUN: RunState = { ...PLAN_RUN, bnpl: { amount: 30, monthsLeft: 2 } };

function availableChoice(state: RunState) {
	const choice = state.card?.choices.find(
		(c) => (c.freeTime ?? 0) >= 0 || Math.abs(c.freeTime ?? 0) <= state.freeTime
	);
	if (!choice) throw new Error('the gate seed dealt a card with no available choice');
	return choice;
}

/** The gate's Choice: the Fork by hand when asked, else the first affordable one. */
function gateChoice(state: RunState, fork?: PathId): string {
	if (fork && state.card?.id === 'the_fork') {
		const chosen = state.card.choices.find((choice) => choice.id === fork);
		if (chosen) return chosen.id;
	}
	return availableChoice(state).id;
}
