<script lang="ts">
	/**
	 * The Stage-up interstitial (ticket 02, ticket 18): a Stage announces itself
	 * before its first Plan, and the Fork carries its own illustration (ticket 30).
	 * Every Stage-up also carries the Year in Review for the year just closed
	 * (gamification ticket 02): a small fixed block — money headline, one
	 * behavioural line, the year's Milestones — never a dashboard (ADR-0003).
	 * Fun-pass ticket 02: each Stage-up opens with its **Year Beat** and
	 * "What you'll meet: {concepts}" instead of a curriculum list (design §6).
	 */
	import { beatArtFor } from '$lib/game/beats';
	import { STAGES } from '$lib/game/economy';
	import type { LedgerEntry } from '$lib/game/ledger';
	import { stageUpReview } from '$lib/game/milestones';
	import type { Action, RunState } from '$lib/game/types';
	import { conceptLabel, milestoneLabel, stageName } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import Avatar from './Avatar.svelte';
	import BeatArt from './BeatArt.svelte';
	import EventStep from './EventStep.svelte';
	import Money from './Money.svelte';

	let {
		run,
		dispatch,
		ledger = null
	}: { run: RunState; dispatch: (a: Action) => void; ledger?: LedgerEntry[] | null } = $props();

	const stage = $derived(STAGES[run.stage]);
	const name = $derived(stageName(run.stage));
	const unlocks = $derived(stage.concepts.map((c) => conceptLabel(c)).join(' · '));
	const art = $derived(run.card ? beatArtFor(run.card.id) : null);
	const review = $derived(stageUpReview(run));

	// Each Stage's one authored in-fiction line (CONTEXT: Year Beat). Stage 1
	// never opens a Stage-up card, so it has no beat (pruned, ticket 03).
	const BEAT: Record<number, () => string> = {
		2: () => m.stage_2_beat(),
		3: () => m.stage_3_beat(),
		4: () => m.stage_4_beat(),
		5: () => m.stage_5_beat()
	};
	const beat = $derived(BEAT[run.stage]?.() ?? '');
</script>

{#if art}
	<div class="mb-4">
		<BeatArt beat={art} />
	</div>
{/if}

<div class="rounded-xl bg-[var(--money-wash)] px-4 py-3">
	<p class="kicker text-[var(--money)]">
		{m.stage_up_title({ stage: run.stage, name, age: run.age })}
	</p>
	<p class="mt-1.5 text-sm leading-relaxed">{beat}</p>
	<p class="mt-1.5 text-sm leading-relaxed">{m.stage_up_unlocks({ concepts: unlocks })}</p>
</div>

{#if review}
	<div class="mt-5">
		<section class="surface px-4 py-3" aria-labelledby="stage-up-review-title">
			<div class="flex flex-wrap items-start gap-4">
				<!-- Fun-pass ticket 05 (design §3.6): the avatar gains presence on
				     the Stage-up — larger, beside the Year in Review. Decoration
				     only; the record below carries every word. -->
				<div class="h-24 w-24 shrink-0 rounded-full bg-[var(--wash)] p-2.5 text-[var(--ink-40)]">
					<Avatar stage={run.stage} />
				</div>

				<div class="min-w-0 flex-1">
					<p class="kicker text-[var(--money)]" id="stage-up-review-title">
						{m.stage_up_review_title({ year: review.year })}
					</p>

					<div class="mt-2 flex flex-col">
						{#if review.netWorth !== null}
							<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
								<span class="text-sm text-[var(--muted)]">{m.story_row_net_worth()}</span>
								<Money amount={review.netWorth} size="md" />
							</div>
						{/if}
						{#if review.change !== null}
							<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
								<span class="text-sm text-[var(--muted)]">{m.stage_up_review_change()}</span>
								<Money
									amount={review.change}
									size="sm"
									tone={review.change >= 0 ? 'up' : 'down'}
									sign
								/>
							</div>
						{/if}
						<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-1">
							<span class="text-sm text-[var(--muted)]">{m.story_row_adherence()}</span>
							<span class="figure text-sm">
								{m.story_months_of_12({ months: review.monthsInsideBudget })}
							</span>
						</div>
					</div>

					{#if review.milestones.length}
						<div class="mt-1 border-t border-dashed border-[var(--line)] pt-2">
							<p class="kicker">{m.stage_up_review_milestones()}</p>
							<ul class="mt-1 flex flex-col">
								{#each review.milestones as id (id)}
									<li class="py-0.5 text-sm">{milestoneLabel(id)}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
{/if}

<EventStep {run} {dispatch} {ledger} />

<style>
	/* The banner sits above the card with the month screen's rhythm. */
	div + :global(section) {
		margin-top: 1.75rem;
	}
</style>
