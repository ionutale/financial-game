<script lang="ts">
	let count = $state(0);
</script>

<main class="mx-auto max-w-[420px] p-6">
	<h1 class="text-2xl font-semibold tracking-tight">Financial Game</h1>
	<p class="mt-1 text-sm opacity-60">
		Scaffold check — SvelteKit, Tailwind, DaisyUI and Svelte 5 runes.
	</p>

	<div class="card mt-6 bg-base-100 shadow-sm">
		<div class="card-body">
			<span class="badge badge-soft badge-primary">◈{count.toLocaleString('en-US')}</span>
			<button class="btn btn-primary" onclick={() => (count += 10)}>Add ◈10</button>
		</div>
	</div>
</main>
