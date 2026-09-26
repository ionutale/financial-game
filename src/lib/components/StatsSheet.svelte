<script lang="ts">
	/**
	 * The Stats Sheet (tickets 04, 20): Savings, Fund, Debt, the Credit score,
	 * the net-worth curve, this month's Obligations and Thread history, on
	 * demand. UI state only — nothing here is written to RunState.
	 */
	import { formatMoney } from '$lib/game/economy';
	import { computeMetrics } from '$lib/game/metrics';
	import { statsSheet, type StatsTone } from '$lib/game/stats';
	import type { RunState } from '$lib/game/types';
	import Money from './Money.svelte';
	import Sparkline from './Sparkline.svelte';

	let { run, onClose }: { run: RunState; onClose: () => void } = $props();

	let panel = $state<HTMLElement | null>(null);

	const sheet = $derived(statsSheet(run));
	const m = $derived(computeMetrics(run));
	const lastNetWorth = $derived(m.trajectory[m.trajectory.length - 1] ?? 0);

	const TONE: Record<StatsTone, string> = {
		ink: 'text-[var(--ink)]',
		muted: 'text-[var(--muted)]',
		down: 'text-[var(--down)]'
	};

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
				<p class="kicker">Month {run.month} of 60</p>
				<h2 id="stats-sheet-title" class="mt-1 text-xl font-semibold tracking-tight">
					Where the money is
				</h2>
			</div>
			<button
				class="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-semibold transition active:scale-[0.99]"
				onclick={onClose}
			>
				Close
			</button>
		</header>

		<section class="surface p-5" aria-labelledby="stats-numbers">
			<p class="kicker" id="stats-numbers">The numbers</p>
			<table class="mt-3 w-full border-collapse">
				<thead>
					<tr>
						<th scope="col" class="kicker pb-1 text-left">Item</th>
						<th scope="col" class="kicker pb-1 text-right">Where it stands</th>
					</tr>
				</thead>
				<tbody>
					{#each sheet.rows as row (row.key)}
						<tr class="border-b border-dashed border-[var(--line)] last:border-0">
							<th scope="row" class="py-2.5 text-left text-sm font-normal text-[var(--muted)]">
								{row.label}
							</th>
							<td class="py-2.5 text-right">
								<span class="figure text-sm {TONE[row.tone]}">{row.value}</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>

		<section aria-labelledby="stats-trajectory">
			<div class="flex flex-wrap items-baseline justify-between gap-2">
				<p class="kicker" id="stats-trajectory">Net worth over time</p>
				{#if m.trajectory.length >= 2}
					<span class="figure text-xs text-[var(--muted)]">
						latest {formatMoney(lastNetWorth)}
					</span>
				{/if}
			</div>
			{#if m.trajectory.length >= 2}
				<div class="surface mt-3 p-4">
					<Sparkline points={m.trajectory} />
					<div class="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-[var(--muted)]">
						<span>Month 1 · {formatMoney(m.trajectory[0])}</span>
						<span>Month {m.trajectory.length} · {formatMoney(lastNetWorth)}</span>
					</div>
				</div>
			{:else}
				<p class="mt-2 text-sm text-[var(--muted)]">
					The curve appears once a month has closed.
				</p>
			{/if}
		</section>

		<section class="surface p-5" aria-labelledby="stats-obligations">
			<p class="kicker" id="stats-obligations">Obligations this month</p>
			<div class="mt-2 flex flex-wrap items-baseline justify-between gap-3">
				<Money amount={sheet.obligations} size="lg" />
				<span class="text-xs text-[var(--muted)]">
					{sheet.obligations > 0 ? 'paid automatically at the close' : 'nothing fixed yet'}
				</span>
			</div>
		</section>

		<section aria-labelledby="stats-threads">
			<p class="kicker" id="stats-threads">Threads</p>

			{#if sheet.liveThread}
				<div class="surface mt-3 p-4">
					<p class="kicker">In play</p>
					<p
						class="mt-1.5 w-fit rounded-full bg-[var(--money-wash)] px-3 py-1 text-xs text-[var(--money)]"
					>
						{sheet.liveThread}
					</p>
				</div>
			{/if}

			{#if sheet.history.length}
				<p class="kicker mt-4">Past threads</p>
				<ul class="mt-1 flex flex-col">
					{#each sheet.history as arc, i (i)}
						<li
							class="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-[var(--line)] py-2.5 last:border-0"
						>
							<span class="text-sm">{arc.label}</span>
							<span class="figure text-xs text-[var(--muted)]">Month {arc.month}</span>
						</li>
					{/each}
				</ul>
			{/if}

			{#if !sheet.liveThread && !sheet.history.length}
				<p class="mt-2 text-sm text-[var(--muted)]">No threads yet.</p>
			{/if}
		</section>
	</div>
</div>
