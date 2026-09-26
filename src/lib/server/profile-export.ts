import type { ArchivedRun, SavedRun } from './store';

/** The published shape of a profile export (tickets 12, 23). */
export interface ProfileExport {
	format: 'financial-game-profile-export';
	version: 1;
	exportedAt: string;
	note: string;
	run: SavedRun | null;
	archive: ArchivedRun[];
}

/**
 * Everything the game holds for one Anonymous Profile: the active Run, if there
 * is one, and the finished Runs archived for replay. The raw cookie and its
 * digest are deliberately not part of this shape — the export is the player's
 * data, not the key that finds it (ticket 12).
 */
export function buildProfileExport(
	run: SavedRun | null,
	archive: ArchivedRun[],
	exportedAt: string
): ProfileExport {
	return {
		format: 'financial-game-profile-export',
		version: 1,
		exportedAt,
		note: 'Everything the game stores for this device: the active Run, if there is one, and the finished Runs kept for replay. There is no account, no name, no email and no tracking.',
		run,
		archive
	};
}
