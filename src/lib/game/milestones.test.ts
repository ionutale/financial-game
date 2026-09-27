import { describe, expect, it } from 'vitest';
import { GOAL_TARGET, STUDY_BUFFER } from './economy';
import { createRun, runActions } from './loop';
import {
	MILESTONE_IDS,
	earnedMilestones,
	longestInsideBudgetMonths,
	milestonesForYear,
	milestonesNewThisMonth,
	type MilestoneId
} from './milestones';
import type { MonthSnapshot, RunState } from './types';

/** A month row with only the fields a fixture cares about set. */
function row(month: number, patch: Partial<MonthSnapshot> = {}): MonthSnapshot {
	return {
		month,
		netWorth: 0,
		savings: 0,
		debt: 0,
		income: 0,
		saved: 0,
		spentNeed: 0,
		spentWant: 0,
		interest: 0,
		insideBudget: false,
		...patch
	};
}

function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

const idsOf = (run: RunState): MilestoneId[] => earnedMilestones(run).map((m) => m.id);

/** `length` consecutive months inside budget, starting at `from`. */
function inside(from: number, length: number): MonthSnapshot[] {
	return Array.from({ length }, (_, i) => row(from + i, { insideBudget: true }));
}

/**
 * A Run that lived every signal the twelve Milestones derive from: a first
 * clean month, a quarter, a half-year, Save, interest, the goal, debt cleared,
 * the spine beats and the Fork.
 */
function fullRun(): RunState {
	return withState({
		path: 'work',
		log: [
			{ month: 25, card: 'first_payslip', choice: 'measured' },
			{ month: 49, card: 'the_fork', choice: 'work' },
			{ month: 50, card: 'first_taxed_payslip', choice: 'read' },
			{ month: 53, card: 'scam_opportunity', choice: 'check' },
			{ month: 55, card: 'the_crash', choice: 'hold' }
		],
		flags: [{ month: 49, kind: 'fork:work' }],
		history: [
			row(1, { insideBudget: true, saved: 40, netWorth: 100 }),
			row(2, { insideBudget: true }),
			row(3, { insideBudget: true }),
			row(4, { interest: 0.1, debt: 300 }),
			row(5, { insideBudget: true, debt: 300 }),
			row(6, { insideBudget: true, debt: 300 }),
			row(7, { insideBudget: true, debt: 300 }),
			row(8, { insideBudget: true, debt: 300 }),
			row(9, { insideBudget: true, debt: 300 }),
			row(10, { insideBudget: true, debt: 0, savings: GOAL_TARGET })
		]
	});
}

describe('the Milestone catalogue', () => {
	it('carries the twelve v1 ids', () => {
		expect(MILESTONE_IDS).toHaveLength(12);
	});

	it('earns nothing from a fresh Run', () => {
		expect(earnedMilestones(createRun())).toEqual([]);
	});

	it('earns every id once, in the month its condition first holds', () => {
		expect(earnedMilestones(fullRun())).toEqual([
			{ id: 'first_budget_month', month: 1 },
			{ id: 'first_saved', month: 1 },
			{ id: 'quarter_inside_budget', month: 3 },
			{ id: 'first_interest', month: 4 },
			{ id: 'half_year_inside_budget', month: 10 },
			{ id: 'goal_reached', month: 10 },
			{ id: 'debt_cleared', month: 10 },
			{ id: 'first_pay', month: 25 },
			{ id: 'fork_chosen', month: 49 },
			{ id: 'payslip_read', month: 50 },
			{ id: 'not_fooled', month: 53 },
			{ id: 'weathered_the_crash', month: 55 }
		]);
	});

	it('never reports the deferred ids', () => {
		const ids = idsOf(fullRun()) as string[];
		expect(ids).not.toContain('survived_a_shortfall');
		expect(ids).not.toContain('insured_and_claimed');
	});
});

/** One fixture per id, exercising the month its predicate first holds. */
const FIRING: Array<{ id: MilestoneId; month: number; run: RunState }> = [
	{
		id: 'first_budget_month',
		month: 2,
		run: withState({ history: [row(1), row(2, { insideBudget: true })] })
	},
	{
		id: 'quarter_inside_budget',
		month: 6,
		run: withState({
			history: [row(1, { insideBudget: true }), row(2, { insideBudget: true }), row(3), ...inside(4, 3)]
		})
	},
	{
		id: 'half_year_inside_budget',
		month: 12,
		run: withState({ history: [...inside(1, 5), row(6), ...inside(7, 6)] })
	},
	{
		id: 'first_saved',
		month: 2,
		run: withState({ history: [row(1), row(2, { saved: 10 })] })
	},
	{
		id: 'first_interest',
		month: 2,
		run: withState({ history: [row(1), row(2, { interest: 0.1 })] })
	},
	{
		id: 'goal_reached',
		month: 2,
		run: withState({ history: [row(1, { savings: GOAL_TARGET - 1 }), row(2, { savings: GOAL_TARGET })] })
	},
	{
		id: 'debt_cleared',
		month: 3,
		run: withState({ history: [row(1, { debt: 100 }), row(2, { debt: 50 }), row(3)] })
	},
	{
		id: 'first_pay',
		month: 25,
		run: withState({ log: [{ month: 25, card: 'first_payslip', choice: 'measured' }] })
	},
	{
		id: 'payslip_read',
		month: 50,
		run: withState({ log: [{ month: 50, card: 'first_taxed_payslip', choice: 'read' }] })
	},
	{
		id: 'not_fooled',
		month: 53,
		run: withState({ log: [{ month: 53, card: 'scam_opportunity', choice: 'block' }] })
	},
	{
		id: 'weathered_the_crash',
		month: 55,
		run: withState({ log: [{ month: 55, card: 'the_crash', choice: 'hold' }] })
	},
	{
		id: 'fork_chosen',
		month: 49,
		run: withState({ flags: [{ month: 49, kind: 'fork:work' }] })
	}
];

describe('each id fires exactly once', () => {
	for (const { id, month, run } of FIRING) {
		it(`${id} in month ${month}`, () => {
			expect(earnedMilestones(run).filter((m) => m.id === id)).toEqual([{ id, month }]);
		});
	}
});

describe('the conditions a Choice can withhold', () => {
	it('does not recognise sending money to the scam', () => {
		const run = withState({ log: [{ month: 53, card: 'scam_opportunity', choice: 'in' }] });
		expect(idsOf(run)).not.toContain('not_fooled');
	});

	it('does not recognise selling the crash', () => {
		const run = withState({ log: [{ month: 55, card: 'the_crash', choice: 'sell' }] });
		expect(idsOf(run)).not.toContain('weathered_the_crash');
	});

	it('recognises buying into the crash as well as holding it', () => {
		const run = withState({ log: [{ month: 55, card: 'the_crash', choice: 'buy' }] });
		expect(idsOf(run)).toContain('weathered_the_crash');
	});

	it('does not recognise ignoring the taxed payslip', () => {
		const run = withState({ log: [{ month: 50, card: 'first_taxed_payslip', choice: 'ignore' }] });
		expect(idsOf(run)).not.toContain('payslip_read');
	});

	it('does not read the Fork from the path alone', () => {
		const run = withState({ path: 'study' });
		expect(idsOf(run)).not.toContain('fork_chosen');
	});

	it('recognises the Study side of the Fork too', () => {
		const run = withState({ flags: [{ month: 49, kind: 'fork:study' }] });
		expect(idsOf(run)).toContain('fork_chosen');
	});

	it('does not fire the goal below the work target', () => {
		const run = withState({ history: [row(1, { savings: GOAL_TARGET - 1 })] });
		expect(idsOf(run)).not.toContain('goal_reached');
	});

	it('uses the Study path’s Buffer as the goal target', () => {
		const run = withState({
			path: 'study',
			history: [row(1, { savings: STUDY_BUFFER - 1 }), row(2, { savings: STUDY_BUFFER })]
		});
		expect(earnedMilestones(run).filter((m) => m.id === 'goal_reached')).toEqual([
			{ id: 'goal_reached', month: 2 }
		]);
	});
});

describe('the consecutive-month conditions', () => {
	it('needs three months in a row, not three clean months', () => {
		const run = withState({
			history: [row(1, { insideBudget: true }), row(2, { insideBudget: true }), row(3), ...inside(4, 2)]
		});
		expect(idsOf(run)).not.toContain('quarter_inside_budget');
	});

	it('breaks a run when the record skips a month', () => {
		const run = withState({
			history: [row(1, { insideBudget: true }), row(2, { insideBudget: true }), row(4, { insideBudget: true })]
		});
		expect(idsOf(run)).not.toContain('quarter_inside_budget');
	});

	it('does not clear debt that was never owed', () => {
		const run = withState({ history: [row(1), row(2)] });
		expect(idsOf(run)).not.toContain('debt_cleared');
	});

	it('does not clear debt that has not gone', () => {
		const run = withState({ history: [row(1, { debt: 100 }), row(2, { debt: 50 })] });
		expect(idsOf(run)).not.toContain('debt_cleared');
	});
});

describe('empty, short and legacy records', () => {
	it('earns nothing and throws nothing on a record missing its history, log and flags', () => {
		const bare = withState({
			history: undefined as unknown as RunState['history'],
			log: undefined as unknown as RunState['log'],
			flags: undefined as unknown as RunState['flags']
		});
		expect(() => earnedMilestones(bare)).not.toThrow();
		expect(earnedMilestones(bare)).toEqual([]);
		expect(milestonesNewThisMonth(bare)).toEqual([]);
		expect(milestonesForYear(bare, 1)).toEqual([]);
		expect(longestInsideBudgetMonths(bare)).toBe(0);
	});

	it('derives from the history alone when the log and flags are missing', () => {
		const run = withState({
			history: [row(1, { insideBudget: true })],
			log: undefined as unknown as RunState['log'],
			flags: undefined as unknown as RunState['flags']
		});
		expect(idsOf(run)).toEqual(['first_budget_month']);
	});

	it('ignores log entries whose card is not in the current deck', () => {
		const run = withState({ log: [{ month: 5, card: 'not_a_card_any_more', choice: 'x' }] });
		expect(earnedMilestones(run)).toEqual([]);
	});

	it('reads an out-of-order history by month', () => {
		const run = withState({
			history: [row(3, { insideBudget: true }), row(1, { insideBudget: true }), row(2, { insideBudget: true })]
		});
		expect(earnedMilestones(run).find((m) => m.id === 'first_budget_month')).toEqual({
			id: 'first_budget_month',
			month: 1
		});
		expect(earnedMilestones(run).find((m) => m.id === 'quarter_inside_budget')).toEqual({
			id: 'quarter_inside_budget',
			month: 3
		});
	});
});

describe('the Month Close line', () => {
	it('reports the ids whose first-true month is the latest closed month', () => {
		const run = withState({ month: 3, history: inside(1, 3) });
		expect(milestonesNewThisMonth(run)).toEqual(['quarter_inside_budget']);
	});

	it('lists several in one month in catalogue order', () => {
		const run = withState({ month: 2, history: [row(1), row(2, { insideBudget: true, saved: 10 })] });
		expect(milestonesNewThisMonth(run)).toEqual(['first_budget_month', 'first_saved']);
	});

	it('never repeats a Milestone in a later month', () => {
		const run = withState({ month: 7, history: inside(1, 7) });
		expect(milestonesNewThisMonth(run)).toEqual([]);
	});

	it('does not retro-announce a month that has already passed', () => {
		const run = withState({
			month: 5,
			history: [row(1), row(2, { saved: 10 }), row(3), row(4), row(5)]
		});
		expect(milestonesNewThisMonth(run)).toEqual([]);
	});

	it('derives the latest closed month from the history, not from run.month', () => {
		const run = withState({ month: 40, history: inside(1, 3) });
		expect(milestonesNewThisMonth(run)).toEqual(['quarter_inside_budget']);
	});

	it('announces nothing when no month has closed', () => {
		const run = withState({
			month: 1,
			log: [{ month: 25, card: 'first_payslip', choice: 'measured' }]
		});
		expect(milestonesNewThisMonth(run)).toEqual([]);
	});

	it('announces a log-carried Milestone in the month it was played', () => {
		const run = withState({
			month: 25,
			history: [row(24), row(25)],
			log: [{ month: 25, card: 'first_payslip', choice: 'measured' }]
		});
		expect(milestonesNewThisMonth(run)).toEqual(['first_pay']);
	});
});

describe('the year slicing', () => {
	it('groups by the same year windows as the metrics', () => {
		const run = withState({ history: [row(1, { insideBudget: true }), row(13, { saved: 10 })] });
		expect(milestonesForYear(run, 1)).toEqual(['first_budget_month']);
		expect(milestonesForYear(run, 2)).toEqual(['first_saved']);
		expect(milestonesForYear(run, 3)).toEqual([]);
	});

	it('puts month 12 in year one and month 13 in year two', () => {
		const run = withState({ history: [row(12, { insideBudget: true }), row(13, { interest: 0.1 })] });
		expect(milestonesForYear(run, 1)).toEqual(['first_budget_month']);
		expect(milestonesForYear(run, 2)).toEqual(['first_interest']);
	});
});

describe('the longest inside-budget run', () => {
	it('is zero with no record and with no clean month', () => {
		expect(longestInsideBudgetMonths(createRun())).toBe(0);
		expect(longestInsideBudgetMonths(withState({ history: [row(1), row(2)] }))).toBe(0);
	});

	it('measures the longest consecutive run', () => {
		const run = withState({
			history: [...inside(1, 2), row(3), ...inside(4, 4), row(8)]
		});
		expect(longestInsideBudgetMonths(run)).toBe(4);
	});

	it('does not join a gap in the record', () => {
		const run = withState({ history: [row(1, { insideBudget: true }), row(3, { insideBudget: true })] });
		expect(longestInsideBudgetMonths(run)).toBe(1);
	});
});

describe('a Run the reducer actually lived', () => {
	it('recognises the first clean, saving month from the real record', () => {
		const run = runActions(
			createRun(),
			{ type: 'FORCE_CARD', id: 'birthday_gift' },
			{ type: 'CONFIRM_PLAN' },
			{ type: 'CHOOSE', choiceId: 'skip' },
			{ type: 'CONTINUE' }
		);
		// Month 1 closes inside both envelopes, funds Save, and credits interest on it.
		expect(milestonesNewThisMonth(run)).toEqual([
			'first_budget_month',
			'first_saved',
			'first_interest'
		]);
	});
});

describe('Milestones grant nothing', () => {
	it('leaves the Run untouched', () => {
		const run = fullRun();
		const before = structuredClone(run);
		earnedMilestones(run);
		milestonesNewThisMonth(run);
		milestonesForYear(run, 2);
		longestInsideBudgetMonths(run);
		expect(run).toStrictEqual(before);
	});
});
