import type { Config } from '@sveltejs/adapter-vercel';
import { json } from '@sveltejs/kit';
import { getStore } from '$lib/server/db';
import { buildProfileExport } from '$lib/server/profile-export';
import type { RequestHandler } from './$types';

/** 15 s, ticket 06's interactive-route cap: one Atlas read of the profile (ticket 32). */
export const config: Config = { maxDuration: 15 };

/**
 * The player's right of access (ticket 12): everything stored for this profile
 * as a downloadable JSON file — the active Run and every finished Run archived
 * for replay (ticket 23). No raw cookie, no digest.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const { active, archive } = await getStore().loadProfile(locals.profileKey);

	return json(buildProfileExport(active, archive, new Date().toISOString()), {
		headers: {
			'content-disposition': 'attachment; filename="financial-game-export.json"',
			'cache-control': 'no-store'
		}
	});
};
