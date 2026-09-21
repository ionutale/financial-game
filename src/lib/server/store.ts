import type { RunState } from '$lib/game/types';

export interface SavedRun {
	/** The month, which is also the turn index. Writes are ordered by it (ticket 06). */
	turnIndex: number;
	state: RunState;
	updatedAt: string;
}

export interface RunStore {
	load(key: string): Promise<SavedRun | null>;
	/** Returns false if the incoming write is older than what is already stored. */
	save(key: string, run: SavedRun): Promise<boolean>;
	remove(key: string): Promise<void>;
}

/**
 * In-process store. It survives page refreshes but dies with the server, so it
 * exists to make local development work without Atlas credentials — not to ship.
 */
export function createMemoryStore(): RunStore {
	const runs = new Map<string, SavedRun>();
	return {
		async load(key) {
			return runs.get(key) ?? null;
		},
		async save(key, run) {
			const existing = runs.get(key);
			if (existing && existing.turnIndex > run.turnIndex) return false;
			runs.set(key, run);
			return true;
		},
		async remove(key) {
			runs.delete(key);
		}
	};
}
