<script lang="ts">
	/**
	 * The sound switch (ticket 30, surfaced on the Cold Open by fun-pass ticket
	 * 02): a monochrome switch, off by default, the state carried by
	 * aria-checked and the On/Off word — never by colour alone. The preference
	 * is localStorage, never RunState; read after mount so the server HTML
	 * renders the honest default.
	 */
	import { playCue, setSfxEnabled, sfxEnabled } from '$lib/audio/sfx';
	import { m } from '$lib/i18n/messages';
	import { onMount } from 'svelte';

	let { labelledBy }: { labelledBy: string } = $props();

	// The accessible name is the section label plus the On/Off word the button
	// visibly shows, so the visible text is inside the name (WCAG 2.5.3).
	const stateId = `${labelledBy}-state`;

	let sound = $state(false);
	onMount(() => {
		sound = sfxEnabled();
	});

	function toggleSound() {
		sound = !sound;
		setSfxEnabled(sound);
		// Switching on confirms itself with the softest cue, inside the gesture.
		if (sound) playCue('choice');
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={sound}
	aria-labelledby="{labelledBy} {stateId}"
	class="inline-flex min-h-11 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 transition active:scale-[0.99]"
	onclick={toggleSound}
>
	<span class="text-xs font-semibold" id={stateId}
		>{sound ? m.settings_sound_on() : m.settings_sound_off()}</span
	>
	<span class="relative h-5 w-9 rounded-full border border-[var(--line)] bg-[var(--wash)]">
		<span
			class="absolute top-[2px] h-3.5 w-3.5 rounded-full transition-all duration-200 {sound
				? 'left-[20px] bg-[var(--ink)]'
				: 'left-[2px] bg-[var(--ink-40)]'}"
		></span>
	</span>
</button>
