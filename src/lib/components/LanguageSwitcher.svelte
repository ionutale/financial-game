<script lang="ts">
	/**
	 * The language switcher (ticket 28). Every option is a real link to the
	 * localized URL, so it works before hydration, opens in a new tab like any
	 * link, and a screen reader hears the target language from `hreflang`/`lang`.
	 * The click handler upgrades a plain left-click to Paraglide's `setLocale`,
	 * which also remembers the choice in the cookie and performs the full
	 * document navigation that keeps the current path (`/settings` ↔
	 * `/it/settings`).
	 */
	import { page } from '$app/state';
	import { m } from '$lib/i18n/messages';
	import {
		baseLocale,
		deLocalizeHref,
		extractLocaleFromUrl,
		localizeHref,
		locales,
		setLocale,
		type Locale
	} from '$lib/paraglide/runtime';

	let {
		compact = false,
		labelledBy
	}: { compact?: boolean; labelledBy?: string } = $props();

	// The URL decides which option is current, exactly as it decided what the
	// server rendered; the cookie is a preference, not the rendered language.
	const current = $derived(extractLocaleFromUrl(page.url) ?? baseLocale);

	// Endonyms, deliberately: someone who cannot read the page they are on must
	// still recognise their own language. The same value in all three catalogues.
	const names: Record<Locale, () => string> = {
		en: m.language_name_en,
		it: m.language_name_it,
		ro: m.language_name_ro
	};

	function href(locale: Locale): string {
		const localized = localizeHref(deLocalizeHref(page.url.pathname), { locale });
		// SvelteKit serves `/it`, not the `/it/` Paraglide builds for the root.
		return localized === '/' ? '/' : localized.replace(/\/$/, '');
	}

	function choose(event: MouseEvent, locale: Locale) {
		// Modified clicks keep the browser's behaviour (new tab, download, …).
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		void setLocale(locale);
	}
</script>

<div
	class={compact ? 'flex flex-wrap gap-1.5' : 'flex gap-2'}
	role="group"
	aria-label={labelledBy ? undefined : m.language_label()}
	aria-labelledby={labelledBy}
>
	{#each locales as locale (locale)}
		<a
			href={href(locale)}
			hreflang={locale}
			lang={locale}
			aria-current={current === locale ? 'true' : undefined}
			class="flex min-h-11 items-center justify-center rounded-xl border transition active:scale-[0.99] {compact
				? 'px-3 text-xs'
				: 'flex-1 px-4 text-sm'} {current === locale
				? 'border-[var(--money)] bg-[var(--money-wash)] font-semibold text-[var(--money)]'
				: 'border-[var(--line)] bg-[var(--surface)] font-medium text-[var(--ink)] hover:border-[var(--ink-40)]'}"
			onclick={(event) => choose(event, locale)}
		>
			{names[locale]()}
		</a>
	{/each}
</div>
