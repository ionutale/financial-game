import { describe, expect, it } from 'vitest';
import { retentionCutoff } from './retention';

describe('the retention cutoff', () => {
	it('is twelve calendar months before now', () => {
		expect(retentionCutoff(new Date('2026-09-26T12:00:00.000Z')).toISOString()).toBe(
			'2025-09-26T12:00:00.000Z'
		);
	});

	it('does not mutate the date it is given', () => {
		const now = new Date('2026-09-26T12:00:00.000Z');
		retentionCutoff(now);
		expect(now.toISOString()).toBe('2026-09-26T12:00:00.000Z');
	});
});
