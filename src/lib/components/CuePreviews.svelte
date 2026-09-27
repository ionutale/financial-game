<script lang="ts">
	/**
	 * The cue previews (fun-pass ticket 04): small buttons so the bank is
	 * discoverable before sound is switched on. A preview is an explicit ask —
	 * it sounds while the game is muted and never writes the preference, so the
	 * off-by-default posture is untouched. The game itself never plays sound
	 * the player did not switch on.
	 */
	import { previewCue, type SfxCue } from '$lib/audio/sfx';
	import { m } from '$lib/i18n/messages';

	let { labelledBy }: { labelledBy: string } = $props();

	// The loop's own order: the tap, the card, the close, the year's big beats.
	const CUES: Array<{ cue: SfxCue; label: () => string }> = [
		{ cue: 'choice', label: () => m.settings_preview_choice() },
		{ cue: 'deal', label: () => m.settings_preview_deal() },
		{ cue: 'month_close', label: () => m.settings_preview_month_close() },
		{ cue: 'milestone', label: () => m.settings_preview_milestone() },
		{ cue: 'stage_up', label: () => m.settings_preview_stage_up() },
		{ cue: 'payoff', label: () => m.settings_preview_payoff() },
		{ cue: 'crash', label: () => m.settings_preview_crash() }
	];
</script>

<div class="flex flex-wrap gap-2" role="group" aria-labelledby={labelledBy}>
	{#each CUES as { cue, label } (cue)}
		<button
			type="button"
			class="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 text-xs font-semibold transition active:scale-[0.99]"
			onclick={() => previewCue(cue)}
		>
			{label()}
		</button>
	{/each}
</div>
