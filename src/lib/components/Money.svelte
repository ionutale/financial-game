<script lang="ts">
	import { formatMoney } from '$lib/game/economy';

	type Size = 'hero' | 'lg' | 'md' | 'sm';
	type Tone = 'money' | 'ink' | 'muted' | 'up' | 'down';

	let {
		amount,
		size = 'md',
		tone = 'ink',
		sign = false
	}: { amount: number; size?: Size; tone?: Tone; sign?: boolean } = $props();

	const SIZES: Record<Size, string> = {
		hero: 'text-[40px] leading-[1.18] font-medium',
		lg: 'text-2xl font-medium',
		md: 'text-base',
		sm: 'text-sm'
	};
	const TONES: Record<Tone, string> = {
		money: 'text-[var(--money)]',
		ink: 'text-[var(--ink)]',
		muted: 'text-[var(--muted)]',
		up: 'text-[var(--up)]',
		down: 'text-[var(--down)]'
	};

	// A negative amount takes a leading minus; a positive one can show a leading plus.
	const shown = $derived(
		amount < 0
			? '\u2212' + formatMoney(Math.abs(amount))
			: (sign ? '+' : '') + formatMoney(amount)
	);
</script>

<span class="figure {SIZES[size]} {TONES[tone]}">{shown}</span>
