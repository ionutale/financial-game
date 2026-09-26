import { describe, expect, it } from 'vitest';
import { localizedAlternates } from './alternates';

/**
 * The hreflang set (ticket 28) is generated, not hand-listed, so it is unit
 * testable: one fully-qualified URL per locale plus `x-default`, the same set
 * from whichever locale's URL the page was opened at, and no URL SvelteKit
 * would redirect away from.
 */
describe('localizedAlternates (ticket 28)', () => {
	it('emits the three locale URLs plus x-default, in locale order', () => {
		expect(localizedAlternates(new URL('http://localhost:4173/settings'))).toEqual([
			{ locale: 'en', href: 'http://localhost:4173/settings' },
			{ locale: 'it', href: 'http://localhost:4173/it/settings' },
			{ locale: 'ro', href: 'http://localhost:4173/ro/settings' },
			{ locale: 'x-default', href: 'http://localhost:4173/settings' }
		]);
	});

	it('emits the same set from a localized URL', () => {
		expect(localizedAlternates(new URL('http://localhost:4173/ro/settings'))).toEqual(
			localizedAlternates(new URL('http://localhost:4173/settings'))
		);
	});

	it('normalizes the root to the URLs SvelteKit serves', () => {
		expect(localizedAlternates(new URL('http://localhost:4173/'))).toEqual([
			{ locale: 'en', href: 'http://localhost:4173/' },
			{ locale: 'it', href: 'http://localhost:4173/it' },
			{ locale: 'ro', href: 'http://localhost:4173/ro' },
			{ locale: 'x-default', href: 'http://localhost:4173/' }
		]);
	});
});
