<script lang="ts">
	import MonthScreen from '$lib/components/MonthScreen.svelte';

	let { data } = $props();
</script>

<MonthScreen initial={data.saved} />
