/**
 * The Run's calendar (fun-pass ticket 04, design §3.3): the HUD's date line
 * needs a year and a month name, derived from `run.month` alone. The Run
 * starts in September, so the school years line up with the Stages (month 13
 * opens Stage 2 in a September).
 *
 * Month names come from `Intl` in the existing explicit-locale pattern —
 * instances are memoised and the locale is passed in, so SSR and hydration
 * cannot disagree — and no catalogue key is spent on a month name.
 */

/** The Run's year, counted like its Stages: months 1–12 are year 1. */
export function runYear(month: number): number {
	return Math.floor((month - 1) / 12) + 1;
}

/** September is month 1; the index is 0-based, wrapped for any input. */
export function runMonthIndex(month: number): number {
	return (((month - 1) % 12) + 12) % 12;
}

const monthFormatters = new Map<string, Intl.DateTimeFormat>();

function monthFormatter(locale: string): Intl.DateTimeFormat {
	let formatter = monthFormatters.get(locale);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
		monthFormatters.set(locale, formatter);
	}
	return formatter;
}

/** The month's name in the active locale, e.g. `September` / `ottobre`. */
export function monthName(month: number, locale: string): string {
	// A fixed reference year: only the month is ever read, and a UTC date keeps
	// the server and the browser on the same day.
	const date = new Date(Date.UTC(2001, 8 + runMonthIndex(month), 1));
	return monthFormatter(locale).format(date);
}
