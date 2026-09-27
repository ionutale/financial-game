<script lang="ts">
	/**
	 * Settings (ticket 12): the two data rights, in-product and without an email.
	 * Download hits the export route; Delete removes the stored Run and expires the
	 * cookie behind a typed confirmation, then returns the player to a fresh Run.
	 * Ticket 30 adds the sound toggle: a preference, off by default, never run data.
	 */
	import { goto } from '$app/navigation';
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte';
	import SoundToggle from '$lib/components/SoundToggle.svelte';
	import { localizedHref } from '$lib/i18n/href';
	import { m } from '$lib/i18n/messages';
	import { tick } from 'svelte';

	let confirming = $state(false);
	let typed = $state('');
	let deleting = $state(false);
	let error = $state<string | null>(null);
	let confirmInput = $state<HTMLInputElement | null>(null);
	let deleteTrigger = $state<HTMLButtonElement | null>(null);

	// Case-insensitive so a phone keyboard cannot dead-end the player, but still
	// a deliberate typed word rather than a single tap (ticket 14). The token is
	// literal and never translated — the label says which word to type.
	const confirmed = $derived(typed.trim().toUpperCase() === 'DELETE');

	async function openConfirm() {
		confirming = true;
		error = null;
		await tick();
		confirmInput?.focus();
	}

	async function cancelConfirm() {
		confirming = false;
		typed = '';
		error = null;
		await tick();
		deleteTrigger?.focus();
	}

	async function deleteEverything() {
		if (!confirmed || deleting) return;
		deleting = true;
		error = null;
		try {
			const response = await fetch('/api/profile', { method: 'DELETE' });
			if (!response.ok) throw new Error(`delete failed: ${response.status}`);
			// The response expired the cookie. invalidateAll clears any preloaded
			// data for `/`, so the Run behind the Settings screen cannot come back:
			// the load reruns with the new profile and starts at month 1.
			await goto('/', { invalidateAll: true });
		} catch {
			error = m.settings_delete_error();
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>{m.settings_title()}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-10">
	<header>
		<p class="kicker">{m.settings_kicker()}</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			{m.settings_heading()}
		</h1>
		<p class="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
			{m.settings_lead()}
		</p>
	</header>

	<section class="surface p-5" aria-labelledby="settings-language">
		<p class="kicker" id="settings-language">{m.settings_language_kicker()}</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			{m.settings_language_body()}
		</p>
		<div class="mt-4">
			<LanguageSwitcher labelledBy="settings-language" />
		</div>
	</section>

	<section class="surface p-5" aria-labelledby="settings-sound">
		<p class="kicker" id="settings-sound">{m.settings_sound_kicker()}</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			{m.settings_sound_body()}
		</p>
		<div class="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
			<span class="text-sm font-semibold" id="settings-sound-label">{m.settings_sound_label()}</span>
			<!-- A monochrome switch: the money accent stays reserved for money, and
			     the state is carried by aria-checked and the On/Off word, never by
			     colour alone (ticket 13/14). -->
			<SoundToggle labelledBy="settings-sound-label" />
		</div>
	</section>

	<section class="surface p-5" aria-labelledby="settings-download">
		<p class="kicker" id="settings-download">{m.settings_download_kicker()}</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			{m.settings_download_body()}
		</p>
		<a
			href="/api/profile/export"
			download="financial-game-export.json"
			class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--money)] px-5 font-semibold text-white transition active:scale-[0.99]"
		>
			{m.settings_download_button()}
		</a>
	</section>

	<section class="surface p-5" aria-labelledby="settings-delete">
		<p class="kicker" id="settings-delete">{m.settings_delete_kicker()}</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			{m.settings_delete_body()}
		</p>

		{#if confirming}
			<label class="mt-4 block text-sm font-semibold" for="delete-confirm">
				{m.settings_delete_confirm_label()}
			</label>
			<input
				id="delete-confirm"
				class="mt-2 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 text-base"
				bind:value={typed}
				bind:this={confirmInput}
				autocapitalize="characters"
				autocomplete="off"
				spellcheck="false"
			/>
			<div class="mt-4 flex flex-col gap-3 sm:flex-row">
				<button
					class="min-h-11 rounded-xl bg-[var(--down)] px-5 font-semibold text-white transition active:scale-[0.99] disabled:opacity-40"
					disabled={!confirmed || deleting}
					onclick={deleteEverything}
				>
					{deleting ? m.settings_deleting() : m.settings_delete_confirm()}
				</button>
				<button
					class="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-semibold transition active:scale-[0.99]"
					onclick={cancelConfirm}
				>
					{m.settings_delete_cancel()}
				</button>
			</div>
		{:else}
			<button
				class="mt-4 max-w-full min-h-11 rounded-xl border border-[var(--down)] px-5 font-semibold text-[var(--down)] transition active:scale-[0.99]"
				bind:this={deleteTrigger}
				onclick={openConfirm}
			>
				{m.settings_delete_button()}
			</button>
		{/if}

		<p class="mt-3 text-sm text-[var(--down)]" aria-live="polite">{error ?? ''}</p>
	</section>

	<footer class="mt-auto flex flex-col gap-2 text-sm">
		<a class="underline underline-offset-2" href={localizedHref('/journal')}>{m.link_journal()}</a>
		<a class="underline underline-offset-2" href={localizedHref('/privacy')}>{m.link_privacy_policy()}</a>
		<a class="underline underline-offset-2" href={localizedHref('/')}>{m.link_back_to_game()}</a>
	</footer>
</main>
