import { dev } from '$app/environment';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getTextDirection } from '$lib/paraglide/runtime';
import { COOKIE_OPTIONS, PROFILE_COOKIE, mintRawKey, profileKeyFrom } from '$lib/server/identity';
import { profilePepper } from '$lib/server/env';
import type { Handle } from '@sveltejs/kit';

/**
 * Paraglide localises the request and stamps `%lang%`/`%dir%` into the HTML
 * (ticket 26). It must wrap every response — including the API routes and the
 * retention cron — so it runs inside the same handle chain as the profile
 * bookkeeping, not beside it.
 */
const paraglideHandle: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
		event.request = localizedRequest;
		return resolve(event, {
			transformPageChunk: ({ html }) => {
				return html.replace('%lang%', locale).replace('%dir%', getTextDirection(locale));
			}
		});
	});

/**
 * Mints the anonymous profile cookie if the player has none, and derives the
 * peppered key the database stores. No IP, no user agent, no fingerprinting —
 * enforced by never reading them (ticket 12). Locale is presentation only and
 * is never written into the profile or the Run.
 */
export const handle: Handle = async ({ event, resolve }) => {
	let raw = event.cookies.get(PROFILE_COOKIE);
	if (!raw) {
		raw = mintRawKey();
		event.cookies.set(PROFILE_COOKIE, raw, { ...COOKIE_OPTIONS, secure: !dev });
	}
	event.locals.profileKey = profileKeyFrom(raw, profilePepper());
	return paraglideHandle({ event, resolve });
};
