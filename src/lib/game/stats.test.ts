import { describe, expect, it } from 'vitest';
import { createRun } from './loop';
import { statsSheet, threadHistory } from './stats';
import type { RunState } from './types';

/** A Run with specific values, for exercising the Stats Sheet derivations. */
function withState(patch: Partial<RunState>): RunState {
	return { ...createRun(), ...patch };
}

describe('the Stats Sheet rows', () => {
	it('keeps raw values and tones for the sheet to format (tickets 15, 20)', () => {
		const sheet = statsSheet(withState({ savings: 282.5, fund: 40, debt: 120 }));
		expect(sheet.rows).toEqual([
			{ key: 'savings', value: 282.5, tone: 'ink' },
			{ key: 'fund', value: 40, tone: 'ink' },
			{ key: 'debt', value: 120, tone: 'down' },
			{ key: 'score', value: null, tone: 'muted' }
		]);
	});

	it('shows the Credit score once a card exists', () => {
		const sheet = statsSheet(withState({ score: 640 }));
		expect(sheet.rows.find((row) => row.key === 'score')).toEqual({
			key: 'score',
			value: 640,
			tone: 'ink'
		});
	});

	it('leaves the score null when there is no card yet', () => {
		// A bare null reads as "no card yet" through the catalogue on the sheet.
		const sheet = statsSheet(createRun());
		expect(sheet.rows.find((row) => row.key === 'score')?.value).toBeNull();
	});

	it('shows the Fund row only when the Fund holds money (ticket 09)', () => {
		// Absent, never a dead zero — the close's own rule (AC4).
		expect(statsSheet(createRun()).rows.map((row) => row.key)).toEqual(['savings', 'debt', 'score']);

		const funded = statsSheet(withState({ fund: 250 }));
		expect(funded.rows.find((row) => row.key === 'fund')).toEqual({
			key: 'fund',
			value: 250,
			tone: 'ink'
		});
	});

	it('treats an absent Fund (a pre-wiring save) as zero without NaN', () => {
		const legacy = statsSheet(withState({ fund: undefined as unknown as number }));
		expect(legacy.rows.map((row) => row.key)).toEqual(['savings', 'debt', 'score']);
		expect(legacy.rows.every((row) => row.value === null || Number.isFinite(row.value))).toBe(true);
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

	it('carries the live Thread countdown alongside resolved arcs', () => {
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
		expect(sheet.liveThread).toEqual({ id: 'friend_loan', months: 2 });
		expect(sheet.history).toEqual([{ id: 'course_enrolled', month: 28 }]);
	});

	it('lists multiple resolved Threads newest first', () => {
		const s = withState({
			log: [
				{ month: 20, card: 'course_pays_off', choice: 'ask' },
				{ month: 33, card: 'lend_returns', choice: 'take' }
			]
		});
		expect(threadHistory(s)).toEqual([
			{ id: 'friend_loan', month: 33 },
			{ id: 'course_enrolled', month: 20 }
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
