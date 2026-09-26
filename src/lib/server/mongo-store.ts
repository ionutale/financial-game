import { MongoClient, type Collection } from 'mongodb';
import type { RunState } from '$lib/game/types';
import type { RunStore, SavedRun } from './store';

const COLLECTION = 'runs';

interface RunDoc {
	_id: string;
	turnIndex: number;
	state: RunState;
	updatedAt: string;
}

/**
 * One client per process, reused across serverless invocations and never closed
 * per request (ticket 06). The pool is deliberately small: Atlas free tiers cap
 * connections per node, and a game with no accounts does not need many.
 */
let client: MongoClient | null = null;

function runs(uri: string): Collection<RunDoc> {
	if (!client) {
		client = new MongoClient(uri, {
			maxPoolSize: 5,
			minPoolSize: 0,
			maxIdleTimeMS: 30_000,
			serverSelectionTimeoutMS: 5_000
		});
	}
	return client.db().collection<RunDoc>(COLLECTION);
}

export function createMongoStore(uri: string): RunStore {
	return {
		async load(key) {
			const doc = await runs(uri).findOne({ _id: key });
			if (!doc) return null;
			return { turnIndex: doc.turnIndex, state: doc.state, updatedAt: doc.updatedAt };
		},

		async save(key, run: SavedRun) {
			// Ordering guard: a write that is behind what is stored is refused, which
			// makes a repeated close idempotent rather than a regression.
			const existing = await runs(uri).findOne({ _id: key }, { projection: { turnIndex: 1 } });
			if (existing && existing.turnIndex > run.turnIndex) return false;

			await runs(uri).updateOne(
				{ _id: key },
				{ $set: { turnIndex: run.turnIndex, state: run.state, updatedAt: run.updatedAt } },
				{ upsert: true }
			);
			return true;
		},

		async remove(key) {
			await runs(uri).deleteOne({ _id: key });
		},

		async sweep(cutoff) {
			// updatedAt is written as an ISO 8601 UTC string everywhere, so $lt
			// against the cutoff's ISO string orders correctly (ticket 12).
			const result = await runs(uri).deleteMany({ updatedAt: { $lt: cutoff.toISOString() } });
			return result.deletedCount;
		}
	};
}
