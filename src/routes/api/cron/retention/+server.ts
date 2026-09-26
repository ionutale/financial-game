import { json } from '@sveltejs/kit';
import { cronAuthorized } from '$lib/server/cron';
import { getStore } from '$lib/server/db';
import { cronSecret } from '$lib/server/env';
import { retentionCutoff } from '$lib/server/retention';
import type { RequestHandler } from './$types';

/**
 * The daily retention sweep (ticket 12): a profile untouched for 12 months is
 * deleted. Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else —
 * including a deploy with no secret set — is refused.
 */
export const GET: RequestHandler = async ({ request }) => {
	const secret = cronSecret();
	if (!cronAuthorized(request.headers.get('authorization'), secret)) {
		if (!secret) console.error('[retention] CRON_SECRET is not set — refusing to sweep');
		return json({ ok: false }, { status: 401 });
	}

	const cutoff = retentionCutoff(new Date());
	const deleted = await getStore().sweep(cutoff);
	console.info(`[retention] deleted ${deleted} run(s) untouched since ${cutoff.toISOString()}`);

	return json({ ok: true, deleted, cutoff: cutoff.toISOString() });
};
