<script lang="ts">
	import { untrack } from 'svelte';
	import { playCue } from '$lib/audio/sfx';
	import { applyAction, createRun } from '$lib/game/loop';
	import { milestonesNewThisMonth } from '$lib/game/milestones';
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

	let { initial = null, seed = 1 }: { initial?: RunState | null; seed?: number } = $props();

	// `$state.raw` rather than `$state`: the reducer replaces the whole state object,
	// and a deep proxy cannot be structuredClone'd (which is how the reducer copies).
	// `untrack` because the saved run is a starting point, not something to follow.
	let run = $state.raw<RunState>(untrack(() => initial ?? createRun(seed)));

	// The Stats Sheet is UI state only (ticket 20) — it must never reach RunState.
	let statsOpen = $state(false);
	let statsTrigger: HTMLButtonElement | null = null;

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
		run = applyAction(run, action);
		// Ticket 30: the cues ride the gestures that cause them, so the AudioContext
		// is only ever created inside a click. Each is a quiet confirmation of
		// something already visible; none of them is needed to play.
		// Gamification ticket 06: a Milestone month hears the single rising note
		// instead of the close's two ticks — one cue, still off by default.
		if (action.type === 'CONTINUE' && run.phase === 'resolve') {
			playCue(milestonesNewThisMonth(run).length ? 'milestone' : 'month_close');
		}
		if (action.type === 'NEXT_MONTH' && run.phase === 'stage_up') playCue('stage_up');
		if (action.type === 'CONFIRM_PLAN' && run.card?.id === 'the_crash') playCue('crash');
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
	<MoneyStory {run} {saved} onNewRun={() => dispatch({ type: 'NEW_RUN', seed: freshSeed() })} />
{:else}
	<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-7">
		<Hud {run} onStats={openStats} />

		{#key run.phase}
			<div class="rise">
				{#if run.phase === 'stage_up'}
					<StageUp {run} {dispatch} />
				{:else if run.phase === 'plan'}
					<PlanStep {run} {dispatch} />
				{:else if run.phase === 'event'}
					<EventStep {run} {dispatch} />
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
