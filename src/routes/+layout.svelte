<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
	{@render children()}
</div>
