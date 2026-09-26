<script lang="ts">
	import { expectedIncome, formatMoney, obligationsFor, stageOf } from '$lib/game/economy';
	import { planWarning, workHintVisible } from '$lib/game/presentation';
	import type { Action, RunState } from '$lib/game/types';
	import { stageName } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const locale = getLocale();
	const stage = $derived(stageOf(run));
	const name = $derived(stageName(run.stage));
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
		<h2 class="text-xl font-semibold tracking-tight">{m.plan_title()}</h2>
		{#if due > 0}
			<span class="figure text-xs text-[var(--muted)]">
				{m.plan_fixed({ amount: formatMoney(due, locale) })}
			</span>
		{/if}
	</div>
	<p class="mt-1 text-sm text-[var(--muted)]">{m.plan_subtitle()}</p>

	{#if hint}
		<div class="mt-6 rounded-xl border border-[var(--money-35)] bg-[var(--money-wash)] p-4">
			<p class="kicker text-[var(--money)]">{m.plan_hint_kicker({ stage: name })}</p>
			<p class="mt-1.5 text-sm leading-relaxed">{m.plan_hint_body()}</p>
			<p class="mt-1 text-xs text-[var(--muted)]">{m.plan_hint_note()}</p>
		</div>
	{/if}

	<div class="mt-6">
		<div class="flex items-baseline justify-between">
			<label class="kicker" for="work-hours">{m.plan_work_hours()}</label>
			<span class="figure text-sm">
				{run.hours}h
				<span class="text-[var(--muted)]">· {formatMoney(run.hours * stage.rate, locale)}</span>
			</span>
		</div>
		<input
			id="work-hours"
			type="range"
			class="mt-2 w-full accent-[var(--money)]"
			aria-describedby="work-hours-hint"
			min="0"
			max={stage.freeTime}
			value={run.hours}
			oninput={(e) => dispatch({ type: 'SET_HOURS', hours: Number(e.currentTarget.value) })}
		/>
		<p id="work-hours-hint" class="mt-1 text-xs text-[var(--muted)]">
			{m.plan_work_hours_hint()}
		</p>
	</div>

	<div class="mt-6">
		<span class="kicker">{m.plan_split()}</span>
		<div class="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[var(--wash)]">
			<div class="h-full bg-[var(--money-35)] transition-[width] duration-300" style="width: {shares.need}%"></div>
			<div class="h-full bg-[var(--money-60)] transition-[width] duration-300" style="width: {shares.want}%"></div>
			<div class="h-full bg-[var(--money)] transition-[width] duration-300" style="width: {shares.save}%"></div>
		</div>

		<div class="mt-4 flex flex-col gap-4">
			<label class="block">
				<span class="flex items-baseline justify-between">
					<span class="kicker">{m.plan_need()}</span>
					<span class="figure text-sm">{formatMoney(run.need, locale)}</span>
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
					<span class="kicker">{m.plan_want()}</span>
					<span class="figure text-sm">{formatMoney(run.want, locale)}</span>
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
			<span class="kicker">{m.plan_saving()}</span>
			<p class="mt-0.5 text-xs text-[var(--muted)]">{m.plan_saving_note()}</p>
		</div>
		<span class="figure text-2xl font-medium text-[var(--money)]">
			{formatMoney(saving, locale)}
		</span>
	</div>

	<div class="mt-5 flex flex-wrap gap-2">
		<button
			class="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs disabled:opacity-40"
			disabled={!run.lastPlan}
			onclick={repeat}
		>
			{m.plan_repeat()}
		</button>
		<button
			class="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs disabled:opacity-40"
			disabled={income <= 0}
			onclick={preset503020}
		>
			{m.plan_preset()}
		</button>
	</div>

	{#if warning}
		<div class="mt-5 rounded-xl border border-dashed border-[var(--down)] px-4 py-3">
			<p class="figure text-sm text-[var(--down)]">
				{m.plan_warning_line({
					due: formatMoney(warning.due, locale),
					income: formatMoney(warning.income, locale)
				})}
			</p>
			<p class="mt-1 text-sm leading-snug">
				{#if warning.source === 'savings'}
					{m.plan_warning_covered()}
				{:else}
					{m.plan_warning_debt({ gap: formatMoney(warning.gap, locale) })}
				{/if}
			</p>
		</div>
	{/if}

	<button
		class="mt-5 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
		onclick={() => dispatch({ type: 'CONFIRM_PLAN' })}
	>
		{m.plan_start()}
	</button>
</section>
