/**
 * Concept Coverage (gamification ticket 03): which of the eight Concepts the
 * current Run has **Introduced** (the Stage that unlocks it has opened) and
 * **Experienced** (an Event Card carrying it has been played). Exposure, never
 * performance — no mastery claim and no bar to fill (CONTEXT.md).
 *
 * Derived from the stored record only — the Stage ladder and the play log with
 * the deck's tags — and never persisted (ADR-0002), so old saves render by
 * construction. Pure and dependency-light, in the `metrics.ts` / `stats.ts`
 * tradition. Ticket 05 builds the across-Run coverage on the same types.
 */

import { cardById } from './cards';
import { STAGES } from './economy';
import type { ConceptId, RunState } from './types';

/** The ladder's Stages, ascending; their Concepts are the curriculum order. */
const STAGE_NUMBERS = Object.keys(STAGES)
	.map(Number)
	.sort((a, b) => a - b);

/** The eight Concepts, each exactly once, in the order the ladder introduces them. */
export const CONCEPT_IDS: readonly ConceptId[] = [
	...new Set(STAGE_NUMBERS.flatMap((stage) => STAGES[stage].concepts))
];

/** The first Stage whose ladder lists a Concept — where it becomes Introduced. */
const INTRODUCED_AT = new Map<ConceptId, number>();
for (const stage of STAGE_NUMBERS) {
	for (const concept of STAGES[stage].concepts) {
		if (!INTRODUCED_AT.has(concept)) INTRODUCED_AT.set(concept, stage);
	}
}

export type ConceptCoverageState = 'experienced' | 'introduced' | 'locked';

/** One Concept and what the current Run has done with it. */
export interface ConceptCoverageEntry {
	concept: ConceptId;
	state: ConceptCoverageState;
}

/** The Concepts a played card carried, from the log and the current deck. */
function experiencedConcepts(run: Pick<RunState, 'log'>): Set<ConceptId> {
	const experienced = new Set<ConceptId>();
	// Old saves may have no log, and a save can name a card the deck no longer
	// carries; both stay readable rather than throwing.
	for (const entry of run.log ?? []) {
		const concept = cardById(entry.card)?.concept;
		if (concept) experienced.add(concept);
	}
	return experienced;
}

/**
 * Every Concept with its state for the current Run: Experienced (a played card
 * carried it, whatever the Stage), else Introduced (its Stage has opened), else
 * locked — a neutral state that names nothing the Stage-up banner has not
 * already announced. Ladder order, so the section reads as the curriculum.
 */
export function conceptCoverage(run: Pick<RunState, 'stage' | 'log'>): ConceptCoverageEntry[] {
	// A legacy save with no stage is read as the Run's first Stage, like `log ?? []`.
	const stage = run.stage ?? 1;
	const experienced = experiencedConcepts(run);

	return CONCEPT_IDS.map((concept) => {
		if (experienced.has(concept)) return { concept, state: 'experienced' };
		const introducedAt = INTRODUCED_AT.get(concept);
		return {
			concept,
			state: introducedAt !== undefined && introducedAt <= stage ? 'introduced' : 'locked'
		};
	});
}
