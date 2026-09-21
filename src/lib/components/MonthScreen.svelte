<script lang="ts">
	import { applyAction, createRun } from '$lib/game/loop';
	import type { Action, RunState } from '$lib/game/types';
	import EventStep from './EventStep.svelte';
	import Hud from './Hud.svelte';
	import Intro from './Intro.svelte';
	import PlanStep from './PlanStep.svelte';
	import ResolveStep from './ResolveStep.svelte';

	// `$state.raw` rather than `$state`: the reducer replaces the whole state object,
	// and a deep proxy cannot be structuredClone'd (which is how the reducer copies).
	let run = $state.raw<RunState>(createRun());

	function dispatch(action: Action) {
		run = applyAction(run, action);
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
