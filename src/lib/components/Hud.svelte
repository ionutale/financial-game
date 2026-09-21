<script lang="ts">
	import { available, formatMoney, goalTarget, netWorth, STAGES } from '$lib/game/economy';
	import type { RunState } from '$lib/game/types';

	let { run }: { run: RunState } = $props();

	const stage = $derived(STAGES[run.stage]);
	const goal = $derived(goalTarget(run));
	const saved = $derived(run.savings + run.fund);
	const pct = $derived(Math.max(0, Math.min(100, Math.round((saved / goal) * 100))));
</script>

<header class="flex flex-col gap-3">
	<div class="grid grid-cols-3 gap-2">
		<div class="rounded-xl border border-base-300 px-3 py-2">
			<div class="text-[10px] tracking-wide uppercase opacity-50">Cash</div>
			<div class="text-lg tabular-nums">{formatMoney(available(run))}</div>
		</div>
		<div class="rounded-xl border border-base-300 px-3 py-2">
			<div class="text-[10px] tracking-wide uppercase opacity-50">Net worth</div>
			<div class="text-lg tabular-nums">{formatMoney(netWorth(run))}</div>
		</div>
		<div class="rounded-xl border border-base-300 px-3 py-2">
			<div class="text-[10px] tracking-wide uppercase opacity-50">Free time</div>
			<div class="text-lg tabular-nums">{Math.max(0, Math.round(run.freeTime))}h</div>
		</div>
	</div>

	<div>
		<div class="h-2 overflow-hidden rounded-full bg-base-200">
			<div class="h-full bg-primary transition-[width] duration-300" style="width: {pct}%"></div>
		</div>
		<div class="mt-1 flex justify-between text-xs opacity-60">
			<span>{run.stage === 5 && run.path === 'study' ? 'Buffer' : 'Emergency fund'}</span>
			<span class="tabular-nums">{formatMoney(saved)} / {formatMoney(goal)}</span>
		</div>
	</div>

	{#if run.bnpl}
		<div class="badge badge-primary badge-sm">
			Open thread — {run.bnpl.monthsLeft} payments of {formatMoney(run.bnpl.amount)} left
		</div>
	{/if}

	<p class="text-xs tracking-wide uppercase opacity-50">
		Month {run.month} of 60 · age {run.age} · {stage.name}{run.path ? ` · ${run.path}` : ''}
	</p>
</header>
