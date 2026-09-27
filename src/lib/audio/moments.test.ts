import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from '$lib/game/loop';
import type { Action, RunState } from '$lib/game/types';
import { cueFor } from './moments';

/**
 * Which cue a dispatch earns (fun-pass ticket 04). The mapping is the Month
 * Screen's: computed from the two RunStates the reducer returns, so the cues
 * ride the same gestures as the screen and never carry meaning of their own.
 * All sound is off by default and never load-bearing; these tests pin the
 * mapping, not the audio.
 */

/** Apply one action and report the cue the dispatch earns. */
function cueOf(state: RunState, action: Action): ReturnType<typeof cueFor> {
	return cueFor(state, applyAction(state, action), action);
}

describe('the cue mapping (fun-pass ticket 04)', () => {
	it('deals: a month’s card arriving earns the deal cue', () => {
		const plan = applyAction(createRun(), { type: 'FORCE_CARD', id: 'odd_job' });
		expect(cueOf(plan, { type: 'CONFIRM_PLAN' })).toBe('deal');
	});

	it('keeps the crash’s own cue instead of the deal cue', () => {
		const plan = applyAction(createRun(), { type: 'FORCE_CARD', id: 'the_crash' });
		expect(cueOf(plan, { type: 'CONFIRM_PLAN' })).toBe('crash');
	});

	it('answers a Choice with the choice cue', () => {
		let s = applyAction(createRun(), { type: 'FORCE_CARD', id: 'odd_job' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(cueOf(s, { type: 'CHOOSE', choiceId: 'take' })).toBe('choice');
	});

	it('pays off a Thread that comes back with money', () => {
		// The friend loan returns ◈20: the one anticipation-then-closure device
		// the deck has, and a positive moment by construction.
		let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage: 3 });
		s = applyAction(s, { type: 'CHOOSE', choiceId: s.card!.choices[0].id });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'SET_HOURS', hours: 5 });
		s = applyAction(s, { type: 'FORCE_CARD', id: 'lend_to_friend' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'lend' });
		s = applyAction(s, { type: 'CONTINUE' });
		for (let i = 0; i < 3; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		s = applyAction(s, { type: 'FORCE_CARD', id: 'lend_returns' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(s.card?.id).toBe('lend_returns');
		expect(cueOf(s, { type: 'CHOOSE', choiceId: 'take' })).toBe('payoff');
	});

	it('leaves the cue to a Choice when the Thread’s ending is not a gain', () => {
		// The app vanishes: a scam the player survives. Positive-only, so the
		// resolution of a mistake is answered by the tap, not by a fanfare.
		let s = applyAction(createRun(), { type: 'JUMP_STAGE', stage: 5 });
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'study' });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'SET_HOURS', hours: 20 });
		s = applyAction(s, { type: 'FORCE_CARD', id: 'app_tip' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'in' });
		s = applyAction(s, { type: 'CONTINUE' });
		for (let i = 0; i < 2; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		s = applyAction(s, { type: 'FORCE_CARD', id: 'app_vanishes' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(s.card?.id).toBe('app_vanishes');
		expect(cueOf(s, { type: 'CHOOSE', choiceId: 'report' })).toBe('choice');
	});

	it('keeps the month close’s two shipped cues', () => {
		// Month 1 closes inside budget and earns Milestones: the rising note.
		let s = applyAction(createRun(), { type: 'FORCE_CARD', id: 'birthday_gift' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'skip' });
		expect(cueOf(s, { type: 'CONTINUE' })).toBe('milestone');
		s = applyAction(s, { type: 'CONTINUE' });

		// The next month earns nothing new: the close’s two quiet ticks.
		s = runActions(
			s,
			{ type: 'NEXT_MONTH' },
			{ type: 'REPEAT_PLAN' },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' }
		);
		expect(s.month).toBe(2);
		expect(cueOf(s, { type: 'CONTINUE' })).toBe('month_close');
	});

	it('keeps the Stage-up cue at the year’s turn', () => {
		let s = applyAction(createRun(), { type: 'FORCE_CARD', id: 'birthday_gift' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		s = applyAction(s, { type: 'CHOOSE', choiceId: 'skip' });
		s = applyAction(s, { type: 'CONTINUE' });
		s = { ...s, month: 12 };
		expect(cueOf(s, { type: 'NEXT_MONTH' })).toBe('stage_up');
	});

	it('stays silent for a dispatch that lands nothing, or a plain plan edit', () => {
		let s = applyAction(createRun(), { type: 'FORCE_CARD', id: 'odd_job' });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		expect(cueOf(s, { type: 'CHOOSE', choiceId: 'a_choice_the_deck_never_had' })).toBeNull();
		expect(cueOf(s, { type: 'SET_HOURS', hours: 3 })).toBeNull();
	});
});
