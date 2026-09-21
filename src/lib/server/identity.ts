import { createHash, randomBytes } from 'node:crypto';

/** The cookie name. The only thing the player carries between visits. */
export const PROFILE_COOKIE = 'fg_profile';

/** 32 random bytes. No name, no email, no IP — just an opaque handle. */
export function mintRawKey(): string {
	return randomBytes(32).toString('base64url');
}

/**
 * The database never sees the cookie value — only this digest, peppered with a
 * server-side secret (tickets 06 and 12). Rotating the pepper would orphan every
 * profile, so it is set once and left alone.
 */
export function profileKeyFrom(raw: string, pepper: string): string {
	return createHash('sha256').update(pepper).update(':').update(raw).digest('hex');
}

/**
 * `httpOnly; Secure; SameSite=Lax`, one year. Strictly necessary: without it there
 * is no game, which is why no consent banner ships (ticket 12).
 */
export const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 365
};
