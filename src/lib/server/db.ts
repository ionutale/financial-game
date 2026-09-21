import { dev } from '$app/environment';
import { mongoUri } from './env';
import { createMongoStore } from './mongo-store';
import { createMemoryStore, type RunStore } from './store';

let cached: RunStore | null = null;

/**
 * Atlas when a URI is configured, an in-process store otherwise so the game is
 * playable locally without credentials. Nothing else in the app knows which.
 */
export function getStore(): RunStore {
	if (cached) return cached;

	const uri = mongoUri();
	if (uri) {
		cached = createMongoStore(uri);
	} else {
		cached = createMemoryStore();
		if (dev) {
			console.info('[store] MONGODB_URI is not set — using the in-process store (dev only)');
		}
	}
	return cached;
}
