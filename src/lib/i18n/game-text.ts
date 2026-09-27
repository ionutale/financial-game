/**
 * Names the game shows for its own vocabulary — Concepts, Stages, Threads,
 * paths, flags, outcome bands (ticket 26). The glossary in CONTEXT.md is the
 * source of truth for the English wording; everything here comes from the
 * message catalogue, so only ids stay in TypeScript.
 */
import { threadDue, THREADS } from '$lib/game/threads';
import {
	coverageStateKey,
	type ConceptCoverageState,
	type CrossRunMilestoneId
} from '$lib/game/journal';
import type { MilestoneId } from '$lib/game/milestones';
import type { CardKind, ConceptId, PathId, RunState } from '$lib/game/types';
import type { ComparisonId, OutcomeBand } from '$lib/game/metrics';
import { message } from './messages';

export function conceptLabel(id: ConceptId): string {
	return message(`concept_${id}`);
}

/**
 * A Concept Coverage state's player-facing word (fun-pass ticket 02, design
 * §6): “coming up” / “met” / “later”, from the display map in `journal.ts`.
 */
export function coverageStateLabel(state: ConceptCoverageState): string {
	return message(coverageStateKey(state));
}

export function stageName(stage: number): string {
	return message(`stage_${stage}_name`);
}

export function pathLabel(path: PathId): string {
	return message(`path_${path}`);
}

/** The Named Goal's player-facing name: a Buffer on the Study path (ticket 21). */
export function goalName(state: Pick<RunState, 'stage' | 'path'>): string {
	return state.stage === 5 && state.path === 'study'
		? message('goal_buffer')
		: message('goal_emergency_fund');
}

export function bandLabel(band: OutcomeBand): string {
	return message(`band_${band}`);
}

const KIND_KEYS: Record<CardKind, string> = {
	decision: 'kind_your_call',
	risk_moment: 'kind_your_call',
	scam: 'kind_your_call',
	shock: 'kind_out_of_nowhere',
	stage_up: 'kind_new_stage'
};

export function kindLabel(kind: CardKind): string {
	return message(KIND_KEYS[kind]);
}

export function threadLabel(id: string): string {
	return message(`thread_${id}_label`);
}

export function threadPayoff(id: string): string {
	return message(`thread_${id}_payoff`);
}

/**
 * The persistent Month Screen chip (ticket 04), counting down. It names what is
 * coming, never what it will do.
 */
export function threadChipText(id: string, months: number): string {
	const when = months > 0 ? message('thread_due', { months }) : message('thread_due_now');
	return message('thread_chip', {
		label: threadLabel(id),
		payoff: threadPayoff(id),
		when
	});
}

/** The chip for the Run's live Thread, or null when none is live. */
export function threadChip(run: Pick<RunState, 'thread' | 'month'>): string | null {
	if (!run.thread) return null;
	const spec = THREADS[run.thread.id];
	if (!spec) return null;
	return threadChipText(run.thread.id, threadDue(run.thread) - run.month);
}

/** A Milestone's player-facing name — the in-Run ids and the cross-Run `both_paths` (tickets 01/05). */
export function milestoneLabel(id: MilestoneId | CrossRunMilestoneId): string {
	return message(`milestone_${id}`);
}

const COMPARISON_KEYS: Record<ComparisonId, string> = {
	adherence: 'comparison_adherence',
	savings_rate: 'comparison_savings_rate',
	want_share: 'comparison_want_share'
};

export function comparisonLabel(id: ComparisonId): string {
	return message(COMPARISON_KEYS[id]);
}

const FLAG_KEYS: Record<string, string> = {
	overdraft: 'flag_overdraft',
	minimum_payment: 'flag_minimum_payment',
	card_issued: 'flag_card_issued',
	'fork:study': 'flag_fork_study',
	'fork:work': 'flag_fork_work'
};

/** A Turning Point's prose, or null for a flag the story has no words for. */
export function flagText(kind: string, month: number): string | null {
	const key = FLAG_KEYS[kind];
	return key ? message(key, { month }) : null;
}
