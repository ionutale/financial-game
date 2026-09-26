/**
 * The href for one of the app's own pages (ticket 29).
 *
 * `localizeHref` is the generated helper: with no explicit locale it uses the
 * active one, and the base locale stays unprefixed, so English links are clean.
 * Paraglide builds the root as `/it/`, but SvelteKit serves `/it`; a trailing
 * slash is dropped while the root itself stays `/`, never empty. The language
 * switcher passes an explicit target locale to build the other options from
 * the current path.
 */
import { localizeHref, type Locale } from '$lib/paraglide/runtime';

export function localizedHref(path: string, locale?: Locale): string {
	const localized = localizeHref(path, { locale });
	return localized.length > 1 ? localized.replace(/\/$/, '') : localized;
}
