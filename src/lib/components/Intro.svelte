<script lang="ts">
	/**
	 * The Cold Open (fun-pass ticket 02): one scene before month 1 — who you
	 * are, the Named Goal as the horizon, Start. It replaces the three intro
	 * screens; how a month works moved to the first month's Plan hint, where it
	 * is needed. The privacy line, the language switcher and the sound toggle
	 * stay surfaced.
	 */
	import { localizedHref } from '$lib/i18n/href';
	import { m } from '$lib/i18n/messages';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import SoundToggle from './SoundToggle.svelte';

	let { onDone }: { onDone: () => void } = $props();
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 py-10">
	<div class="flex-1">
		<p class="kicker">{m.intro_kicker()}</p>
		<h1 class="mt-4 text-[34px] leading-[1.1] font-semibold tracking-tight">
			{m.intro_screen_1_title()}
		</h1>
		<p class="mt-5 text-[17px] leading-relaxed">{m.intro_screen_1_body()}</p>

		<!-- The goal as the horizon: the one number the whole Run points at. -->
		<div class="mt-8 rounded-xl bg-[var(--money-wash)] px-4 py-3.5">
			<p class="kicker text-[var(--money)]">{m.intro_screen_2_kicker()}</p>
			<p class="mt-1.5 text-[17px] font-semibold tracking-tight">
				{m.intro_screen_2_title()}
			</p>
			<p class="mt-2 text-[15px] leading-relaxed">{m.intro_screen_2_body()}</p>
		</div>
	</div>

	<button
		class="mt-8 w-full rounded-xl bg-[var(--money)] py-3.5 font-semibold text-white transition active:scale-[0.99]"
		onclick={onDone}
	>
		{m.intro_start()}
	</button>

	<p class="mt-6 text-xs leading-relaxed text-[var(--muted)]">
		{m.intro_privacy()}
		<a class="underline underline-offset-2" href={localizedHref('/privacy')}>{m.link_privacy_policy()}</a>
		<span aria-hidden="true">·</span>
		<a class="underline underline-offset-2" href={localizedHref('/settings')}>{m.link_settings()}</a>
	</p>

	<!-- Ticket 28: the first-run notice is where language matters most, so the
	     choice sits with the fine print, out of the way of the one action. -->
	<div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
		<p class="kicker" id="intro-language">{m.language_label()}</p>
		<LanguageSwitcher compact labelledBy="intro-language" />
	</div>

	<!-- Sound stays surfaced here too (ticket 30's switch, off by default). -->
	<div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
		<p class="kicker" id="intro-sound">{m.settings_sound_label()}</p>
		<SoundToggle labelledBy="intro-sound" />
	</div>
</main>
