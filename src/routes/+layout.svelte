<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-dvh bg-base-200 text-base-content">
	{@render children()}
</div>
