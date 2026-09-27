# Gamification — grilling log (run 2)

**Task:** "I want gamification added to this game."
**Method:** `grill-with-docs` → `grilling` + `domain-modeling`. Design tree worked in rounds;
the frontier (questions whose prerequisites are settled) is asked one round at a time.
**Run mode:** non-interactive. Every question is settled immediately with the ➡️ recommended
answer; that recommendation *is* this run's answer. No `question` tool was used.
**Sandbox:** all output lives under `docs/gamification-grill/run-2/`. No existing repo file was
edited. No source code was changed.

---

## 0. Facts established before grilling (facts are the griller's job)

Read from the repo, not assumed. Files inspected: `CONTEXT.md`, `src/lib/game/{types,loop,economy,
metrics,stats,cards,threads,spine,beats}.ts`, `src/lib/components/{MonthScreen,StageUp,MoneyStory,
Hud,StatsSheet,ResolveStep,EventStep,Intro}.svelte`, `src/lib/i18n/{game-text,chips,card-text}.ts`,
`messages/en.json`, `src/lib/server/{store,profile-export}.ts`, `src/routes/+page.server.ts`,
`src/routes/api/run/+server.ts`, `docs/{accessibility,art-audio}.md`, `.scratch/mvp/{map.md,
charting-decisions.md,research/08-prior-art.md,issues/05-ending-report-metrics.md}`.

Facts that constrain every question below:

1. **The project has already decided *against* classic gamification.** Ticket 08 (prior art)
   says: *"no XP/coins/lives or leaderboards"*; *"If we use points at all, they must be **the money
   itself**, not a parallel currency."* `map.md` puts **leaderboards out of scope**, and
   `charting-decisions.md` #22 lists *"multiplayer/social; leaderboards"* as out of scope.
2. **Teaching metrics are deliberately hidden during a Run.** Ticket 05: *"the teaching metrics are
   never visible during the Run… A player who can see a score optimises the score instead of living
   the life."* Budget adherence and savings rate are the ending's payoff, not a dashboard.
3. **One metric line per Stage was promised but never built.** Ticket 05's *Year-in-review*: *"The
   stage-up card carries one metric line plus the money summary — 'You stayed inside budget 8 of 12
   months; net worth ◈1,240.'"* `StageUp.svelte` renders only the title and *"Unlocks {concepts}"* —
   the metric line does not exist in the build. This is the single biggest missing game-feel loop.
4. **The model already exposes everything a derived progression layer needs.** `RunState.history:
   MonthSnapshot[]` (netWorth, savings+fund, debt, income, saved, spentWant, interest, insideBudget)
   is appended once per close; `RunState.log[{month, card, choice}]` records every card played;
   `RunState.flags[]` records Turning Points; `computeMetrics()` already computes `adherenceByYear`
   and the trajectory. All are on the client and already persisted per Turn.
5. **The eight Concepts already have a guaranteed funnel.** `STAGES[1..5].concepts` partitions all
   eight across the five Stages; `pickCard()` boosts concepts *"behind their quota of two"*. The
   Stage-up banner already prints *"Unlocks …"*.
6. **There is a cross-Run archive but no cross-Run UI.** `ArchivedRun[]` holds every finished Run's
   final state, seed and `finishedAt`. But `+page.server.ts` loads **only the active Run**; the
   archive is reachable only through `GET /api/profile/export`. Any archive-facing screen needs a
   loader change.
7. **Hard, documented presentation constraints.** WCAG 2.2 AA; colour **never** load-bearing; no
   timers anywhere; motion respects `prefers-reduced-motion`; the Month Close deliberately has **no
   live region** (ticket 25 — the focused heading announces it); SFX is off by default, quiet,
   positive-only and **never load-bearing**; art is at the beats, never per card; every string exists
   in en/it/ro (695 keys each) and an i18n gate fails on drift.
8. **Old saves must keep loading.** `store.ts` deliberately reads pre-existing document shapes and
   `stats.ts` guards a missing `thread` field. Schema additions are a real cost here.

### The design tree (before round 1)

```
gamification of this game?
├─ A. What does "gamification" mean here, given the no-XP/no-leaderboard decision?
├─ B. What problem is it solving / who is it for?
├─ C. Where does its state live — RunState, or derived?
├─ D. Which devices ship?
│   ├─ D1. short-horizon loop inside a Run
│   ├─ D2. collection / completion
│   ├─ D3. recognition moments
│   ├─ D4. cross-Run meta-progression
│   └─ D5. juice (motion/audio) and goal feedback
├─ E. What must NOT change (guardrails)?
└─ F. Risks, verification, sequencing
```

Prerequisites run left-to-right: A/B/C/E gate D; D gates all detail in F.

---

# Round 1 — Framing

The frontier here is the root: definition, purpose, state topology, motivational constraint, and
guardrails. None of these depends on another answer in this round.

❓ **Q1** — **What does "gamification" mean in *this* project, given ticket 08's standing "no XP/coins/lives/leaderboards"?** The word is overloaded. It could mean (a) a parallel reward layer — XP, coins, stars, gems, levels, lives; (b) intrinsic progression devices that make the existing money mechanics more legible and satisfying, using the money itself as the reward; (c) a competition/social layer. Ticket 08 already rejected (a) and (c) on evidence (Deci/Koestner/Ryan: tangible rewards undermine intrinsic motivation; Banqer's leaderboards measure luck). The user's ask reopens this. Do we re-decide ticket 08, or sharpen it?

➡️ **Sharpen it, and keep (b).** Add a glossary term that makes the boundary explicit: **Gamification** = *the set of Progression Devices that make a Run's forward movement legible and satisfying, using the game's own money and story as the reward.* It adds **no parallel currency, no score, and no competition**. The rejected pattern gets its own banned term: **Reward Loop** = *an extrinsic progression layer (XP, coins, lives, stars, gems, streaks, leaderboards) that measures something other than the money.* Ticket 08 is **reaffirmed, not reversed** — the ask is satisfied by doing (b) *well*, because (a) is the thing the evidence says fails. This is the run's root decision and is recorded as **ADR-0001**.

❓ **Q2** — **What problem is this solving — what is actually missing?** Candidates: (i) no short-horizon feedback (the Named Goal is 60 months away; the outcome band is hidden until month 60); (ii) no recognition of *learning* (a player finishes 5 years and is never shown that they met all eight Concepts); (iii) no reason to replay beyond curiosity (the archive exists but is invisible); (iv) flat moment-to-moment feel (money moves but rarely *celebrates*).

➡️ **All four are real; (i) and (ii) are the priority.** (i) is a promised-but-unbuilt ticket; (ii) is the game's *purpose* (eight capabilities) and currently has no payoff inside a Run. (iii) and (iv) are enhancements, sequenced later. Explicit non-goal: designing for click-through, session counts, or any engagement metric — the privacy decision (no analytics) makes engagement unmeasurable and the Better-Choices Proof is the real success criterion.

❓ **Q3** — **Where does progression state live: new fields in `RunState`, or derived from the Run we already store?** Options: (a) persist a new `milestones`/`conceptsSeen` set (migration risk for old saves; a new stored field); (b) derive every device from `history`, `log`, `stage` and `path` at render time (no schema change, old saves keep loading, nothing new to export/erase); (c) a separate profile-level document.

➡️ **Derive it (b), with one deliberate exception carried as a trade-off (ADR-0002).** The data already needed is stored: `log` gives Concepts experienced, `history` gives milestone crossings and the annual line, `stage` gives Concepts introduced, `ArchiveWall` reads the existing archive. Deriving means: no `RunState` schema change, no write-path change, no export/erase change, and old saves render correctly by construction. The cost — recomputation on render, and no memory of a crossing after the Run is archived — is accepted. This is a genuinely surprising choice (most games persist achievement state), so it is recorded as **ADR-0002**.

❓ **Q4** — **What is the motivational rule of thumb we design to?** The prior-art research is specific: intrinsic motivation is undermined by expected tangible rewards; effects are larger for rules-of-thumb and just-in-time content; a character you care about beats a ledger; scarcity creates tension; failure must be recoverable and non-shaming.

➡️ **Intrinsic, in-world, non-punitive.** Every device must be (1) *the money or the story*, (2) *legible without reading a manual*, (3) *impossible to lose* (the Add-only rule extends to progression: nothing a player has met is ever removed or downgraded), and (4) *never scolding* — a milestone names a fact, never a failure. No device may create a number the player would rationally farm.

❓ **Q5** — **What are the non-negotiable guardrails?** Enumerate what the docs already hard-require.

➡️ **Eight guardrails, all inherited, none new:**
1. **No parallel currency, no score, no leaderboards** (ADR-0001).
2. **No live behavioural score during a Run**; the only recurring behavioural surface is the annual Year in Review, which ticket 05 already sanctioned (ADR-0003).
3. **Add-only** — nothing met is ever lost or downgraded; milestones cannot "break".
4. **Colour never load-bearing**; every progression state carries a word.
5. **No timers; no streaks** (a streak is a timer in disguise and a punishment when it breaks).
6. **Motion respects `prefers-reduced-motion`; audio stays off by default, positive-only, never load-bearing.**
7. **All strings in en/it/ro**; art stays at the beats, never per card, so no new drawing is required.
8. **Old saves and the privacy shape stay valid** — derived state means no new stored fields.

**Frontier recomputed.** A/B/C/E settled. Round 2's frontier: the device portfolio (D1–D5) plus
the explicit rejection list. Detail (how each device works) depends on *which* devices are chosen,
so it waits.

---

# Round 2 — The device portfolio

❓ **Q6** — **Build the short-horizon loop: a Year in Review line on every Stage-up Card?** Ticket 05 promised *"one metric line plus the money summary"* at each Stage boundary and the build never shipped it. It is derivable (`computeMetrics().adherenceByYear` + `history`), it is annual (not a live meter), and it is the moment the player most needs recognition — a Stage just ended.

➡️ **Yes — ship it, and make it the headline gamification feature.** One line at each Stage-up (and at the Fork): *money summary + months inside budget this year.* Rendering it once per year is exactly the boundary ticket 05 drew, so it does not become a scoreboard. Recorded as **ADR-0003** because the gamification ask makes "why not a live streak?" a question a future reader will ask.

❓ **Q7** — **Add a collection/completion device: a Concept Journal?** The game teaches eight Concepts and never tells the player they met them. A Journal with the eight Concepts, each showing **Introduced** (its Stage has opened — which the Stage-up banner already announces) and **Experienced** (a card carrying that Concept has been played — derivable from `log` + `cardById`), is the classic "collection" device, but it collects *exposure*, not *performance*. It directly reinforces the curriculum and needs no new state.

➡️ **Yes — a Concept Journal section in the Stats Sheet, 8 rows, "Introduced / Experienced", future ones hidden (spoiler-safe).** This is the device that most cleanly answers the ask while being *more* educational than a badge. It is not a score: a player cannot "farm" it beyond playing the game, and it cannot be lost.

❓ **Q8** — **Add in-Run recognition moments: money-native Milestones?** A small set of thresholds crossed once (first ◈500 saved, first month clear of Debt, first ◈1,000 net worth, the Named Goal reached, first ◈100 of interest earned, first money in the Fund), surfaced as a quiet one-line note at the Month Close. These are *the money itself*, which is precisely the condition ticket 08 set. They are fully derivable by scanning `history` for the crossing.

➡️ **Yes — but as *notices*, never as a visible checklist.** The player must never see "3 of 8 milestones". A checklist becomes a score; a notice is a moment. The set is fixed and small; thresholds are not previewed. No negative milestones (a "first debt" notice would shame; debt is already narrated honestly in the Money Story).

❓ **Q9** — **Add cross-Run meta-progression: an Archive Wall?** The profile already stores every finished Run (`state`, `seed`, `finishedAt`) and exports it, but no screen shows it. A small gallery — each past Run's outcome band + final Net Worth — is the cross-Run you-vs-you and gives replay a visible point.

➡️ **Yes, but sequenced last and kept deliberately modest.** It is the *only* device that needs a loader/endpoint change (fact 6: the game page loads only the active Run). Its value is real but lower than Q6–Q8, and it touches the server path. Show bands and money; never rank, never "best".

❓ **Q10** — **Add a juice layer (motion + audio)?** The art/audio doc already reserves motion for choice feedback, bars and the close, and defines a quiet positive-only SFX bank. Candidates: a pulse on the Named-Goal bar when a milestone threshold is crossed, a fill animation on the bar, one new `milestone` cue.

➡️ **Yes, minimal and reduced-motion-gated.** One `milestone` cue (a single rising note, off by default, positive-only); a short pulse/fill on the Named-Goal bar at 25/50/75/100%. No new drawing. Nothing load-bearing.

❓ **Q11** — **Name the devices we deliberately reject**, so the boundary is on record.

➡️ **Reject:** XP/levels; coins/gems/soft currency; lives/energy; stars; **streaks** (timer-like and punitive on break, and it hides a behavioural metric inside a Run — against guardrail 2); **badges/achievements awarded for performance** (a parallel score); **leaderboards or any cross-player comparison** (out of scope since charting); **daily-login/cadence mechanics** (no timers, no push, and a device-keyed anonymous player cannot be asked to return on schedule); **a visible milestone checklist**; **negative milestones**. Recorded in ADR-0001's consequences.

❓ **Q12** — **Goal-bar milestone ticks on the HUD?** The Named Goal bar shows a single progress fill. Add quiet ticks at 25/50/75/100% so the only always-visible progress bar acquires sub-goals.

➡️ **Yes.** Derivable, static, no strings of its own beyond an accessible label, and it makes the one existing long-horizon goal feel nearer. This is the cheapest device and belongs with Q6.

**Frontier recomputed.** Portfolio settled: Year in Review, Concept Journal, Milestones,
Archive Wall, juice, goal ticks. Round 3's frontier: the detail of each chosen device, plus the
derivation/old-save rule. Questions about the *rejected* devices are moot.

---

# Round 3 — Detail

❓ **Q13** — **Exactly when is a Concept *Introduced* and *Experienced*?** Options: (a) Introduced = the Stage that first lists it has opened; Experienced = the first Event Card whose `concept` equals it has been played; (b) both tied to a hand-authored "Teachable Moment" card per Concept; (c) Experienced when the Concept's *mechanics* are first touched.

➡️ **(a).** `Introduced(c) ⇔ min{stage : STAGES[stage].concepts ∋ c} ≤ run.stage` — always true once its Stage opens, and it matches the Stage-up banner's existing *"Unlocks …"* language. `Experienced(c) ⇔ run.log.some(e => cardById(e.card)?.concept === c)` — a real first encounter, guaranteed for most Concepts by the `pickCard` quota, and never a performance claim. (b) would need new authoured data and some Concepts have no spine card (e.g. `needs_wants`). (c) has no data source. **Never** call an Experienced Concept *learned* or *mastered* — the game makes no such claim.

❓ **Q14** — **Where does the Concept Journal live, and how does it avoid spoilers?** Options: the Stats Sheet (an existing on-demand full-screen surface), the Money Story, a new route, or the HUD.

➡️ **A section in the Stats Sheet.** It is on-demand (so it never becomes a persistent scoreboard), it is already a gated a11y screen, and it already uses the derived-`stats.ts` pattern — the Journal is `conceptJournal(run)` added there. Future Concepts render as a neutral locked row (no name revealed beyond the Stage-up's existing announcement, no greyed "you failed"). The Stats Sheet gains a section; no new route.

❓ **Q15** — **What exactly is in the Milestone set, and what is the non-checklist rule in operative terms?** Candidates and their derivations from `history` (each row already has `netWorth`, `savings` = savings+fund, `debt`, `interest`, and the `MonthSnapshot` list is appended on close): `saved_500` (first `savings ≥ 500`), `net_worth_1000` (first `netWorth ≥ 1000`), `goal_reached` (first `savings ≥ goalTarget(path)`), `debt_free` (first month with `debt === 0` after a month with `debt > 0`), `interest_100` (cumulative `interest ≥ 100`), `fund_opened` (first `run.fund > 0`).

➡️ **Ship those six; fire at the close of the crossing month; show the line once; never render the list, a count, or the un-crossed ones.** A Milestone is produced by `milestonesCrossed(prevState, run)` — actually derived from `history` alone by testing whether the crossing month equals `run.month`. It is *recognition of an outcome already visible on the close*, never a target the game tells you to chase. `goal_reached` and `debt_free` are the two that carry the story; the rest are quiet texture.

❓ **Q16** — **What is the Year in Review's exact line and formula?** Ticket 05's example: *"You stayed inside budget 8 of 12 months; net worth ◈1,240."*

➡️ **Two facts, no judgement:** *months inside budget in the year just ended* (`adherenceByYear[year-1]`, already computed) **and** the money summary — net worth at the Stage boundary, plus the year's change (`history` rows for that year). For year 5 the boundary is the end of the Run, so the line renders on the Money Story instead (the Fork's Stage-up carries year 4→5's line). No band, no colour verdict, no comparison.

❓ **Q17** — **Archive Wall shape and fields?** It can only read the existing `ArchivedRun[]`.

➡️ **A compact list, newest first:** band chip, final Net Worth, path, and `finishedAt` (localised). No sorting control, no "best", no rank, no comparison between entries beyond what the band already means. Lives in **Settings** (which is already the profile's home and already server-backed) rather than the Money Story, to avoid loading the archive on the hot game path — this directly mitigates fact 6's loader cost. If it later earns a place in the Money Story's *"What next"*, that is a follow-up, not the first cut.

❓ **Q18** — **Does any device remember progress *across* Runs?** A cross-Run "8/8 Concepts experienced" counter, or lifetime Milestones, would be the strongest completion pull — but needs profile-level state.

➡️ **No — within-Run only for now; cross-Run is explicitly deferred.** It would require new persisted state (breaking ADR-0002's derived rule at the profile level), touch the export/erase/retention shape, and start to look like the lifetime collection that becomes a score. The Archive Wall (Q9/Q17) already provides cross-Run continuity using data that exists. Flagged in FINAL-DESIGN as the likeliest v-next ask, with the recommended design sketch.

❓ **Q19** — **How do we guarantee old saves render correctly and the derivation cannot throw?** Existing code already guards a missing `thread` (`stats.ts`) and reads legacy document shapes (`store.ts`).

➡️ **Mirror those guards.** `conceptJournal` uses `run.log ?? []` and ignores unknown card ids; `milestonesCrossed` treats an absent/empty `history` as "no crossings"; the Journal uses `STAGES[run.stage]` with the existing `Math.min(5, …)` stage invariant. Add unit tests with a minimal/legacy `RunState`. No migration, no version bump.

**Frontier recomputed.** Device detail settled. Round 4's frontier: risk, privacy, a11y, i18n,
verification and sequencing — all of which need the full device set to exist first.

---

# Round 4 — Risk, verification, sequence

❓ **Q20** — **Does any device invite the wrong optimisation (the failure ticket 08 warned about)?** The risky ones: the Concept Journal (could reward breadth over depth), Milestones (could encourage hoarding or "don't spend to keep the milestone"), the Year in Review (a visible adherence number could be farmed).

➡️ **Contain each explicitly.** The Journal tracks *exposure*, which the quota mechanic already produces — it cannot be farmed past "play the game". Milestones are *outcomes of money already moving*, never shown as targets, and include no "spend nothing" threshold — and `saved_500`/`interest_100` reward the intended behaviours (saving, compounding), which are the game's goals, not a distortion. The Year in Review is annual and retrospective, so there is exactly one decision point per year at which it could be gamed, and by then the year's months have closed. **No device may be added that a rational player would max out by playing badly at the money.**

❓ **Q21** — **Does gamification endanger the Better-Choices Proof?** The Proof (the MVP's success criterion) is the you-vs-you comparison of the three behavioural measures.

➡️ **No, because nothing changes the metrics or their derivation.** Every device is a *view* over data the Proof already uses. Three explicit non-goals: do not add a success metric based on Milestones or Journal completeness; do not surface the three behavioural measures outside the Money Story and the annual Year in Review; do not let a device alter `computeMetrics`. Add a unit test asserting the Metric values are unchanged by the presence of the new UI (they are pure functions, so this is really a "don't wire it in" review rule, recorded in FINAL-DESIGN).

❓ **Q22** — **Privacy consequences?** The only new surface is the Archive Wall, which reads existing archived Runs.

➡️ **None new, and that is a feature of the derived design.** No new stored field ⇒ `buildProfileExport` (`run` + `archive`), the erasure route, and the 12-month retention sweep all remain correct unchanged. The Archive Wall is subject to exactly the same deletion and export as the rest of the profile, because it *is* the profile. A one-line note goes in the implementation ticket: any future persisted progression state must be added to the export and the sweep.

❓ **Q23** — **Accessibility specifics?** Constraints from `docs/accessibility.md`: the close has **no live region** (the focused heading announces it); colour is never load-bearing; motion respects reduced-motion; the Stats Sheet is a focus-trapped modal.

➡️ **Concrete rules:**
- Milestone at the close: render **inside the Month Close's labelled region**, after the heading, with its own short heading/word — do **not** add an `aria-live` region (mirrors ticket 25's deliberate "no live region"). The focus move announces the screen; the milestone is the next thing in reading order.
- Concept Journal: a real `<table>` or `<dl>` with a text state per row (*"Experienced"* / *"Introduced"* / *"Not yet"*), never colour/icon alone. New section joins the existing Stats Sheet a11y test.
- Named-Goal ticks: `aria-hidden` decoration; the accessible progress value stays on the existing bar.
- Milestone pulse: `@media (prefers-reduced-motion: reduce)` removes it; the text line already carries the event.
- New screens/sections get one axe test each; the Journal section is covered by the existing Stats Sheet screen.

❓ **Q24** — **i18n budget?** Every new string is ×3 (en/it/ro), gated.

➡️ **Keep it under ~25 new keys** so translation is a small pass: Journal section labels + the four state words; six Milestone lines + one Milestone heading; the Year-in-Review line (one parametrised key, not five); Archive Wall labels (title, band reuse, empty state, path reuse, one date row). Reuse existing `band_*`, `path_*`, `concept_*`, `goal_*`, `resolve_*` keys wherever possible — most of the vocabulary already exists.

❓ **Q25** — **How is the work verified?** The repo gates are `pnpm check`, `pnpm test` (Vitest), the i18n check, and the axe/Lighthouse a11y suite.

➡️ **Unit (Vitest, pure):** `conceptJournal(run)` (introduced/experienced/not-yet, legacy save, unknown card id); `milestonesCrossed(run)` (each threshold, no double-fire, empty history); the Year-in-Review values per year; Archive Wall grouping from `ArchivedRun[]`. **a11y:** axe over the Stats Sheet with the Journal present, and over a Month Close carrying a milestone line. **i18n:** the existing key-parity/allowed-key gates. **Manual:** the greyscale and muted passes now also cover the Journal states and the milestone line (they must read without colour or sound).

❓ **Q26** — **What is the sequence of shipping work?** Small, independently landable tickets.

➡️ **Ordered:** (1) this design + ADRs; (2) **Concept Journal** derivation (`stats.ts` level: `conceptJournal`) + Stats Sheet section + tests + i18n; (3) **Year in Review** at Stage-up (derive from `history`/`computeMetrics`) + tests + i18n; (4) **Named-Goal ticks** + accessible label; (5) **Milestones** at the close + `milestone` SFX cue + reduced-motion pulse + tests + i18n; (6) **Archive Wall** in Settings (loader/endpoint change) + tests + i18n. Each ticket is a tracer bullet: derive → render → gate → translate.

❓ **Q27** — **Any question left genuinely unresolved, so the frontier can close honestly?** Enumerate the items that are "settled by recommendation but most likely to be revisited", so nothing is silently assumed.

➡️ **Frontier is empty; five items are settled-by-recommendation and named as revisit candidates:**
1. **Cross-Run progression** — recommendation: defer; within-Run only (Q18).
2. **Archive Wall placement** — recommendation: Settings, newest first, no rank (Q17). If a human wants it on the Money Story, it moves.
3. **Milestone set size/specific thresholds** — recommendation: the fixed six of Q15; the exact values (500, 1 000, 100) are tuning, not design.
4. **`milestone` SFX cue** — recommendation: add, off by default, one rising note; if a human prefers no new cue, the text line carries it.
5. **Milestone pulse** — recommendation: a short bar pulse, reduced-motion-gated; optional.

---

## Design tree, fully visited

```
gamification of this game?
├─ A. meaning: Progression Devices using the money itself; no Reward Loop   [Q1, ADR-0001]
├─ B. purpose: short-horizon recognition + learning payoff + replay pull     [Q2]
├─ C. state: derived, never persisted                                        [Q3, ADR-0002]
├─ D. devices
│   ├─ D1. Year in Review at each Stage-up                                   [Q6, Q16, ADR-0003]
│   ├─ D2. Concept Journal in the Stats Sheet                                [Q7, Q13, Q14]
│   ├─ D3. money-native Milestones at the close (not a checklist)            [Q8, Q15]
│   ├─ D4. Archive Wall in Settings (cross-Run, no rank)                     [Q9, Q17, Q18]
│   └─ D5. juice: goal ticks, reduced-motion pulse, one SFX cue              [Q10, Q12]
├─ E. guardrails: no score, add-only, no streaks, colour/audio/motion rules  [Q5, Q11]
└─ F. risk · privacy · a11y · i18n · verification · sequence                 [Q20–Q27]
```

**Frontier: empty.** Every branch visited; every recommendation recorded. Nothing acted on in
code (this is a design-and-docs run only).
