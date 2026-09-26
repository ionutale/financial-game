<script lang="ts">
	import MonthScreen from '$lib/components/MonthScreen.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Financial Life-Sim</title>
</svelte:head>

<MonthScreen initial={data.saved} seed={data.seed} />
