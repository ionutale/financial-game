<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { localizedAlternates } from '$lib/i18n/alternates';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Ticket 28: every server-rendered page carries the three locale URLs plus
	// x-default, generated from the localized URLs of the current path.
	const alternates = $derived(localizedAlternates(page.url));

	// The hydration signal the a11y suite waits on: an invisible marker set once
	// the client has mounted. Server HTML is on screen before this, but presses
	// and clicks on it are dispatched to inert markup and silently lost — the
	// race the month-close test lost on faster machines.
	onMount(() => {
		document.documentElement.dataset.hydrated = 'true';
	});
</script>

<svelte:head>
	{#each alternates as alternate (alternate.locale)}
		<link rel="alternate" hreflang={alternate.locale} href={alternate.href} />
	{/each}
</svelte:head>

<div class="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
	{@render children()}
</div>
