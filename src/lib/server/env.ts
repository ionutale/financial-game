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
 * The accessibility gate serves a production build (`vite preview`) with no
 * Atlas, so its scripts opt in to the in-process store explicitly. Never set
 * on Vercel: a production build without `MONGODB_URI` must refuse (ticket 32).
 */
export function allowMemoryStore(): boolean {
	return env.A11Y_MEMORY_STORE === '1';
}

/**
 * The shared secret Vercel sends as `Authorization: Bearer $CRON_SECRET` on
 * scheduled requests. Server-only; the retention sweep refuses to run without it.
 */
export function cronSecret(): string | undefined {
	return env.CRON_SECRET || undefined;
}
