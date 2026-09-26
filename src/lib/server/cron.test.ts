import { describe, expect, it } from 'vitest';
import { cronAuthorized } from './cron';

describe('the cron authorisation check', () => {
	it('accepts the bearer secret Vercel sends', () => {
		expect(cronAuthorized('Bearer s3cret', 's3cret')).toBe(true);
	});

	it('rejects a wrong or missing secret', () => {
		expect(cronAuthorized('Bearer nope', 's3cret')).toBe(false);
		expect(cronAuthorized('Basic s3cret', 's3cret')).toBe(false);
		expect(cronAuthorized('Bearer ', 's3cret')).toBe(false);
		expect(cronAuthorized(null, 's3cret')).toBe(false);
	});

	it('fails closed when the server has no secret configured', () => {
		expect(cronAuthorized('Bearer anything', undefined)).toBe(false);
		expect(cronAuthorized(null, undefined)).toBe(false);
		expect(cronAuthorized('Bearer ', '')).toBe(false);
	});
});
