import { dev } from '$app/environment';
import { COOKIE_OPTIONS, PROFILE_COOKIE, mintRawKey, profileKeyFrom } from '$lib/server/identity';
import { profilePepper } from '$lib/server/env';
import type { Handle } from '@sveltejs/kit';

/**
 * Mints the anonymous profile cookie if the player has none, and derives the
 * peppered key the database stores. No IP, no user agent, no fingerprinting —
 * enforced by never reading them (ticket 12).
 */
export const handle: Handle = async ({ event, resolve }) => {
	let raw = event.cookies.get(PROFILE_COOKIE);
	if (!raw) {
		raw = mintRawKey();
		event.cookies.set(PROFILE_COOKIE, raw, { ...COOKIE_OPTIONS, secure: !dev });
	}
	event.locals.profileKey = profileKeyFrom(raw, profilePepper());
	return resolve(event);
};
