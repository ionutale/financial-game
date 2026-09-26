import { describe, expect, it } from 'vitest';
import { formatMoney, formatMoneyExact } from './economy';

describe('money formatting', () => {
	it('rounds to whole units by default', () => {
		expect(formatMoney(0.1, 'en')).toBe('\u25c80');
		expect(formatMoney(1234.6, 'en')).toBe('\u25c81,235');
	});

	it('keeps up to two decimals when exact, so interest is never rounded away', () => {
		// Ticket 15: at 3%/yr a small balance earns a tenth of a unit a month.
		expect(formatMoneyExact(0.1, 'en')).toBe('\u25c80.1');
		expect(formatMoneyExact(40.1, 'en')).toBe('\u25c840.1');
		expect(formatMoneyExact(1234.567, 'en')).toBe('\u25c81,234.57');
	});

	it('drops the decimals entirely when the amount is whole', () => {
		expect(formatMoneyExact(40, 'en')).toBe('\u25c840');
		expect(formatMoneyExact(0, 'en')).toBe('\u25c80');
	});

	it('puts the minus before the glyph, not inside the number', () => {
		expect(formatMoney(-8597, 'en')).toBe('\u2212\u25c88,597');
		expect(formatMoneyExact(-40.5, 'en')).toBe('\u2212\u25c840.5');
	});

	/*
	 * Ticket 26: the glyph stays neutral, the grouping follows the active
	 * locale. Note Italian's CLDR minimumGroupingDigits: four-digit amounts
	 * are not grouped in `it` (8597), where en and ro group them (8,597).
	 * These snapshots are the alarm if a future ICU/Node changes that.
	 */
	it('groups thousands per locale, with the neutral ◈ kept', () => {
		expect(formatMoney(1234567, 'en')).toMatchInlineSnapshot(`"◈1,234,567"`);
		expect(formatMoney(1234567, 'it')).toMatchInlineSnapshot(`"◈1.234.567"`);
		expect(formatMoney(1234567, 'ro')).toMatchInlineSnapshot(`"◈1.234.567"`);
		expect(formatMoney(8597, 'en')).toMatchInlineSnapshot(`"◈8,597"`);
		expect(formatMoney(8597, 'it')).toMatchInlineSnapshot(`"◈8597"`);
		expect(formatMoney(8597, 'ro')).toMatchInlineSnapshot(`"◈8.597"`);
	});

	it('localises the decimal mark when exact', () => {
		expect(formatMoneyExact(1234.5, 'en')).toMatchInlineSnapshot(`"◈1,234.5"`);
		expect(formatMoneyExact(1234.5, 'it')).toMatchInlineSnapshot(`"◈1234,5"`);
		expect(formatMoneyExact(1234.5, 'ro')).toMatchInlineSnapshot(`"◈1.234,5"`);
		expect(formatMoneyExact(0.1, 'en')).toMatchInlineSnapshot(`"◈0.1"`);
		expect(formatMoneyExact(0.1, 'it')).toMatchInlineSnapshot(`"◈0,1"`);
		expect(formatMoneyExact(0.1, 'ro')).toMatchInlineSnapshot(`"◈0,1"`);
	});
});
