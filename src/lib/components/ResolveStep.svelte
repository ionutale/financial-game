<script lang="ts">
	import { formatMoney } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const close = $derived(run.close);
	const change = $derived(close ? close.netWorthAfter - close.netWorthBefore : 0);
</script>

{#if close}
	<section class="card border border-base-300 bg-base-100">
		<div class="card-body gap-1 p-4">
			<h2 class="mb-2 font-semibold">Month {run.month} closes</h2>

			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Income landed</span>
				<span class="tabular-nums">{formatMoney(close.income)}</span>
			</div>
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Spent — Need</span>
				<span class="tabular-nums">
					{formatMoney(close.spentNeed)}{close.adherence.need ? '' : ' · over'}
				</span>
			</div>
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Spent — Want</span>
				<span class="tabular-nums">
					{formatMoney(close.spentWant)}{close.adherence.want ? '' : ' · over'}
				</span>
			</div>
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Obligations paid</span>
				<span class="tabular-nums">{formatMoney(close.obligations)}</span>
			</div>
			{#if close.bnpl}
				<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
					<span class="opacity-60">BNPL instalment</span>
					<span class="tabular-nums">
						{formatMoney(close.bnpl.fromCash + close.bnpl.fromSavings + close.bnpl.toDebt)}
					</span>
				</div>
			{/if}
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Interest credited</span>
				<span class="tabular-nums">{formatMoney(close.interest)}</span>
			</div>
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Net worth change</span>
				<span class="tabular-nums {change >= 0 ? 'text-success' : 'text-warning'}">
					{change >= 0 ? '+' : '\u2212'}{formatMoney(Math.abs(change))}
				</span>
			</div>
			<div class="flex justify-between border-b border-dashed border-base-300 py-1 text-sm">
				<span class="opacity-60">Next month’s obligations</span>
				<span class="tabular-nums">{formatMoney(close.nextObligations)}</span>
			</div>

			<button class="btn btn-primary mt-3" onclick={() => dispatch({ type: 'NEXT_MONTH' })}>
				Next month
			</button>
		</div>
	</section>
{/if}
