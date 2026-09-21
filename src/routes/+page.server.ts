import { getStore } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const saved = await getStore().load(locals.profileKey);
	return { saved: saved?.state ?? null };
};
