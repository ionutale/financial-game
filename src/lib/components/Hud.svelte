<script lang="ts">
	import { untrack } from 'svelte';
	import {
		formatMoney,
		formatMoneyExact,
		goalTarget,
		netWorth,
		savedTowardGoal,
		spendable
	} from '$lib/game/economy';
	import type { RunState } from '$lib/game/types';
	import { monthName, runYear } from '$lib/i18n/date-line';
	import { goalName, lifeLine, pathLabel, stageName, threadChip } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Avatar from './Avatar.svelte';
	import Money from './Money.svelte';

	// The Stats pill hands its element back so focus can return on close (ticket 14).
	let { run, onStats }: { run: RunState; onStats: (trigger: HTMLButtonElement) => void } =
		$props();

	const locale = getLocale();
	const name = $derived(stageName(run.stage));
	/*
	 * One authored Life Line per Stage (fun-pass ticket 04, design §3.3): what
	 * the life outside money is, this year. Text only, never a wellbeing stat.
	 */
	const life = $derived(lifeLine(run.stage));
	const free = $derived(Math.max(0, Math.round(run.freeTime)));
	const goal = $derived(goalTarget(run));
	const saved = $derived(savedTowardGoal(run));
	const pct = $derived(Math.max(0, Math.min(100, (saved / goal) * 100)));
	const thread = $derived(threadChip(run));

	/*
	 * The Named Goal's quarter ticks (gamification ticket 06): decoration at
	 * 25 / 50 / 75 / 100 %, aria-hidden, while the accessible reading of the
	 * goal stays the money text below — unchanged.
	 */
	const TICKS = [25, 50, 75, 100] as const;

	/*
	 * A short emphasis when a tick lands. The effect compares the rendered
	 * percentage with the previous one, so a month that pushes savings over a
	 * quarter earns one pulse — never a timer, never a loop, and nothing on
	 * first load. `untrack` keeps the write out of the effect's dependencies.
	 */
	let lastPct: number | null = null;
	let landings = $state(0);

	$effect(() => {
		const current = pct;
		if (lastPct !== null && TICKS.some((tick) => lastPct! < tick && current >= tick)) {
			untrack(() => (landings += 1));
		}
		lastPct = current;
	});

	/*
	 * A changed figure flashes once (fun-pass ticket 04, “money moves”): the
	 * effect compares each rendered figure with the previous render and bumps a
	 * counter the markup keys on, so the one-shot animation replays. UI state
	 * only, never part of RunState, and the final value is in the DOM at all
	 * times — nothing counts up.
	 */
	let previous: { netWorth: number | null; cash: number | null; freeTime: number | null } = {
		netWorth: null,
		cash: null,
		freeTime: null
	};
	let netFlash = $state(0);
	let cashFlash = $state(0);
	let freeFlash = $state(0);

	$effect(() => {
		const now = { netWorth: netWorth(run), cash: spendable(run), freeTime: free };
		const before = previous;
		untrack(() => {
			if (before.netWorth !== null && now.netWorth !== before.netWorth) netFlash += 1;
			if (before.cash !== null && now.cash !== before.cash) cashFlash += 1;
			if (before.freeTime !== null && now.freeTime !== before.freeTime) freeFlash += 1;
		});
		previous = now;
	});
</script>

<header class="flex flex-col gap-6">
	<!-- You: the person, the date and the Stage — not a countdown. -->
	<div class="flex items-start gap-3" role="group" aria-labelledby="hud-you">
		<div class="h-11 w-11 shrink-0 rounded-full bg-[var(--wash)] p-1.5 text-[var(--ink-40)]">
			<Avatar stage={run.stage} />
		</div>
		<div class="min-w-0 flex-1">
			<p class="kicker text-[var(--ink)]" id="hud-you">{m.hud_band_you()}</p>
			<!-- The Run starts in September, so the school years line up with the
			     Stages; the date turns once, on the month's own change. -->
			{#key run.month}
				<p class="time-turn figure mt-1 text-sm">
					{m.hud_date({
						age: run.age,
						year: runYear(run.month),
						month: monthName(run.month, locale)
					})}
				</p>
			{/key}
			<p class="truncate text-sm">
				{run.path
					? m.hud_stage_path({ stage: name, path: pathLabel(run.path) })
					: name}
			</p>
			<p class="mt-1.5 text-sm leading-snug text-[var(--muted)]">{life}</p>
		</div>
		<button
			class="min-h-11 shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-xs font-semibold transition active:scale-[0.99]"
			onclick={(e) => onStats(e.currentTarget)}
		>
			{m.hud_stats()}
		</button>
	</div>

	<!-- The money: the hero, the Named Goal, and the two live figures. -->
	<div class="flex flex-col gap-5" role="group" aria-labelledby="hud-money">
		<div>
			<p class="kicker text-[var(--ink)]" id="hud-money">{m.hud_band_money()}</p>
			<p class="kicker mt-3">{m.hud_net_worth()}</p>
			{#key netFlash}
				<span class="rounded-md {netFlash > 0 ? 'money-flash' : ''}">
					<Money amount={netWorth(run)} size="hero" />
				</span>
			{/key}
		</div>

		<div>
			<div class="relative h-1.5 overflow-hidden rounded-full bg-[var(--wash)]">
				<div
					class="h-full rounded-full bg-[var(--money)] transition-[width] duration-500 ease-out"
					style="width: {pct}%"
				></div>
				<!--
					The quarter ticks (gamification ticket 06): decoration only, hidden
					from assistive tech. The goal's value is the fill plus the money text
					below — this layer adds no meaning and no progressbar role.
				-->
				<div id="goal-ticks" class="absolute inset-0" aria-hidden="true">
					{#each TICKS as tick (tick)}
						<span
							class="absolute top-0 h-full w-px bg-[var(--ink-25)] {tick === 100
								? '-translate-x-full'
								: ''}"
							style="left: {tick}%"
						></span>
					{/each}
				</div>
				{#if landings > 0}
					{#key landings}
						<span class="goal-pulse absolute inset-0" aria-hidden="true"></span>
					{/key}
				{/if}
			</div>
			<div class="mt-2 flex items-baseline justify-between">
				<span class="kicker">{goalName(run)}</span>
				<span class="figure text-xs text-[var(--muted)]">
					{formatMoneyExact(saved, locale)} / {formatMoney(goal, locale)}
				</span>
			</div>
		</div>

		<div class="flex flex-wrap gap-8">
			<div>
				<p class="kicker">{m.hud_cash()}</p>
				{#key cashFlash}
					<span class="rounded-md {cashFlash > 0 ? 'money-flash' : ''}">
						<Money amount={spendable(run)} size="lg" />
					</span>
				{/key}
			</div>
			<div>
				<p class="kicker">{m.hud_free_time()}</p>
				{#key freeFlash}
					<span class="rounded-md {freeFlash > 0 ? 'money-flash' : ''}">
						<span class="figure text-2xl font-medium">
							{free}<span class="text-base text-[var(--muted)]">h</span>
						</span>
					</span>
				{/key}
			</div>
		</div>
	</div>

	<!-- The world: what the Run is carrying, in people and promises. -->
	<div class="flex flex-col gap-2" role="group" aria-labelledby="hud-world">
		<p class="kicker text-[var(--ink)]" id="hud-world">{m.hud_band_world()}</p>
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
	</div>
</header>
