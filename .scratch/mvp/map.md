# Wayfinder Map — Financial Game MVP

## Destination

A **buildable MVP spec** for the financial life-sim: a mobile-first SvelteKit web game where a
teenager plays a **5-in-game-year run in monthly turns** (~60 authored event cards), earning,
budgeting and saving through **life stages that unlock all eight financial concepts** shallowly,
with **recoverable consequences**, **anonymous device-keyed progress**, **en/it/ro**, deployed on
**Vercel with MongoDB Atlas**, and an end-of-run report that proves **better choices**.

Reaching it = every decision below resolved, so the spec assembles directly. **Building the app
lies beyond this destination.**

## Notes

- **Domain**: adolescent (13–18) financial literacy delivered as a life-sim. Glossary in
  [`../../CONTEXT.md`](../../CONTEXT.md).
- **Skills**: HITL tickets use `grilling` + `domain-modeling`; `research` tickets use `/research`;
  `prototype` tickets use `/prototype`.
- **Stack (locked)**: SvelteKit 5 + `adapter-vercel`, MongoDB Atlas, Vercel, DaisyUI.
- **Standing preferences**: mobile-first; translate-only multi-locale, one shared economy
  (en/it/ro); data-driven JSON event deck; seeded randomness (reproducible runs); real
  consequences but always recoverable; flat-vector playful art; modern realistic teen life;
  **anonymous-only in the MVP — accounts deferred to v2.** Resolved in
  [12 — Privacy & data handling](issues/12-privacy.md): not dodged, but reduced — one strictly-necessary
  cookie, one policy page, two buttons in Settings, one cron sweep.
- **Process**: one ticket per session; research tickets may parallelise. Claim a ticket by setting
  `Status: claimed` before any work.
- Ticket **11** assembles the spec; building the app is past the destination.

## Decisions so far

Settled during charting (full Q&A in [`charting-decisions.md`](charting-decisions.md)):

- **Destination** — buildable MVP spec, not a prototype or shipped product.
- **Audience** — teens 13–18; no COPPA. No accounts either — though a device key remains
  pseudonymous personal data, so privacy still has a floor (see 06 and 12).
- **Game shape** — life-sim / virtual economy; life stages, monthly turns.
- **Run length** — 5 in-game years, character ages **14→19** (extended from 13→18 so independence
  is played, not implied) × 1 event/month = **60 draws from an authored pool of 81 cards**; the
  surplus of 21 is what makes runs differ.
- **Concepts** — all eight, wide and shallow, unlocked by life stage.
- **Identity** — anonymous-first; MongoDB stores content + device-keyed anonymous progress.
  Accounts fully deferred to v2 (email+password chosen for when they arrive).
- **Locales** — translate-only, one economy: en + it + ro.
- **Success** — in-run metrics + end-of-run "Money Story" report proving better choices.
- **Tone** — real consequences (debt, overdrafts, missed rent) but always recoverable.
- **Platform** — mobile-first responsive web.
- **Randomness** — seeded draws from the event deck.
- **Content** — data-driven JSON event deck.
- **Look** — flat vector, playful; modern realistic teen setting.
- **Out of scope** — multiplayer/social, leaderboards.

Closed tickets:

- [01 — Game economy model & difficulty curve](issues/01-economy-model.md) — `◈` whole-number
  currency; Lean year 5 (~70% of net income consumed by obligations); 3% savings vs 2.5% inflation;
  Need/Want/Save envelopes feeding a named goal; one card at 19.9% APR with a 600-start score; one
  market fund at 7% ±16% with a scripted crash; 20% withheld tax; insure-or-gamble risk moments;
  seeded shocks capped at 400; net worth = Cash + Savings + Fund − Debt.
- [02 — Life-stage ladder & concept-unlock map](issues/02-stage-ladder.md) — five one-year Stages
  14→19 (Pocket Money → First Budget → First Wage → First Credit → The Fork); concepts unlock on
  the spine earn → budget → save → borrow → invest → tax, each with one mechanic and one teachable
  moment; Free Time (100h shrinking) trades against the hours slider; BNPL at 17 builds no Credit
  Score, the card arrives at 18; Stage 5 forks into a Study path (900/mo, 3,000 loan) or a Work
  path (1,600/mo, ~1,150 obligations); Stages only add, never remove.
- [03 — Event Card schema & authoring rules](issues/03-event-card-schema.md) — language-neutral JSON
  cards at `content/cards/<stage>/<id>.json` plus `content/spine.json`; immutable slug ids drive the
  i18n keys; one schema with five `kind`s; a typed effect vocabulary with mechanically-derived cost
  chips (costs visible, outcomes hidden); server-side seeded draw from an **81-card pool** producing
  60 draws, one thread live at a time, a card plays at most once per Run.
- [04 — Month-turn loop & decision UX](issues/04-turn-loop-ux.md) — one scrolling **month screen**,
  Plan → Event → Resolve; money envelopes + work-hours sliders with preset and repeat; choices carry
  cost chips, **money cascades Save→Debt while Free Time is a hard limit**; Feedback shows
  immediately under the choice; a compact month-close sheet; shocks and Risk Moments *are* the
  month's card; progress commits at month close.
- [05 — Run ending, Money Story & success metrics](issues/05-ending-report-metrics.md) — fixed ending
  at month 60; **descriptive outcome bands** from money, the path goal and the score; the **compact
  seven** metrics; teaching metrics **hidden until the end**; the Money Story runs story-first with
  turning points drawn from `flags`, then a **you-vs-you** comparison on the three behavioural
  measures, then the numbers; finished Runs are archived on the profile for replay.
- [12 — Privacy & data handling for device-keyed play](issues/12-privacy.md) — a strictly-necessary
  cookie holding 32 random bytes, stored only as a peppered digest; **no banner, no analytics, no
  IP/UA/fingerprinting**; legitimate interest documented in `docs/privacy/lia.md`; 12-month
  inactivity retention enforced by cron; **Download my data** and **Delete everything** in Settings;
  EU regions for both Vercel and Atlas.
- [13 — Art & audio direction](issues/13-art-and-audio.md) — typographic-first, illustrated at the
  beats (~10 images: spine moments + stage-up cards, never per card); **one accent colour reserved
  for money**, colour never load-bearing; an abstract silhouette avatar that ages, optionally
  tinted; SFX only, off by default, hybrid synthesised + ~4 CC0 stings, never load-bearing;
  **CC0 for art and audio, permissive for icons and fonts**; one variable display face for numbers
  plus system body; light theme only in the MVP.
- [14 — Accessibility target](issues/14-accessibility.md) — **WCAG 2.2 AA with a documented subset**
  (six criteria listed as not applicable, including error prevention because in-game mistakes are
  the content); **fully playable with a screen reader**; no timers anywhere; 200% text zoom must
  reflow; colour never load-bearing and targets ≥ 44px; `prefers-reduced-motion` respected;
  verification is axe + Lighthouse in CI plus four manual passes — muted, zoomed, keyboard-only,
  greyscale.
- [06 — SvelteKit + Vercel + MongoDB Atlas architecture](issues/06-architecture.md) — Node runtime,
  one module-scoped `MongoClient` (pool 5–10), Atlas holds only the Anonymous Profile + Run state,
  deck stays in git, one server-resolved card view per turn, idempotent turn resolution via
  `findOneAndUpdate`.
- [07 — i18n for en/it/ro](issues/07-i18n.md) — Paraglide JS + language-neutral deck with
  `messages/{locale}.json` keyed by card/choice ids; locale is presentation only and never feeds
  the seeded RNG.
- [08 — Prior art: teen financial-literacy games](issues/08-prior-art.md) — model on ESSI Money /
  Banqer High; budgeting, saving, interest, credit and investing have proven interactive
  treatments; tax/scams/needs-vs-wants must be consequences, never quizzes; let the player play
  the villain; no XP/coins/lives or leaderboards.
- [15 — Interest rounding](issues/15-interest-rounding.md) — the savings line keeps two decimals,
  so the compounding lesson is visible when it is first taught.
- [17 — The default plan trap](issues/17-default-plan-trap.md) — hours still default to 0 and the
  economy is unchanged; the Plan step gains a Shortfall Warning and Stage 3 a one-time Wage Hint,
  so doing nothing is legible instead of silent.

## Not yet specified

<!-- in-scope fog, not yet sharp enough to ticket -->
- Classroom/teacher tools, native mobile app, user-generated scenarios, monetization, push
  notifications — considered but not ruled out; revisit once the spec lands.
- Working title, branding, domain name.
- Progress portability across devices without accounts (device-id limitation).
- The v2 anonymous→account migration path.
- Authoring workflow/tooling for adding new cards after the 60.
- The concrete city/character fiction and the list of 60 cards per stage.

## Out of scope

- **Multiplayer / social play** — beyond the destination.
- **Leaderboards** — beyond the destination.

## Frontier

**Empty of the original work — every decision is resolved.** The build's tickets:

- [ ] **19 exhausted-pool-fallback** — `issues/19-exhausted-pool-fallback.md` — the fallback that
  stops a Stage stalling deals cards with their `requires` and Thread rules bypassed; found by
  playing a full Run.
- [ ] **20 stats-sheet** — `issues/20-stats-sheet.md` — Debt, Savings, Fund and the score are
  invisible during play.
- [x] **19 exhausted-pool-fallback** — resolved: the fallback now repeats legally and only as a
  last resort; the deck grew to 84 cards so every Stage can fill its draws unseen (0 repeats
  across four seeds).
- [x] **21 study-buffer-label** — resolved: one `goalName()` for the HUD and the Money Story.
- [x] **18 fork-before-plan** — resolved: the Fork is a Stage-up interstitial that resolves before
  month 49's Plan, with the compact stage announcement.
- [x] **16 deck-content-pass** — resolved: 69 cards, pools of 15/15/16/15 and 25 drawable in
  Stage 5; `requires` and `thread` implemented, with the countdown chip on the month screen.
- [x] **15 interest-rounding** — resolved and shipped.
- [x] **17 default-plan-trap** — resolved: the Shortfall Warning and the Wage Hint; no economy change.

What remains of the original map is not a decision — it is two artifacts awaiting a human:

- **09 turn-loop-prototype** — resolved without human validation; the risk is carried by the build.
- **10 money-story-prototype** — resolved without human validation; story-first is untested.

**11 spec-assembly** is unblocked, and is superseded in practice: the build is being driven directly
from the tickets.
