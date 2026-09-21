<script lang="ts">
	import { formatMoney, goalTarget, netWorth, savedTowardGoal, spendable, STAGES } from '$lib/game/economy';
	import type { RunState } from '$lib/game/types';
	import Avatar from './Avatar.svelte';
	import Money from './Money.svelte';

	let { run }: { run: RunState } = $props();

	const stage = $derived(STAGES[run.stage]);
	const goal = $derived(goalTarget(run));
	const saved = $derived(savedTowardGoal(run));
	const pct = $derived(Math.max(0, Math.min(100, (saved / goal) * 100)));
</script>

<header class="flex flex-col gap-6">
	<div class="flex items-center gap-3">
		<div class="h-11 w-11 shrink-0 rounded-full bg-[var(--wash)] p-1.5 text-[var(--ink-40)]">
			<Avatar stage={run.stage} />
		</div>
		<div class="min-w-0">
			<p class="kicker">Month {run.month} of 60</p>
			<p class="truncate text-sm">
				{run.age} · {stage.name}{run.path ? ` · ${run.path}` : ''}
			</p>
		</div>
	</div>

	<div>
		<p class="kicker">Net worth</p>
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
			<span class="kicker">{run.stage === 5 && run.path === 'study' ? 'Buffer' : 'Emergency fund'}</span>
			<span class="figure text-xs text-[var(--muted)]">
				{formatMoney(saved)} / {formatMoney(goal)}
			</span>
		</div>
	</div>

	<div class="flex gap-8">
		<div>
			<p class="kicker">Cash</p>
			<Money amount={spendable(run)} size="lg" />
		</div>
		<div>
			<p class="kicker">Free time</p>
			<p class="figure text-2xl font-medium">
				{Math.max(0, Math.round(run.freeTime))}<span class="text-base text-[var(--muted)]">h</span>
			</p>
		</div>
	</div>

	{#if run.bnpl}
		<p
			class="w-fit rounded-full bg-[var(--money-wash)] px-3 py-1 text-xs text-[var(--money)]"
		>
			Open thread — {run.bnpl.monthsLeft} payments of {formatMoney(run.bnpl.amount)} left
		</p>
	{/if}
</header>
