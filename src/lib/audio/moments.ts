/**
 * Which cue a dispatch earns (fun-pass ticket 04, design §3.3). The mapping
 * is derived from the two RunStates the reducer returns, so cues ride the
 * same gestures as the screen — queued inside a click, where the AudioContext
 * may be created — and never carry meaning of their own.
 *
 * The two new cues: `deal` when a month's card arrives, `payoff` when a
 * Thread comes back with money. The payoff is positive-only by construction:
 * the app vanishing is survived in silence, and the tap's own cue answers it.
 */

import { milestonesNewThisMonth } from '$lib/game/milestones';
import type { Action, RunState } from '$lib/game/types';
import type { SfxCue } from './sfx';

/**
 * The cue this action earns, or null when the dispatch lands nothing, edits a
 * plan, or answers a moment the bank has no sound for.
 */
export function cueFor(before: RunState, after: RunState, action: Action): SfxCue | null {
	switch (action.type) {
		case 'CHOOSE':
			// A dispatch that landed nothing (an unknown choice, a refused
			// hour cost) is silent; otherwise the tap is answered, and a
			// Thread that comes back with money answers with the payoff.
			if (after.chosen === before.chosen) return null;
			return threadPaysOff(before, action) ? 'payoff' : 'choice';

		case 'CONTINUE':
			// The close's Milestone note replaces its two ticks (ticket 06).
			if (after.phase !== 'resolve') return null;
			return milestonesNewThisMonth(after).length ? 'milestone' : 'month_close';

		case 'CONFIRM_PLAN':
			// A dealt card arrives — the crash keeps its own, bigger sound.
			if (!after.card) return null;
			return after.card.id === 'the_crash' ? 'crash' : 'deal';

		case 'NEXT_MONTH':
			return after.phase === 'stage_up' ? 'stage_up' : null;

		default:
			return null;
	}
}

/** Did this Choice end a live Thread with money coming back? */
function threadPaysOff(before: RunState, action: Extract<Action, { type: 'CHOOSE' }>): boolean {
	const card = before.card;
	if (!before.thread || !card?.resolves || card.resolves !== before.thread.id) return false;
	const choice = card.choices.find((c) => c.id === action.choiceId);
	return Boolean(choice?.gain);
}
