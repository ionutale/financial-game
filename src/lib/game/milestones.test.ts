import { describe, expect, it } from 'vitest';
import { GOAL_TARGET, STUDY_BUFFER } from './economy';
import { applyAction, createRun, runActions } from './loop';
import { computeMetrics } from './metrics';
import {
	MILESTONE_IDS,
	earnedMilestones,
	longestInsideBudgetMonths,
	milestonesForYear,
	milestonesNewThisMonth,
	stageUpReview,
	yearInReview,
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

/** Plays a Run taking the first affordable Choice every month, as `deck.test.ts` does. */
function play(state: RunState, months: number): RunState {
	let s = state;
	for (let i = 0; i < months; i++) {
		if (s.phase === 'stage_up' && s.card) {
			s = applyAction(s, { type: 'CHOOSE', choiceId: s.card.choices[0].id });
			s = applyAction(s, { type: 'CONTINUE' });
		}
		s = applyAction(s, { type: 'SET_HOURS', hours: 0 });
		s = applyAction(s, { type: 'CONFIRM_PLAN' });
		if (!s.card) break;
		const affordable = s.card.choices.find((c) => {
			const hours = c.freeTime ?? 0;
			return !(hours < 0 && Math.abs(hours) > s.freeTime);
		});
		s = applyAction(s, { type: 'CHOOSE', choiceId: (affordable ?? s.card.choices[0]).id });
		s = applyAction(s, { type: 'CONTINUE' });
		s = applyAction(s, { type: 'NEXT_MONTH' });
	}
	return s;
}

/**
 * A Run that lived every signal the fifteen Milestones derive from: a first
 * clean month, a quarter, a half-year, Save, interest, the goal, debt cleared,
 * the spine beats, the Fork, the Fund's open → crash → recovery, and the month
 * the money turned back up after three months down.
 */
function fullRun(): RunState {
	return withState({
		path: 'work',
		log: [
			{ month: 25, card: 'first_payslip', choice: 'measured' },
			{ month: 49, card: 'the_fork', choice: 'work' },
			{ month: 49, card: 'the_fund', choice: 'open' },
			{ month: 50, card: 'first_taxed_payslip', choice: 'read' },
			{ month: 53, card: 'scam_opportunity', choice: 'check' },
			{ month: 55, card: 'the_crash', choice: 'hold' }
		],
		flags: [{ month: 49, kind: 'fork:work' }],
		history: [
			row(1, { insideBudget: true, saved: 40, netWorth: 100 }),
			row(2, { insideBudget: true, netWorth: 90 }),
			row(3, { insideBudget: true, netWorth: 80 }),
			row(4, { interest: 0.1, debt: 300, netWorth: 70 }),
			row(5, { insideBudget: true, debt: 300, netWorth: 80 }),
			row(6, { insideBudget: true, debt: 300, netWorth: 90 }),
			row(7, { insideBudget: true, debt: 300, netWorth: 100 }),
			row(8, { insideBudget: true, debt: 300, netWorth: 110 }),
			row(9, { insideBudget: true, debt: 300, netWorth: 120 }),
			row(10, { insideBudget: true, debt: 0, savings: GOAL_TARGET, netWorth: 130 }),
			row(58, { netWorth: 140 })
		]
	});
}

describe('the Milestone catalogue', () => {
	it('carries the fifteen ids', () => {
		expect(MILESTONE_IDS).toHaveLength(15);
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
			{ id: 'the_climb', month: 5 },
			{ id: 'half_year_inside_budget', month: 10 },
			{ id: 'goal_reached', month: 10 },
			{ id: 'debt_cleared', month: 10 },
			{ id: 'first_pay', month: 25 },
			{ id: 'fork_chosen', month: 49 },
			{ id: 'fund_opened', month: 49 },
			{ id: 'payslip_read', month: 50 },
			{ id: 'not_fooled', month: 53 },
			{ id: 'weathered_the_crash', month: 55 },
			{ id: 'rode_the_recovery', month: 58 }
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
	},
	{
		id: 'fund_opened',
		month: 49,
		run: withState({ log: [{ month: 49, card: 'the_fund', choice: 'open' }] })
	},
	{
		id: 'rode_the_recovery',
		month: 58,
		run: withState({
			log: [
				{ month: 49, card: 'the_fund', choice: 'open' },
				{ month: 55, card: 'the_crash', choice: 'hold' }
			],
			history: [row(58)]
		})
	},
	{
		id: 'the_climb',
		month: 5,
		run: withState({
			history: [
				row(1, { netWorth: 100 }),
				row(2, { netWorth: 90 }),
				row(3, { netWorth: 80 }),
				row(4, { netWorth: 70 }),
				row(5, { netWorth: 80 })
			]
		})
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

describe('the Fund Milestones (ticket 09)', () => {
	const opened = { month: 49, card: 'the_fund', choice: 'open' } as const;
	const weathered = { month: 55, card: 'the_crash', choice: 'hold' } as const;

	it('opens the Fund on any deposit — including the boring fund and buying the crash', () => {
		expect(
			earnedMilestones(withState({ log: [{ month: 53, card: 'boring_fund', choice: 'fund' }] })).find(
				(m) => m.id === 'fund_opened'
			)
		).toEqual({ id: 'fund_opened', month: 53 });
		expect(
			earnedMilestones(withState({ log: [{ month: 55, card: 'the_crash', choice: 'buy' }] })).find(
				(m) => m.id === 'fund_opened'
			)
		).toEqual({ id: 'fund_opened', month: 55 });
	});

	it('does not open the Fund for the choices that leave it alone', () => {
		const waited = withState({ log: [{ month: 49, card: 'the_fund', choice: 'wait' }] });
		expect(idsOf(waited)).not.toContain('fund_opened');
	});

	it('rides the recovery only with money in the Fund and the fall held or bought', () => {
		const rode = withState({ log: [opened, weathered], history: [row(58)] });
		expect(earnedMilestones(rode).filter((m) => m.id === 'rode_the_recovery')).toEqual([
			{ id: 'rode_the_recovery', month: 58 }
		]);

		// Buying the dip rides it too.
		const bought = withState({
			log: [opened, { month: 55, card: 'the_crash', choice: 'buy' }],
			history: [row(58)]
		});
		expect(idsOf(bought)).toContain('rode_the_recovery');
	});

	it('does not ride a recovery the Run never funded, held, or reached', () => {
		// Never any money in the Fund.
		expect(idsOf(withState({ log: [weathered], history: [row(58)] }))).not.toContain(
			'rode_the_recovery'
		);
		// Sold the crash: the recovery happened without the Fund.
		expect(
			idsOf(
				withState({
					log: [opened, { month: 55, card: 'the_crash', choice: 'sell' }],
					history: [row(58)]
				})
			)
		).not.toContain('rode_the_recovery');
		// The recovery window is still open — the record has not reached month 58.
		expect(
			idsOf(withState({ log: [opened, weathered], history: [row(57)] }))
		).not.toContain('rode_the_recovery');
	});

	it('never fires twice across later months', () => {
		const run = withState({ log: [opened, weathered], history: [row(58), row(59), row(60)] });
		expect(earnedMilestones(run).filter((m) => m.id === 'rode_the_recovery')).toHaveLength(1);
	});
});

describe('the climb (fun-pass ticket 11)', () => {
	const down = (from: number) =>
		Array.from({ length: from }, (_, i) => row(i + 1, { netWorth: 100 - (i + 1) * 10 }));

	it('fires in the first month worth turns back up after three months down', () => {
		const run = withState({
			history: [
				row(1, { netWorth: 100 }),
				row(2, { netWorth: 90 }),
				row(3, { netWorth: 80 }),
				row(4, { netWorth: 70 }),
				row(5, { netWorth: 60 }),
				row(6, { netWorth: 70 })
			]
		});
		expect(earnedMilestones(run).filter((m) => m.id === 'the_climb')).toEqual([
			{ id: 'the_climb', month: 6 }
		]);
	});

	it('needs three consecutive months down, not three falls anywhere', () => {
		// Down, flat, down, down, up: the flat month breaks the run of falls.
		const run = withState({
			history: [
				row(1, { netWorth: 100 }),
				row(2, { netWorth: 90 }),
				row(3, { netWorth: 90 }),
				row(4, { netWorth: 80 }),
				row(5, { netWorth: 70 }),
				row(6, { netWorth: 80 })
			]
		});
		expect(idsOf(run)).not.toContain('the_climb');
	});

	it('does not join a gap in the record', () => {
		const run = withState({
			history: [
				row(1, { netWorth: 100 }),
				row(2, { netWorth: 90 }),
				row(3, { netWorth: 80 }),
				row(5, { netWorth: 70 }),
				row(6, { netWorth: 80 })
			]
		});
		expect(idsOf(run)).not.toContain('the_climb');
	});

	it('needs a fall and a rise, not a flat record', () => {
		expect(idsOf(withState({ history: down(4) }))).not.toContain('the_climb');
	});

	it('fires once, and only after the record shows the rise', () => {
		const run = withState({
			history: [
				row(1, { netWorth: 100 }),
				row(2, { netWorth: 90 }),
				row(3, { netWorth: 80 }),
				row(4, { netWorth: 70 }),
				row(5, { netWorth: 80 }),
				row(6, { netWorth: 90 })
			]
		});
		expect(earnedMilestones(run).filter((m) => m.id === 'the_climb')).toEqual([
			{ id: 'the_climb', month: 5 }
		]);
	});

	it('leaves legacy records alone', () => {
		const bare = withState({ history: undefined as unknown as RunState['history'] });
		expect(() => earnedMilestones(bare)).not.toThrow();
		expect(idsOf(bare)).not.toContain('the_climb');
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

/**
 * A Run that lived `count` closed years: net worth climbing ◈10 a month from
 * the ◈60 start, a clean month every third, Save first used in year 2, the
 * first interest in year 4, the first payslip in year 3, and — from year 5 —
 * the Fork.
 */
function livedYears(count: number): RunState {
	const history: MonthSnapshot[] = [];
	for (let month = 1; month <= count * 12; month++) {
		history.push(
			row(month, {
				netWorth: 60 + month * 10,
				insideBudget: month % 3 === 0,
				saved: month === 13 ? 10 : 0,
				interest: month === 40 ? 0.1 : 0
			})
		);
	}
	return withState({
		history,
		log:
			count >= 5
				? [
						{ month: 25, card: 'first_payslip', choice: 'measured' },
						{ month: 49, card: 'the_fork', choice: 'work' }
					]
				: [{ month: 25, card: 'first_payslip', choice: 'measured' }],
		flags: count >= 5 ? [{ month: 49, kind: 'fork:work' }] : []
	});
}

/** A Run at the Stage-5 Stage-up, the Fork on the table (month 49). */
function atTheFork(run: RunState, phase: RunState['phase'] = 'stage_up'): RunState {
	return { ...run, stage: 5, month: 49, path: 'work', phase };
}

describe('the Year in Review (ticket 02)', () => {
	it('reports each closed year’s money from the stored history', () => {
		const run = livedYears(5);

		expect(yearInReview(run, 1)).toEqual({
			year: 1,
			netWorth: 180,
			// The Run starts at ◈60, the Money Story's opening figure.
			change: 120,
			monthsInsideBudget: 4,
			milestones: ['first_budget_month']
		});
		expect(yearInReview(run, 2)).toEqual({
			year: 2,
			netWorth: 300,
			change: 120,
			monthsInsideBudget: 4,
			milestones: ['first_saved']
		});
		expect(yearInReview(run, 3)).toEqual({
			year: 3,
			netWorth: 420,
			change: 120,
			monthsInsideBudget: 4,
			milestones: ['first_pay']
		});
		expect(yearInReview(run, 4)).toEqual({
			year: 4,
			netWorth: 540,
			change: 120,
			monthsInsideBudget: 4,
			milestones: ['first_interest']
		});
		expect(yearInReview(run, 5)).toEqual({
			year: 5,
			netWorth: 660,
			change: 120,
			monthsInsideBudget: 4,
			milestones: ['fork_chosen']
		});
	});

	it('measures year one’s change from the Run’s ◈60 start, like the Money Story', () => {
		const flat = withState({ history: [row(12, { netWorth: 60 })] });
		expect(yearInReview(flat, 1).change).toBe(0);

		const spent = withState({ history: [row(12, { netWorth: 20 })] });
		expect(yearInReview(spent, 1).change).toBe(-40);
	});

	it('agrees with the metrics for the months inside budget', () => {
		const run = livedYears(5);
		const metrics = computeMetrics(run);
		for (let year = 1; year <= 5; year++) {
			expect(yearInReview(run, year).monthsInsideBudget).toBe(metrics.adherenceByYear[year - 1]);
		}
	});

	it('agrees with the Milestone year slicing', () => {
		const run = livedYears(5);
		for (let year = 1; year <= 5; year++) {
			expect(yearInReview(run, year).milestones).toEqual(milestonesForYear(run, year));
		}
	});

	it('opens stages 2–5 with years 1–4, and stage 1 with no review', () => {
		const run = livedYears(5);
		for (const stage of [2, 3, 4, 5]) {
			const at = { ...run, stage, month: (stage - 1) * 12 + 1, phase: 'stage_up' as const };
			expect(stageUpReview(at)?.year).toBe(stage - 1);
			expect(stageUpReview(at)?.netWorth).toBe(yearInReview(run, stage - 1).netWorth);
		}
		expect(stageUpReview({ ...run, stage: 1, month: 1, phase: 'stage_up' })).toBeNull();
	});

	it('carries year 4 on the Stage-5 Fork, on both paths', () => {
		const run = livedYears(5);
		for (const path of ['study', 'work'] as const) {
			const review = stageUpReview(atTheFork({ ...run, path }));
			expect(review?.year).toBe(4);
			expect(review).toEqual(yearInReview(run, 4));
		}
	});

	it('never reports during the month loop', () => {
		const run = livedYears(5);
		for (const phase of ['plan', 'event', 'resolve', 'done'] as const) {
			expect(stageUpReview(atTheFork(run, phase))).toBeNull();
		}
		expect(stageUpReview(atTheFork(run))).not.toBeNull();
	});

	it('reads only the closed record, so the Fork’s own cost cannot move it', () => {
		const before = livedYears(4);
		const review = yearInReview(before, 4);
		// Choosing Work pays a deposit from live money; the review must not budge.
		const after = {
			...before,
			cash: 0,
			savings: 0,
			debt: 5000,
			month: 49,
			stage: 5,
			phase: 'stage_up' as const
		};
		expect(stageUpReview(after)).toEqual(review);
	});

	it('reports only the part of a year the record covers', () => {
		// A Run dropped straight into Stage 4 has no year-3 close to measure against.
		const jumped = withState({
			history: [row(37), row(48, { netWorth: 500 })],
			stage: 5,
			month: 49,
			phase: 'stage_up'
		});
		expect(yearInReview(jumped, 4)).toEqual({
			year: 4,
			netWorth: 500,
			change: null,
			monthsInsideBudget: 0,
			milestones: []
		});
	});

	it('tolerates an empty, short or legacy record', () => {
		const bare = withState({ history: undefined as unknown as RunState['history'] });
		expect(() => yearInReview(bare, 4)).not.toThrow();
		expect(yearInReview(bare, 4)).toEqual({
			year: 4,
			netWorth: null,
			change: null,
			monthsInsideBudget: 0,
			milestones: []
		});
		expect(stageUpReview({ ...bare, stage: 5, phase: 'stage_up' })).toEqual({
			year: 4,
			netWorth: null,
			change: null,
			monthsInsideBudget: 0,
			milestones: []
		});
	});

	it('carries year 4 on a Run the reducer actually played to the Fork', () => {
		const run = play(applyAction(createRun(20260926), { type: 'DISMISS_INTRO' }), 48);
		expect(run.phase).toBe('stage_up');
		expect(run.stage).toBe(5);

		const review = stageUpReview(run);
		expect(review?.year).toBe(4);
		expect(review?.netWorth).toBe(run.history[47].netWorth);
		expect(review?.change).toBe(run.history[47].netWorth - run.history[35].netWorth);
		expect(review?.monthsInsideBudget).toBe(
			run.history.slice(36, 48).filter((r) => r.insideBudget).length
		);
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
		yearInReview(run, 2);
		stageUpReview({ ...run, stage: 5, month: 49, phase: 'stage_up' });
		expect(run).toStrictEqual(before);
	});
});
