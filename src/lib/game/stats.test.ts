import { describe, expect, it } from 'vitest';
import { createRun } from './loop';
import { statsSheet, threadHistory } from './stats';
import type { RunState } from './types';

/** A Run with specific values, for exercising the Stats Sheet derivations. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

describe('the Stats Sheet rows', () => {
	it('keeps decimals on Savings and Fund, whole figures elsewhere (tickets 15, 20)', () => {
		const sheet = statsSheet(withState({ savings: 282.5, fund: 40, debt: 120 }));
		expect(sheet.rows.map((row) => [row.label, row.value])).toEqual([
			['Savings', '\u25c8282.5'],
			['Fund', '\u25c840'],
			['Debt', '\u25c8120'],
			['Credit score', 'No card yet']
		]);
	});

	it('shows the Credit score once a card exists', () => {
		const sheet = statsSheet(withState({ score: 640 }));
		expect(sheet.rows.find((row) => row.label === 'Credit score')?.value).toBe('640');
	});

	it('says there is no card yet when the score is null', () => {
		// A bare null would read as a missing number on the sheet.
		const sheet = statsSheet(createRun());
		expect(sheet.rows.find((row) => row.label === 'Credit score')?.value).toBe('No card yet');
	});
});

describe('the Stats Sheet obligations', () => {
	it('carries this month’s fixed costs, inflation applied', () => {
		const s = withState({ stage: 4, inflationIndex: 1 });
		expect(statsSheet(s).obligations).toBe(180);
	});
});

describe('the Thread history', () => {
	it('is empty when no Thread has ever been planted', () => {
		const sheet = statsSheet(createRun());
		expect(sheet.liveThread).toBeNull();
		expect(sheet.history).toEqual([]);
	});

	it('shows the live Thread as its countdown chip alongside resolved arcs', () => {
		const s = withState({
			month: 31,
			thread: { id: 'friend_loan', since: 30 },
			log: [
				{ month: 25, card: 'evening_course', choice: 'enrol' },
				{ month: 28, card: 'course_pays_off', choice: 'ask' },
				{ month: 30, card: 'lend_to_friend', choice: 'lend' }
			]
		});
		const sheet = statsSheet(s);
		expect(sheet.liveThread).toBe('The money you lent \u2014 repayment in 2 months');
		expect(sheet.history).toEqual([{ label: 'The course', month: 28 }]);
	});

	it('lists multiple resolved Threads newest first', () => {
		const s = withState({
			log: [
				{ month: 20, card: 'course_pays_off', choice: 'ask' },
				{ month: 33, card: 'lend_returns', choice: 'take' }
			]
		});
		expect(threadHistory(s)).toEqual([
			{ label: 'The money you lent', month: 33 },
			{ label: 'The course', month: 20 }
		]);
	});

	it('ignores log entries that do not resolve a Thread', () => {
		const s = withState({
			log: [
				{ month: 5, card: 'evening_course', choice: 'enrol' },
				{ month: 9, card: 'not_a_card_in_the_deck', choice: 'x' }
			]
		});
		expect(threadHistory(s)).toEqual([]);
	});

	it('tolerates old saves that predate the thread field', () => {
		const old = withState({ thread: undefined as unknown as RunState['thread'] });
		expect(() => statsSheet(old)).not.toThrow();
		expect(statsSheet(old).liveThread).toBeNull();
	});
});
