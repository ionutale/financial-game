import { deLocalizeUrl } from '$lib/paraglide/runtime';
import type { Reroute } from '@sveltejs/kit';

/**
 * Strips the locale prefix before SvelteKit routes (ticket 26): `/it/settings`
 * renders `/settings` in Italian, and `/` stays English because `en` is the
 * base locale and is never prefixed. Must live in src/hooks.ts, not
 * hooks.server.ts — the router needs it on the client too.
 */
export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;
