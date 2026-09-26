<script lang="ts">
	import { formatMoney } from '$lib/game/economy';
	import { chipsFor } from '$lib/game/presentation';
	import type { Action, Choice, RunState } from '$lib/game/types';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const card = $derived(run.card);

	// A scam card must never announce itself as one.
	const KIND: Record<string, string> = {
		decision: 'Your call',
		risk_moment: 'Your call',
		scam: 'Your call',
		shock: 'Out of nowhere',
		stage_up: 'A new stage'
	};

	function blocked(c: Choice): boolean {
		const hours = c.freeTime ?? 0;
		return hours < 0 && Math.abs(hours) > run.freeTime;
	}
</script>

{#if card}
	<section class="surface p-5">
		<p class="kicker">{KIND[card.kind] ?? 'Your call'}</p>
		<h2 class="mt-2 text-xl leading-snug font-semibold tracking-tight">{card.title}</h2>
		<p class="mt-3 text-[15px] leading-relaxed">{card.situation}</p>

		{#if card.odds}
			<p class="mt-3 border-l-2 border-[var(--line)] pl-3 text-xs text-[var(--muted)]">
				{card.odds}
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
						onclick={() => dispatch({ type: 'CHOOSE', choiceId: c.id })}
					>
						<span class="block text-[15px] font-medium">{c.label}</span>
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
								<span class="text-[11px] text-[var(--muted)]">no cost now</span>
							{/if}
						</span>
						{#if off}
							<span class="mt-1.5 block text-[11px] text-[var(--down)]">
								Not enough free time — you cannot borrow hours.
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if run.feedback}
			<div class="mt-6 border-l-2 border-[var(--money)] pl-4" aria-live="polite">
				<p class="kicker">What happened</p>
				<p class="mt-2 text-[15px] leading-relaxed">{run.feedback}</p>

				{#if run.cascade && run.cascade.toDebt > 0}
					<p class="mt-3 text-[13px] text-[var(--down)]">
						The cascade: {formatMoney(run.cascade.fromSave)} came out of the Save envelope, and
						{formatMoney(run.cascade.toDebt)} went onto Debt.
					</p>
				{:else if run.cascade && run.cascade.fromSave > 0}
					<p class="mt-3 text-[13px] text-[var(--down)]">
						The cascade: {formatMoney(run.cascade.fromSave)} came out of the Save envelope.
					</p>
				{/if}
			</div>

			<button
				class="mt-6 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
				onclick={() => dispatch({ type: 'CONTINUE' })}
			>
				Continue
			</button>
		{/if}
	</section>
{/if}
