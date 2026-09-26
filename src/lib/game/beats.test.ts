import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BEAT_ART, BEAT_ART_IDS, MONEY_STORY_BEAT, beatAltKey, beatArtFor } from './beats';
import { SPINE } from './spine';

/**
 * Ticket 30's art gate. The component holds the drawings, `beats.ts` holds the
 * map, and the catalogues hold the alt text — three places that must agree, or
 * a beat ships silent or unillustrated. These are the honest checks a unit test
 * can make without a browser.
 */

const LOCALES = ['en', 'it', 'ro'] as const;
type Locale = (typeof LOCALES)[number];

const catalogues = Object.fromEntries(
	LOCALES.map((locale) => [
		locale,
		JSON.parse(
			readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), 'utf8')
		) as Record<string, unknown>
	])
) as Record<Locale, Record<string, unknown>>;

describe('the beat map (ticket 30)', () => {
	it('illustrates every spine beat exactly once, plus the Fork', () => {
		const spineIds = Object.values(SPINE);
		expect(Object.keys(BEAT_ART).sort()).toEqual([...spineIds, 'the_fork'].sort());
		for (const id of spineIds) {
			expect(beatArtFor(id), `the spine beat ${id} has no art`).not.toBeNull();
		}
	});

	it('leaves every non-beat card typographic', () => {
		expect(beatArtFor('two_wants')).toBeNull();
		expect(beatArtFor('phone_cracked')).toBeNull();
		expect(beatArtFor('')).toBeNull();
	});

	it('names ten distinct pieces: nine beats and the Money Story panel', () => {
		expect(BEAT_ART_IDS).toHaveLength(10);
		expect(new Set(BEAT_ART_IDS).size).toBe(BEAT_ART_IDS.length);
		expect(BEAT_ART_IDS).toContain(MONEY_STORY_BEAT);
	});

	it('has non-empty alt text for every piece in all three locales', () => {
		for (const beat of BEAT_ART_IDS) {
			const key = beatAltKey(beat);
			for (const locale of LOCALES) {
				const value = catalogues[locale][key];
				expect(typeof value, `${locale}: ${key}`).toBe('string');
				expect((value as string).trim().length, `${locale}: ${key} is empty`).toBeGreaterThan(0);
			}
		}
	});
});
