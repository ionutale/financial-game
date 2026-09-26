<script lang="ts">
	import {
		formatMoney,
		formatMoneyExact,
		goalTarget,
		netWorth,
		savedTowardGoal,
		spendable
	} from '$lib/game/economy';
	import type { RunState } from '$lib/game/types';
	import { goalName, pathLabel, stageName, threadChip } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Avatar from './Avatar.svelte';
	import Money from './Money.svelte';

	// The Stats pill hands its element back so focus can return on close (ticket 14).
	let { run, onStats }: { run: RunState; onStats: (trigger: HTMLButtonElement) => void } =
		$props();

	const locale = getLocale();
	const name = $derived(stageName(run.stage));
	const goal = $derived(goalTarget(run));
	const saved = $derived(savedTowardGoal(run));
	const pct = $derived(Math.max(0, Math.min(100, (saved / goal) * 100)));
	const thread = $derived(threadChip(run));
</script>

<header class="flex flex-col gap-6">
	<div class="flex items-center gap-3">
		<div class="h-11 w-11 shrink-0 rounded-full bg-[var(--wash)] p-1.5 text-[var(--ink-40)]">
			<Avatar stage={run.stage} />
		</div>
		<div class="min-w-0 flex-1">
			<p class="kicker">{m.hud_month_of_60({ month: run.month })}</p>
			<p class="truncate text-sm">
				{run.path
					? m.hud_age_stage_path({ age: run.age, stage: name, path: pathLabel(run.path) })
					: m.hud_age_stage({ age: run.age, stage: name })}
			</p>
		</div>
		<button
			class="min-h-11 shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-semibold transition active:scale-[0.99]"
			onclick={(e) => onStats(e.currentTarget)}
		>
			{m.hud_stats()}
		</button>
	</div>

	<div>
		<p class="kicker">{m.hud_net_worth()}</p>
		<Money amount={netWorth(run)} size="hero" />
	</div>

	<div>
		<div class="h-1.5 overflow-hidden rounded-full bg-[var(--wash)]">
			<div
				class="h-full rounded-full bg-[var(--money)] transition-[width] duration-500 ease-out"
				style="width: {pct}%"
			></div>
		</div>
		<div class="mt-2 flex items-baseline justify-between">
			<span class="kicker">{goalName(run)}</span>
			<span class="figure text-xs text-[var(--muted)]">
				{formatMoneyExact(saved, locale)} / {formatMoney(goal, locale)}
			</span>
		</div>
	</div>

	<div class="flex gap-8">
		<div>
			<p class="kicker">{m.hud_cash()}</p>
			<Money amount={spendable(run)} size="lg" />
		</div>
		<div>
			<p class="kicker">{m.hud_free_time()}</p>
			<p class="figure text-2xl font-medium">
				{Math.max(0, Math.round(run.freeTime))}<span class="text-base text-[var(--muted)]">h</span>
			</p>
		</div>
	</div>

	{#if thread}
		<p class="w-fit rounded-full bg-[var(--money-wash)] px-3 py-1 text-xs text-[var(--money)]">
			{thread}
		</p>
	{/if}

	{#if run.bnpl}
		<p
			class="w-fit rounded-full bg-[var(--money-wash)] px-3 py-1 text-xs text-[var(--money)]"
		>
			{m.hud_bnpl({ months: run.bnpl.monthsLeft, amount: formatMoney(run.bnpl.amount, locale) })}
		</p>
	{/if}
</header>
