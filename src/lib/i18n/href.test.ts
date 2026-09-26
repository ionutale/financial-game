import { describe, expect, it } from 'vitest';
import { localizedHref } from './href';

/**
 * Ticket 29: internal links are written in the active locale, not left bare
 * for the cookie middleware to redirect. With an explicit locale the generated
 * helper is deterministic; the no-locale case runs against the Vitest
 * environment's base locale (`en`).
 */
describe('localizedHref (ticket 29)', () => {
	it('prefixes a page path with a non-base locale', () => {
		expect(localizedHref('/privacy', 'it')).toBe('/it/privacy');
		expect(localizedHref('/settings', 'ro')).toBe('/ro/settings');
	});

	it('leaves the base locale unprefixed', () => {
		expect(localizedHref('/privacy', 'en')).toBe('/privacy');
		expect(localizedHref('/privacy')).toBe('/privacy');
	});

	it('keeps the root a path SvelteKit serves', () => {
		expect(localizedHref('/', 'en')).toBe('/');
		expect(localizedHref('/', 'it')).toBe('/it');
		expect(localizedHref('/', 'ro')).toBe('/ro');
	});

	it('re-localizes an already localized path', () => {
		expect(localizedHref('/it/settings', 'ro')).toBe('/ro/settings');
		expect(localizedHref('/it/settings', 'en')).toBe('/settings');
	});
});
