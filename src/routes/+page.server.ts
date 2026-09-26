import type { Config } from '@sveltejs/adapter-vercel';
import { getStore } from '$lib/server/db';
import { freshSeed } from '$lib/game/rng';
import type { PageServerLoad } from './$types';

/**
 * Ticket 06's interactive-route cap: a cold start, the Paraglide SSR render and
 * one Atlas read fit in 15 s, and a stuck query must not keep the function
 * alive to Vercel's 300 s platform default (ticket 32).
 */
export const config: Config = { maxDuration: 15 };

export const load: PageServerLoad = async ({ locals }) => {
	const saved = await getStore().load(locals.profileKey);
	// The seed is minted server-side so SSR and hydration agree, and so a new Run
	// differs from the last one (ticket 05 wants replay with a fresh seed).
	return { saved: saved?.state ?? null, seed: freshSeed() };
};
