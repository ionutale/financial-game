<script lang="ts">
	import { beatArtFor } from '$lib/game/beats';
	import { callbackFor } from '$lib/game/callbacks';
	import { formatMoney, saveTotal } from '$lib/game/economy';
	import { cardFormFor } from '$lib/game/forms';
	import type { LedgerEntry } from '$lib/game/ledger';
	import { isFirstEncounter } from '$lib/game/presentation';
	import type { Action, Choice, RunState } from '$lib/game/types';
	import {
		cardLines,
		cardOdds,
		cardSituation,
		cardTitle,
		chosenFeedbackParts,
		choiceLabel
	} from '$lib/i18n/card-text';
	import { chipsFor } from '$lib/i18n/chips';
	import { callbackText, kindLabel, ledgerAccountLabel } from '$lib/i18n/game-text';
	import { m } from '$lib/i18n/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import BeatArt from './BeatArt.svelte';
	import Money from './Money.svelte';

	let {
		run,
		dispatch,
		ledger = null
	}: { run: RunState; dispatch: (a: Action) => void; ledger?: LedgerEntry[] | null } = $props();

	const locale = getLocale();
	const card = $derived(run.card);
	const title = $derived(card ? cardTitle(card) : '');
	const situation = $derived(card ? cardSituation(card) : '');
	const odds = $derived(card ? cardOdds(card) : null);
	const form = $derived(card ? cardFormFor(card.id) : null);
	const lines = $derived(card ? cardLines(card) : []);
	/*
	 * A Callback (fun-pass ticket 07, design §3.4): the one derived line the
	 * world remembers about this card's moment, shown before the Choice is
	 * taken. At most one; no numbers, never a maxim; nothing is stored.
	 */
	const callback = $derived(callbackFor(run, card));
	const callbackLine = $derived(callback ? callbackText(callback) : null);
	/*
	 * The two parts of the Feedback (ADR-0004, ticket 02): the Reaction first,
	 * then the Why under "Why it happened". The Why opens by itself at the
	 * Concept's first encounter and stays collapsed after (*taught once,
	 * trusted after*); with no Reaction authored, today's single paragraph
	 * renders exactly as it always has.
	 */
	const feedback = $derived(chosenFeedbackParts(card, run.chosen));
	const whyOpen = $derived(isFirstEncounter(run));

	/*
	 * Kind identity is typography only (design §3.6, fun-pass ticket 05): the
	 * shock opens under a heavy ink rule and sets its prose tight; the scam
	 * reads as a message, its own title the weighted sender line; the
	 * risk-moment promotes its odds above the prose; the stage-up is a poster;
	 * the decision stays plain. Colour never carries the kind — the kicker
	 * always names it in words.
	 */
	const tight = $derived(card?.kind === 'shock');
	const proseLeading = $derived(tight ? 'leading-snug' : 'leading-relaxed');

	/*
	 * Why a Choice is not takeable (fun-pass ticket 09): time is the shipped
	 * rule; a Fund deposit is blocked when the Save envelope and the savings
	 * account cannot cover it — the Fund never borrows. The reducer enforces
	 * both; this only mirrors it so the tap is never a dead one.
	 */
	function blockedBy(c: Choice): 'time' | 'fund' | null {
		const hours = c.freeTime ?? 0;
		if (hours < 0 && Math.abs(hours) > run.freeTime) return 'time';
		if (c.sets?.fund !== undefined && saveTotal(run) < c.sets.fund) return 'fund';
		return null;
	}

	/*
	 * Colour supports the sign, never carries it: money in reads up, money out
	 * reads down, and Debt runs the other way — growing is down, repaid is up.
	 */
	function ledgerTone(entry: LedgerEntry): 'up' | 'down' {
		if (entry.key === 'debt') return entry.amount > 0 ? 'down' : 'up';
		return entry.amount > 0 ? 'up' : 'down';
	}
</script>

<!--
	The Card Formats (design §3.6, fun-pass ticket 05): the diegetic shape the
	card's own words are set into — a chat thread, a document sheet, an itemised
	block. The arrangement only rearranges: `situation` is the card's shipped
	catalogue line, `lines` are its `card_<id>_line_<n>` extras, and the heading
	and choices below are untouched. Reading order stays linear.
-->
{#snippet messageThread()}
	<div class="mt-3 flex flex-col items-start gap-2">
		<p
			class="w-fit max-w-full rounded-2xl rounded-bl-sm border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] {proseLeading}"
		>
			{situation}
		</p>
		{#each lines as line, index (index)}
			<p
				class="w-fit max-w-full rounded-2xl rounded-bl-sm border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] {proseLeading}"
			>
				{line}
			</p>
		{/each}
	</div>
{/snippet}

{#snippet paperSheet()}
	<div class="mt-3 border-y border-[var(--line)]">
		<p class="py-3 text-[15px] {proseLeading}">{situation}</p>
		{#each lines as line, index (index)}
			<p class="border-t border-[var(--line)] py-3 text-[15px] {proseLeading}">{line}</p>
		{/each}
	</div>
{/snippet}

{#snippet receiptBlock()}
	<div class="mt-3">
		<p class="text-[15px] {proseLeading}">{situation}</p>
		<div class="mt-3 border-t border-dashed border-[var(--line)]">
			{#each lines as line, index (index)}
				<p class="border-b border-dashed border-[var(--line)] py-2 text-sm leading-snug">
					{line}
				</p>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet cardBody()}
	{#if form?.format === 'message'}
		{@render messageThread()}
	{:else if form?.format === 'paper'}
		{@render paperSheet()}
	{:else if form?.format === 'receipt'}
		{@render receiptBlock()}
	{:else}
		<p class="mt-3 text-[15px] {proseLeading}">{situation}</p>
	{/if}
{/snippet}

{#snippet oddsPromoted()}
	<p class="figure mt-3 rounded-lg border border-[var(--line)] px-3 py-2 text-sm leading-snug">
		{odds}
	</p>
{/snippet}

{#snippet oddsTail()}
	<p class="mt-3 border-l-2 border-[var(--line)] pl-3 text-xs text-[var(--muted)]">{odds}</p>
{/snippet}

{#if card}
	<!-- Art only at the beats (ticket 30), never on every card; the Fork's own
	     illustration belongs to StageUp, which renders this component too. -->
	{@const art = card.kind === 'stage_up' ? null : beatArtFor(card.id)}
	<section class="surface p-5">
		{#if art}
			<div class="mb-5">
				<BeatArt beat={art} />
			</div>
		{/if}

		{#if card.kind === 'shock'}
			<!-- The shock's top rule is ink, like its words: a typographic mark,
			     nothing for assistive tech to announce. -->
			<div class="mb-4 h-[3px] w-full bg-[var(--ink)]" aria-hidden="true"></div>
		{/if}

		<p class="kicker">{kindLabel(card.kind)}</p>

		{#if card.kind === 'scam'}
			<!-- The scam reads as a message: a neutral frame, and the card's own
			     title as the weighted sender line inside it. -->
			<div class="mt-2 rounded-xl bg-[var(--wash)] px-4 py-3.5">
				<h2 class="text-lg leading-snug font-bold tracking-tight">{title}</h2>
				{@render cardBody()}
				{#if odds}{@render oddsTail()}{/if}
			</div>
		{:else}
			<h2
				class={card.kind === 'stage_up'
					? 'mt-2 text-3xl leading-[1.08] font-extrabold tracking-tight text-balance'
					: 'mt-2 text-xl leading-snug font-semibold tracking-tight'}
			>
				{title}
			</h2>

			{#if odds && card.kind === 'risk_moment'}{@render oddsPromoted()}{/if}
			{@render cardBody()}
			{#if odds && card.kind !== 'risk_moment'}{@render oddsTail()}{/if}
		{/if}

		{#if !run.chosen}
			{#if callbackLine}
				<!--
					The Callback (fun-pass ticket 07): one derived memory line,
					before the Choice. Plain text in reading order; nothing is
					announced early and nothing is stored.
				-->
				<div class="mt-4 border-l-2 border-[var(--line)] pl-3">
					<p class="kicker">{m.event_callback()}</p>
					<p class="mt-1.5 text-sm leading-relaxed">{callbackLine}</p>
				</div>
			{/if}
			<div class="mt-6 flex flex-col gap-2.5">
				{#each card.choices as c (c.id)}
					{@const chips = chipsFor(c, run.insurance)}
					{@const reason = blockedBy(c)}
					{@const off = reason !== null}
					<button
						class="group w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-left transition
							{off ? 'opacity-40' : 'hover:border-[var(--ink-25)] active:scale-[0.995]'}"
						disabled={off}
						onclick={() => dispatch({ type: 'CHOOSE', choiceId: c.id })}
					>
						<span class="block text-[15px] font-medium">{choiceLabel(card, c)}</span>
						<span class="mt-1.5 flex flex-wrap items-center gap-1.5">
							{#if chips.length}
								{#each chips as chip (chip)}
									<span
										class="figure rounded-full bg-[var(--wash)] px-2 py-0.5 text-[11px] text-[var(--muted)]"
									>
										{chip}
									</span>
								{/each}
							{:else}
								<span class="text-[11px] text-[var(--muted)]">{m.event_no_cost()}</span>
							{/if}
						</span>
						{#if reason}
							<span class="mt-1.5 block text-[11px] text-[var(--down)]">
								{reason === 'fund' ? m.event_blocked_fund() : m.event_blocked()}
							</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		{#if feedback}
			<div class="mt-6 border-l-2 border-[var(--money)] pl-4" aria-live="polite">
				{#if feedback.reaction}
					<p class="kicker">{m.event_what_happened()}</p>
					<p class="mt-2 text-[15px] leading-relaxed">{feedback.reaction}</p>
				{:else}
					<!-- No Reaction authored: today's exact rendering, byte for byte. -->
					<p class="kicker">{m.event_what_happened()}</p>
					<p class="mt-2 text-[15px] leading-relaxed">{feedback.why}</p>
				{/if}

				{#if ledger && ledger.length}
					<!--
						The Ledger Line (fun-pass ticket 04, design §3.3): what the
						Choice actually moved — the changed entries only, diffed at the
						Month Screen edge from the reducer's before/after. Signs and
						words carry the meaning; the changed figure flashes once
						(app.css) and the final values are always in this DOM. It sits
						in the existing polite region, so it is announced once, with
						the Reaction.
					-->
					<p
						id="ledger-line"
						class="money-flash mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md px-1 py-0.5 text-sm"
					>
						{#each ledger as entry, i (entry.key)}
							{#if i > 0}
								<span class="text-[var(--muted)]" aria-hidden="true">·</span>
							{/if}
							<span class="whitespace-nowrap">
								{ledgerAccountLabel(entry.key)}
								{#if entry.key === 'freeTime'}
									<span
										class="figure {ledgerTone(entry) === 'up'
											? 'text-[var(--up)]'
											: 'text-[var(--down)]'}"
									>
										{entry.amount > 0 ? '+' : '\u2212'}{Math.abs(entry.amount)}h
									</span>
								{:else}
									<Money amount={entry.amount} size="sm" tone={ledgerTone(entry)} sign />
								{/if}
							</span>
						{/each}
					</p>
				{/if}

				{#if feedback.reaction}
					<!--
						The Why is a disclosure, not a hidden lesson (ADR-0004):
						open at the Concept's first encounter, collapsed after. The
						summary carries the words; the opening is native and works
						with no JavaScript.
					-->
					<details class="mt-3" open={whyOpen}>
						<summary class="w-fit cursor-pointer text-sm font-semibold text-[var(--money)]">
							{m.event_why_it_happened()}
						</summary>
						<p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">{feedback.why}</p>
					</details>
				{/if}

				{#if run.cascade && run.cascade.toDebt > 0}
					<p class="cascade-travel mt-3 text-[13px] text-[var(--down)]">
						{m.event_cascade_debt({
							from: formatMoney(run.cascade.fromSave, locale),
							to: formatMoney(run.cascade.toDebt, locale)
						})}
					</p>
				{:else if run.cascade && run.cascade.fromSave > 0}
					<p class="cascade-travel mt-3 text-[13px] text-[var(--down)]">
						{m.event_cascade_save({ from: formatMoney(run.cascade.fromSave, locale) })}
					</p>
				{/if}
			</div>

			<button
				class="mt-6 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
				onclick={() => dispatch({ type: 'CONTINUE' })}
			>
				{m.event_continue()}
			</button>
		{/if}
	</section>
{/if}
