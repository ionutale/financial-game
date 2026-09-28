<script lang="ts">
	import { untrack } from 'svelte';
	import { cueFor } from '$lib/audio/moments';
	import { playCue } from '$lib/audio/sfx';
	import { ledgerEntries, type LedgerEntry } from '$lib/game/ledger';
	import type { ChapterRef } from '$lib/game/journal';
	import { applyAction, createRun } from '$lib/game/loop';
	import { freshSeed } from '$lib/game/rng';
	import type { Action, RunState } from '$lib/game/types';
	import EventStep from './EventStep.svelte';
	import Hud from './Hud.svelte';
	import Intro from './Intro.svelte';
	import MoneyStory from './MoneyStory.svelte';
	import PlanStep from './PlanStep.svelte';
	import ResolveStep from './ResolveStep.svelte';
	import StageUp from './StageUp.svelte';
	import StatsSheet from './StatsSheet.svelte';

	let { initial = null, seed = 1, chapters = [] }: { initial?: RunState | null; seed?: number; chapters?: ChapterRef[] } = $props();

	// `$state.raw` rather than `$state`: the reducer replaces the whole state object,
	// and a deep proxy cannot be structuredClone'd (which is how the reducer copies).
	// `untrack` because the saved run is a starting point, not something to follow.
	let run = $state.raw<RunState>(untrack(() => initial ?? createRun(seed)));

	// The Stats Sheet is UI state only (ticket 20) — it must never reach RunState.
	let statsOpen = $state(false);
	let statsTrigger: HTMLButtonElement | null = null;

	/*
	 * The Ledger Line (fun-pass ticket 04, design §3.3): computed here, at the
	 * Month Screen edge, from the two RunStates the reducer returns — no new
	 * field, no economy recomputation. UI state only; the Feedback renders it
	 * inside the existing polite region.
	 */
	let ledger = $state.raw<LedgerEntry[] | null>(null);

	// Whether the end-of-run write landed, for the Money Story's quiet line.
	let saved = $state<'saving' | 'saved' | 'offline'>('saving');

	function openStats(trigger: HTMLButtonElement) {
		statsTrigger = trigger;
		statsOpen = true;
	}

	function closeStats() {
		statsOpen = false;
		statsTrigger?.focus();
	}

	function dispatch(action: Action) {
		const before = run;
		const after = applyAction(run, action);
		run = after;
		if (action.type === 'CHOOSE') ledger = ledgerEntries(before, after);

		/*
		 * Ticket 30's cues, mapped by the dispatch's own before/after (fun-pass
		 * ticket 04 moved the mapping to `audio/moments`): the AudioContext is
		 * only ever created inside a click, and each cue is a quiet
		 * confirmation of something already visible — none is needed to play.
		 * A Milestone month hears the single rising note instead of the close's
		 * two ticks; the deal replaces nothing, the crash keeps its own sound,
		 * and a Thread that comes back with money answers with the payoff.
		 */
		const cue = cueFor(before, after, action);
		if (cue) playCue(cue);

		// Committing at the month close is the one write per Turn (ticket 04); a
		// Stage-up happens mid-month and stays client-side. Finishing the Run is
		// one extra terminal write (ticket 23): it archives the Run server-side
		// and frees the profile, so the replay persists from month 1.
		if (action.type === 'CONTINUE' && run.phase === 'resolve') void persist(run);
		if (action.type === 'NEXT_MONTH' && run.phase === 'done') {
			const finished = run;
			void persist(finished).then((ok) => (saved = ok ? 'saved' : 'offline'));
		}
	}

	async function persist(state: RunState): Promise<boolean> {
		try {
			const response = await fetch('/api/run', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ state })
			});
			return response.ok;
		} catch {
			// Offline is not fatal: the next close writes again, and the month is
			// still in memory. A failed finish says so on the Money Story; a reload
			// resumes the last closed month and lets it land again.
			return false;
		}
	}
</script>

{#if run.showIntro}
	<Intro onDone={() => dispatch({ type: 'DISMISS_INTRO' })} />
{:else if run.phase === 'done'}
	<MoneyStory {run} {saved} {chapters} onNewRun={() => dispatch({ type: 'NEW_RUN', seed: freshSeed() })} />
{:else}
	<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-7">
		<Hud {run} onStats={openStats} />

		{#key run.phase}
			<div class="rise">
				{#if run.phase === 'stage_up'}
					<StageUp {run} {dispatch} {ledger} />
				{:else if run.phase === 'plan'}
					<PlanStep {run} {dispatch} />
				{:else if run.phase === 'event'}
					<EventStep {run} {dispatch} {ledger} />
				{:else if run.phase === 'resolve'}
					<ResolveStep {run} {dispatch} />
				{/if}
			</div>
		{/key}

		{#if statsOpen}
			<StatsSheet {run} onClose={closeStats} />
		{/if}
	</main>
{/if}
