<script lang="ts">
	/**
	 * Settings (ticket 12): the two data rights, in-product and without an email.
	 * Download hits the export route; Delete removes the stored Run and expires the
	 * cookie behind a typed confirmation, then returns the player to a fresh Run.
	 */
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';

	let confirming = $state(false);
	let typed = $state('');
	let deleting = $state(false);
	let error = $state<string | null>(null);
	let confirmInput = $state<HTMLInputElement | null>(null);
	let deleteTrigger = $state<HTMLButtonElement | null>(null);

	// Case-insensitive so a phone keyboard cannot dead-end the player, but still
	// a deliberate typed word rather than a single tap (ticket 14).
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
			error = 'That did not go through. Nothing was deleted — try again.';
			deleting = false;
		}
	}
</script>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-7 px-5 py-10">
	<header>
		<p class="kicker">Settings</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			Your data, your call.
		</h1>
		<p class="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
			The game keeps one thing about you: a random id and the Run it points at. Take it with
			you or delete it — neither needs an account.
		</p>
	</header>

	<section class="surface p-5" aria-labelledby="settings-download">
		<p class="kicker" id="settings-download">Download my data</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			A JSON file holding the saved Run exactly as it is stored: the month, the money, the
			plan and the choices.
		</p>
		<a
			href="/api/profile/export"
			download="financial-game-export.json"
			class="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--money)] px-5 font-semibold text-white transition active:scale-[0.99]"
		>
			Download my data
		</a>
	</section>

	<section class="surface p-5" aria-labelledby="settings-delete">
		<p class="kicker" id="settings-delete">Delete everything</p>
		<p class="mt-3 text-sm leading-relaxed text-[var(--muted)]">
			Removes the saved Run and clears the id on this device. It cannot be undone — a fresh
			Run starts from month 1.
		</p>

		{#if confirming}
			<label class="mt-4 block text-sm font-semibold" for="delete-confirm">
				Type DELETE to confirm
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
					{deleting ? 'Deleting…' : 'Delete for good'}
				</button>
				<button
					class="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 font-semibold transition active:scale-[0.99]"
					onclick={cancelConfirm}
				>
					Keep my progress
				</button>
			</div>
		{:else}
			<button
				class="mt-4 min-h-11 rounded-xl border border-[var(--down)] px-5 font-semibold text-[var(--down)] transition active:scale-[0.99]"
				bind:this={deleteTrigger}
				onclick={openConfirm}
			>
				Delete everything
			</button>
		{/if}

		<p class="mt-3 text-sm text-[var(--down)]" aria-live="polite">{error ?? ''}</p>
	</section>

	<footer class="mt-auto flex flex-col gap-2 text-sm">
		<a class="underline underline-offset-2" href="/privacy">Privacy policy</a>
		<a class="underline underline-offset-2" href="/">Back to the game</a>
	</footer>
</main>
