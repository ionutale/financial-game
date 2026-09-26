import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { getStore } from '$lib/server/db';
import { COOKIE_OPTIONS, PROFILE_COOKIE } from '$lib/server/identity';
import type { RequestHandler } from './$types';

/**
 * The player's right to erasure (ticket 12): removes the stored Run and expires
 * the profile cookie with the same options it was set with. The next visit mints
 * a fresh profile, which is a fresh Run.
 */
export const DELETE: RequestHandler = async ({ locals, cookies }) => {
	await getStore().remove(locals.profileKey);
	cookies.set(PROFILE_COOKIE, '', { ...COOKIE_OPTIONS, secure: !dev, maxAge: 0 });

	return json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
};
