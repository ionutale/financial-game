<script lang="ts">
	/**
	 * The Stats Sheet (tickets 04, 20): Savings, Fund, Debt, the Credit score,
	 * the net-worth curve, this month's Obligations and Thread history, on
	 * demand. UI state only — nothing here is written to RunState. Labels and
	 * money formatting come from the catalogue and the active locale (ticket 26).
	 */
	import { formatMoney, formatMoneyExact } from '$lib/game/economy';
	import { computeMetrics } from '$lib/game/metrics';
	import { statsSheet, type StatsRow, type StatsTone } from '$lib/game/stats';
	import type { RunState } from '$lib/game/types';
	import { threadChipText, threadLabel } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import Money from './Money.svelte';
	import Sparkline from './Sparkline.svelte';

	let { run, onClose }: { run: RunState; onClose: () => void } = $props();

	const locale = getLocale();
	let panel = $state<HTMLElement | null>(null);

	const sheet = $derived(statsSheet(run));
	const metrics = $derived(computeMetrics(run));
	const trajectory = $derived(metrics.trajectory);
	const latest = $derived(trajectory[trajectory.length - 1] ?? 0);

	const TONE: Record<StatsTone, string> = {
		ink: 'text-[var(--ink)]',
		muted: 'text-[var(--muted)]',
		down: 'text-[var(--down)]'
	};

	const ROW_LABEL: Record<StatsRow['key'], () => string> = {
		savings: () => m.stats_row_savings(),
		fund: () => m.stats_row_fund(),
		debt: () => m.stats_row_debt(),
		score: () => m.stats_row_score()
	};

	/**
	 * Ticket 15: the detail view keeps the decimals on Savings and Fund —
	 * rounding away the monthly interest hides the compounding lesson.
	 */
	function rowValue(row: StatsRow): string {
		if (row.key === 'score') {
			return row.value === null ? m.stats_row_no_card() : String(row.value);
		}
		if (row.value === null) return '';
		return row.key === 'debt' ? formatMoney(row.value, locale) : formatMoneyExact(row.value, locale);
	}

	// The sheet opens focused, and the month screen waits underneath (ticket 14).
	$effect(() => {
		panel?.focus();
	});

	// Nothing behind the sheet should scroll while it is up.
	$effect(() => {
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
			return;
		}
		// A dialog keeps Tab inside itself.
		if (e.key !== 'Tab' || !panel) return;
		const targets = panel.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (!targets.length) return;
		const first = targets[0];
		const last = targets[targets.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}
</script>

<div class="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[var(--paper)]">
	<div
		class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-6 px-5 py-7"
		role="dialog"
		aria-modal="true"
		aria-labelledby="stats-sheet-title"
		tabindex="-1"
		bind:this={panel}
		onkeydown={onKeydown}
	>
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<p class="kicker">{m.hud_month_of_60({ month: run.month })}</p>
				<h2 id="stats-sheet-title" class="mt-1 text-xl font-semibold tracking-tight">
					{m.stats_title()}
				</h2>
			</div>
			<button
				class="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-semibold transition active:scale-[0.99]"
				onclick={onClose}
			>
				{m.stats_close()}
			</button>
		</header>

		<section class="surface p-5" aria-labelledby="stats-numbers">
			<p class="kicker" id="stats-numbers">{m.stats_numbers()}</p>
			<table class="mt-3 w-full border-collapse">
				<thead>
					<tr>
						<th scope="col" class="kicker pb-1 text-left">{m.stats_item()}</th>
						<th scope="col" class="kicker pb-1 text-right">{m.stats_where_it_stands()}</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.rows as row (row.key)}
						<tr class="border-b border-dashed border-[var(--line)] last:border-0">
							<th scope="row" class="py-2.5 text-left text-sm font-normal text-[var(--muted)]">
								{ROW_LABEL[row.key]()}
							</th>
							<td class="py-2.5 text-right">
								<span class="figure text-sm {TONE[row.tone]}">{rowValue(row)}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section aria-labelledby="stats-trajectory">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<p class="kicker" id="stats-trajectory">{m.stats_trajectory()}</p>
				{#if trajectory.length >= 2}
					<span class="figure text-xs text-[var(--muted)]">
						{m.stats_latest({ amount: formatMoney(latest, locale) })}
					</span>
				{/if}
			</div>
			{#if trajectory.length >= 2}
				<div class="surface mt-3 p-4">
					<Sparkline points={trajectory} />
					<div class="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-[var(--muted)]">
						<span>{m.stats_month_point({ month: 1, amount: formatMoney(trajectory[0], locale) })}</span>
						<span>
							{m.stats_month_point({
								month: trajectory.length,
								amount: formatMoney(latest, locale)
							})}
						</span>
					</div>
				</div>
			{:else}
				<p class="mt-2 text-sm text-[var(--muted)]">{m.stats_no_curve()}</p>
			{/if}
		</section>

		<section class="surface p-5" aria-labelledby="stats-obligations">
			<p class="kicker" id="stats-obligations">{m.stats_obligations()}</p>
			<div class="mt-2 flex flex-wrap items-baseline justify-between gap-3">
				<Money amount={sheet.obligations} size="lg" />
				<span class="text-xs text-[var(--muted)]">
					{sheet.obligations > 0 ? m.stats_obligations_paid() : m.stats_obligations_none()}
				</span>
			</div>
		</section>

		<section aria-labelledby="stats-threads">
			<p class="kicker" id="stats-threads">{m.stats_threads()}</p>

			{#if sheet.liveThread}
				<div class="surface mt-3 p-4">
					<p class="kicker">{m.stats_in_play()}</p>
					<p
						class="mt-1.5 w-fit rounded-full bg-[var(--money-wash)] px-3 py-1 text-xs text-[var(--money)]"
					>
						{threadChipText(sheet.liveThread.id, sheet.liveThread.months)}
					</p>
				</div>
			{/if}

			{#if sheet.history.length}
				<p class="kicker mt-4">{m.stats_past_threads()}</p>
				<ul class="mt-1 flex flex-col">
					{#each sheet.history as arc, i (i)}
						<li
							class="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-[var(--line)] py-2.5 last:border-0"
						>
							<span class="text-sm">{threadLabel(arc.id)}</span>
							<span class="figure text-xs text-[var(--muted)]">
								{m.stats_thread_month({ month: arc.month })}
							</span>
						</li>
					{/each}
				</ul>
			{/if}

			{#if !sheet.liveThread && !sheet.history.length}
				<p class="mt-2 text-sm text-[var(--muted)]">{m.stats_no_threads()}</p>
			{/if}
		</section>

		<footer class="mt-auto pt-2">
			<a class="text-sm text-[var(--muted)] underline underline-offset-2" href="/settings">
				{m.link_settings()}
			</a>
		</footer>
	</div>
</div>
