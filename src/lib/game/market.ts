/**
 * The market (fun-pass ticket 09, ADR-0006, design §3.5).
 *
 * The Fund's money moves with a seeded market: a monthly return drawn from the
 * Run's own Turn RNG (`turnRng(seed, month)`), calibrated to the spec's
 * ≈ 7 %/yr growth with ≈ 16 %/yr volatility and clipped so a single month
 * cannot swing more than ±15 %. The market is a fact of the seed, not of the
 * locale: the maths uses `Math` only, so the same seed lives the same market in
 * every language (which is what the Twin Run's premise needs).
 *
 * The crash is scripted, not drawn. At month 55 the Fund falls by a quarter,
 * applied when that month's Choice is taken (see `loop.ts`), so `hold`, `sell`
 * and `buy` do what their copy says: sell locks the fallen value, buy adds at
 * the fallen price. Months 56–58 carry the scripted recovery — three +10 %
 * months bring a held Fund back to ~99.8 % of its pre-crash value by month 58.
 */

import { turnRng } from './rng';

/** The spec's bounds — the tuning surface, never the goal or the bands. */
export const MARKET_MEAN_ANNUAL = 0.07;
export const MARKET_VOL_ANNUAL = 0.16;
/** The clip: one seeded month cannot swing more than this. */
export const MARKET_CLIP_MONTHLY = 0.15;

/** The scripted crash: month 55, a quarter off for holders. */
export const CRASH_MONTH = 55;
export const CRASH_FACTOR = 0.75;
/** The scripted recovery: +10 % a month, three months, restoring by month 58. */
export const RECOVERY_MONTHS: Readonly<Record<number, number>> = { 56: 1.1, 57: 1.1, 58: 1.1 };

const VOL_MONTHLY = MARKET_VOL_ANNUAL / Math.sqrt(12);

/**
 * The monthly drift: the *geometric* reading is what "averaged seven per cent a
 * year" means, so the lognormal correction lifts the simple-return mean until
 * `E[ln(1 + r)] ≈ ln(1.07)/12` — the compounded result lands on 7 %.
 */
const DRIFT_MONTHLY =
	Math.log(1 + MARKET_MEAN_ANNUAL) / 12 + (VOL_MONTHLY * VOL_MONTHLY) / 2;

/** One standard normal draw from the Turn's stream (Box–Muller). */
function gaussian(random: () => number): number {
	// `random()` can be 0 exactly; `log(0)` would poison the Fund.
	const u1 = Math.max(random(), Number.MIN_VALUE);
	const u2 = random();
	return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** The month's seeded return, before the clip. Pure; exported for the bounds test. */
export function marketReturn(seed: number, month: number): number {
	const raw = DRIFT_MONTHLY + VOL_MONTHLY * gaussian(turnRng(seed, month));
	return Math.min(MARKET_CLIP_MONTHLY, Math.max(-MARKET_CLIP_MONTHLY, raw));
}

/**
 * The close's factor for a month the Fund holds money.
 *
 * - Months 56–58: the scripted recovery (+10 %).
 * - Month 55: 1 — the crash is the month's market move, applied when the
 *   month's Choice is taken, so the close does not move the Fund again.
 * - Every other month: the seeded draw.
 */
export function marketFactor(seed: number, month: number): number {
	if (month === CRASH_MONTH) return 1;
	const scripted = RECOVERY_MONTHS[month];
	if (scripted !== undefined) return scripted;
	return 1 + marketReturn(seed, month);
}

/** The scripted quarter the crash takes off the Fund. */
export function crashFund(fund: number): number {
	return fund * CRASH_FACTOR;
}
