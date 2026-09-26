import type { SavedRun } from './store';

/** The published shape of a profile export (ticket 12). */
export interface ProfileExport {
	format: 'financial-game-profile-export';
	version: 1;
	exportedAt: string;
	note: string;
	run: SavedRun | null;
}

/**
 * Everything the game holds for one Anonymous Profile: the saved Run, if there
 * is one. The raw cookie and its digest are deliberately not part of this
 * shape — the export is the player's data, not the key that finds it (ticket 12).
 */
export function buildProfileExport(saved: SavedRun | null, exportedAt: string): ProfileExport {
	return {
		format: 'financial-game-profile-export',
		version: 1,
		exportedAt,
		note: 'Everything the game stores for this device: the saved Run, if there is one. There is no account, no name, no email and no tracking.',
		run: saved
	};
}
