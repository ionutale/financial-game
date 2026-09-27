import { describe, expect, it } from 'vitest';
import { monthName, runYear } from './date-line';

/**
 * The HUD's date line (fun-pass ticket 04, design §3.3): the Run starts in
 * September so the school years line up with the Stages, and month names come
 * from `Intl` in the explicit-locale pattern — no catalogue keys, no state.
 */

describe('the Run’s calendar (fun-pass ticket 04)', () => {
	it('counts the Run’s years the way the Stages do', () => {
		expect(runYear(1)).toBe(1);
		expect(runYear(12)).toBe(1);
		expect(runYear(13)).toBe(2);
		expect(runYear(48)).toBe(4);
		expect(runYear(49)).toBe(5);
		expect(runYear(60)).toBe(5);
	});

	it('starts in September, so a Stage opens with a school year', () => {
		expect(monthName(1, 'en')).toBe('September');
		expect(monthName(12, 'en')).toBe('August');
		expect(monthName(13, 'en')).toBe('September');
		expect(monthName(60, 'en')).toBe('August');
	});

	it('names the month in the active locale', () => {
		expect(monthName(2, 'en')).toBe('October');
		expect(monthName(2, 'it')).toBe('ottobre');
		expect(monthName(2, 'ro')).toBe('octombrie');
		expect(monthName(50, 'it')).toBe('ottobre');
		expect(monthName(50, 'ro')).toBe('octombrie');
	});

	it('wraps safely for a month outside 1..60 rather than throwing', () => {
		expect(runYear(0)).toBe(0);
		expect(monthName(0, 'en')).toBe('August');
		expect(monthName(61, 'en')).toBe('September');
	});
});
