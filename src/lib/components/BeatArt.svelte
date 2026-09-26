<script lang="ts">
	/**
	 * The beat illustrations (ticket 30). One inline SVG, keyed by art id,
	 * drawn with the app's design tokens: the money accent is the only colour,
	 * colour never carries meaning alone, and every piece is restrained enough
	 * to read at 390px. Deliberately inline, not a static file per beat — the
	 * drawings inherit `--money` and friends straight from `:root`, plug into
	 * the catalogue for alt text, and cost no requests (see docs/art-audio.md).
	 *
	 * No mascots, no emoji, no baked-in text: the pictures are shapes only.
	 */
	import { beatAltKey, type BeatArtId } from '$lib/game/beats';
	import { message } from '$lib/i18n/messages';

	let { beat }: { beat: BeatArtId } = $props();

	const alt = $derived(message(beatAltKey(beat)));
	const LINE = 'var(--ink-40)';
	const FAINT = 'var(--ink-25)';
	const SOFT = 'var(--wash)';
	const PAPER = 'var(--surface)';
	const MONEY = 'var(--money)';
	const MONEY_WASH = 'var(--money-wash)';
</script>

<svg
	viewBox="0 0 300 120"
	role="img"
	aria-label={alt}
	class="block h-auto w-full"
	fill="none"
	stroke-linecap="round"
	stroke-linejoin="round"
>
	{#if beat === 'allowance'}
		<!-- Coins dropping into a wallet: the allowance arrives. -->
		<circle cx="118" cy="28" r="11" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<circle cx="118" cy="28" r="4" stroke={FAINT} stroke-width="2" />
		<circle cx="150" cy="44" r="11" fill={MONEY} stroke={MONEY} stroke-width="2.5" />
		<circle cx="150" cy="44" r="4" stroke={PAPER} stroke-width="2" />
		<circle cx="182" cy="28" r="11" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<circle cx="182" cy="28" r="4" stroke={FAINT} stroke-width="2" />
		<rect x="96" y="60" width="108" height="44" rx="10" fill={SOFT} stroke={LINE} stroke-width="2.5" />
		<path d="M96 74h108" stroke={FAINT} stroke-width="2" />
		<circle cx="186" cy="84" r="4" fill={LINE} />
	{:else if beat === 'phone_plan'}
		<!-- A phone beside a calendar, one month marked: the recurring bill. -->
		<rect x="42" y="16" width="54" height="88" rx="10" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<path d="M60 28h18M60 92h18" stroke={FAINT} stroke-width="2" />
		<path d="M112 44a16 16 0 0 1 18 0" stroke={FAINT} stroke-width="2.5" />
		<path d="M106 36a26 26 0 0 1 30 0" stroke={FAINT} stroke-width="2.5" />
		<circle cx="121" cy="52" r="2.5" fill={LINE} />
		<rect x="148" y="26" width="112" height="76" rx="10" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<path d="M148 46h112" stroke={FAINT} stroke-width="2" />
		<path d="M170 18v16M238 18v16" stroke={LINE} stroke-width="2.5" />
		<circle cx="174" cy="64" r="4" fill={FAINT} />
		<circle cx="202" cy="64" r="4" fill={FAINT} />
		<circle cx="230" cy="64" r="4" fill={FAINT} />
		<circle cx="174" cy="84" r="4" fill={FAINT} />
		<circle cx="202" cy="84" r="4" fill={MONEY} />
		<circle cx="230" cy="84" r="4" fill={FAINT} />
	{:else if beat === 'first_payslip'}
		<!-- A payslip with a coin on its corner: effort becomes a wage. -->
		<rect x="58" y="16" width="118" height="88" rx="8" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<path d="M76 38h82M76 54h82M76 70h56" stroke={FAINT} stroke-width="2.5" />
		<path d="M76 88h60" stroke={MONEY} stroke-width="6" />
		<circle cx="196" cy="86" r="20" fill={PAPER} stroke={MONEY} stroke-width="2.5" />
		<circle cx="196" cy="86" r="7" stroke={MONEY} stroke-width="2" />
	{:else if beat === 'bnpl_offer'}
		<!-- A shopping bag beside four instalments, the first one taken. -->
		<rect x="60" y="48" width="70" height="52" rx="9" fill={SOFT} stroke={LINE} stroke-width="2.5" />
		<path d="M78 48v-8a17 17 0 0 1 34 0v8" stroke={LINE} stroke-width="2.5" />
		<path d="M74 80h40" stroke={FAINT} stroke-width="2" />
		<path d="M168 62h96" stroke={FAINT} stroke-width="2" />
		<rect x="162" y="50" width="24" height="24" rx="6" fill={MONEY} stroke={MONEY} stroke-width="2.5" />
		<rect x="196" y="50" width="24" height="24" rx="6" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<rect x="230" y="50" width="24" height="24" rx="6" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<rect x="264" y="50" width="24" height="24" rx="6" fill={PAPER} stroke={LINE} stroke-width="2.5" />
	{:else if beat === 'first_statement'}
		<!-- A statement over a payment card, the balance line marked. -->
		<rect x="150" y="8" width="96" height="56" rx="10" fill={SOFT} stroke={FAINT} stroke-width="2.5" />
		<rect x="162" y="24" width="20" height="14" rx="3" fill={PAPER} stroke={FAINT} stroke-width="2" />
		<rect x="62" y="20" width="164" height="88" rx="8" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<circle cx="206" cy="40" r="6" stroke={FAINT} stroke-width="2" />
		<path d="M80 40h84" stroke={LINE} stroke-width="4" />
		<path d="M80 60h148M80 74h148" stroke={FAINT} stroke-width="2.5" />
		<path d="M80 92h66" stroke={MONEY} stroke-width="6" />
		<path d="M170 92h58" stroke={FAINT} stroke-width="2.5" />
	{:else if beat === 'first_taxed_payslip'}
		<!-- One pay bar, split: the kept part and the deducted part leaving. -->
		<rect x="40" y="30" width="220" height="40" rx="9" fill={SOFT} stroke={LINE} stroke-width="2.5" />
		<path d="M212 24v52" stroke={LINE} stroke-width="2.5" stroke-dasharray="5 5" />
		<rect x="216" y="34" width="40" height="32" rx="7" fill={MONEY_WASH} stroke={MONEY} stroke-width="2.5" />
		<path d="M62 42h120M62 58h84" stroke={FAINT} stroke-width="2.5" />
		<path d="M236 74v22M236 96l-7-7M236 96l7-7" stroke={MONEY} stroke-width="2.5" />
	{:else if beat === 'scam'}
		<!-- A coin caught on a hook, lowered on a dashed line. -->
		<path d="M224 14C196 38 172 52 150 62" stroke={FAINT} stroke-width="2.5" stroke-dasharray="6 7" />
		<path d="M150 62v14" stroke={LINE} stroke-width="3" />
		<path d="M150 76a24 24 0 0 1-48 0" stroke={LINE} stroke-width="3" />
		<path d="M102 76v-10" stroke={LINE} stroke-width="3" />
		<circle cx="126" cy="94" r="14" fill={MONEY_WASH} stroke={MONEY} stroke-width="2.5" />
		<circle cx="126" cy="94" r="5" stroke={MONEY} stroke-width="2" />
	{:else if beat === 'crash'}
		<!-- A chart line climbing to a peak, then falling to the baseline. -->
		<path d="M40 14v82h230" stroke={FAINT} stroke-width="2.5" />
		<path d="M54 72C92 60 124 46 166 28L258 96" stroke={MONEY} stroke-width="3" />
		<circle cx="166" cy="28" r="4.5" fill={PAPER} stroke={MONEY} stroke-width="2.5" />
	{:else if beat === 'fork'}
		<!-- One path forking in two: a book on one branch, a briefcase on the other. -->
		<path d="M24 60h96" stroke={LINE} stroke-width="3" />
		<path d="M120 60c36 0 48-26 88-26h40" stroke={LINE} stroke-width="3" />
		<path d="M120 60c36 0 48 26 88 26h40" stroke={LINE} stroke-width="3" />
		<circle cx="120" cy="60" r="7" fill={MONEY} />
		<rect x="248" y="18" width="34" height="30" rx="4" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<path d="M265 18v30" stroke={FAINT} stroke-width="2" />
		<rect x="248" y="72" width="34" height="24" rx="4" fill={PAPER} stroke={LINE} stroke-width="2.5" />
		<path d="M258 72v-4a7 7 0 0 1 14 0v4" stroke={LINE} stroke-width="2.5" />
	{:else if beat === 'money_story'}
		<!-- Five years, five bars; the final year carries the accent. -->
		<path d="M40 100h224" stroke={FAINT} stroke-width="2.5" />
		<rect x="52" y="78" width="30" height="22" rx="5" fill={SOFT} stroke={FAINT} stroke-width="2.5" />
		<rect x="96" y="66" width="30" height="34" rx="5" fill={SOFT} stroke={FAINT} stroke-width="2.5" />
		<rect x="140" y="54" width="30" height="46" rx="5" fill={SOFT} stroke={FAINT} stroke-width="2.5" />
		<rect x="184" y="42" width="30" height="58" rx="5" fill={SOFT} stroke={FAINT} stroke-width="2.5" />
		<rect x="228" y="22" width="30" height="78" rx="5" fill={MONEY_WASH} stroke={MONEY} stroke-width="2.5" />
	{/if}
</svg>
