import { describe, expect, it } from 'vitest';
import { applyAction, createRun, runActions } from './loop';
import type { RunState } from './types';
import { netWorth, savedTowardGoal, spendable } from './economy';

/** A fresh Run, with the loop driven to a known Stage. */
function atStage(stage: number): RunState {
	return applyAction(createRun(), { type: 'JUMP_STAGE', stage });
}

describe('a new Run', () => {
	it('starts at 14 with ◈60 and nothing else', () => {
		const s = createRun();
		expect(s.month).toBe(1);
		expect(s.stage).toBe(1);
		expect(s.age).toBe(14);
		expect(s.cash).toBe(60);
		expect(s.savings).toBe(0);
		expect(s.debt).toBe(0);
		expect(s.score).toBeNull();
		expect(s.phase).toBe('plan');
		expect(netWorth(s)).toBe(60);
	});
});

describe('the Plan step', () => {
	it('lands income into the envelopes and deals the month’s card', () => {
		const s = runActions(
			createRun(),
			{ type: 'SET_HOURS', hours: 0 },
			{ type: 'SET_WANT', amount: 40 },
			{ type: 'CONFIRM_PLAN' }
		);
		expect(s.income).toBe(40); // allowance, no hours worked
		expect(s.pots).toEqual({ need: 0, want: 40, save: 0 });
		expect(s.cash).toBe(60); // 60 + 40 income − 40 allocated
		expect(s.phase).toBe('event');
		expect(s.card).not.toBeNull();
	});

	it('never lets the plan exceed expected income', () => {
		const s = runActions(
			createRun(),
			{ type: 'SET_WANT', amount: 500 },
			{ type: 'SET_NEED', amount: 500 }
		);
		expect(s.need + s.want).toBeLessThanOrEqual(40);
		expect(s.saveAlloc).toBe(0);
	});
});

describe('the cascade', () => {
	function spendBeyondWant() {
		return runActions(
			atStage(2),
			{ type: 'SET_WANT', amount: 0 },
			{ type: 'SET_NEED', amount: 20 },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'buy' } // ◈25 against an empty Want pot
		);
	}

	it('draws from the Save envelope first, then Debt', () => {
		const s = spendBeyondWant();
		expect(s.pots.save).toBe(0); // ◈20 of the Save envelope consumed
		expect(s.debt).toBe(5); // the remaining ◈5 becomes Debt
		expect(s.cascade).toEqual({ fromPot: 0, fromSave: 20, toDebt: 5 });
	});

	it('records the month as over-budget', () => {
		const s = runActions(spendBeyondWant(), { type: 'CONTINUE' });
		expect(s.close?.spentWant).toBe(25);
		expect(s.close?.adherence.want).toBe(false);
		expect(s.close?.adherence.need).toBe(true);
	});
});

describe('time is hard', () => {
	it('refuses a Choice the player has no hours for', () => {
		const planned = runActions(
			atStage(3),
			{ type: 'FORCE_CARD', id: 'extra_shift' },
			{ type: 'SET_HOURS', hours: 80 }, // every free hour worked
			{ type: 'CONFIRM_PLAN' }
		);
		expect(planned.freeTime).toBe(0);

		const s = applyAction(planned, { type: 'CHOOSE', choiceId: 'take' });
		expect(s.chosen).toBeNull();
		expect(s.freeTime).toBe(0);
		expect(s.cash).toBe(planned.cash);
	});
});

describe('the month close', () => {
	it('settles the Save envelope into savings and credits interest', () => {
		const s = runActions(
			createRun(),
			{ type: 'SET_HOURS', hours: 0 },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' }
		);
		expect(s.phase).toBe('resolve');
		expect(s.pots.save).toBe(0);
		expect(s.savings).toBeCloseTo(40.1, 6); // ◈40 saved + 0.25% interest
		expect(s.close?.interest).toBeCloseTo(0.1, 6);
		expect(s.close?.obligations).toBe(0); // Stage 1 has none
		expect(netWorth(s)).toBeCloseTo(100.1, 6);
		// The month's real movement: ◈40 earned + ◈0.10 interest.
		expect(s.close?.monthChange).toBeCloseTo(40.1, 6);
	});

	it('cascades an unpayable Obligation through savings into Debt', () => {
		const s = runActions(
			atStage(4), // ◈180 of obligations, no income if no hours are worked
			{ type: 'FORCE_CARD', id: 'bnpl_trainers' },
			{ type: 'SET_HOURS', hours: 0 },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' }
		);
		expect(s.close?.obligations).toBe(180);
		expect(s.close?.obligationCascade).toEqual({ fromCash: 60, fromSavings: 0, toDebt: 120 });
		expect(s.debt).toBe(120);
	});
});

describe('BNPL', () => {
	it('takes four instalments and decrements one per month', () => {
		const s = runActions(
			atStage(4),
			{ type: 'FORCE_CARD', id: 'bnpl_trainers' },
			{ type: 'SET_HOURS', hours: 35 },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'bnpl' },
			{ type: 'CONTINUE' }
		);
		expect(s.bnpl).toEqual({ amount: 30, monthsLeft: 3 });
		expect(s.close?.bnpl?.fromSavings).toBe(30);
		expect(s.savings).toBeCloseTo(200.5, 6); // 350 saved − 180 obligations − 30 instalment + interest
		expect(s.debt).toBe(0);
	});

	it('clears itself when the last instalment is paid', () => {
		let s = runActions(
			atStage(4),
			{ type: 'FORCE_CARD', id: 'bnpl_trainers' },
			{ type: 'SET_HOURS', hours: 35 },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'bnpl' },
			{ type: 'CONTINUE' }
		);
		for (let i = 0; i < 3; i++) {
			s = runActions(
				s,
				{ type: 'NEXT_MONTH' },
				{ type: 'SET_HOURS', hours: 35 },
				// Force a card whose zero-cost choice is always available — the demo deck's
				// rotation can deal one that has no `skip`.
				{ type: 'FORCE_CARD', id: 'birthday_gift' },
				{ type: 'CONFIRM_PLAN' },
				{ type: 'CHOOSE', choiceId: 'skip' },
				{ type: 'CONTINUE' }
			);
		}
		expect(s.bnpl).toBeNull();
	});
});

describe('the Fork', () => {
	it('puts the student loan on the balance sheet and switches the economy', () => {
		const planned = runActions(
			atStage(5),
			{ type: 'FORCE_CARD', id: 'the_fork' },
			{ type: 'CONFIRM_PLAN' }
		);
		expect(planned.obligations).toBe(1150); // the default Work profile

		const s = applyAction(planned, { type: 'CHOOSE', choiceId: 'study' });
		expect(s.path).toBe('study');
		expect(s.debt).toBe(3000);
		expect(s.obligations).toBe(750);
		expect(s.freeTimeMax).toBe(55);
	});
});

describe('repeating a plan', () => {
	it('carries last month’s allocation into this month', () => {
		const first = runActions(
			createRun(),
			{ type: 'SET_HOURS', hours: 6 },
			{ type: 'SET_NEED', amount: 10 },
			{ type: 'SET_WANT', amount: 20 },
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' },
			{ type: 'NEXT_MONTH' }
		);
		expect(first.lastPlan).toEqual({ hours: 6, need: 10, want: 20 });
		expect(first.need).toBe(0); // a new month starts unplanned

		const repeated = applyAction(first, { type: 'REPEAT_PLAN' });
		expect(repeated.hours).toBe(6);
		expect(repeated.need).toBe(10);
		expect(repeated.want).toBe(20);
	});
});

describe('the HUD figures', () => {
	it('keeps the Save envelope out of spendable cash but inside the goal', () => {
		const s = runActions(
			createRun(),
			{ type: 'SET_HOURS', hours: 0 },
			{ type: 'SET_WANT', amount: 20 },
			{ type: 'CONFIRM_PLAN' }
		);
		// ◈40 income: ◈20 to Want, ◈20 earmarked for Save.
		expect(spendable(s)).toBe(80); // ◈60 held + ◈20 Want
		expect(savedTowardGoal(s)).toBe(20); // the earmark already counts toward the goal
		expect(netWorth(s)).toBe(100); // ◈60 + ◈20 + ◈20
	});
});

describe('the intro', () => {
	it('shows on a new Run and stays dismissed once the player has read it', () => {
		const fresh = createRun();
		expect(fresh.showIntro).toBe(true);

		const dismissed = applyAction(fresh, { type: 'DISMISS_INTRO' });
		expect(dismissed.showIntro).toBe(false);

		// Reading it must not be undone by starting the month.
		const started = applyAction(dismissed, { type: 'CONFIRM_PLAN' });
		expect(started.showIntro).toBe(false);
	});
});

describe('the Run', () => {
	it('advances a month at a time and changes Stage at the year boundary', () => {
		let s = createRun();
		s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(2);
		expect(s.phase).toBe('plan');

		for (let i = 0; i < 11; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(13);
		expect(s.stage).toBe(2);
		expect(s.age).toBe(15);
	});

	it('ends after 60 months', () => {
		let s = createRun();
		for (let i = 0; i < 60; i++) s = applyAction(s, { type: 'NEXT_MONTH' });
		expect(s.month).toBe(61);
		expect(s.phase).toBe('done');
	});
});
