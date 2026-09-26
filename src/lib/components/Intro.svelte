<script lang="ts">
	/**
	 * Three screens before the first month (ticket 04): who you are, what you are
	 * aiming at, and how a month works. No tutorial — the first card teaches.
	 */
	import { m } from '$lib/i18n/messages';
	import LanguageSwitcher from './LanguageSwitcher.svelte';

	let { onDone }: { onDone: () => void } = $props();

	const SCREENS = [
		{
			kicker: () => m.intro_screen_1_kicker(),
			title: () => m.intro_screen_1_title(),
			body: () => m.intro_screen_1_body(),
			footnote: () => m.intro_screen_1_footnote()
		},
		{
			kicker: () => m.intro_screen_2_kicker(),
			title: () => m.intro_screen_2_title(),
			body: () => m.intro_screen_2_body(),
			footnote: () => m.intro_screen_2_footnote()
		},
		{
			kicker: () => m.intro_screen_3_kicker(),
			title: () => m.intro_screen_3_title(),
			body: () => m.intro_screen_3_body(),
			footnote: () => m.intro_screen_3_footnote()
		}
	];

	let step = $state(0);
	const screen = $derived(SCREENS[step]);
	const last = $derived(step === SCREENS.length - 1);

	function next() {
		if (last) onDone();
		else step += 1;
	}
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 py-10">
	<div class="flex-1">
		{#key step}
			<div class="rise">
				<p class="kicker">{screen.kicker()}</p>
				<h1 class="mt-4 text-[34px] leading-[1.1] font-semibold tracking-tight">
					{screen.title()}
				</h1>
				<p class="mt-5 text-[17px] leading-relaxed">{screen.body()}</p>
				<p class="mt-5 text-sm leading-relaxed text-[var(--muted)]">{screen.footnote()}</p>
			</div>
		{/key}
	</div>

	<p class="mt-8 text-xs leading-relaxed text-[var(--muted)]">
		{m.intro_privacy()}
		<a class="underline underline-offset-2" href="/privacy">{m.link_privacy_policy()}</a>
		<span aria-hidden="true">·</span>
		<a class="underline underline-offset-2" href="/settings">{m.link_settings()}</a>
	</p>

	<!-- Ticket 28: the first-run notice is where language matters most, so the
	     choice sits with the fine print, out of the way of the one action. -->
	<div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
		<p class="kicker" id="intro-language">{m.language_label()}</p>
		<LanguageSwitcher compact labelledBy="intro-language" />
	</div>

	<div class="mt-6 flex items-center justify-between">
		<div class="flex gap-1.5" aria-hidden="true">
			{#each SCREENS as _, i (i)}
				<span
					class="h-1.5 rounded-full transition-all duration-300 {i === step
						? 'w-6 bg-[var(--money)]'
						: 'w-1.5 bg-[var(--wash)]'}"
				></span>
			{/each}
		</div>

		<button
			class="rounded-xl bg-[var(--money)] px-6 py-3 font-semibold text-white transition active:scale-[0.99]"
			onclick={next}
		>
			{last ? m.intro_start() : m.intro_next()}
		</button>
	</div>
</main>
