<script lang="ts">
	import { untrack } from 'svelte';
	import { applyAction, createRun } from '$lib/game/loop';
	import type { Action, RunState } from '$lib/game/types';
	import EventStep from './EventStep.svelte';
	import Hud from './Hud.svelte';
	import Intro from './Intro.svelte';
	import PlanStep from './PlanStep.svelte';
	import ResolveStep from './ResolveStep.svelte';

	let { initial = null, seed = 1 }: { initial?: RunState | null; seed?: number } = $props();

	// `$state.raw` rather than `$state`: the reducer replaces the whole state object,
	// and a deep proxy cannot be structuredClone'd (which is how the reducer copies).
	// `untrack` because the saved run is a starting point, not something to follow.
	let run = $state.raw<RunState>(untrack(() => initial ?? createRun(seed)));

	function dispatch(action: Action) {
		run = applyAction(run, action);
		// Committing at the month close is the one write per Turn (ticket 04).
		if (action.type === 'CONTINUE') void persist(run);
	}

	async function persist(state: RunState) {
		try {
			await fetch('/api/run', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ state })
			});
		} catch {
			// Offline is not fatal: the next close writes again, and the month is
			// still in memory.
		}
	}
</script>

{#if run.showIntro}
	<Intro onDone={() => dispatch({ type: 'DISMISS_INTRO' })} />
{:else}
	<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-7">
		<Hud {run} />

		{#key run.phase}
			<div class="rise">
				{#if run.phase === 'plan'}
					<PlanStep {run} {dispatch} />
				{:else if run.phase === 'event'}
					<EventStep {run} {dispatch} />
				{:else if run.phase === 'resolve'}
					<ResolveStep {run} {dispatch} />
				{:else}
					<section class="surface p-5">
						<p class="kicker">The run is over</p>
						<h2 class="mt-2 text-xl font-semibold tracking-tight">Sixty months, done.</h2>
						<p class="mt-2 text-sm text-[var(--muted)]">Your Money Story would follow here.</p>
					</section>
				{/if}
			</div>
		{/key}
	</main>
{/if}
