import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

const DEV_PEPPER = 'dev-pepper-not-for-production';

/**
 * The pepper is a server-only secret. A production deploy without one would
 * silently use the dev value, so it throws instead.
 */
export function profilePepper(): string {
	const pepper = env.PROFILE_PEPPER;
	if (pepper) return pepper;
	if (dev) return DEV_PEPPER;
	throw new Error('PROFILE_PEPPER must be set in production — see .env.example');
}

export function mongoUri(): string | undefined {
	return env.MONGODB_URI || undefined;
}

/**
 * The shared secret Vercel sends as `Authorization: Bearer $CRON_SECRET` on
 * scheduled requests. Server-only; the retention sweep refuses to run without it.
 */
export function cronSecret(): string | undefined {
	return env.CRON_SECRET || undefined;
}
