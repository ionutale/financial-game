<script lang="ts">
	/**
	 * The Stage-up interstitial (ticket 02, ticket 18): a Stage announces itself
	 * before its first Plan, and the Fork carries its own illustration (ticket 30).
	 */
	import { beatArtFor } from '$lib/game/beats';
	import { STAGES } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';
	import { conceptLabel, stageName } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import BeatArt from './BeatArt.svelte';
	import EventStep from './EventStep.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const stage = $derived(STAGES[run.stage]);
	const name = $derived(stageName(run.stage));
	const unlocks = $derived(stage.concepts.map((c) => conceptLabel(c)).join(' · '));
	const art = $derived(run.card ? beatArtFor(run.card.id) : null);
</script>

{#if art}
	<div class="mb-4">
		<BeatArt beat={art} />
	</div>
{/if}

<div class="rounded-xl bg-[var(--money-wash)] px-4 py-3">
	<p class="kicker text-[var(--money)]">
		{m.stage_up_title({ stage: run.stage, name, age: run.age })}
	</p>
	<p class="mt-1.5 text-sm leading-relaxed">{m.stage_up_unlocks({ concepts: unlocks })}</p>
</div>

<EventStep {run} {dispatch} />

<style>
	/* The banner sits above the card with the month screen's rhythm. */
	div + :global(section) {
		margin-top: 1.75rem;
	}
</style>
