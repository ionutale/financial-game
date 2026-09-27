# Gamification — settled design (run 2)

**Status:** design only. No source code was changed. All artifacts are sandboxed under
`docs/gamification-grill/run-2/`. Companion files: `grilling-log.md` (the full rounds),
`CONTEXT-delta.md` (glossary), `adr/0001..0003` (the three durable decisions).

---

## 1. The design in one paragraph

Gamification here means **Progression Devices built from the Run's own money and story**, not a
parallel reward layer. The game already has stages, unlocks, consequences, a Money Story and a
stats sheet; it lacks a *short-horizon* sense of progress, a payoff for *learning*, and any
*discount* on replay. Five devices close that gap — a **Year in Review** on each Stage-up, a
**Concept Journal** in the Stats Sheet, money-native **Milestones** at the Month Close, a
cross-Run **Archive Wall** in Settings, and a light **juice** pass — and every one of them is
**derived from the Run we already store**, so no schema changes and no new privacy surface. XP,
coins, lives, stars, streaks, performance badges and leaderboards are excluded by design
(ADR-0001), because ticket 08 already found them to undermine exactly the behaviour this game
exists to build.

This is a **refinement of ticket 08 and ticket 05, not a reversal of them.**

---

## 2. What to add

### 2.1 Year in Review — the headline device

Ticket 05 promised it and the build never shipped it. At each **Stage-up Card**, render one line:
the year's **money summary** (net worth at the boundary and the year's change) and the **months
inside budget** for the year just ended (`computeMetrics().adherenceByYear[year-1]`, already
computed). Year 5 has no boundary Stage-up, so its line lands on the Money Story; the Fork carries
year 4→5.

*Why it is safe:* it is **annual and retrospective**, so it is exactly the "felt annually without a
scoreboard" boundary ticket 05 drew (ADR-0003). Two facts, no verdict, no colour, no rank.

### 2.2 Concept Journal — the collection device

A new section in the **Stats Sheet** listing the eight Concepts. Each row shows one of three text
states:

- **Introduced** — the Stage that unlocks it has opened (`min{stage : STAGES[stage].concepts ∋ c} ≤ run.stage`).
- **Experienced** — a card carrying it has been played (`run.log.some(e => cardById(e.card)?.concept === c)`).
- **Not yet** — for future Concepts, shown without revealing more than the Stage-up banner already does.

*Why it is safe:* it collects **exposure, not performance**. It cannot be farmed past "play the
game", cannot be lost, and reinforces the curriculum — the game's purpose — with a payoff that
currently only exists (as a name) at the Stage boundary.

### 2.3 Milestones — the recognition device

A small fixed set of money-native thresholds, each fired **once**, surfaced as a quiet line at the
**Month Close** in the month it is crossed:

| Milestone | Crossing test (from `history` / state) |
|---|---|
| First ◈500 saved | first row with `savings ≥ 500` |
| Net worth ◈1,000 | first row with `netWorth ≥ 1000` |
| Named Goal reached | first row with `savings ≥ goalTarget(path)` |
| Debt clear | first month with `debt === 0` after a month with `debt > 0` |
| ◈100 of interest earned | cumulative `interest ≥ 100` |
| Money in the Fund | first month with `run.fund > 0` |

*Why it is safe:* these are **outcomes of money already moving** — the "points must be the money
itself" condition from ticket 08, honoured literally. The set is **never rendered as a checklist**,
never shown as a count, and includes **no negative milestone** (a "first debt" notice would shame;
debt is narrated honestly in the Money Story instead).

### 2.4 Archive Wall — the cross-Run device

A compact list in **Settings** of the player's own finished Runs, newest first: outcome band, final
Net Worth, path, finish date. It reads the existing `ArchivedRun[]` — already stored, exported and
erased. No ranking, no sorting, no "best".

*Why Settings:* it is the profile's home and already server-backed. The game page loader returns
only the active Run (fact 6), so putting the Wall on the hot game path would force an extra load;
Settings keeps it off that path. This is the only device that needs a loader/endpoint change, which
is why it is sequenced last.

### 2.5 Juice — the feel layer

- Quiet **ticks at 25/50/75/100%** on the Named-Goal bar; the accessible progress value stays on the
  bar and the ticks are `aria-hidden` decoration.
- A short, reduced-motion-gated **pulse/fill** when a goal threshold is crossed.
- One new **`milestone` SFX cue** in the existing bank: a single rising note, off by default,
  positive-only, never load-bearing.

No new drawing: the art direction (beats only, never per card) is unchanged.

---

## 3. How it fits the existing domain

| New concept | Lives on top of | Derivation |
|---|---|---|
| Year in Review | `computeMetrics().adherenceByYear`, `history`, `stage` | pure |
| Concept Journal | `stage`, `STAGES[].concepts`, `log`, `cardById` | pure |
| Milestone | `history` (`MonthSnapshot[]`), `fund`, `path` | pure |
| Archive Wall | `ArchivedRun[]` (server) | pure |
| Goal ticks | `savedTowardGoal`, `goalTarget` | pure |
| Juice | `HUD`, `Month Close`, `sfx.ts` | presentation only |

Three rules make the fit clean:

1. **Derived, never persisted** (ADR-0002). No new `RunState` field, no profile document. Old saves
   render correctly by construction; `buildProfileExport`, the erasure route and the retention sweep
   are untouched.
2. **No metric changes.** Every device is a *view*. `computeMetrics` and `outcomeBand` are not
   altered, so the **Better-Choices Proof is unaffected** — which is the point.
3. **The vocabulary already exists.** Most strings reuse `concept_*`, `band_*`, `path_*`, `goal_*`,
   `resolve_*`; the new key budget is deliberately under ~25 across en/it/ro.

The devices are new derivations, not new mechanics: they add no knob to the economy, no card, no
draw rule, and no reducer action.

---

## 4. What we deliberately reject

Recorded in ADR-0001, with ticket 08 as the evidence:

- XP, levels, gems, coins, stars, lives, energy.
- **Streaks** — a timer in disguise, punitive on break, and a behavioural metric inside a Run.
- Performance badges/achievements — a parallel score.
- Leaderboards, rankings, any cross-player comparison (out of scope since charting).
- Daily-login / cadence mechanics.
- A visible Milestone checklist or count.
- Negative milestones.
- Cross-Run lifetime progression (deferred; see §8).

---

## 5. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A device invites optimisation of the wrong thing (milestone hoarding, adherence farming) | Journal tracks exposure; Milestones are outcomes, never targets, never a checklist; the only behavioural surface is annual and retrospective (ADR-0003) |
| Gamification drifts into a Reward Loop later | ADR-0001 fixes the test: *reward the money, not a number beside the money* |
| Schema creep / broken old saves | Derived-only (ADR-0002); unit tests with a minimal legacy `RunState` |
| Archive Wall expands the server path | Settings placement; reads only what the loader already needs there; sequenced last |
| Spoilers in the Journal | Future Concepts hidden behind a neutral locked row |
| Shaming tone | No negative milestones; Milestone text names a fact; colour never load-bearing; manual greyscale + muted passes |
| Privacy surface grows | None new: the Wall *is* the archive, so export/erase/retention already cover it |
| i18n debt | Small key budget, heavy reuse of existing keys, existing gates enforce parity |
| Accessibility regression (live region collision at the close) | Milestone renders inside the close's labelled region after the heading; **no** new `aria-live` (mirrors ticket 25) |

---

## 6. Verification

- **Unit (Vitest):** `conceptJournal` (three states per Concept, legacy save, unknown card id);
  `milestonesCrossed` (each threshold, single fire, empty history); Year-in-Review values per year;
  Archive Wall grouping. Pure functions, no DOM.
- **a11y (axe + Playwright):** the Stats Sheet with the Journal present; a Month Close carrying a
  Milestone line; reduced-motion path (the existing gate runs reduced motion).
- **i18n:** existing key-parity and allowed-key gates; three locales for every new key.
- **Manual (per `docs/accessibility.md`):** the greyscale pass and the muted pass now also cover the
  Journal's text states and the Milestone line — both must read without colour or sound.
- **Review rule (no test can enforce it):** the new devices must not be wired into `computeMetrics`,
  `outcomeBand`, or the draw/economy. A reviewer checks this.

---

## 7. Sequence of decisions made (this run)

1. **Q1** — "Gamification" means intrinsic Progression Devices using the game's own money/story; no Reward Loop. *(ADR-0001)*
2. **Q2** — Priority is the missing short-horizon loop and the learning payoff; no engagement targets.
3. **Q3** — Progression state is derived from the Run, never persisted. *(ADR-0002)*
4. **Q4** — Intrinsic, in-world, non-punitive, add-only.
5. **Q5** — Eight inherited guardrails (no score/streaks/timers, colour never load-bearing, reduced motion, en/it/ro, old saves valid).
6. **Q6** — Ship the Year in Review at each Stage-up. *(ADR-0003)*
7. **Q7** — Ship the Concept Journal in the Stats Sheet.
8. **Q8** — Ship money-native Milestones at the close, as notices not a checklist.
9. **Q9** — Ship the Archive Wall, modest and last.
10. **Q10/Q12** — Minimal juice: goal ticks, a reduced-motion pulse, one off-by-default SFX cue.
11. **Q11** — Explicit rejection list (streaks, XP, leaderboards, performance badges, daily cadence).
12. **Q13–Q19** — Detail: Introduction/Experience definitions; Stats Sheet placement; the six milestones; the Year-in-Review formula; the Wall's fields; within-Run only; legacy-save guards.
13. **Q20–Q27** — Risk containment, Proof safety, privacy, a11y, i18n, verification, and sequencing.

---

## 8. Shipping sequence (tracer bullets)

Each is independently landable; each is derive → render → gate → translate.

1. **This design + ADRs** *(done, this run)*.
2. **Concept Journal** — `conceptJournal(run)` in `stats.ts` + Stats Sheet section + unit tests + i18n.
3. **Year in Review** — Stage-up derivation from `history`/`computeMetrics` + tests + i18n.
4. **Named-Goal ticks** — HUD ticks + accessible label.
5. **Milestones** — `milestonesCrossed` + close line + `milestone` cue + reduced-motion pulse + tests + i18n.
6. **Archive Wall** — Settings view + loader/endpoint + tests + i18n.

---

## 9. Settled decisions (orchestrator answers) — open questions closed

The five items below were the only questions left open at the end of the grill. The orchestrator
answered for the user, accepting each recommended option exactly. **This section is closed** — none
of these remains open, and no further grilling is required.

1. **Cross-Run progression** — **deferred; within-Run only.** Revisit later as a profile-level
   "Concepts experienced across all Runs" count only if needed.
2. **Archive Wall placement** — **Settings, newest first, no rank.**
3. **Milestone thresholds** — **the fixed six;** the exact values (500 / 1 000 / 100) are tuning, not
   design.
4. **`milestone` SFX cue** — **added**, off by default.
5. **Goal-tick pulse** — **yes**, reduced-motion-gated.

## 10. Non-goals

- No change to the economy, the deck, the draw, the reducer, or `RunState`.
- No new persisted state, no new route on the game path, no analytics.
- No change to `computeMetrics`, `outcomeBand`, or the three Behavioural Measures.
- No XP/coins/lives/stars/streaks/leaderboards, and no performance claim the game cannot support.
- No new art; presentation reuses the existing tokens, beats and SFX bank.
