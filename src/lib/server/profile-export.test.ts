import { describe, expect, it } from 'vitest';
import { createRun } from '../game/loop';
import { buildProfileExport } from './profile-export';

describe('the profile export payload', () => {
	it('names itself and carries the export time', () => {
		const payload = buildProfileExport(null, '2026-09-26T10:00:00.000Z');
		expect(payload.format).toBe('financial-game-profile-export');
		expect(payload.version).toBe(1);
		expect(payload.exportedAt).toBe('2026-09-26T10:00:00.000Z');
		expect(payload.run).toBeNull();
	});

	it('carries the saved run exactly as the store held it', () => {
		const saved = { turnIndex: 7, state: createRun(), updatedAt: '2026-09-01T00:00:00.000Z' };
		const payload = buildProfileExport(saved, '2026-09-26T10:00:00.000Z');

		expect(payload.run).toEqual(saved);
		expect(payload.run?.turnIndex).toBe(7);
	});

	it('does not echo the cookie or its digest', () => {
		const saved = { turnIndex: 1, state: createRun(), updatedAt: 'x' };
		const json = JSON.stringify(buildProfileExport(saved, 'now'));

		expect(json).not.toContain('profileKey');
		expect(json).not.toContain('fg_profile');
	});
});
