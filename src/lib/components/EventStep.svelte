<script lang="ts">
	import { playCue } from '$lib/audio/sfx';
	import { beatArtFor } from '$lib/game/beats';
	import { formatMoney } from '$lib/game/economy';
	import { isFirstEncounter } from '$lib/game/presentation';
	import type { Action, Choice, RunState } from '$lib/game/types';
	import {
		cardOdds,
		cardSituation,
		cardTitle,
		chosenFeedbackParts,
		choiceLabel
	} from '$lib/i18n/card-text';
	import { chipsFor } from '$lib/i18n/chips';
	import { kindLabel } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import BeatArt from './BeatArt.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const locale = getLocale();
	const card = $derived(run.card);
	/*
	 * The two parts of the Feedback (ADR-0004, ticket 02): the Reaction first,
	 * then the Why under "Why it happened". The Why opens by itself at the
	 * Concept's first encounter and stays collapsed after (*taught once,
	 * trusted after*); with no Reaction authored, today's single paragraph
	 * renders exactly as it always has.
	 */
	const feedback = $derived(chosenFeedbackParts(card, run.chosen));
	const whyOpen = $derived(isFirstEncounter(run));

	function blocked(c: Choice): boolean {
		const hours = c.freeTime ?? 0;
		return hours < 0 && Math.abs(hours) > run.freeTime;
	}

	function choose(choiceId: string) {
		playCue('choice');
		dispatch({ type: 'CHOOSE', choiceId });
	}
</script>

{#if card}
	{@const odds = cardOdds(card)}
	<!-- Art only at the beats (ticket 30), never on every card; the Fork's own
	     illustration belongs to StageUp, which renders this component too. -->
	{@const art = card.kind === 'stage_up' ? null : beatArtFor(card.id)}
	<section class="surface p-5">
		{#if art}
			<div class="mb-5">
				<BeatArt beat={art} />
			</div>
		{/if}

		<p class="kicker">{kindLabel(card.kind)}</p>
		<h2 class="mt-2 text-xl leading-snug font-semibold tracking-tight">{cardTitle(card)}</h2>
		<p class="mt-3 text-[15px] leading-relaxed">{cardSituation(card)}</p>

		{#if odds}
			<p class="mt-3 border-l-2 border-[var(--line)] pl-3 text-xs text-[var(--muted)]">
				{odds}
			</p>
		{/if}

		{#if !run.chosen}
			<div class="mt-6 flex flex-col gap-2.5">
				{#each card.choices as c (c.id)}
					{@const chips = chipsFor(c, run.insurance)}
					{@const off = blocked(c)}
					<button
						class="group w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-left transition
							{off ? 'opacity-40' : 'hover:border-[var(--ink-25)] active:scale-[0.995]'}"
						disabled={off}
						onclick={() => choose(c.id)}
					>
						<span class="block text-[15px] font-medium">{choiceLabel(card, c)}</span>
						<span class="mt-1.5 flex flex-wrap items-center gap-1.5">
							{#if chips.length}
								{#each chips as chip (chip)}
									<span
										class="figure rounded-full bg-[var(--wash)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
									>
										{chip}
									</span>
								{/each}
							{:else}
								<span class="text-[11px] text-[var(--muted)]">{m.event_no_cost()}</span>
							{/if}
						</span>
						{#if off}
							<span class="mt-1.5 block text-[11px] text-[var(--down)]">
								{m.event_blocked()}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if feedback}
			<div class="mt-6 border-l-2 border-[var(--money)] pl-4" aria-live="polite">
				{#if feedback.reaction}
					<p class="kicker">{m.event_what_happened()}</p>
					<p class="mt-2 text-[15px] leading-relaxed">{feedback.reaction}</p>

					<!--
						The Why is a disclosure, not a hidden lesson (ADR-0004):
						open at the Concept's first encounter, collapsed after. The
						summary carries the words; the opening is native and works
						with no JavaScript.
					-->
					<details class="mt-3" open={whyOpen}>
						<summary class="w-fit cursor-pointer text-sm font-semibold text-[var(--money)]">
							{m.event_why_it_happened()}
						</summary>
						<p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">{feedback.why}</p>
					</details>
				{:else}
					<!-- No Reaction authored: today's exact rendering, byte for byte. -->
					<p class="kicker">{m.event_what_happened()}</p>
					<p class="mt-2 text-[15px] leading-relaxed">{feedback.why}</p>
				{/if}

				{#if run.cascade && run.cascade.toDebt > 0}
					<p class="mt-3 text-[13px] text-[var(--down)]">
						{m.event_cascade_debt({
							from: formatMoney(run.cascade.fromSave, locale),
							to: formatMoney(run.cascade.toDebt, locale)
						})}
					</p>
				{:else if run.cascade && run.cascade.fromSave > 0}
					<p class="mt-3 text-[13px] text-[var(--down)]">
						{m.event_cascade_save({ from: formatMoney(run.cascade.fromSave, locale) })}
					</p>
				{/if}
			</div>

			<button
				class="mt-6 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
				onclick={() => dispatch({ type: 'CONTINUE' })}
			>
				{m.event_continue()}
			</button>
		{/if}
	</section>
{/if}
