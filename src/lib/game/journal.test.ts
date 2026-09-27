import { describe, expect, it } from 'vitest';
import { STAGES } from './economy';
import {
	buildJournal,
	CONCEPT_IDS,
	conceptCoverage,
	coverageAcross,
	CROSS_RUN_MILESTONE_IDS,
	type ArchivedRunLike,
	type ConceptCoverageEntry,
	type ConceptCoverageState
} from './journal';
import { createRun } from './loop';
import { MILESTONE_IDS } from './milestones';
import type { ConceptId, MonthSnapshot, RunState } from './types';

/**
 * Concept Coverage (gamification ticket 03), table-driven like the Milestone
 * tests: given the stored record, which of the eight Concepts are Introduced
 * (their Stage has opened), Experienced (a card carrying them was played) or
 * still locked.
 */

/** One expected coverage row, for readable table expectations. */
function entry(concept: ConceptId, state: ConceptCoverageState): ConceptCoverageEntry {
	return { concept, state };
}

/** A Run with specific fields, for exercising the coverage derivations. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

/**
 * A fresh Run: stage 1's two Concepts are Introduced by the ladder alone,
 * nothing has been played, and the later Stages' six stay locked.
 */
const FRESH: ConceptCoverageEntry[] = [
	entry('needs_wants', 'introduced'),
	entry('earning_work', 'introduced'),
	entry('budgeting', 'locked'),
	entry('saving_goals', 'locked'),
	entry('interest', 'locked'),
	entry('credit', 'locked'),
	entry('investing', 'locked'),
	entry('tax_insurance_scams', 'locked')
];

/**
 * Month 25, stage 3: a Concept played twice is one Experienced row, the open
 * Stages' unplayed Concepts are Introduced, and stages 4–5 are locked.
 */
const MID_RUN: RunState = withState({
	stage: 3,
	month: 25,
	log: [
		{ month: 1, card: 'birthday_gift', choice: 'skip' },
		{ month: 5, card: 'two_wants', choice: 'game' },
		{ month: 24, card: 'interest_first', choice: 'nothing' }
	]
});

const MID_RUN_EXPECTED: ConceptCoverageEntry[] = [
	entry('needs_wants', 'experienced'),
	entry('earning_work', 'introduced'),
	entry('budgeting', 'introduced'),
	entry('saving_goals', 'introduced'),
	entry('interest', 'experienced'),
	entry('credit', 'locked'),
	entry('investing', 'locked'),
	entry('tax_insurance_scams', 'locked')
];

/** A Run that played a card carrying every one of the eight Concepts. */
const FULLY_COVERED: RunState = withState({
	stage: 5,
	month: 55,
	log: [
		{ month: 1, card: 'birthday_gift', choice: 'skip' },
		{ month: 2, card: 'the_allowance', choice: 'keep' },
		{ month: 14, card: 'first_budget', choice: 'tighten' },
		{ month: 20, card: 'savings_goal', choice: 'bike' },
		{ month: 26, card: 'interest_first', choice: 'more' },
		{ month: 40, card: 'bnpl_offer', choice: 'leave' },
		{ month: 52, card: 'the_fund', choice: 'open' },
		{ month: 53, card: 'scam_opportunity', choice: 'check' }
	]
});

const FULLY_EXPERIENCED: ConceptCoverageEntry[] = [
	entry('needs_wants', 'experienced'),
	entry('earning_work', 'experienced'),
	entry('budgeting', 'experienced'),
	entry('saving_goals', 'experienced'),
	entry('interest', 'experienced'),
	entry('credit', 'experienced'),
	entry('investing', 'experienced'),
	entry('tax_insurance_scams', 'experienced')
];

const CASES: Array<{ name: string; run: RunState; expected: ConceptCoverageEntry[] }> = [
	{ name: 'a fresh Run has only stage 1 Introduced', run: createRun(), expected: FRESH },
	{ name: 'a mid-Run reads all three states', run: MID_RUN, expected: MID_RUN_EXPECTED },
	{
		name: 'a fully covered Run is Experienced across the board',
		run: FULLY_COVERED,
		expected: FULLY_EXPERIENCED
	},
	{
		name: 'ignores log entries whose card is not in the current deck',
		run: withState({ log: [{ month: 5, card: 'not_a_card_any_more', choice: 'x' }] }),
		expected: FRESH
	},
	{
		name: 'tolerates a legacy record missing its log',
		run: withState({ log: undefined as unknown as RunState['log'] }),
		expected: FRESH
	}
];

describe('the Concept Coverage for the current Run (ticket 03)', () => {
	for (const { name, run, expected } of CASES) {
		it(name, () => {
			expect(conceptCoverage(run)).toEqual(expected);
		});
	}

	it('reads a played card from a Stage that has not opened as Experienced, not locked', () => {
		// A forced card is still a real encounter; no new information is revealed.
		const run = withState({ stage: 1, log: [{ month: 1, card: 'bnpl_offer', choice: 'leave' }] });
		expect(conceptCoverage(run).find((e) => e.concept === 'credit')).toEqual(
			entry('credit', 'experienced')
		);
	});

	it('never marks a Concept Experienced because its Stage opened', () => {
		expect(conceptCoverage(createRun()).filter((e) => e.state === 'experienced')).toEqual([]);
	});

	it('throws nothing on a record missing its log and stage, reading it as stage 1', () => {
		const bare = withState({
			log: undefined as unknown as RunState['log'],
			stage: undefined as unknown as RunState['stage']
		});
		expect(() => conceptCoverage(bare)).not.toThrow();
		expect(conceptCoverage(bare)).toEqual(FRESH);
	});

	it('leaves the Run untouched', () => {
		const run = FULLY_COVERED;
		const before = structuredClone(run);
		conceptCoverage(run);
		expect(run).toStrictEqual(before);
	});
});

describe('the Concept ladder', () => {
	it('is the eight Concepts, each exactly once, in ladder order', () => {
		const ladder = [1, 2, 3, 4, 5].flatMap((stage) => STAGES[stage].concepts);
		expect(CONCEPT_IDS).toHaveLength(8);
		expect(CONCEPT_IDS).toEqual([...new Set(ladder)]);
	});

	it('orders a Run’s coverage by the ladder', () => {
		expect(conceptCoverage(FULLY_COVERED).map((e) => e.concept)).toEqual(CONCEPT_IDS);
	});
});

/**
 * The cross-Run half (gamification ticket 05): Chapters from the archive in
 * the order lived, the across-Run Concept Coverage, the collected Milestones —
 * including the cross-Run `both_paths` — and the header summary.
 */

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

/** One finished Run as the profile archive stores it. */
function chapter(state: RunState, seed: number, finishedAt: string): ArchivedRunLike {
	return { state, seed, finishedAt };
}

/**
 * A finished Work Run with one clean month behind it (Save, interest), the
 * first payslip and one Turning Point — enough to pin every Chapter field.
 * `netWorth` reaches the Work Named Goal, so its band is Ahead.
 */
const WORK_CHAPTER_STATE: RunState = withState({
	path: 'work',
	month: 61,
	phase: 'done',
	cash: 0,
	savings: 4000,
	debt: 0,
	history: [row(1, { insideBudget: true, saved: 40, interest: 0.12, netWorth: 4000 })],
	log: [
		{ month: 1, card: 'birthday_gift', choice: 'skip' },
		{ month: 3, card: 'first_payslip', choice: 'measured' }
	],
	flags: [{ month: 20, kind: 'overdraft' }]
});

/** The same shape on the Study path, finished a month earlier. */
const STUDY_CHAPTER_STATE: RunState = withState({
	path: 'study',
	month: 61,
	phase: 'done',
	history: [row(1, { insideBudget: true })]
});

const WORK_CHAPTER = chapter(WORK_CHAPTER_STATE, 101, '2026-02-01T09:00:00.000Z');
const STUDY_CHAPTER = chapter(STUDY_CHAPTER_STATE, 202, '2026-01-01T09:00:00.000Z');

/** The eight Concepts with nothing met yet. */
const ALL_LOCKED: ConceptCoverageEntry[] = CONCEPT_IDS.map((concept) =>
	entry(concept, 'locked')
);

describe('the cross-Run Milestone catalogue (ticket 05)', () => {
	it('is both_paths alone, outside the twelve in-Run ids', () => {
		expect(CROSS_RUN_MILESTONE_IDS).toEqual(['both_paths']);
		expect(MILESTONE_IDS).not.toContain('both_paths');
	});
});

describe('the Journal over the archive (ticket 05)', () => {
	it('reads an empty archive as no Chapters, nothing collected and nothing met', () => {
		const journal = buildJournal(null, []);
		expect(journal.chapters).toEqual([]);
		expect(journal.collectedMilestones).toEqual([]);
		expect(journal.coverage).toEqual(ALL_LOCKED);
		expect(journal.summary).toEqual({ runsFinished: 0, conceptsMet: 0, conceptsTotal: 8 });
	});

	it('reads one finished Run as one Chapter with its band, moments, Milestones, seed and date', () => {
		const journal = buildJournal(null, [WORK_CHAPTER]);

		expect(journal.chapters).toEqual([
			{
				seed: 101,
				finishedAt: '2026-02-01T09:00:00.000Z',
				band: 'ahead',
				turningPoints: [{ month: 20, kind: 'overdraft' }],
				milestones: [
					{ id: 'first_budget_month', month: 1 },
					{ id: 'first_saved', month: 1 },
					{ id: 'first_interest', month: 1 },
					{ id: 'first_pay', month: 3 }
				]
			}
		]);
		expect(journal.summary).toEqual({ runsFinished: 1, conceptsMet: 2, conceptsTotal: 8 });
	});

	it('orders Chapters the way they were lived: oldest first, whatever the archive order', () => {
		const journal = buildJournal(null, [WORK_CHAPTER, STUDY_CHAPTER]);
		expect(journal.chapters.map((c) => c.seed)).toEqual([202, 101]);
		expect(journal.summary.runsFinished).toBe(2);
	});

	it('collects the Milestones earned across Runs in catalogue order', () => {
		const saver = chapter(withState({ history: [row(1, { saved: 10 })] }), 1, '2026-01-01T00:00:00.000Z');
		const budgeter = chapter(
			withState({
				history: [row(1, { insideBudget: true })],
				log: [{ month: 2, card: 'first_payslip', choice: 'measured' }]
			}),
			2,
			'2026-01-02T00:00:00.000Z'
		);
		const journal = buildJournal(null, [saver, budgeter]);
		expect(journal.collectedMilestones).toEqual(['first_budget_month', 'first_saved', 'first_pay']);
	});

	it('recognises both paths once the archive holds a Study Run and a Work Run', () => {
		const journal = buildJournal(null, [WORK_CHAPTER, STUDY_CHAPTER]);
		expect(journal.collectedMilestones).toContain('both_paths');
	});

	it('does not recognise both paths when the archive holds only one', () => {
		expect(buildJournal(null, [WORK_CHAPTER]).collectedMilestones).not.toContain('both_paths');
	});

	it('lands both paths when both are finished, not while one is still being lived', () => {
		// The design: the recognition lands when the archive holds both paths —
		// a Run still in progress is not a Chapter.
		const activeStudy = withState({ path: 'study' });
		expect(buildJournal(activeStudy, [WORK_CHAPTER]).collectedMilestones).not.toContain(
			'both_paths'
		);
	});

	it('counts the Run in progress for across-Run coverage and collected Milestones', () => {
		const active = withState({
			log: [{ month: 1, card: 'birthday_gift', choice: 'skip' }],
			history: [row(1, { insideBudget: true })]
		});
		const journal = buildJournal(active, []);

		expect(journal.chapters).toEqual([]);
		expect(journal.coverage.find((e) => e.concept === 'needs_wants')?.state).toBe('experienced');
		expect(journal.summary.conceptsMet).toBe(1);
		expect(journal.collectedMilestones).toEqual(['first_budget_month']);
	});

	it('tolerates archived logs with unknown card ids', () => {
		const old = chapter(
			withState({ log: [{ month: 1, card: 'a_card_from_an_old_deck', choice: 'gone' }] }),
			5,
			'2026-03-01T00:00:00.000Z'
		);
		const journal = buildJournal(null, [old]);
		// The unknown card marks nothing Experienced; stage 1's two remain Introduced.
		expect(journal.coverage).toEqual(FRESH);
		expect(journal.chapters[0].milestones).toEqual([]);
	});

	it('throws nothing on a legacy archive entry missing its collections', () => {
		const bare: RunState = {
			...createRun(),
			log: undefined as unknown as RunState['log'],
			flags: undefined as unknown as RunState['flags'],
			history: undefined as unknown as RunState['history']
		};
		expect(() => buildJournal(null, [chapter(bare, 6, '2026-03-02T00:00:00.000Z')])).not.toThrow();
	});

	it('leaves the archive it reads untouched', () => {
		const archive = [WORK_CHAPTER, STUDY_CHAPTER];
		const before = structuredClone(archive);
		buildJournal(null, archive);
		expect(archive).toStrictEqual(before);
		expect(archive.map((c) => c.seed)).toEqual([101, 202]);
	});
});

describe('the across-Run Concept Coverage (ticket 05)', () => {
	it('is the union of the Concepts Experienced in any Run', () => {
		const needsWants = withState({ log: [{ month: 1, card: 'birthday_gift', choice: 'skip' }] });
		const interest = withState({
			stage: 3,
			log: [{ month: 24, card: 'interest_first', choice: 'nothing' }]
		});

		expect(coverageAcross([needsWants, interest])).toEqual([
			entry('needs_wants', 'experienced'),
			entry('earning_work', 'introduced'),
			entry('budgeting', 'introduced'),
			entry('saving_goals', 'introduced'),
			entry('interest', 'experienced'),
			entry('credit', 'locked'),
			entry('investing', 'locked'),
			entry('tax_insurance_scams', 'locked')
		]);
	});

	it('reads no Runs as nothing met at all', () => {
		expect(coverageAcross([])).toEqual(ALL_LOCKED);
	});
});
