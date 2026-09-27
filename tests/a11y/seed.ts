import { applyAction, createRun } from '$lib/game/loop';
import type { Action, RunState } from '$lib/game/types';

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
 * A Run played to the Stage-5 Fork through the real reducer (gamification
 * ticket 02), so the Stage-up carries the year 4→5 Year in Review with real
 * months behind it. The plan is deck.test.ts's playtest policy: work the wage
 * years, allocate half and a third.
 */
function playedToFork(seed: number): RunState {
	let state = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });
	for (let month = 1; month <= 48; month++) {
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
 * A Run played to the last close through the real reducer (gamification ticket
 * 04), so the Money Story renders its additions over a record the game actually
 * wrote: closed months behind the milestones, the coverage and the year-5
 * review. Same policy as `playedToFork`, carried through all sixty months.
 *
 * The fixture stops at month 60's `resolve`: the gate finishes the Run with a
 * "Next month" click, because a done state posted to `/api/run` is archived
 * and frees the active slot — the Money Story is the last client-side screen.
 */
function playedToTheLastClose(seed: number): RunState {
	let state = applyAction(createRun(seed), { type: 'DISMISS_INTRO' });
	for (let month = 1; month <= 60; month++) {
		// A Stage-up card is resolved before its month can be planned (ticket 18).
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
		// The sixtieth close is where the gate takes over, one click from the Story.
		if (month < 60) state = applyAction(state, { type: 'NEXT_MONTH' });
	}
	return state;
}

/** One "Next month" from the Money Story: sixty closed months behind it. */
export const FINAL_MONTH_RUN = playedToTheLastClose(GATE_SEED);

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
