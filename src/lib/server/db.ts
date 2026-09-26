import { dev } from '$app/environment';
import { allowMemoryStore, mongoUri } from './env';
import { createMongoStore } from './mongo-store';
import { createMemoryStore, resolveStore, type RunStore } from './store';

let cached: RunStore | null = null;

/**
 * Atlas when a URI is configured, an in-process store otherwise so the game is
 * playable locally without credentials. A production build without a URI
 * refuses to serve instead of losing every profile at cold start (ticket 32).
 */
export function getStore(): RunStore {
	if (cached) return cached;

	const uri = mongoUri();
	if (!uri && dev) {
		console.info('[store] MONGODB_URI is not set — using the in-process store (dev only)');
	}

	cached = resolveStore(
		{ uri, dev, allowMemory: allowMemoryStore() },
		{ mongo: createMongoStore, memory: createMemoryStore }
	);
	return cached;
}
