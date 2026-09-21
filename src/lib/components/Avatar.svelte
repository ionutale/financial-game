<script lang="ts">
	/**
	 * An abstract silhouette that ages by proportion and posture (ticket 13).
	 * No face, no markers of gender or ethnicity — it sidesteps representation
	 * and works identically in all three locales.
	 */
	let { stage = 1, tint = false }: { stage?: number; tint?: boolean } = $props();

	// Head size and shoulder width grow; the posture straightens.
	const SHAPE = [
		{ headY: 17.5, headR: 6.6, width: 19, tilt: -5 },
		{ headY: 17.0, headR: 6.9, width: 21, tilt: -3.5 },
		{ headY: 16.5, headR: 7.2, width: 23, tilt: -2 },
		{ headY: 16.0, headR: 7.5, width: 25, tilt: -0.5 },
		{ headY: 15.5, headR: 7.8, width: 27, tilt: 0 }
	];

	const s = $derived(SHAPE[Math.min(4, Math.max(0, stage - 1))]);
</script>

<svg viewBox="0 0 48 48" class="h-full w-full" aria-hidden="true">
	<g transform="rotate({s.tilt} 24 40)">
		<circle cx="24" cy={s.headY + s.headR} r={s.headR} fill={tint ? 'var(--money)' : 'currentColor'} />
		<rect
			x={24 - s.width / 2}
			y={s.headY + s.headR * 2 + 1.6}
			width={s.width}
			height="26"
			rx={s.width * 0.46}
			fill={tint ? 'var(--money)' : 'currentColor'}
		/>
	</g>
</svg>
