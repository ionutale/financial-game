import { describe, expect, it } from 'vitest';
import { RUN_MONTHS, createRun } from '../game/loop';
import type { RunState } from '../game/types';
import {
	createMemoryStore,
	readProfile,
	resolveStore,
	type RunStore,
	type SavedRun
} from './store';

/** A Run state parked at a month and phase — the store never validates them. */
function stateAt(month: number, phase: RunState['phase'], seed = 1): RunState {
	return { ...createRun(seed), month, phase };
}

/** The extra write the client sends when month 60 closes into the Money Story. */
function doneWrite(seed = 1, updatedAt = 'done'): SavedRun {
	return {
		turnIndex: RUN_MONTHS + 1,
		state: stateAt(RUN_MONTHS + 1, 'done', seed),
		updatedAt
	};
}

describe('the run store', () => {
	it('round-trips a run', async () => {
		const store = createMemoryStore();
		expect(await store.load('k')).toBeNull();

		expect(await store.save('k', { turnIndex: 1, state: createRun(), updatedAt: 'now' })).toBe(true);

		const loaded = await store.load('k');
		expect(loaded?.state.month).toBe(1);
		expect(loaded?.state.cash).toBe(60);
	});

	it('refuses a write that would roll a Run backwards', async () => {
		const store = createMemoryStore();
		const state = createRun();

		await store.save('k', { turnIndex: 12, state, updatedAt: 'a' });
		expect(await store.save('k', { turnIndex: 11, state, updatedAt: 'b' })).toBe(false);
		expect((await store.load('k'))?.turnIndex).toBe(12);
	});

	it('accepts a repeated write of the same Turn', async () => {
		const store = createMemoryStore();
		const state = createRun();
		await store.save('k', { turnIndex: 5, state, updatedAt: 'a' });
		expect(await store.save('k', { turnIndex: 5, state, updatedAt: 'b' })).toBe(true);
	});

	it('keeps profiles apart', async () => {
		const store = createMemoryStore();
		await store.save('a', { turnIndex: 1, state: createRun(), updatedAt: 'x' });
		expect(await store.load('b')).toBeNull();
	});

	it('forgets everything on request, archives included', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 7), updatedAt: 'x' });
		await store.save('k', doneWrite(7));
		await store.remove('k');

		expect(await store.load('k')).toBeNull();
		expect(await store.loadProfile('k')).toEqual({ active: null, archive: [] });
	});
});

describe('the archive', () => {
	it('archives a finished Run and frees the active slot', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 7), updatedAt: 'close' });

		expect(await store.save('k', doneWrite(7, 'finish'))).toBe(true);
		expect(await store.load('k')).toBeNull();

		const profile = await store.loadProfile('k');
		expect(profile.active).toBeNull();
		expect(profile.archive).toHaveLength(1);
		expect(profile.archive[0].seed).toBe(7);
		expect(profile.archive[0].finishedAt).toBe('finish');
		expect(profile.archive[0].state.phase).toBe('done');
		expect(profile.archive[0].state.month).toBe(RUN_MONTHS + 1);
	});

	it('records a finished Run once when the done write repeats', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 7), updatedAt: 'close' });
		await store.save('k', doneWrite(7, 'first'));
		expect(await store.save('k', doneWrite(7, 'second'))).toBe(true);

		const profile = await store.loadProfile('k');
		expect(profile.archive).toHaveLength(1);
		expect(profile.archive[0].finishedAt).toBe('first');
	});

	it('lets a fresh Run persist from month 1 once the finished Run is archived', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 7), updatedAt: 'close' });
		await store.save('k', doneWrite(7));

		expect(await store.save('k', { turnIndex: 1, state: createRun(8), updatedAt: 'replay' })).toBe(
			true
		);
		expect((await store.load('k'))?.state.seed).toBe(8);
		expect((await store.loadProfile('k')).archive).toHaveLength(1);
	});

	it('keeps every finished Run when a Run replays and finishes again', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 1, state: createRun(7), updatedAt: 'a' });
		await store.save('k', doneWrite(7, 'first'));
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 8), updatedAt: 'b' });
		await store.save('k', doneWrite(8, 'second'));

		const { active, archive } = await store.loadProfile('k');
		expect(active).toBeNull();
		expect(archive.map((entry) => entry.seed)).toEqual([7, 8]);
	});

	it('refuses a month-1 write while a Run is still active', async () => {
		// The intended path to a new Run is NEW_RUN from the finished Money Story,
		// and the done write clears the active slot first, so a month-1 write over
		// a live Run can only be a leftover (a stale tab, a finish whose write was
		// lost). Conservatively, the stored Run wins: no write, no archive change.
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 30, state: stateAt(30, 'plan', 7), updatedAt: 'a' });

		expect(await store.save('k', { turnIndex: 1, state: createRun(8), updatedAt: 'b' })).toBe(false);
		expect((await store.load('k'))?.turnIndex).toBe(30);
		expect((await store.loadProfile('k')).archive).toEqual([]);
	});

	it('ignores a repeated done write without clearing a newer active Run', async () => {
		// Idempotency must not cost data: a finish for seed 7 is already archived,
		// so its retry is a no-op — the Run that is active now stays active.
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 60, state: stateAt(60, 'resolve', 7), updatedAt: 'a' });
		await store.save('k', doneWrite(7, 'first'));
		await store.save('k', { turnIndex: 30, state: stateAt(30, 'event', 8), updatedAt: 'b' });

		expect(await store.save('k', doneWrite(7, 'retry'))).toBe(true);
		expect((await store.load('k'))?.state.seed).toBe(8);
		expect((await store.loadProfile('k')).archive).toHaveLength(1);
	});
});

describe('reading a stored profile document', () => {
	it('loads the old single-Run shape as the active Run with no archive', () => {
		const state = stateAt(42, 'event', 3);
		const profile = readProfile({
			turnIndex: 42,
			state,
			updatedAt: '2026-09-01T00:00:00.000Z'
		});

		expect(profile.active).toEqual({
			turnIndex: 42,
			state,
			updatedAt: '2026-09-01T00:00:00.000Z'
		});
		expect(profile.archive).toEqual([]);
	});

	it('loads the active Run and archive of the new shape', () => {
		const archive = [{ state: stateAt(61, 'done', 3), seed: 3, finishedAt: 'f' }];
		const active = { turnIndex: 5, state: createRun(9), updatedAt: 'a' };
		const profile = readProfile({ active, archive, updatedAt: 'b' });

		expect(profile.active).toEqual(active);
		expect(profile.archive).toEqual(archive);
	});

	it('reads an empty profile from a document carrying neither shape', () => {
		expect(readProfile({ updatedAt: 'x' })).toEqual({ active: null, archive: [] });
	});
});

describe('the retention sweep', () => {
	const cutoff = new Date('2026-01-01T00:00:00.000Z');

	it('removes runs untouched since the cutoff and keeps fresher ones', async () => {
		const store = createMemoryStore();
		await store.save('old', {
			turnIndex: 3,
			state: createRun(),
			updatedAt: '2025-06-01T00:00:00.000Z'
		});
		await store.save('fresh', {
			turnIndex: 4,
			state: createRun(),
			updatedAt: '2026-06-01T00:00:00.000Z'
		});

		expect(await store.sweep(cutoff)).toBe(1);
		expect(await store.load('old')).toBeNull();
		expect(await store.load('fresh')).not.toBeNull();
	});

	it('keeps a run touched exactly at the cutoff', async () => {
		const store = createMemoryStore();
		await store.save('edge', {
			turnIndex: 1,
			state: createRun(),
			updatedAt: cutoff.toISOString()
		});

		expect(await store.sweep(cutoff)).toBe(0);
		expect(await store.load('edge')).not.toBeNull();
	});

	it('reports zero when there is nothing to remove', async () => {
		expect(await createMemoryStore().sweep(cutoff)).toBe(0);
	});

	it('leaves a run it cannot date alone rather than guessing', async () => {
		const store = createMemoryStore();
		const undated = { turnIndex: 1, state: createRun() } as unknown as SavedRun;
		await store.save('undated', undated);

		expect(await store.sweep(cutoff)).toBe(0);
		expect(await store.load('undated')).not.toBeNull();
	});

	it('dates the profile by its last write, including the finish', async () => {
		const store = createMemoryStore();
		await store.save('k', {
			turnIndex: 60,
			state: stateAt(60, 'resolve', 7),
			updatedAt: '2025-06-01T00:00:00.000Z'
		});
		await store.save('k', doneWrite(7, '2026-06-01T00:00:00.000Z'));

		expect(await store.sweep(cutoff)).toBe(0);
		expect((await store.loadProfile('k')).archive).toHaveLength(1);
	});

	it('removes a quiet profile with its archive', async () => {
		const store = createMemoryStore();
		await store.save('k', {
			turnIndex: 60,
			state: stateAt(60, 'resolve', 7),
			updatedAt: '2025-01-01T00:00:00.000Z'
		});
		await store.save('k', doneWrite(7, '2025-06-01T00:00:00.000Z'));

		expect(await store.sweep(cutoff)).toBe(1);
		expect(await store.loadProfile('k')).toEqual({ active: null, archive: [] });
	});
});

describe('choosing the run store (ticket 32)', () => {
	const memoryStore = { kind: 'memory' } as unknown as RunStore;
	const mongoStore = { kind: 'mongo' } as unknown as RunStore;
	const calls: string[] = [];
	const stores = {
		mongo: (uri: string) => {
			calls.push(uri);
			return mongoStore;
		},
		memory: () => memoryStore
	};

	it('uses Atlas whenever a URI is configured, in dev and in production', () => {
		expect(resolveStore({ uri: 'mongodb://atlas', dev: true, allowMemory: false }, stores)).toBe(
			mongoStore
		);
		expect(resolveStore({ uri: 'mongodb://atlas', dev: false, allowMemory: false }, stores)).toBe(
			mongoStore
		);
		expect(calls).toEqual(['mongodb://atlas', 'mongodb://atlas']);
	});

	it('keeps the in-process fallback in development', () => {
		expect(resolveStore({ uri: undefined, dev: true, allowMemory: false }, stores)).toBe(
			memoryStore
		);
	});

	it('refuses to serve a production build without a URI', () => {
		expect(() => resolveStore({ uri: undefined, dev: false, allowMemory: false }, stores)).toThrow(
			/MONGODB_URI must be set in production/
		);
	});

	it('allows the in-process store only when the a11y gate opts in explicitly', () => {
		expect(resolveStore({ uri: undefined, dev: false, allowMemory: true }, stores)).toBe(
			memoryStore
		);
	});
});
