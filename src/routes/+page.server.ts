import { getStore } from '$lib/server/db';
import { freshSeed } from '$lib/game/rng';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const saved = await getStore().load(locals.profileKey);
	// The seed is minted server-side so SSR and hydration agree, and so a new Run
	// differs from the last one (ticket 05 wants replay with a fresh seed).
	return { saved: saved?.state ?? null, seed: freshSeed() };
};
