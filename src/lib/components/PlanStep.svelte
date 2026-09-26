<script lang="ts">
	import { expectedIncome, formatMoney, obligationsFor, stageOf } from '$lib/game/economy';
	import { planWarning, workHintVisible } from '$lib/game/presentation';
	import type { Action, RunState } from '$lib/game/types';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const stage = $derived(stageOf(run));
	const income = $derived(expectedIncome(run));
	const saving = $derived(Math.max(0, income - run.need - run.want));
	const due = $derived(obligationsFor(run));
	const warning = $derived(planWarning(run));
	const hint = $derived(workHintVisible(run));

	// The split of expected income, as widths.
	const share = (n: number) => (income > 0 ? Math.max(0, Math.min(100, (n / income) * 100)) : 0);
	const shares = $derived({
		need: share(run.need),
		want: share(run.want),
		save: share(saving)
	});

	function repeat() {
		dispatch({ type: 'REPEAT_PLAN' });
	}
	function preset503020() {
		const i = income;
		dispatch({ type: 'SET_WANT', amount: Math.round(i * 0.3) });
		dispatch({ type: 'SET_NEED', amount: Math.round(i * 0.5) });
	}
</script>

<section class="surface p-5">
	<div class="flex items-baseline justify-between">
		<h2 class="text-xl font-semibold tracking-tight">Plan the month</h2>
		{#if due > 0}
			<span class="figure text-xs text-[var(--muted)]">{formatMoney(due)} fixed</span>
		{/if}
	</div>
	<p class="mt-1 text-sm text-[var(--muted)]">
		Put the money where you want it before the month gets a say.
	</p>

	{#if hint}
		<div class="mt-6 rounded-xl border border-[var(--money-35)] bg-[var(--money-wash)] p-4">
			<p class="kicker text-[var(--money)]">{stage.name} · no allowance</p>
			<p class="mt-1.5 text-sm leading-relaxed">The allowance stopped. This year, hours are the money.</p>
			<p class="mt-1 text-xs text-[var(--muted)]">Set them before the month starts.</p>
		</div>
	{/if}

	<div class="mt-6">
		<div class="flex items-baseline justify-between">
			<span class="kicker">Work hours</span>
			<span class="figure text-sm">
				{run.hours}h
				<span class="text-[var(--muted)]">· {formatMoney(run.hours * stage.rate)}</span>
			</span>
		</div>
		<input
			type="range"
			class="mt-2 w-full accent-[var(--money)]"
			min="0"
			max={stage.freeTime}
			value={run.hours}
			oninput={(e) => dispatch({ type: 'SET_HOURS', hours: Number(e.currentTarget.value) })}
		/>
		<p class="mt-1 text-xs text-[var(--muted)]">
			Every hour worked is an hour you do not get back.
		</p>
	</div>

	<div class="mt-6">
		<span class="kicker">How income splits</span>
		<div class="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[var(--wash)]">
			<div class="h-full bg-[var(--money-35)] transition-[width] duration-300" style="width: {shares.need}%"></div>
			<div class="h-full bg-[var(--money-60)] transition-[width] duration-300" style="width: {shares.want}%"></div>
			<div class="h-full bg-[var(--money)] transition-[width] duration-300" style="width: {shares.save}%"></div>
		</div>

		<div class="mt-4 flex flex-col gap-4">
			<label class="block">
				<span class="flex items-baseline justify-between">
					<span class="kicker">Need · bills and basics</span>
					<span class="figure text-sm">{formatMoney(run.need)}</span>
				</span>
				<input
					type="range"
					class="mt-1.5 w-full accent-[var(--money)]"
					min="0"
					max={Math.max(income, 1)}
					step="5"
					value={run.need}
					oninput={(e) => dispatch({ type: 'SET_NEED', amount: Number(e.currentTarget.value) })}
				/>
			</label>

			<label class="block">
				<span class="flex items-baseline justify-between">
					<span class="kicker">Want · everything else</span>
					<span class="figure text-sm">{formatMoney(run.want)}</span>
				</span>
				<input
					type="range"
					class="mt-1.5 w-full accent-[var(--money)]"
					min="0"
					max={Math.max(income, 1)}
					step="5"
					value={run.want}
					oninput={(e) => dispatch({ type: 'SET_WANT', amount: Number(e.currentTarget.value) })}
				/>
			</label>
		</div>
	</div>

	<div class="mt-5 flex items-end justify-between border-t border-dashed border-[var(--line)] pt-4">
		<div>
			<span class="kicker">Into savings</span>
			<p class="mt-0.5 text-xs text-[var(--muted)]">the part that buys your future</p>
		</div>
		<span class="figure text-2xl font-medium text-[var(--money)]">{formatMoney(saving)}</span>
	</div>

	<div class="mt-5 flex flex-wrap gap-2">
		<button
			class="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs disabled:opacity-40"
			disabled={!run.lastPlan}
			onclick={repeat}
		>
			Keep last month
		</button>
		<button
			class="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs disabled:opacity-40"
			disabled={income <= 0}
			onclick={preset503020}
		>
			50 / 30 / 20
		</button>
	</div>

	{#if warning}
		<div class="mt-5 rounded-xl border border-dashed border-[var(--down)] px-4 py-3">
			<p class="figure text-sm text-[var(--down)]">
				{formatMoney(warning.due)} fixed · {formatMoney(warning.income)} coming in
			</p>
			<p class="mt-1 text-sm leading-snug">
				{#if warning.source === 'savings'}
					Covered from savings.
				{:else}
					The {formatMoney(warning.gap)} gap becomes debt.
				{/if}
			</p>
		</div>
	{/if}

	<button
		class="mt-5 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
		onclick={() => dispatch({ type: 'CONFIRM_PLAN' })}
	>
		Start the month
	</button>
</section>
