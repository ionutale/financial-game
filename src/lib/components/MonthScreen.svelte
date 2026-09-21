<script lang="ts">
	import { applyAction, createRun } from '$lib/game/loop';
	import type { Action, RunState } from '$lib/game/types';
	import EventStep from './EventStep.svelte';
	import Hud from './Hud.svelte';
	import PlanStep from './PlanStep.svelte';
	import ResolveStep from './ResolveStep.svelte';

	// `$state.raw` rather than `$state`: the reducer replaces the whole state object,
	// and a deep proxy cannot be structuredClone'd (which is how the reducer copies).
	let run = $state.raw<RunState>(createRun());

	function dispatch(action: Action) {
		run = applyAction(run, action);
	}
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col gap-4 p-5">
	<Hud {run} />

	{#if run.phase === 'plan'}
		<PlanStep {run} {dispatch} />
	{:else if run.phase === 'event'}
		<EventStep {run} {dispatch} />
	{:else if run.phase === 'resolve'}
		<ResolveStep {run} {dispatch} />
	{:else}
		<section class="card border border-base-300 bg-base-100">
			<div class="card-body p-4">
				<h2 class="font-semibold">Run over</h2>
				<p class="text-sm opacity-60">That is month 60 — the Money Story follows.</p>
			</div>
		</section>
	{/if}
</main>
