<script lang="ts">
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';
	import Money from './Money.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const close = $derived(run.close);
	const change = $derived(close ? close.monthChange : 0);
	const over = $derived(close ? (!close.adherence.need || !close.adherence.want) : false);

	/*
	 * The close appears only after CONTINUE, so nothing is still being read
	 * when it arrives. Focus the heading rather than live-announcing the whole
	 * sheet: the heading names the screen, and Tab from it lands on Next month
	 * (ticket 14: a labelled region that receives focus, no focus trap).
	 */
	let heading = $state<HTMLHeadingElement | null>(null);

	$effect(() => {
		heading?.focus();
	});
</script>

{#if close}
	<section class="surface p-5" aria-labelledby="month-close-title">
		<h2 id="month-close-title" class="kicker" tabindex="-1" bind:this={heading}>
			Month {run.month} closes
		</h2>

		<div class="mt-3">
			<p class="kicker">Net worth this month</p>
			<Money amount={change} size="hero" tone={change >= 0 ? 'up' : 'down'} sign />
		</div>

		<div class="mt-6 flex flex-col">
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">Income landed</span>
				<span class="figure text-sm">{formatMoney(close.income)}</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">Spent on needs</span>
				<span class="figure text-sm {close.adherence.need ? '' : 'text-[var(--down)]'}">
					{formatMoney(close.spentNeed)}{close.adherence.need ? '' : ' · over'}
				</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">Spent on wants</span>
				<span class="figure text-sm {close.adherence.want ? '' : 'text-[var(--down)]'}">
					{formatMoney(close.spentWant)}{close.adherence.want ? '' : ' · over'}
				</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">Obligations paid</span>
				<span class="figure text-sm">{formatMoney(close.obligations)}</span>
			</div>
			{#if close.bnpl}
				<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
					<span class="text-sm text-[var(--muted)]">BNPL instalment</span>
					<span class="figure text-sm">
						{formatMoney(close.bnpl.fromCash + close.bnpl.fromSavings + close.bnpl.toDebt)}
					</span>
				</div>
			{/if}
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">Interest credited</span>
				<span class="figure text-sm {close.interest > 0 ? 'text-[var(--up)]' : ''}">
					{formatMoneyExact(close.interest)}
				</span>
			</div>
			<div class="flex items-baseline justify-between py-2">
				<span class="text-sm text-[var(--muted)]">Next month’s obligations</span>
				<span class="figure text-sm">{formatMoney(close.nextObligations)}</span>
			</div>
		</div>

		{#if over}
			<p class="mt-4 rounded-lg bg-[var(--money-wash)] px-3 py-2 text-[13px] text-[var(--ink)]">
				You went past one of your envelopes this month. That is allowed — the cascade covered it —
				but the money came from somewhere.
			</p>
		{/if}

		<button
			class="mt-6 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
			onclick={() => dispatch({ type: 'NEXT_MONTH' })}
		>
			Next month
		</button>
	</section>
{/if}
