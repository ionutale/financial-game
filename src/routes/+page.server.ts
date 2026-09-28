import type { Config } from '@sveltejs/adapter-vercel';
import { getStore } from '$lib/server/db';
import { chapterRefs } from '$lib/game/journal';
import { freshSeed } from '$lib/game/rng';
import type { PageServerLoad } from './$types';

/**
 * Ticket 06's interactive-route cap: a cold start, the Paraglide SSR render and
 * one Atlas read fit in 15 s, and a stuck query must not keep the function
 * alive to Vercel's 300 s platform default (ticket 32).
 */
export const config: Config = { maxDuration: 15 };

export const load: PageServerLoad = async ({ locals }) => {
	// One read of the profile, as before (ticket 32). The archive leaves this
	// route as link-ready Chapter refs for the Money Story's Other Path (fun-pass
	// ticket 11) — a seed, a date, a path, a title, never whole Runs.
	const profile = await getStore().loadProfile(locals.profileKey);
	// The seed is minted server-side so SSR and hydration agree, and so a new Run
	// differs from the last one (ticket 05 wants replay with a fresh seed).
	return {
		saved: profile.active?.state ?? null,
		seed: freshSeed(),
		chapters: chapterRefs(profile.archive)
	};
};
