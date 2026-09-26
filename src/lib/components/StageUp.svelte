<script lang="ts">
	/**
	 * The Stage-up interstitial (ticket 02, ticket 18): a Stage announces itself
	 * before its first Plan. Only the Fork ships so far; the other four Stages
	 * still open silently.
	 */
	import { CONCEPT_LABEL, STAGES } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';
	import EventStep from './EventStep.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const stage = $derived(STAGES[run.stage]);
	const unlocks = $derived(stage.concepts.map((c) => CONCEPT_LABEL[c]).join(' · '));
</script>

<div class="rounded-xl bg-[var(--money-wash)] px-4 py-3">
	<p class="kicker text-[var(--money)]">Stage {run.stage} · {stage.name} · age {run.age}</p>
	<p class="mt-1.5 text-sm leading-relaxed">Unlocks {unlocks}</p>
</div>

<EventStep {run} {dispatch} />

<style>
	/* The banner sits above the card with the month screen's rhythm. */
	div + :global(section) {
		margin-top: 1.75rem;
	}
</style>
