import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Vercel sends `Authorization: Bearer $CRON_SECRET` to scheduled routes when
 * the secret is configured. Compare digests in constant time, and fail closed
 * if the server has no secret at all — a cron route that runs unauthorised
 * would delete profiles on request.
 */
export function cronAuthorized(header: string | null, secret: string | undefined): boolean {
	if (!secret) return false;
	const expected = createHash('sha256').update(`Bearer ${secret}`).digest();
	const actual = createHash('sha256').update(header ?? '').digest();
	return timingSafeEqual(expected, actual);
}
