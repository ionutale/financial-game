import { describe, expect, it } from 'vitest';
import {
	CRASH_FACTOR,
	CRASH_MONTH,
	MARKET_CLIP_MONTHLY,
	MARKET_MEAN_ANNUAL,
	MARKET_VOL_ANNUAL,
	RECOVERY_MONTHS,
	crashFund,
	marketFactor,
	marketReturn
} from './market';

/** Months whose move is scripted, not drawn. */
const SCRIPTED = new Set([CRASH_MONTH, ...Object.keys(RECOVERY_MONTHS).map(Number)]);

describe('the seeded market (ticket 09, ADR-0006)', () => {
	it('is the same for a seed and a month, and differs across months and seeds', () => {
		const value = marketReturn(7, 50);
		expect(marketReturn(7, 50)).toBe(value);
		expect(marketReturn(7, 51)).not.toBe(value);
		expect(marketReturn(8, 50)).not.toBe(value);
	});

	it('is pure arithmetic, pinned for a known seed and month — locale never feeds it', () => {
		// A recorded value, so a change to the stream has to be a conscious one:
		// the market is a fact of the seed, with no locale, Intl or ambient state.
		expect(marketReturn(42, 50)).toBeCloseTo(-0.03697941479676975, 12);
		expect(marketFactor(42, 50)).toBeCloseTo(0.9630205852032303, 12);
	});

	it('clips a single seeded month to ±15 %, and can never wipe the money out', () => {
		for (let seed = 1; seed <= 400; seed++) {
			for (let month = 1; month <= 60; month++) {
				if (SCRIPTED.has(month)) continue;
				const value = marketReturn(seed, month);
				expect(value).toBeGreaterThanOrEqual(-MARKET_CLIP_MONTHLY);
				expect(value).toBeLessThanOrEqual(MARKET_CLIP_MONTHLY);
				expect(1 + value).toBeGreaterThan(0);
			}
		}
	});

	it('averages about seven per cent a year with about sixteen per cent volatility', () => {
		// 2000 seeds × the non-scripted months: the spec bounds, measured on the
		// real draw. ~2.4σ of headroom on the mean, ~1.5σ on the volatility.
		const logs: number[] = [];
		for (let seed = 1; seed <= 2000; seed++) {
			for (let month = 1; month <= 60; month++) {
				if (SCRIPTED.has(month)) continue;
				logs.push(Math.log(1 + marketReturn(seed, month)));
			}
		}
		const mean = logs.reduce((sum, value) => sum + value, 0) / logs.length;
		const variance = logs.reduce((sum, value) => sum + (value - mean) ** 2, 0) / logs.length;
		const annualMean = Math.exp(mean * 12) - 1;
		const annualVol = Math.sqrt(variance) * Math.sqrt(12);

		expect(MARKET_MEAN_ANNUAL).toBe(0.07);
		expect(MARKET_VOL_ANNUAL).toBe(0.16);
		expect(annualMean, `annual mean ${(annualMean * 100).toFixed(2)}%`).toBeGreaterThanOrEqual(0.065);
		expect(annualMean, `annual mean ${(annualMean * 100).toFixed(2)}%`).toBeLessThanOrEqual(0.075);
		expect(annualVol, `annual vol ${(annualVol * 100).toFixed(2)}%`).toBeGreaterThanOrEqual(0.15);
		expect(annualVol, `annual vol ${(annualVol * 100).toFixed(2)}%`).toBeLessThanOrEqual(0.17);
	});

	it('scripts the crash at month 55 and the recovery through 56–58', () => {
		expect(CRASH_MONTH).toBe(55);
		expect(CRASH_FACTOR).toBeCloseTo(0.75, 12);
		expect(crashFund(400)).toBe(300);
		// Month 55's close does not move the Fund again: the crash is the month.
		expect(marketFactor(1, CRASH_MONTH)).toBe(1);
		for (const month of [56, 57, 58]) {
			expect(marketFactor(1, month)).toBeCloseTo(1.1, 12);
			expect(marketFactor(9999, month)).toBeCloseTo(1.1, 12);
		}
		// Three +10 % months bring a held Fund back to ~99.8 % of its pre-crash value.
		expect(crashFund(400) * 1.1 ** 3).toBeCloseTo(399.3, 6);
	});
});
