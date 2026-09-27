import type { Config } from '@sveltejs/adapter-vercel';
import { getStore } from '$lib/server/db';
import type { PageServerLoad } from './$types';

/** 15 s, ticket 06's interactive-route cap: one Atlas read of the profile (ticket 32). */
export const config: Config = { maxDuration: 15 };

/**
 * The Journal's record (gamification ticket 05): the active Run and the
 * archive, through the existing profile loader — no new endpoint, no schema
 * change. The page hands the plain shapes to the pure `buildJournal`.
 */
export const load: PageServerLoad = async ({ locals }) => {
	const { active, archive } = await getStore().loadProfile(locals.profileKey);
	return { active: active?.state ?? null, archive };
};
