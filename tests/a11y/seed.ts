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

/** Stage 5 opens with the Fork's Stage-up card (ticket 18). */
export const STAGE_UP_RUN = seededRun(
	{ type: 'DISMISS_INTRO' },
	{ type: 'JUMP_STAGE', stage: 5 }
);

/** A run carrying state chips (the BNPL pill), so their contrast is gated. */
export const CHIP_RUN: RunState = { ...PLAN_RUN, bnpl: { amount: 30, monthsLeft: 2 } };

function availableChoice(state: RunState) {
	const choice = state.card?.choices.find(
		(c) => (c.freeTime ?? 0) >= 0 || Math.abs(c.freeTime ?? 0) <= state.freeTime
	);
	if (!choice) throw new Error('the gate seed dealt a card with no available choice');
	return choice;
}
