# Fun & framing — final design (run 1)

**Ask:** *"I want to improve the game even more, make it more fun, more attractive, and make it feel
less like a teaching class and more like having a good time and fun."*

**Status:** settled after six grilling rounds (see `grilling-log.md`). Design/docs only — no source
code was changed. Sandboxed under `docs/fun-grill/run-1/` so the four parallel runs do not clobber
each other.

**One-line answer:** keep every guardrail and every number; change **how the game frames itself,
shows consequence and dresses its cards** — a Cold Open instead of three intro screens, a Year Beat
instead of "Unlocks {concepts}", a Ledger Line so money visibly moves, diegetic Card Formats, a
receipt month-close, two Play-the-Villain cards, Chapter Titles, a Road Not Taken line — and
**no new mechanics, no new stored state, no new art, no music, no analytics**.

---

## 1. What "fun" means here

The game does not need new mechanics to be fun; it needs the mechanics it has to be *felt*. This
pass defines fun as five things, and orders them by leverage:

1. **Framing and voice** — how the game talks to you (it already talks well in the deck; the wrap
   does not).
2. **Craft** — how a consequence lands the moment it happens (today: prose only).
3. **Variety and form** — how the same loop stops looking like the same card (today: one shape).
4. **Drama and stakes** — anticipation and closure (exists in Threads; under-felt).
5. **Expression** — it is my life, my calls (already true; strengthened by the framing).

Explicitly *not* fun, for this project: difficulty, speed, scores, competition, streaks, rewards.

**Governing sentence:** *the same sixty months, told better.*

**Governing rule (new):** the **Watch-it-happen Rule** — every Concept is taught by a consequence
the player watched happen in the fiction; never by a definition, a quiz or an instruction. Two
supporting principles: *the fiction is the interface*; *juice confirms, never carries.*

**Success instrument (no telemetry, per ticket 12):** a 5–8 player playtest, moderator notes only.
Success = players reach month 60; recount a concrete moment; describe a choice by how it felt; read
the numbers unprompted; name one thing they would change; start a second Run; and **nobody calls the
game a course, lesson, quiz or homework.** Honest limit: tiny n, self-reported; it finds problems,
it does not prove effects.

---

## 2. The diagnosis — why it reads as a class

Countable tells, ranked by harm, read from the shipped code:

| # | Tell | Evidence |
|---|---|---|
| 1 | Three expository intro screens | `Intro.svelte` — "You are 14" / "The goal" / "How a month works" |
| 2 | A syllabus line on every Stage-up | `stage_up_unlocks`: "Unlocks {concepts}" (`StageUp.svelte`) |
| 3 | A curriculum tracker, mid-Run | `Concept coverage` + `Introduced / Experienced / Not yet` (`StatsSheet.svelte`) |
| 4 | Consequence is prose-only | Feedback block is text; no visible money movement (`EventStep.svelte`) |
| 5 | The most repeated screen is a bank statement | seven-row month close (`ResolveStep.svelte`), 60× |
| 6 | The ending is a report card | "Months inside budget 34 / 60", "You, against you", "The numbers" (`MoneyStory.svelte`) |
| 7 | The title is a genre label | `app_title`: "Financial Life-Sim" |

The guardrails are **not** the cause. Hiding teaching metrics, banning XP, no timers and the a11y
bar do not make the game feel like school — the framing and the static consequence do. That is why
this pass reopens no hard guardrail and reworks the seven tells instead.

---

## 3. The design

### 3.1 Framing and voice (P0 — copy only; this phase alone changes the felt genre)

- **Cold Open.** One screen replaces the three: kicker "Month 1 of 60", "You are 14.", the existing
  body line, the Named Goal as one line ("By 19 you're aiming at ◈4,000 — money you don't spend."),
  Start, plus the existing privacy line and language switcher. "How a month works" becomes a
  **first-month Plan hint** shown while `month === 1 && history.length === 0` — the Wage Hint
  pattern: derived, self-retiring, no new state.
- **Year Beats.** Every Stage-up replaces "Unlocks {concepts}" with one authored in-fiction line
  (`stage_<n>_beat`, five keys). The unlocked Concept still unlocks; it is recorded, not recited.
- **Coverage relabel.** The shipped Coverage model stays exactly as it is; only the player-facing
  words change: "What money has shown you" (Stats) / "What the five years showed you" (Money Story)
  / "What you've met" (Journal); states *met* / *coming up* / *later*. The internal vocabulary
  (Concept, Coverage, Introduced, Experienced) is unchanged.
- **Voice Bible.** New `docs/voice.md`: second person, present tense, concrete nouns, short
  sentences; dry, on the player's side; never sneers at a choice; no exclamation marks, emoji,
  "Great job!" or ranks; rules of thumb only *after* the consequence; humour must survive literal
  translation. Includes a half-page cast note (Priya, Ravi, Danny, Grandma, the neighbour, the
  manager) for copy continuity.
- **Copy-pass scope.** Surface copy (intro, Stage-ups, Plan labels, close, Stats, Money Story,
  Journal, Settings — changed keys only), the nine spine cards + feedbacks, the eleven format cards,
  and the two villain cards. The rest of the pool is already in voice and is not rewritten. The
  added Fink translation debt is a known, listed cost.
- **Working title.** `app_title` and route titles adopt **"Leftover"** (runner-up: "Money Story"),
  with "Financial Life-Sim" kept as the descriptive subtitle. A reversible brand decision; taste
  still belongs to the owner.

### 3.2 Craft — the consequence moment (P1)

- **Ledger Line.** Inside the Feedback: the applied movement, changed entries only —
  `Cash +◈80 · Free time −14h`, or `Save −◈20 · Debt +◈15` when the cascade bites. Computed at the
  Month Screen edge from the previous and next `RunState` the reducer already returns: no new field,
  no economy recomputation, automatically truthful for insurance, cascade and Threads. Joins the
  existing `aria-live="polite"` region; signs and words carry the meaning, colour only supports.
  This is the research's #1 device, and the single change most likely to make the game feel like a
  game.
- **Receipt month-close.** Same figures, no folds: headline first (the existing hero change), then
  the Ledger Line, then the rows grouped *In / Out / Next month*, milestone line where it shipped.
  Focus behaviour (ticket 25) unchanged.
- **Five-year strip.** A five-segment strip in the HUD, current year filled to the current month;
  text readout unchanged; `aria-hidden` decoration. Time made visible — not a competence bar.
- **Avatar on Stage-up.** The existing silhouette at the year's age, one component argument, no new
  art.
- **Sound.** One new `payoff` cue for a Thread resolving (gesture-fired, off by default, positive-
  only, never load-bearing). **No music** this pass.
- **Motion policy.** One-shot emphases only, `prefers-reduced-motion` gated; no counting/rolling
  numbers, no artificial delays, no confetti, no loops, at most two emphases per screen.

### 3.3 Card Formats — variety without drawings (P2)

A card can be presented as the artefact it is, with the same words:

| Format | Cards | What it looks like |
|---|---|---|
| `message` | `scam_opportunity`, `app_tip`, `app_vanishes`, `refund_text`, `lend_to_friend` | a chat/text thread, bubbles in order, a countdown |
| `paper` | `first_payslip`, `first_taxed_payslip`, `payslip_error`, `first_statement`, `minimum_payment` | a document block: heading, lines, a total |
| `receipt` | `bnpl_trainers`, `subscription_creep`, `meal_deal` | an itemised till/statement block |

- **Mapping lives in `src/lib/game/forms.ts`** — a pure code map in the `beats.ts` tradition;
  **ADR-0001**. The deck schema is untouched and stays language-neutral data.
- Extra prose for multi-line formats lives in the catalogues under `card_<id>_line_<n>`; a
  `forms.test.ts` gate mirrors `beats.test.ts` (card ids exist; keys exist ×3 with agreeing
  placeholders; no orphan line keys).
- Constraints: text carries all meaning (layout never does); one heading and linear reading order
  for screen readers; one axe screen per format; no new controls; a format is never the only carrier
  of a value. Two more formats are a data + copy edit later, not a rebuild.

### 3.4 Drama and content (P3)

- **Two Play-the-Villain Cards** (**ADR-0002**, reopening the gamification merge's §10 deferral with
  reasons): Stage 4 — a phone-shop shift teaches the four-payment pitch with a friend at the
  counter; Stage 5 — a cut offered for bringing two friends into the app. Real gains, Threads that
  resolve with the friend's situation (`sold_the_split`, `brought_them_in`), no wrong-choice flag,
  no maxim, Better-Choices Proof untouched.
- **Threads unchanged structurally**: one live at a time, chip always visible; the `payoff` cue
  makes closure land. Stakes stay honest; no second slot, no missable deadlines.
- **Chapter Titles** (Journal): a pure derivation over a finished Run's `flags`/`log` picks its most
  significant moment (the market fall; the card; the loan; the minimum-payment year; the quiet
  year) and maps to a catalogue title. No stored data (ADR-0002 holds).
- **Road Not Taken** (Money Story's "What next"): if the archive holds a Run on the other path, one
  line — "Your other life: Chapter N, <band>." — linking to the Journal; otherwise the existing Fork
  tease. The game route's loader gains one small derived field; no new stored data, no new endpoint.
- **No flavour cards.** The pool is 84; the variety problem is form, not volume. Life stays visible
  through the copy pass and the villain cards.

### 3.5 Deliberate no-s (recorded, not omitted)

Failure and recovery feel (already non-judgemental and recoverable — "That is allowed — the cascade
covered it"; `debt_cleared` already gives recovery a beat) · music · new art · flavour cards ·
same-seed replay (still aims the player at the score) · short-Run mode (breaks the fixed ending and
the proof) · avatar tint · dark mode (v2) · personal bests (v1.1).

---

## 4. How it fits the existing domain and guardrails

| Guardrail / domain piece | How this design respects it |
|---|---|
| **Ticket 05 + ADR-0003 — teaching metrics hidden; behavioural numbers retrospective** | Nothing competence-shaped appears mid-Run. The Ledger Line shows balances, already live in the HUD. Fun comes from the life, not a score. |
| **Ticket 08 + gamification ADR-0001 — no XP/coins/lives/leaderboards** | No new progression device of any kind. The pass adds craft and framing only. |
| **ADR-0002 — progression derived, never persisted** | `forms.ts`, Chapter Titles and the loader's road-not-taken field are pure/derived; no `RunState` field, no profile field, no migration. |
| **Ticket 12 — privacy floor** | No analytics, no PII, no new collection; the Road Not Taken line derives from the archive already exported/deleted/swept. |
| **Ticket 13 — one accent, colour never load-bearing, light theme, beats-only art, SFX-only off by default** | Formats are typography, not drawings; the strip is decoration; every colour-bearing value keeps a word or sign; one new cue on the existing terms; no music. |
| **Ticket 14 + 24 — WCAG 2.2 AA subset, no timers, text-first, reduced motion, 44px** | Every new surface is text; every emphasis is reduced-motion gated; no timers/auto-dismiss; new screens join seed/screens/zoom and the manual passes. |
| **Tickets 07/26 — translate-only ×3 with a parity gate** | New keys are enumerated by gates; no concatenated sentences; the voice bible forbids untranslatable humour. |
| **Determinism — same seed, same Run** | No RNG, draw, reducer or economy change. The villain cards are content executed by the existing reducer. |
| **The shipped gamification layer** | Built on, not replaced: the Year in Review stays the annual beat, Milestones stay the recognition, the Journal finds its titles, Coverage keeps its model and loses its syllabus words. |
| **Ticket 02 / ticket 04** | Amended explicitly at the presentation level only: a Year Beat replaces the unlock list; a Cold Open plus a first-month hint replaces the three screens. Both recorded in the final design. |

---

## 5. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| **The formats hurt skim-reading** (a chat bubble is fun but slower) | Same text, one heading, linear reading order; each format axe-checked; the format is presentation and can be stripped without touching the deck. |
| **Villain cards glamourise or moralise** | The fence in ADR-0002: small gain, costlier Thread, no wrong-choice flag, no maxim; a playtest looks specifically for "the game told me off". |
| **The Road Not Taken triggers regret/optimisation** | One line, no numbers, framed as a lived story and pointing at the Journal, not a score to beat. |
| **Translation cost and drift** | Scoped copy pass (surface + spine + format + villain cards); gate-enumerated keys; the Fink debt is listed, not hidden. |
| **Motion regresses accessibility** | Policy is explicit (one-shot, gated, no counters, ≤2 emphases/screen); the a11y suite covers the new screens and the manual passes extend to them. |
| **The Ledger Line reads as a score** | It shows the balances already live in the HUD, has no target, no rank, no accumulation, and disappears with the month. |
| **"Fun" becomes scope creep** | A fenced non-goals checklist (§6) and five independently shippable phases (§7); nothing touches the economy, RNG, metrics or storage. |
| **The playtest is thin evidence** | Stated honestly in §8: it finds problems; it does not prove effects. |

---

## 6. Non-goals checklist (review gate)

No new mechanics · no XP/points/coins/lives/stars/gems · no leaderboards or other-player comparison ·
no timers, daily loop, notifications or FOMO · no visible teaching metric mid-Run · no change to the
Behavioural Measures, `computeMetrics` or `outcomeBand` · no economy, deck-draw, RNG or reducer
change (the villain cards are content) · no new `RunState`/profile field, no migration, no new
stored data · no analytics or telemetry · no new personal data · no new art files · no music ·
no second accent, no dark mode · no toasts, confetti, counters or artificial delays · no new
controls or drag interactions · no content gated behind anything · no moralising copy, no
wrong-choice flags, no maxims · no shortened Run · no same-seed replay · no new route on the game
path.

---

## 7. Delivery — additive phases, built on the shipped gamification layer

Each phase is independently shippable and reversible.

- **P0 — Framing and voice (copy only).** Cold Open; first-month Plan hint; Year Beats; coverage
  relabels; working title; `docs/voice.md`. *This phase alone changes the felt genre.*
- **P1 — Craft.** Ledger Line; receipt month-close; five-year strip; avatar on Stage-up; `payoff`
  cue; the motion policy applied. Extends the shipped juice layer; no stored state.
- **P2 — Formats.** `forms.ts` + three components + `card_<id>_line_<n>` copy + `forms.test.ts` +
  a11y screens.
- **P3 — Drama.** Two villain cards + two Threads; Chapter Titles; Road Not Taken line + the
  loader's derived field; cast note applied.
- **P4 — Proof and docs.** Playtest run; `docs/art-audio.md`, `docs/accessibility.md`,
  `docs/voice.md`, `docs/playtest.md`, CONTEXT merge; manual a11y passes extended.

**Suggested order of evidence:** P0 and P1 are the cheapest way to move the felt experience; P2 is
the visible variety win; P3 changes what the game *says* about money; P4 closes the loop. If only
one phase ships, ship P0 + P1.

---

## 8. Definition of done

The pass is done when:

1. `pnpm verify` is green — svelte-check, Vitest (including new `forms` / chapter-title tests),
   the i18n gates, axe/Lighthouse — with the new screens added and no excludes added.
2. The four manual a11y passes have been extended to the new surfaces and run.
3. The playtest protocol (5–8 players, notes only) has been run and its notes filed; specifically,
   no participant describes the game as a course, lesson, quiz or homework.
4. The non-goals checklist (§6) has been reviewed against the diff with no violations.
5. The Better-Choices Proof is unchanged: no new device can be optimised for competence, and every
   number the Money Story reports still comes from the same derivations.

**No engagement metric is claimed, because none is collected.**

---

## 9. Open questions and deferrals

**Open questions: none** — the design tree is fully visited (`grilling-log.md`, final frontier
check).

**Deferred by decision, each with its reason:**

- **Same-seed replay** — still deferred: it aims the player at the score instead of the life; the
  Road Not Taken line is the non-optimising version of the same wish.
- **Short-Run mode** — breaks the fixed month-60 ending, the Lean-year-5 curve and the proof.
- **Music** — licence pass, download weight, attention in a reading game; easy to add later, so it
  needs no lock.
- **Avatar tint** — identity decoration; weak against the pass's priorities.
- **Dark mode** — v2, per ticket 13 (the accent is contrast-checked against one surface).
- **Flavour cards** — the variety problem is form, not volume.
- **Personal bests** — a v1.1 candidate from the gamification merge; nothing here depends on it.

---

## 10. Files in this run

- `grilling-log.md` — every round: 37 questions + recommended answers, in ❓/➡️ form, with the
  ground-truth facts and the final frontier check.
- `CONTEXT-delta.md` — nine proposed glossary terms (Watch-it-happen Rule, Game Feel, Card Format,
  Cold Open, Year Beat, Ledger Line, Play-the-Villain Card, Road Not Taken, Chapter Title), the
  reused-term list, and the player-facing copy table.
- `adr/0001-card-formats-are-presentation-mapped-outside-the-deck.md`
- `adr/0002-play-the-villain-cards-are-admitted.md`
- `FINAL-DESIGN.md` — this file.