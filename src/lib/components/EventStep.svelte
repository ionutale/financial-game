<script lang="ts">
	import { formatMoney } from '$lib/game/economy';
	import { chipsFor } from '$lib/game/presentation';
	import type { Action, Choice, RunState } from '$lib/game/types';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const card = $derived(run.card);

	function blocked(c: Choice): boolean {
		const hours = c.freeTime ?? 0;
		return hours < 0 && Math.abs(hours) > run.freeTime;
	}
</script>

{#if card}
	<section class="card border border-base-300 bg-base-100">
		<div class="card-body gap-4 p-4">
			<div>
				<h2 class="font-semibold">{card.title}</h2>
				<p class="mt-1 text-sm">{card.situation}</p>
				{#if card.odds}
					<p class="mt-2 text-xs opacity-60">{card.odds}</p>
				{/if}
			</div>

			{#if !run.chosen}
				<div class="flex flex-col gap-2">
					{#each card.choices as c (c.id)}
						{@const chips = chipsFor(c, run.insurance)}
						<button
							class="btn btn-outline h-auto justify-start py-3 text-left"
							disabled={blocked(c)}
							onclick={() => dispatch({ type: 'CHOOSE', choiceId: c.id })}
						>
							<span class="flex flex-col items-start gap-1">
								<span class="font-semibold">{c.label}</span>
								<span class="text-xs font-normal opacity-60">
									{chips.length ? chips.join(' · ') : 'no cost now'}
								</span>
								{#if blocked(c)}
									<span class="text-xs font-normal text-warning">
										Not enough free time — you cannot borrow hours.
									</span>
								{/if}
							</span>
						</button>
					{/each}
				</div>
			{/if}

			{#if run.feedback}
				<div class="border-l-2 border-primary bg-primary/5 p-3 text-sm">{run.feedback}</div>

				{#if run.cascade && run.cascade.toDebt > 0}
					<p class="text-xs text-warning">
						Cascade: {formatMoney(run.cascade.fromSave)} came out of the Save envelope, {formatMoney(
							run.cascade.toDebt
						)} went onto Debt.
					</p>
				{:else if run.cascade && run.cascade.fromSave > 0}
					<p class="text-xs text-warning">
						Cascade: {formatMoney(run.cascade.fromSave)} came out of the Save envelope.
					</p>
				{/if}

				<button class="btn btn-primary" onclick={() => dispatch({ type: 'CONTINUE' })}>
					Continue
				</button>
			{/if}
		</div>
	</section>
{/if}
