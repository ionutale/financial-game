/**
 * The Journal (gamification tickets 03 and 05, fun-pass ticket 07). Ticket 03's
 * half is Concept Coverage: which of the eight Concepts a Run has **Introduced**
 * (the Stage that unlocks it has opened) and **Experienced** (an Event Card
 * carrying it has been played). Ticket 05's half is the cross-Run record: the
 * Chapters — every finished Run in the order lived, with its Outcome Band,
 * Turning Points, Milestones, seed, finish date and **Cast** (the people its log
 * names, fun-pass ticket 07) — the across-Run Concept Coverage, the collected
 * Milestones (including the cross-Run `both_paths`), and the header summary.
 * Exposure and memory, never performance or ranking.
 *
 * Derived from the stored record only — the Stage ladder, the play log with
 * the deck's tags, and the profile archive — and never persisted (ADR-0002),
 * so old saves render by construction. Pure and dependency-light, in the
 * `metrics.ts` / `stats.ts` tradition. The Journal is a view over the archive,
 * so export, delete-everything and the retention sweep already cover it.
 */

import { cardById } from './cards';
import { castFor, type CastId } from './cast';
import { STAGES } from './economy';
import { outcomeBand, turningPoints, type OutcomeBand, type TurningPoint } from './metrics';
import {
	earnedMilestones,
	MILESTONE_IDS,
	type EarnedMilestone,
	type MilestoneId
} from './milestones';
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

/**
 * The coverage display map (fun-pass ticket 02, design §6): the catalogue key
 * for a state's player-facing word. The internal states keep their names
 * (Introduce/Experience are the model's vocabulary); only the words the player
 * reads change — Introduced → “coming up”, Experienced → “met”, locked → “later”.
 */
export function coverageStateKey(
	state: ConceptCoverageState
): 'coverage_coming_up' | 'coverage_met' | 'coverage_later' {
	if (state === 'experienced') return 'coverage_met';
	if (state === 'introduced') return 'coverage_coming_up';
	return 'coverage_later';
}

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

/**
 * The cross-Run Milestone ids — the one recognition that needs more than a
 * single Run: `both_paths`, earned once the archive holds a finished Study Run
 * and a finished Work Run. Language-neutral ids; the copy lives in the
 * catalogues as `milestone_<id>` in en/it/ro, like the in-Run twelve.
 */
export const CROSS_RUN_MILESTONE_IDS = ['both_paths'] as const;

export type CrossRunMilestoneId = (typeof CROSS_RUN_MILESTONE_IDS)[number];

/** A Milestone the Journal can collect: an in-Run id or the cross-Run one. */
export type CollectedMilestoneId = MilestoneId | CrossRunMilestoneId;

/** The stronger state a Concept reached across Runs, for the union. */
const COVERAGE_RANK: Record<ConceptCoverageState, number> = {
	locked: 0,
	introduced: 1,
	experienced: 2
};

/**
 * The union of several Runs' Concept Coverage (ticket 05): a Concept
 * Experienced in any Run counts as met; otherwise the strongest state any Run
 * reached wins. Built on `conceptCoverage` — per-Run coverage is never
 * re-derived here — and read defensively, like every record read.
 */
export function coverageAcross(
	runs: Array<Pick<RunState, 'stage' | 'log'>>
): ConceptCoverageEntry[] {
	const reached = new Map<ConceptId, ConceptCoverageState>();
	for (const run of runs) {
		for (const { concept, state } of conceptCoverage(run)) {
			const best = reached.get(concept);
			if (best === undefined || COVERAGE_RANK[state] > COVERAGE_RANK[best]) {
				reached.set(concept, state);
			}
		}
	}

	return CONCEPT_IDS.map((concept) => ({
		concept,
		state: reached.get(concept) ?? 'locked'
	}));
}

/**
 * One finished Run as the profile archive stores it. Restated here, instead of
 * imported from the server store, so the game module stays free of server
 * imports; the two shapes are structurally identical.
 */
export interface ArchivedRunLike {
	state: RunState;
	seed: number;
	finishedAt: string;
}

/** One finished Run as the Journal records it (CONTEXT.md: Chapter). */
export interface JournalChapter {
	/** The seed the Run was played from. */
	seed: number;
	/** When the Run ended, an ISO 8601 UTC string. */
	finishedAt: string;
	/** Ahead / Treading water / Behind — from the money, never behaviour. */
	band: OutcomeBand;
	/** The flagged moments the Money Story narrates, in order. */
	turningPoints: TurningPoint[];
	/** The Run's earned Milestones, oldest first. */
	milestones: EarnedMilestone[];
	/**
	 * The people the Run met, in the order the log first names them (fun-pass
	 * ticket 07). Derived from the log alone; a legacy Chapter has met nobody.
	 */
	cast: CastId[];
}

/** The Journal's header: how much of the story there is, and how much met. */
export interface JournalSummary {
	/** Finished Runs — the Chapters shown. */
	runsFinished: number;
	/** Concepts Experienced in any Run: exposure, never mastery. */
	conceptsMet: number;
	/** The whole curriculum, so the header reads "7 / 8" without magic numbers. */
	conceptsTotal: number;
}

/** The Journal: a pure projection over the active Run and the archive. */
export interface Journal {
	summary: JournalSummary;
	/** Every finished Run, in the order lived — never ranked. */
	chapters: JournalChapter[];
	coverage: ConceptCoverageEntry[];
	collectedMilestones: CollectedMilestoneId[];
}

/**
 * The stored record, read defensively: a legacy save may miss any of the
 * collections, exactly as `milestones.ts` tolerates (`run.thread ?? null`).
 */
function readRecord(state: RunState): RunState {
	return {
		...state,
		log: state.log ?? [],
		flags: state.flags ?? [],
		history: state.history ?? []
	};
}

/** Oldest first: ISO 8601 UTC strings sort in time order, and the sort is stable. */
function livedOrder(a: ArchivedRunLike, b: ArchivedRunLike): number {
	if (a.finishedAt === b.finishedAt) return 0;
	return a.finishedAt < b.finishedAt ? -1 : 1;
}

function toChapter(entry: ArchivedRunLike): JournalChapter {
	const run = readRecord(entry.state);
	return {
		seed: entry.seed,
		finishedAt: entry.finishedAt,
		band: outcomeBand(run),
		turningPoints: turningPoints(run),
		milestones: earnedMilestones(run),
		cast: castFor(run)
	};
}

/** `both_paths`: the archive holds a finished Study Run and a finished Work Run. */
function bothPathsLived(archive: ArchivedRunLike[]): boolean {
	const paths = new Set(archive.map((entry) => entry.state.path));
	return paths.has('study') && paths.has('work');
}

/**
 * The Journal (ticket 05): Chapters for every finished Run in the order lived,
 * the across-Run Concept Coverage, the collected Milestones — the union over
 * the archive and the Run in progress, plus `both_paths` once both paths are
 * finished records — and the header summary.
 *
 * The Run in progress is a Run the player is living: its Concepts count as met
 * and its Milestones as collected. It is not a Chapter yet, and `both_paths`
 * waits for the archive to hold both paths — the recognition of a finished arc.
 */
export function buildJournal(active: RunState | null, archive: ArchivedRunLike[]): Journal {
	const chapters = [...archive].sort(livedOrder).map(toChapter);

	const runs = [
		...archive.map((entry) => readRecord(entry.state)),
		...(active ? [readRecord(active)] : [])
	];
	const coverage = coverageAcross(runs);

	const earned = new Set<MilestoneId>();
	for (const run of runs) {
		for (const milestone of earnedMilestones(run)) earned.add(milestone.id);
	}

	return {
		summary: {
			runsFinished: chapters.length,
			conceptsMet: coverage.filter((c) => c.state === 'experienced').length,
			conceptsTotal: coverage.length
		},
		chapters,
		coverage,
		collectedMilestones: [
			...MILESTONE_IDS.filter((id) => earned.has(id)),
			...(bothPathsLived(archive) ? CROSS_RUN_MILESTONE_IDS : [])
		]
	};
}
