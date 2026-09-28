<script lang="ts">
	/**
	 * The Journal (gamification ticket 05): the private cross-Run record — a
	 * pure projection over the profile's active Run and archive (ADR-0002).
	 * Every finished Run is a Chapter, in the order lived, never ranked; the
	 * across-Run Concept Coverage and the collected Milestones (including
	 * `both_paths`) sit beside them. Derived only: export, delete-everything
	 * and the retention sweep already cover everything shown here.
	 */
	import { buildJournal } from '$lib/game/journal';
	import {
		bandLabel,
		castName,
		chapterTitle,
		conceptLabel,
		coverageStateLabel,
		flagText,
		milestoneLabel
	} from '$lib/i18n/game-text';
	import { localizedHref } from '$lib/i18n/href';
	import { m } from '$lib/i18n/messages';

	let { data } = $props();

	const journal = $derived(buildJournal(data.active, data.archive));

	/** The stored finish date as the ISO day — locale-free and honest to the record. */
	const dayOf = (finishedAt: string) => finishedAt.slice(0, 10);
</script>

<svelte:head>
	<title>{m.journal_title()}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-10">
	<header>
		<p class="kicker">{m.journal_kicker()}</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			{m.journal_heading()}
		</h1>
		<p class="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{m.journal_lead()}</p>

		<dl class="mt-5 flex flex-col">
			<div
				class="flex items-baseline justify-between border-b border-dashed border-[var(--line)] py-2"
			>
				<dt class="text-sm text-[var(--muted)]">{m.journal_runs_finished()}</dt>
				<dd class="figure text-sm">{journal.summary.runsFinished}</dd>
			</div>
			<div class="flex items-baseline justify-between py-2">
				<dt class="text-sm text-[var(--muted)]">{m.journal_concepts_met()}</dt>
				<dd class="figure text-sm">
					{m.journal_concepts_value({
						met: journal.summary.conceptsMet,
						total: journal.summary.conceptsTotal
					})}
				</dd>
			</div>
		</dl>
	</header>

	{#if journal.chapters.length === 0}
		<!--
			The first-time player's honest state: nothing has finished yet, so
			there is no record to fake. The header still says zero.
		-->
		<section class="surface p-5" aria-labelledby="journal-empty">
			<p class="text-sm font-semibold" id="journal-empty">{m.journal_empty()}</p>
			<p class="mt-2 text-sm leading-relaxed text-[var(--muted)]">{m.journal_empty_body()}</p>
		</section>
	{:else}
		{#each journal.chapters as chapter, index (chapter.seed)}
			<section class="surface p-5" aria-labelledby={`journal-chapter-${chapter.seed}`}>
				<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
					<h2 id={`journal-chapter-${chapter.seed}`} class="kicker">
						{m.journal_chapter({ number: index + 1 })}
					</h2>
					<!--
						The band chip is neutral (fun-pass ticket 11): the words say
						where the money ended; colour never washes the person.
					-->
					<span class="rounded-full bg-[var(--wash)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
						{bandLabel(chapter.band)}
					</span>
				</div>
				<!-- The Chapter's own title (fun-pass ticket 11): the story it lived. -->
				<p class="mt-1.5 text-[17px] leading-snug font-semibold tracking-tight">
					{chapterTitle(chapter.title)}
				</p>
				<p class="mt-1 text-xs text-[var(--muted)]">
					{m.journal_chapter_facts({ date: dayOf(chapter.finishedAt), seed: chapter.seed })}
				</p>

				{#if chapter.turningPoints.length}
					<div class="mt-4 border-t border-dashed border-[var(--line)] pt-3">
						<p class="kicker">{m.story_moments()}</p>
						<div class="mt-2 flex flex-col gap-3">
							{#each chapter.turningPoints as moment (moment.month + ':' + moment.kind)}
								{@const text = flagText(moment.kind, moment.month)}
								{#if text}
									<p class="border-l-2 border-[var(--line)] pl-3 text-sm leading-relaxed">{text}</p>
								{/if}
							{/each}
						</div>
					</div>
				{/if}

				{#if chapter.milestones.length}
					<div class="mt-4 border-t border-dashed border-[var(--line)] pt-3">
						<p class="kicker">{m.stats_milestones()}</p>
						<ul class="mt-2 flex flex-col">
							{#each chapter.milestones as milestone (milestone.id)}
								<li class="py-0.5 text-sm">{milestoneLabel(milestone.id)}</li>
							{/each}
						</ul>
					</div>
				{/if}

				{#if chapter.cast.length}
					<!--
						The Cast (fun-pass ticket 07): the people this Run's log
						names, in the order it met them. Derived from the archive,
						never stored; a Chapter that met nobody renders nothing.
					-->
					<div class="mt-4 border-t border-dashed border-[var(--line)] pt-3">
						<p class="kicker">{m.journal_cast()}</p>
						<p class="mt-2 text-sm">{chapter.cast.map(castName).join(' · ')}</p>
					</div>
				{/if}
			</section>
		{/each}
	{/if}

	<!--
		Across-Run Concept Coverage: the eight Concepts, met or not. A Concept
		no Run has opened names nothing the Stage-up banner has not announced.
	-->
	<section aria-labelledby="journal-coverage">
		<p class="kicker" id="journal-coverage">{m.journal_coverage()}</p>
		<ul class="mt-2 flex flex-col">
			{#each journal.coverage as entry (entry.concept)}
				<li
					class="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-dashed border-[var(--line)] py-2.5 last:border-0"
				>
					{#if entry.state === 'locked'}
						<span class="ml-auto text-xs text-[var(--muted)]">{coverageStateLabel(entry.state)}</span>
					{:else}
						<span class="text-sm">{conceptLabel(entry.concept)}</span>
						<span class="text-xs text-[var(--muted)]">{coverageStateLabel(entry.state)}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<!-- The Milestones collected across Runs, `both_paths` last. -->
	<section aria-labelledby="journal-collected">
		<p class="kicker" id="journal-collected">{m.journal_collected()}</p>
		{#if journal.collectedMilestones.length}
			<ul class="mt-2 flex flex-col">
				{#each journal.collectedMilestones as id (id)}
					<li class="border-b border-dashed border-[var(--line)] py-2.5 text-sm last:border-0">
						{milestoneLabel(id)}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-2 text-sm text-[var(--muted)]">{m.stats_no_milestones()}</p>
		{/if}
	</section>

	<footer class="mt-auto flex flex-col gap-2 text-sm">
		<a class="underline underline-offset-2" href={localizedHref('/')}>{m.link_back_to_game()}</a>
		<a class="underline underline-offset-2" href={localizedHref('/settings')}>{m.link_settings()}</a>
	</footer>
</main>
