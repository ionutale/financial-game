<script lang="ts">
	/** The net-worth trajectory, drawn. Ticket 01 asked for a visible curve. */
	let { points, height = 96 }: { points: number[]; height?: number } = $props();

	const W = 360;
	const PAD = 6;

	const low = $derived(points.length ? Math.min(0, ...points) : 0);
	const high = $derived(points.length ? Math.max(...points, 1) : 1);

	const path = $derived(
		points
			.map((v, i) => {
				const x = PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2);
				const y = height - PAD - ((v - low) / (high - low || 1)) * (height - PAD * 2);
				return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
			})
			.join(' ')
	);

	const area = $derived(
		points.length ? `${path} L${W - PAD} ${height - PAD} L${PAD} ${height - PAD} Z` : ''
	);
</script>

<svg viewBox="0 0 {W} {height}" class="w-full" preserveAspectRatio="none" aria-hidden="true">
	<path d={area} fill="var(--money-wash)" />
	<path d={path} fill="none" stroke="var(--money)" stroke-width="2" stroke-linejoin="round" />
</svg>
