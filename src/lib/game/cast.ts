/**
 * The Cast (fun-pass ticket 07, design §3.4): five recurring people — Priya,
 * Ravi, Danny, Mum, Grandma — written with their own wants and never carrying
 * a lesson. This module is the cast's language-neutral half: who exists, which
 * deck cards are theirs, and how a finished Run's Cast derives from its log
 * alone (never a new stored field, so old saves render by construction).
 *
 * The mapping is authored, not a deck field (the deck schema is frozen); the
 * tests pin both directions — every listed card is real, every person has two
 * or three appearances — and `castFor` reads the log defensively, like every
 * other derivation. Player-facing names live in the catalogues as `cast_<id>`
 * and are identical in every locale.
 */

import type { RunState } from './types';

export const CAST_IDS = ['priya', 'ravi', 'danny', 'mum', 'grandma'] as const;

export type CastId = (typeof CAST_IDS)[number];

/**
 * The cards each person appears in — the deck's shipped faces (voice.md §7)
 * plus the ticket-07 continuity. Two or three each; a Run meets whoever its
 * draw deals, and the Journal reports exactly that.
 */
export const CAST_APPEARANCES: Record<CastId, readonly string[]> = {
	priya: ['course_pays_off', 'priya_shift_swap', 'priya_swap_back'],
	ravi: ['overtime_offer', 'ravi_needs_cover', 'ravi_returns_favour'],
	danny: ['app_tip', 'app_vanishes', 'danny_flat_night'],
	mum: ['mum_late_pay', 'mum_pays_back', 'mum_late_week'],
	grandma: ['grandma_windfall', 'grandma_asks_help', 'grandma_sends_thanks']
};

/** The person a deck card belongs to, or undefined for the cards nobody owns. */
const FACE_OF = new Map<string, CastId>(
	CAST_IDS.flatMap((id) => CAST_APPEARANCES[id].map((cardId) => [cardId, id] as const))
);

/**
 * The people a Run has met, in the order the log first names them. A legacy
 * save with no log has met nobody; a card the deck no longer carries names
 * nobody.
 */
export function castFor(run: Pick<RunState, 'log'>): CastId[] {
	const met: CastId[] = [];
	const seen = new Set<CastId>();
	for (const entry of run.log ?? []) {
		const person = FACE_OF.get(entry.card);
		if (!person || seen.has(person)) continue;
		seen.add(person);
		met.push(person);
	}
	return met;
}
