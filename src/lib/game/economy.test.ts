import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyExact } from './economy';

describe('money formatting', () => {
	it('rounds to whole units by default', () => {
		expect(formatMoney(0.1)).toBe('\u25c80');
		expect(formatMoney(1234.6)).toBe('\u25c81,235');
	});

	it('keeps up to two decimals when exact, so interest is never rounded away', () => {
		// Ticket 15: at 3%/yr a small balance earns a tenth of a unit a month.
		expect(formatMoneyExact(0.1)).toBe('\u25c80.1');
		expect(formatMoneyExact(40.1)).toBe('\u25c840.1');
		expect(formatMoneyExact(1234.567)).toBe('\u25c81,234.57');
	});

	it('drops the decimals entirely when the amount is whole', () => {
		expect(formatMoneyExact(40)).toBe('\u25c840');
		expect(formatMoneyExact(0)).toBe('\u25c80');
	});

	it('puts the minus before the glyph, not inside the number', () => {
		expect(formatMoney(-8597)).toBe('\u2212\u25c88,597');
		expect(formatMoneyExact(-40.5)).toBe('\u2212\u25c840.5');
	});
});
