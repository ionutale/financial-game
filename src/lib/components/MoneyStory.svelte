<script lang="ts">
	import { formatMoney, formatMoneyExact, goalName } from '$lib/game/economy';
	import { BAND_LABEL, computeMetrics, outcomeBand, turningPoints } from '$lib/game/metrics';
	import type { RunState } from '$lib/game/types';
	import Money from './Money.svelte';
	import Sparkline from './Sparkline.svelte';

	let { run, onNewRun }: { run: RunState; onNewRun: () => void } = $props();

	const band = $derived(outcomeBand(run));
	const m = $derived(computeMetrics(run));
	const moments = $derived(turningPoints(run));

	const asMonths = (v: number) => `${Math.round(v)} / 12`;
	const asPct = (v: number) => `${Math.round(v * 100)}%`;

	const story = $derived([
		`You started at 14 with ${formatMoney(60)} and finished at 19 with ${formatMoney(m.finalNetWorth)}${
			run.debt > 0 ? `, still owing ${formatMoney(run.debt)}` : ', owing nothing'
		}.`,
		`You kept to the plan you set yourself in ${m.adherenceTotal} of the 60 months.`,
		band === 'ahead'
			? 'You ended up past the goal you were aiming at, with the score to go with it.'
			: band === 'treading'
				? 'You ended up still moving — not ahead, and not sunk either.'
				: 'You ended up behind where you needed to be. Nothing is unrecoverable from here; that is the point of the five years.'
	]);
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-7">
	<section>
		<p class="kicker">The Money Story</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			Five years, in one page.
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
				{BAND_LABEL[band]}
			</span>
			<span class="text-xs text-[var(--muted)]">your ending, from the money and the score</span>
		</div>
	</section>

	{#if moments.length}
		<section>
			<p class="kicker">The moments that decided it</p>
			<div class="mt-4 flex flex-col gap-4">
				{#each moments as moment (moment.month + ':' + moment.text)}
					<div class="border-l-2 border-[var(--line)] pl-4">
						<p class="text-sm leading-relaxed">{moment.text}</p>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<p class="kicker">You, against you</p>
		<p class="mt-1 text-sm text-[var(--muted)]">Year one against year five. Nobody else's numbers.</p>

		<div class="mt-4 flex flex-col gap-5">
			{#each m.comparisons as c (c.label)}
				{@const now = c.kind === 'months' ? c.y5 / 12 : c.y5}
				{@const then = c.kind === 'months' ? c.y1 / 12 : c.y1}
				<div>
					<div class="flex items-baseline justify-between">
						<span class="text-sm">{c.label}</span>
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
						<span>Year 1 · {c.kind === 'months' ? asMonths(c.y1) : asPct(c.y1)}</span>
						<span>Year 5 · {c.kind === 'months' ? asMonths(c.y5) : asPct(c.y5)}</span>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<section>
		<p class="kicker">The numbers</p>
		<div class="mt-4">
			<Sparkline points={m.trajectory} />
			<div class="mt-1 flex justify-between text-[11px] text-[var(--muted)]">
				<span>Age 14</span><span>Net worth over 60 months</span><span>Age 19</span>
			</div>
		</div>

		<dl class="mt-5 flex flex-col">
			{#each [
				{ k: 'Months inside budget', v: `${m.adherenceTotal} / 60` },
				{ k: 'Income saved', v: asPct(m.savingsRate) },
				{ k: 'Income spent on wants', v: asPct(m.wantShare) },
				{ k: 'Debt taken', v: `${formatMoney(m.debtTaken)} · peak ${formatMoney(m.peakDebt)}` },
				{ k: goalName(run), v: `${formatMoneyExact(m.goalProgress)} / ${formatMoney(m.goalTarget)}` },
				{ k: 'Net worth', v: formatMoney(m.finalNetWorth) },
				{ k: 'Credit score', v: m.finalScore === null ? 'never had a card' : String(m.finalScore) }
			] as row (row.k)}
				<div class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2">
					<dt class="text-sm text-[var(--muted)]">{row.k}</dt>
					<dd class="figure text-sm">{row.v}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section>
		<p class="kicker">What next</p>
		<p class="mt-2 text-sm text-[var(--muted)]">
			The Fork comes round again in month 49. Studying and working end very differently.
		</p>
		<button
			class="mt-4 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
			onclick={onNewRun}
		>
			Play another five years
		</button>
		<a
			class="mt-3 inline-block text-sm text-[var(--muted)] underline underline-offset-2"
			href="/settings"
		>
			Settings
		</a>
	</section>
</main>
