import { json } from '@sveltejs/kit';
import { getStore } from '$lib/server/db';
import { buildProfileExport } from '$lib/server/profile-export';
import type { RequestHandler } from './$types';

/**
 * The player's right of access (ticket 12): everything stored for this profile
 * as a downloadable JSON file. No raw cookie, no digest — just the Run.
 */
export const GET: RequestHandler = async ({ locals }) => {
	const saved = await getStore().load(locals.profileKey);

	return json(buildProfileExport(saved, new Date().toISOString()), {
		headers: {
			'content-disposition': 'attachment; filename="financial-game-export.json"',
			'cache-control': 'no-store'
		}
	});
};
