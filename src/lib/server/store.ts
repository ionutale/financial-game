import { RUN_MONTHS } from '$lib/game/loop';
import type { RunState } from '$lib/game/types';

export interface SavedRun {
	/** The month, which is also the turn index. Writes are ordered by it (ticket 06). */
	turnIndex: number;
	state: RunState;
	updatedAt: string;
}

/** A finished Run kept on the profile for replay (tickets 05, 23). */
export interface ArchivedRun {
	/** The final state: phase `done`, month 61. */
	state: RunState;
	/** The seed the Run was played from, kept alongside the state for clarity. */
	seed: number;
	/** When the Run finished, an ISO 8601 UTC string. */
	finishedAt: string;
}

/** What one profile holds: the Run being played plus the finished ones. */
export interface RunProfile {
	active: SavedRun | null;
	archive: ArchivedRun[];
}

/**
 * The stored document for one profile. New documents carry `active` and
 * `archive`; documents written before ticket 23 have one Run at the top level
 * (`turnIndex`, `state`) and must still load as the active Run.
 */
export interface StoredProfileDoc {
	active?: SavedRun | null;
	archive?: ArchivedRun[];
	updatedAt: string;
	/** The old single-Run shape, read-only. */
	turnIndex?: number;
	state?: RunState;
}

export interface RunStore {
	/** The active Run only — the archive is not something to resume (ticket 23). */
	load(key: string): Promise<SavedRun | null>;
	/** The active Run plus the archive, for the export (ticket 23). */
	loadProfile(key: string): Promise<RunProfile>;
	/** Returns false if the incoming write is older than what is already stored. */
	save(key: string, run: SavedRun): Promise<boolean>;
	remove(key: string): Promise<void>;
	/** Deletes every Run untouched since `cutoff`; returns how many were removed (ticket 12). */
	sweep(cutoff: Date): Promise<number>;
}

/** A profile that has never been written. */
export function emptyProfile(): RunProfile {
	return { active: null, archive: [] };
}

/** Reads a stored document in either shape (ticket 23). */
export function readProfile(doc: StoredProfileDoc): RunProfile {
	if (doc.active !== undefined || doc.archive !== undefined) {
		return { active: doc.active ?? null, archive: doc.archive ?? [] };
	}

	// The old shape: the whole document was one Run.
	if (doc.turnIndex !== undefined && doc.state !== undefined) {
		return {
			active: { turnIndex: doc.turnIndex, state: doc.state, updatedAt: doc.updatedAt },
			archive: []
		};
	}

	return emptyProfile();
}

/**
 * Applies one write to a profile, returning the profile to persist and whether
 * the write was accepted (ticket 23):
 *
 * - A done state (phase `done`, month 61) archives the Run and frees the active
 *   slot, so the replay that follows persists from month 1. A repeated finish
 *   is idempotent: once its seed is archived, the write changes nothing.
 * - With no active Run, any write becomes the active Run — that is the replay
 *   slot the finish just freed.
 * - A write at or after the active month moves the Run forwards; the same month
 *   repeated is ticket 06's idempotent close.
 * - An older write is refused, including a fresh month-1 write while a Run is
 *   active: the only intended path to a new Run is NEW_RUN from the finished
 *   Money Story, and the done write clears the active slot first. Leftovers
 *   (a stale tab, a finish whose write was lost) must not overwrite progress.
 */
export function applyRunWrite(
	profile: RunProfile,
	run: SavedRun
): { saved: boolean; profile: RunProfile } {
	if (run.state.phase === 'done' && run.state.month > RUN_MONTHS) {
		const archived = profile.archive.some((entry) => entry.seed === run.state.seed);
		if (archived) return { saved: true, profile };

		return {
			saved: true,
			profile: {
				active: null,
				archive: [
					...profile.archive,
					{ state: run.state, seed: run.state.seed, finishedAt: run.updatedAt }
				]
			}
		};
	}

	const active = profile.active;
	if (!active || run.turnIndex >= active.turnIndex) {
		return { saved: true, profile: { active: run, archive: profile.archive } };
	}

	return { saved: false, profile };
}

/**
 * In-process store. It survives page refreshes but dies with the server, so it
 * exists to make local development work without Atlas credentials — not to ship.
 */
export function createMemoryStore(): RunStore {
	// Keyed by profile; `updatedAt` is the profile's last activity, which is what
	// the retention sweep dates (ticket 12) — an archive append counts.
	const profiles = new Map<string, { profile: RunProfile; updatedAt: string }>();

	return {
		async load(key) {
			return profiles.get(key)?.profile.active ?? null;
		},

		async loadProfile(key) {
			return profiles.get(key)?.profile ?? emptyProfile();
		},

		async save(key, run) {
			const stored = profiles.get(key);
			const { saved, profile } = applyRunWrite(stored?.profile ?? emptyProfile(), run);
			if (!saved) return false;
			profiles.set(key, { profile, updatedAt: run.updatedAt });
			return true;
		},

		async remove(key) {
			profiles.delete(key);
		},

		async sweep(cutoff) {
			// Writes always store `updatedAt` as an ISO 8601 UTC string, so the
			// lexicographic comparison is the same one MongoDB's $lt makes. A run
			// whose date is missing or unreadable is left alone: deleting data we
			// cannot date would be worse than keeping it.
			const iso = cutoff.toISOString();
			let deleted = 0;
			for (const [key, stored] of profiles) {
				if (typeof stored.updatedAt === 'string' && stored.updatedAt < iso) {
					profiles.delete(key);
					deleted += 1;
				}
			}
			return deleted;
		}
	};
}
