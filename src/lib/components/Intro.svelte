<script lang="ts">
	/**
	 * Three screens before the first month (ticket 04): who you are, what you are
	 * aiming at, and how a month works. No tutorial — the first card teaches.
	 */
	let { onDone }: { onDone: () => void } = $props();

	const SCREENS = [
		{
			kicker: 'Month 1 of 60',
			title: 'You are 14.',
			body: 'You have \u25c860 and a roof you do not pay for. In five years someone will hand you a payslip and expect you to cope with it.',
			footnote: 'Nobody is going to test you on this. It just goes better if you know how it works.'
		},
		{
			kicker: 'The goal',
			title: 'An emergency fund.',
			body: '\u25c84,000 by the time you are nineteen. It does not come from a windfall or a lucky month. It comes out of the money you decide not to spend.',
			footnote: 'Money you do not spend is the only money you keep.'
		},
		{
			kicker: 'How a month works',
			title: 'Plan it. Meet it. Close it.',
			body: 'You decide where the money goes before you know what the month holds. Then something happens, as it does. At the close you see what it cost.',
			footnote: 'Income lands when you start the month. The rest is up to you.'
		}
	];

	let step = $state(0);
	const screen = $derived(SCREENS[step]);
	const last = $derived(step === SCREENS.length - 1);

	function next() {
		if (last) onDone();
		else step += 1;
	}
</script>

<div class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-6 py-10">
	<div class="flex-1">
		{#key step}
			<div class="rise">
				<p class="kicker">{screen.kicker}</p>
				<h1 class="mt-4 text-[34px] leading-[1.1] font-semibold tracking-tight">
					{screen.title}
				</h1>
				<p class="mt-5 text-[17px] leading-relaxed">{screen.body}</p>
				<p class="mt-5 text-sm leading-relaxed text-[var(--muted)]">{screen.footnote}</p>
			</div>
		{/key}
	</div>

	<p class="mt-8 text-xs leading-relaxed text-[var(--muted)]">
		Your progress is saved on this device with a random id. No name, no email, no tracking.
		<a class="underline underline-offset-2" href="/privacy">Privacy policy</a>
		<span aria-hidden="true">·</span>
		<a class="underline underline-offset-2" href="/settings">Settings</a>
	</p>

	<div class="mt-6 flex items-center justify-between">
		<div class="flex gap-1.5" aria-hidden="true">
			{#each SCREENS as _, i (i)}
				<span
					class="h-1.5 rounded-full transition-all duration-300 {i === step
						? 'w-6 bg-[var(--money)]'
						: 'w-1.5 bg-[var(--wash)]'}"
				></span>
			{/each}
		</div>

		<button
			class="rounded-xl bg-[var(--money)] px-6 py-3 font-semibold text-white transition active:scale-[0.99]"
			onclick={next}
		>
			{last ? 'Start month 1' : 'Next'}
		</button>
	</div>
</div>
