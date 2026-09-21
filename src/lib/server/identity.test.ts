import { describe, expect, it } from 'vitest';
import { mintRawKey, profileKeyFrom } from './identity';

describe('the anonymous profile key', () => {
	it('mints 32 bytes of base64url and never repeats', () => {
		const raw = mintRawKey();
		expect(raw).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(mintRawKey()).not.toBe(raw);
	});

	it('is deterministic for the same cookie and pepper', () => {
		expect(profileKeyFrom('abc', 'pep')).toBe(profileKeyFrom('abc', 'pep'));
	});

	it('changes when either the cookie or the pepper changes', () => {
		expect(profileKeyFrom('abc', 'pep')).not.toBe(profileKeyFrom('abd', 'pep'));
		expect(profileKeyFrom('abc', 'pep')).not.toBe(profileKeyFrom('abc', 'pep2'));
	});

	it('stores a digest that does not contain the cookie', () => {
		const raw = 'super-secret-cookie-value';
		const key = profileKeyFrom(raw, 'pep');
		expect(key).toMatch(/^[0-9a-f]{64}$/);
		expect(key).not.toContain(raw);
	});
});
