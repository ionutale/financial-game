<script lang="ts">
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import { milestonesNewThisMonth } from '$lib/game/milestones';
	import type { Action, RunState } from '$lib/game/types';
	import { milestoneLabel } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Money from './Money.svelte';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const locale = getLocale();
	const close = $derived(run.close);
	const change = $derived(close ? close.monthChange : 0);
	const over = $derived(close ? (!close.adherence.need || !close.adherence.want) : false);
	/*
	 * The Milestones whose condition first held this month (gamification
	 * ticket 01). Quiet plain text inside the close's labelled region: no live
	 * region, no timer, no colour-only meaning, and the source of truth is the
	 * record, so the line cannot repeat in a later month.
	 */
	const milestones = $derived(milestonesNewThisMonth(run).map(milestoneLabel));
	/*
	 * The receipt's tail (fun-pass ticket 04, design §3.3): a Debt line
	 * whenever Debt is non-zero, and the Fund row only when the Fund holds
	 * money — with `fund: 0` it must not render (ticket 09 grows the Fund).
	 */
	const debt = $derived(run.debt);
	const fund = $derived(run.fund);

	/*
	 * The close appears only after CONTINUE, so nothing is still being read
	 * when it arrives. Focus the heading rather than live-announcing the whole
	 * sheet: the heading names the screen, and Tab from it lands on Next
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

		{#if milestones.length}
			<!-- The line eases in (app.css, reduced-motion-gated): emphasis
			     only — the words are the announcement, and nothing dismisses it. -->
			<p class="milestone-land mt-2 text-sm text-[var(--money)]">
				{m.resolve_milestone({ names: milestones.join(', ') })}
			</p>
		{/if}

		<div class="mt-3">
			<p class="kicker">{m.resolve_net_worth()}</p>
			<!-- The Tally's figure: one flash as the month's money lands (fun-pass
			     ticket 04). Never a count-up — the final value is the only value. -->
			<span class="money-flash inline-block rounded-md">
				<Money amount={change} size="hero" tone={change >= 0 ? 'up' : 'down'} sign />
			</span>
		</div>

		<!--
			The receipt (fun-pass ticket 04): the same rows, no figures removed
			and nothing folded, grouped In / Out / Next month so the month reads
			like a receipt. The Debt and Fund rows report the balances the Run
			carries into next month, and only when they are real.
		-->
		<div class="mt-6 flex flex-col">
			<p class="kicker">{m.resolve_group_in()}</p>
			<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_income()}</span>
				<span class="figure text-sm">{formatMoney(close.income, locale)}</span>
			</div>
			<div class="flex items-baseline justify-between py-2">
				<span class="text-sm text-[var(--muted)]">{m.resolve_interest()}</span>
				<span class="figure text-sm {close.interest > 0 ? 'text-[var(--up)]' : ''}">
					{formatMoneyExact(close.interest, locale)}
				</span>
			</div>

			<p class="kicker mt-5">{m.resolve_group_out()}</p>
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
			<div
				class="flex items-baseline justify-between py-2
					{close.bnpl ? 'border-b border-dashed border-[var(--line)]' : ''}"
			>
				<span class="text-sm text-[var(--muted)]">{m.resolve_obligations()}</span>
				<span class="figure text-sm">{formatMoney(close.obligations, locale)}</span>
			</div>
			{#if close.bnpl}
				<div class="flex items-baseline justify-between py-2">
					<span class="text-sm text-[var(--muted)]">{m.resolve_bnpl()}</span>
					<span class="figure text-sm">
						{formatMoneyExact(
							close.bnpl.fromCash + close.bnpl.fromSavings + close.bnpl.toDebt,
							locale
						)}
					</span>
				</div>
			{/if}

			<p class="kicker mt-5">{m.resolve_group_next()}</p>
			<div
				class="flex items-baseline justify-between py-2
					{debt > 0 || fund > 0 ? 'border-b border-dashed border-[var(--line)]' : ''}"
			>
				<span class="text-sm text-[var(--muted)]">{m.resolve_next_obligations()}</span>
				<span class="figure text-sm">{formatMoney(close.nextObligations, locale)}</span>
			</div>
			{#if debt > 0}
				<div
					class="flex items-baseline justify-between py-2
						{fund > 0 ? 'border-b border-dashed border-[var(--line)]' : ''}"
				>
					<span class="text-sm text-[var(--muted)]">{m.stats_row_debt()}</span>
					<span class="figure text-sm text-[var(--down)]">{formatMoney(debt, locale)}</span>
				</div>
			{/if}
			{#if fund > 0}
				<div class="flex items-baseline justify-between py-2">
					<span class="text-sm text-[var(--muted)]">{m.stats_row_fund()}</span>
					<span class="figure text-sm">{formatMoneyExact(fund, locale)}</span>
				</div>
			{/if}
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
