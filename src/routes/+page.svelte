<script lang="ts">
	import MonthScreen from '$lib/components/MonthScreen.svelte';
	import { m } from '$lib/i18n/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.app_title()}</title>
</svelte:head>

<MonthScreen initial={data.saved} seed={data.seed} />
