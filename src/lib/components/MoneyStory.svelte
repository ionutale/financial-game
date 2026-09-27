<script lang="ts">
	/**
	 * The end-of-Run report (ticket 05) and the Gamification additions on it
	 * (ticket 04): this Run's Milestones, its Concept Coverage, the year-5 Year
	 * in Review that no Stage-up carries, and a retrospective inside-budget
	 * line — prose, never a live counter. Everything is derived from the stored
	 * record (ADR-0002) and purely retrospective (ADR-0003).
	 */
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import { conceptCoverage, type ConceptCoverageState } from '$lib/game/journal';
	import { computeMetrics, outcomeBand, turningPoints } from '$lib/game/metrics';
	import { earnedMilestones, longestInsideBudgetMonths, yearInReview } from '$lib/game/milestones';
	import type { RunState } from '$lib/game/types';
	import {
		bandLabel,
		comparisonLabel,
		conceptLabel,
		flagText,
		goalName,
		milestoneLabel
	} from '$lib/i18n/game-text';
	import { localizedHref } from '$lib/i18n/href';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import BeatArt from './BeatArt.svelte';
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

	/*
	 * This Run's Milestones, oldest first — names, never a count and never a
	 * checklist; the same derivation the Stats Sheet lists (ticket 01).
	 */
	const milestones = $derived(earnedMilestones(run));
	/*
	 * Concept Coverage for the Run (ticket 03): Introduced by the Stage ladder,
	 * Experienced by a played card, or locked — exposure, never performance.
	 */
	const coverage = $derived(conceptCoverage(run));
	const STATE_LABEL: Record<ConceptCoverageState, () => string> = {
		experienced: () => m.coverage_experienced(),
		introduced: () => m.coverage_introduced(),
		locked: () => m.coverage_not_yet()
	};
	/*
	 * Year 5's review — the recap no Stage-up carries (the Fork takes year 4→5),
	 * in the same shape and from the same derivation as the Stage-up block.
	 */
	const finalReview = $derived(yearInReview(run, 5));
	/** The longest run of consecutive months inside budget, as prose. */
	const longestInside = $derived(longestInsideBudgetMonths(run));

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

		<!-- The closing panel (ticket 30): five years as five bars. -->
		<div class="mt-5">
			<BeatArt beat="money_story" />
		</div>

		<div class="mt-5 flex flex-col gap-3">
			{#each story as line, i (i)}
				<p class="text-[15px] leading-relaxed">{line}</p>
			{/each}
		</div>

		<div class="mt-6 flex items-center gap-3">
			<span
				class="rounded-full px-3 py-1 text-xs font-semibold"
				style="background: {band === 'behind'
					? 'var(--down-wash)'
					: band === 'ahead'
						? 'var(--up-wash)'
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

	<!--
		Ticket 04's additions: this Run's Milestones, its Concept Coverage, the
		year-5 review no Stage-up carries, and the retrospective inside-budget
		line. Story-first, derived from the record, and never a live metric.
	-->
	{#if milestones.length}
		<section aria-labelledby="story-milestones-title">
			<p class="kicker" id="story-milestones-title">{m.stats_milestones()}</p>
			<ul class="mt-2 flex flex-col">
				{#each milestones as milestone (milestone.id)}
					<li class="border-b border-dashed border-[var(--line)] py-2.5 text-sm last:border-0">
						{milestoneLabel(milestone.id)}
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<section aria-labelledby="story-coverage-title">
		<p class="kicker" id="story-coverage-title">{m.stats_coverage()}</p>
		<ul class="mt-2 flex flex-col">
			{#each coverage as entry (entry.concept)}
				<li
					class="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-[var(--line)] py-2.5 last:border-0"
				>
					{#if entry.state === 'locked'}
						<!-- A locked Concept names nothing the Stage-up banner has not announced. -->
						<span class="ml-auto text-xs text-[var(--muted)]">{STATE_LABEL.locked()}</span>
					{:else}
						<span class="text-sm">{conceptLabel(entry.concept)}</span>
						<span class="text-xs text-[var(--muted)]">{STATE_LABEL[entry.state]()}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<!-- Year 5 in review: the same shape as every Stage-up's recap (ticket 02). -->
	<section class="surface px-4 py-3" aria-labelledby="story-final-review-title">
		<p class="kicker text-[var(--money)]" id="story-final-review-title">
			{m.stage_up_review_title({ year: finalReview.year })}
		</p>

		<div class="mt-2 flex flex-col">
			{#if finalReview.netWorth !== null}
				<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
					<span class="text-sm text-[var(--muted)]">{m.story_row_net_worth()}</span>
					<Money amount={finalReview.netWorth} size="md" />
				</div>
			{/if}
			{#if finalReview.change !== null}
				<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
					<span class="text-sm text-[var(--muted)]">{m.stage_up_review_change()}</span>
					<Money
						amount={finalReview.change}
						size="sm"
						tone={finalReview.change >= 0 ? 'up' : 'down'}
						sign
					/>
				</div>
			{/if}
			<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
				<span class="text-sm text-[var(--muted)]">{m.story_row_adherence()}</span>
				<span class="figure text-sm">
					{m.story_months_of_12({ months: finalReview.monthsInsideBudget })}
				</span>
			</div>
		</div>

		{#if finalReview.milestones.length}
			<div class="mt-1 border-t border-dashed border-[var(--line)] pt-2">
				<p class="kicker">{m.stage_up_review_milestones()}</p>
				<ul class="mt-1 flex flex-col">
					{#each finalReview.milestones as id (id)}
						<li class="py-0.5 text-sm">{milestoneLabel(id)}</li>
					{/each}
				</ul>
			</div>
		{/if}
	</section>

	<p class="text-sm leading-relaxed">
		{#if longestInside > 0}
			{m.story_inside_budget_longest({ months: longestInside })}
		{:else}
			{m.story_inside_budget_none()}
		{/if}
	</p>

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
			href={localizedHref('/settings')}
		>
			{m.link_settings()}
		</a>
	</section>
</main>
