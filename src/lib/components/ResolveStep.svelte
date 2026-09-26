<script lang="ts">
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Money from './Money.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const locale = getLocale();
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
			{m.resolve_title({ month: run.month })}
		</h2>

		<div class="mt-3">
			<p class="kicker">{m.resolve_net_worth()}</p>
			<Money amount={change} size="hero" tone={change >= 0 ? 'up' : 'down'} sign />
		</div>

		<div class="mt-6 flex flex-col">
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_income()}</span>
				<span class="figure text-sm">{formatMoney(close.income, locale)}</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_needs()}</span>
				<span class="figure text-sm {close.adherence.need ? '' : 'text-[var(--down)]'}">
					{formatMoney(close.spentNeed, locale)}{close.adherence.need ? '' : m.resolve_over()}
				</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_wants()}</span>
				<span class="figure text-sm {close.adherence.want ? '' : 'text-[var(--down)]'}">
					{formatMoney(close.spentWant, locale)}{close.adherence.want ? '' : m.resolve_over()}
				</span>
			</div>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_obligations()}</span>
				<span class="figure text-sm">{formatMoney(close.obligations, locale)}</span>
			</div>
			{#if close.bnpl}
				<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
					<span class="text-sm text-[var(--muted)]">{m.resolve_bnpl()}</span>
					<span class="figure text-sm">
						{formatMoney(close.bnpl.fromCash + close.bnpl.fromSavings + close.bnpl.toDebt, locale)}
					</span>
				</div>
			{/if}
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_interest()}</span>
				<span class="figure text-sm {close.interest > 0 ? 'text-[var(--up)]' : ''}">
					{formatMoneyExact(close.interest, locale)}
				</span>
			</div>
			<div class="flex items-baseline justify-between py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_next_obligations()}</span>
				<span class="figure text-sm">{formatMoney(close.nextObligations, locale)}</span>
			</div>
		</div>

		{#if over}
			<p class="mt-4 rounded-lg bg-[var(--money-wash)] px-3 py-2 text-[13px] text-[var(--ink)]">
				{m.resolve_over_note()}
			</p>
		{/if}

		<button
			class="mt-6 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
			onclick={() => dispatch({ type: 'NEXT_MONTH' })}
		>
			{m.resolve_next_month()}
		</button>
	</section>
{/if}
