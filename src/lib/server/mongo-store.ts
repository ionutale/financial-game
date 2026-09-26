import { MongoClient, type Collection } from 'mongodb';
import {
	applyRunWrite,
	emptyProfile,
	readProfile,
	type RunStore,
	type StoredProfileDoc
} from './store';

const COLLECTION = 'runs';

/** One document per profile: the new shape plus the old single-Run fields. */
interface RunDoc extends StoredProfileDoc {
	_id: string;
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
			return doc ? readProfile(doc).active : null;
		},

		async loadProfile(key) {
			const doc = await runs(uri).findOne({ _id: key });
			return doc ? readProfile(doc) : emptyProfile();
		},

		async save(key, run) {
			// Ordering guard (ticket 06): a write behind the active Run is refused;
			// a done state archives the Run and frees the slot (ticket 23). Read
			// then write, as this store always has — the guard is optimistic, and
			// one player's own retries are the only writers for a key.
			const doc = await runs(uri).findOne({ _id: key });
			const { saved, profile } = applyRunWrite(doc ? readProfile(doc) : emptyProfile(), run);
			if (!saved) return false;

			await runs(uri).updateOne(
				{ _id: key },
				{
					$set: { active: profile.active, archive: profile.archive, updatedAt: run.updatedAt },
					// A document written by the old shape becomes the new one here.
					$unset: { turnIndex: '', state: '' }
				},
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
