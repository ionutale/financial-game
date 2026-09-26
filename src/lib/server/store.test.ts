import { describe, expect, it } from 'vitest';
import { createRun } from '../game/loop';
import { createMemoryStore, type SavedRun } from './store';

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

	it('forgets everything on request', async () => {
		const store = createMemoryStore();
		await store.save('k', { turnIndex: 1, state: createRun(), updatedAt: 'x' });
		await store.remove('k');
		expect(await store.load('k')).toBeNull();
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
});
