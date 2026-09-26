<script lang="ts">
	import { m } from '$lib/i18n/messages';
</script>

<svelte:head>
	<title>{m.privacy_title()}</title>
</svelte:head>

<main class="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-8 px-5 py-10">
	<header>
		<p class="kicker">{m.privacy_kicker()}</p>
		<h1 class="mt-3 text-[32px] leading-[1.12] font-semibold tracking-tight">
			{m.privacy_heading()}
		</h1>
		<p class="mt-4 text-[15px] leading-relaxed">{m.privacy_lead()}</p>
	</header>

	<!--
		Privacy policy body: legal text awaiting review, deliberately not moved
		into the message catalogues or machine-translated (ticket 26).
	-->
	<section>
		<h2 class="text-lg font-semibold tracking-tight">What is stored</h2>
		<p class="mt-2 text-sm leading-relaxed">
			A random id, kept in a cookie on this device, and the state of your Runs — the month you
			have reached, your money, your plan and the choices you have made, plus any finished
			Runs you have kept for replay. On the server the id is held only as a scrambled digest,
			so the cookie value itself never sits in the database.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">Why</h2>
		<p class="mt-2 text-sm leading-relaxed">
			To save your progress between visits, so you can pick the Run up where you left it. That
			is the only reason.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">For how long</h2>
		<p class="mt-2 text-sm leading-relaxed">
			A profile that has not been used for 12 months is deleted automatically by a daily
			cleanup job. Until then it stays, so you can come back to it. Clearing your browser's
			site data deletes the id immediately, and the progress with it.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">What is not collected</h2>
		<p class="mt-2 text-sm leading-relaxed">
			No account, no name, no email address. No IP address, no user agent, no fingerprinting,
			no analytics, no advertising and no third-party tracking. There is no consent banner
			because there is nothing to consent to: the one cookie is strictly necessary to save
			your game.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">Who can see it</h2>
		<p class="mt-2 text-sm leading-relaxed">
			Two services and no one else: the host that runs the game and the database that stores
			it, both in the EU. Nothing is sold, shared or sent outside the EU.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">Age</h2>
		<p class="mt-2 text-sm leading-relaxed">The game is for players aged 13 and over.</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">Downloading and deleting</h2>
		<p class="mt-2 text-sm leading-relaxed">
			Both live in <a class="underline underline-offset-2" href="/settings">Settings</a>:
			<strong>Download my data</strong> gives you a JSON file of everything stored, and
			<strong>Delete everything</strong> removes every stored Run and clears the id behind a
			typed confirmation. A fresh Run then starts from month 1.
		</p>
	</section>

	<section>
		<h2 class="text-lg font-semibold tracking-tight">Contact</h2>
		<p class="mt-2 text-sm leading-relaxed">
			Questions and privacy requests:
			<a
				class="underline underline-offset-2"
				href="https://github.com/ionutale/financial-game/issues">open an issue</a
			>.
		</p>
		<!-- No email address yet — this contact becomes a privacy@ address when the game gets a domain. -->
	</section>

	<footer class="mt-auto flex flex-col gap-2 text-sm">
		<a class="underline underline-offset-2" href="/settings">{m.link_settings()}</a>
		<a class="underline underline-offset-2" href="/">{m.link_back_to_game()}</a>
	</footer>
</main>
