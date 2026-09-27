import { describe, expect, it } from 'vitest';
import { STAGES } from './economy';
import {
	CONCEPT_IDS,
	conceptCoverage,
	type ConceptCoverageEntry,
	type ConceptCoverageState
} from './journal';
import { createRun } from './loop';
import type { ConceptId, RunState } from './types';

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
