<script lang="ts">
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import { computeMetrics, outcomeBand, turningPoints } from '$lib/game/metrics';
	import type { RunState } from '$lib/game/types';
	import { bandLabel, comparisonLabel, flagText, goalName } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Money from './Money.svelte';
	import Sparkline from './Sparkline.svelte';

	let {
		run,
		onNewRun,
		saved
	}: {
		run: RunState;
		onNewRun: () => void;
		saved: 'saving' | 'saved' | 'offline';
	} = $props();

	const locale = getLocale();
	const band = $derived(outcomeBand(run));
	const metrics = $derived(computeMetrics(run));
	const moments = $derived(
		turningPoints(run)
			.map((moment) => ({ ...moment, text: flagText(moment.kind, moment.month) }))
			.filter((moment): moment is { month: number; kind: string; text: string } => moment.text !== null)
	);

	const asMonths = (v: number) => m.story_months_of_12({ months: Math.round(v) });
	const asPct = (v: number) => m.story_percent({ percent: Math.round(v * 100) });

	const story = $derived([
		run.debt > 0
			? m.story_opening_debt({
					start: formatMoney(60, locale),
					final: formatMoney(metrics.finalNetWorth, locale),
					debt: formatMoney(run.debt, locale)
				})
			: m.story_opening_free({
					start: formatMoney(60, locale),
					final: formatMoney(metrics.finalNetWorth, locale)
				}),
		m.story_adherence({ months: metrics.adherenceTotal }),
		band === 'ahead'
			? m.story_band_ahead()
			: band === 'treading'
				? m.story_band_treading()
				: m.story_band_behind()
	]);
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-7">
	<section>
		<p class="kicker">{m.story_kicker()}</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			{m.story_title()}
		</h1>

		<div class="mt-5 flex flex-col gap-3">
			{#each story as line, i (i)}
				<p class="text-[15px] leading-relaxed">{line}</p>
			{/each}
		</div>

		<div class="mt-6 flex items-center gap-3">
			<span
				class="rounded-full px-3 py-1 text-xs font-semibold"
				style="background: {band === 'behind'
					? 'rgb(173 79 28 / 0.12)'
					: band === 'ahead'
						? 'rgb(22 121 74 / 0.12)'
						: 'var(--money-wash)'};
					color: {band === 'behind' ? 'var(--down)' : band === 'ahead' ? 'var(--up)' : 'var(--money)'}"
			>
				{bandLabel(band)}
			</span>
			<span class="text-xs text-[var(--muted)]">{m.story_band_note()}</span>
		</div>
	</section>

	{#if moments.length}
		<section>
			<p class="kicker">{m.story_moments()}</p>
			<div class="mt-4 flex flex-col gap-4">
				{#each moments as moment (moment.month + ':' + moment.kind)}
					<div class="border-l-2 border-[var(--line)] pl-4">
						<p class="text-sm leading-relaxed">{moment.text}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<p class="kicker">{m.story_you_vs_you()}</p>
		<p class="mt-1 text-sm text-[var(--muted)]">{m.story_you_vs_you_note()}</p>

		<div class="mt-4 flex flex-col gap-5">
			{#each metrics.comparisons as c (c.id)}
				{@const now = c.kind === 'months' ? c.y5 / 12 : c.y5}
				{@const then = c.kind === 'months' ? c.y1 / 12 : c.y1}
				<div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm">{comparisonLabel(c.id)}</span>
						<span class="figure text-sm">
							{c.kind === 'months' ? asMonths(c.y5) : asPct(c.y5)}
						</span>
					</div>
					<div class="mt-2 flex flex-col gap-1">
						<div class="h-2 overflow-hidden rounded-full bg-[var(--wash)]">
							<div class="h-full rounded-full bg-[var(--money)]" style="width: {Math.min(100, now * 100)}%"></div>
						</div>
						<div class="h-2 overflow-hidden rounded-full bg-[var(--wash)]">
							<div
								class="h-full rounded-full bg-[var(--ink-25)]"
								style="width: {Math.min(100, then * 100)}%"
							></div>
						</div>
					</div>
					<div class="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
						<span>{m.story_year_1({ value: c.kind === 'months' ? asMonths(c.y1) : asPct(c.y1) })}</span>
						<span>{m.story_year_5({ value: c.kind === 'months' ? asMonths(c.y5) : asPct(c.y5) })}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<p class="kicker">{m.story_numbers()}</p>
		<div class="mt-4">
			<Sparkline points={metrics.trajectory} />
			<div class="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
				<span>{m.story_age_14()}</span><span>{m.story_sparkline_caption()}</span><span>{m.story_age_19()}</span>
			</div>
		</div>

		<dl class="mt-5 flex flex-col">
			{#each [
				{ k: m.story_row_adherence(), v: `${metrics.adherenceTotal} / 60` },
				{ k: m.story_row_savings_rate(), v: asPct(metrics.savingsRate) },
				{ k: m.story_row_want_share(), v: asPct(metrics.wantShare) },
				{
					k: m.story_row_debt(),
					v: m.story_row_debt_value({
						taken: formatMoney(metrics.debtTaken, locale),
						peak: formatMoney(metrics.peakDebt, locale)
					})
				},
				{
					k: goalName(run),
					v: `${formatMoneyExact(metrics.goalProgress, locale)} / ${formatMoney(metrics.goalTarget, locale)}`
				},
				{ k: m.story_row_net_worth(), v: formatMoney(metrics.finalNetWorth, locale) },
				{
					k: m.story_row_score(),
					v: metrics.finalScore === null ? m.story_score_none() : String(metrics.finalScore)
				}
			] as row (row.k)}
				<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
					<dt class="text-sm text-[var(--muted)]">{row.k}</dt>
					<dd class="figure text-sm">{row.v}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section>
		<p class="kicker">{m.story_what_next()}</p>
		<p class="mt-2 text-sm text-[var(--muted)]">{m.story_what_next_body()}</p>
		<p class="mt-2 text-xs leading-relaxed" aria-live="polite">
			{#if saved === 'saved'}
				<span class="text-[var(--muted)]">{m.story_saved()}</span>
			{:else if saved === 'offline'}
				<span class="text-[var(--down)]">{m.story_offline()}</span>
			{:else}
				<span class="text-[var(--muted)]">{m.story_saving()}</span>
			{/if}
		</p>
		<button
			class="mt-4 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
			onclick={onNewRun}
		>
			{m.story_play_again()}
		</button>
		<a
			class="mt-3 inline-block text-sm text-[var(--muted)] underline underline-offset-2"
			href="/settings"
		>
			{m.link_settings()}
		</a>
	</section>
</main>
