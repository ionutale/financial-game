import { describe, expect, it } from 'vitest';
import { createRun } from '../game/loop';
import { createMemoryStore } from './store';

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
