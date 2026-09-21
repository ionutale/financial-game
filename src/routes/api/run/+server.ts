import { json } from '@sveltejs/kit';
import type { RunState } from '$lib/game/types';
import { getStore } from '$lib/server/db';
import type { RequestHandler } from './$types';

/** Enough of a shape check to reject a malformed body without a full validator. */
function isRunState(value: unknown): value is RunState {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.month === 'number' &&
		typeof v.phase === 'string' &&
		typeof v.cash === 'number' &&
		typeof v.pots === 'object'
	);
}

/**
 * One write per Turn, at the month close (ticket 04). Idempotent and ordered by
 * the month index, so a repeated close cannot roll a Run backwards.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	let body: { state?: unknown };
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'malformed body' }, { status: 400 });
	}

	if (!isRunState(body?.state)) {
		return json({ ok: false, error: 'malformed run' }, { status: 400 });
	}

	const saved = await getStore().save(locals.profileKey, {
		turnIndex: body.state.month,
		state: body.state,
		updatedAt: new Date().toISOString()
	});

	return json({ ok: saved });
};
