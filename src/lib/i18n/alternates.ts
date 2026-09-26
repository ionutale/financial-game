/**
 * The `<link rel="alternate" hreflang>` set for a page (ticket 28).
 *
 * Paraglide's `generateStaticLocalizedUrls` produces the localized variants of
 * a canonical path — including the base locale's unprefixed one — and
 * `extractLocaleFromUrl` reads back which locale each URL belongs to. The
 * current URL may itself be localized (`/ro/settings`), so it is de-localized
 * first: the same page emits the same set from every locale's URL.
 *
 * SvelteKit's default `trailingSlash: 'never'` serves `/it`, not the `/it/`
 * Paraglide builds for the root, so root variants are normalized to the URL the
 * router actually serves. `x-default` points at the base locale, as Google's
 * hreflang guidance expects.
 */
import {
	baseLocale,
	deLocalizeUrl,
	extractLocaleFromUrl,
	generateStaticLocalizedUrls,
	type Locale
} from '$lib/paraglide/runtime';

export interface Alternate {
	/** A locale code, or `x-default` for the fallback entry. */
	locale: Locale | 'x-default';
	/** The fully-qualified URL, which is what hreflang requires. */
	href: string;
}

/** Drop a trailing slash SvelteKit would redirect away, keeping the root `/`. */
function served(url: URL): URL {
	if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
		return new URL(url.pathname.slice(0, -1) + url.search, url.origin);
	}
	return url;
}

export function localizedAlternates(url: URL): Alternate[] {
	const canonical = deLocalizeUrl(new URL(url.pathname, url.origin));
	const alternates: Alternate[] = generateStaticLocalizedUrls([canonical]).map((localized) => ({
		locale: extractLocaleFromUrl(localized) ?? baseLocale,
		href: served(localized).href
	}));
	const base = alternates.find((alternate) => alternate.locale === baseLocale);
	alternates.push({ locale: 'x-default', href: base?.href ?? served(canonical).href });
	return alternates;
}
