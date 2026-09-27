# Final design — Gamification of the Financial Life-Sim

*grill run 3 · settled non-interactively · design/docs only — no source changed*

---

## 1. The one-line thesis

**This game is already gamified in the two ways its own research says survive: Stages are its
levels, and money is its score. What it lacks is not reward but *acknowledgement* and *memory* — so
add exactly those, and nothing that creates a second score, a parallel currency, a live competence
meter, or a leaderboard.**

The user asked for "gamification". The honest answer for *this* game is a deliberately narrow one:
a feature that recognises what the player just did, and remembers who they have been — without ever
giving the player something to optimise instead of a life to live.

---

## 2. Why the obvious version is wrong here

The repo already made three decisions that a conventional gamification pass would silently undo:

| Existing decision | Source | What naive gamification would break |
|---|---|---|
| Teaching metrics are **never visible during a Run** — "a player who can see a score optimises the score". | ticket 05; header of `src/lib/game/metrics.ts` | A live adherence bar, savings-rate ticker or streak counter. |
| **No XP / coins / lives / leaderboards**; "if we use points at all, they must be the money itself, not a parallel currency". | ticket 08 (prior art) | A second currency ("miles"), badges-as-rewards, leaderboards. |
| **No timers, colour/motion never load-bearing, fully screen-reader playable.** | ticket 14 | Timed toasts, confetti, badge grids, FOMO loops. |
| Anonymised device-keyed profile, **no analytics, no new PII**. | ticket 12 | A server-side achievement/telemetry store. |
| One author, ~10 CC0 images, **typographic-first**. | ticket 13 | A badge/icon grid. |

So the design does not "add reward loops". It adds **acknowledgement** (Milestones) and **memory**
(a cross-Run Journal), and it defends the boundaries above as invariants.

---

## 3. What to add

### 3.1 Milestones (in-Run acknowledgement)

An authored catalogue of ~10–14 short acknowledgements, each triggered by **something already
visible in the Run**, shown at the **month close** and folded into the **Stage-up recap**.

- Evaluated **once per Turn at the month close** by a pure function over the existing `history`,
  `flags` and `log` — no new `RunState` field, no mid-event interruption (matches ticket 04's
  commit-at-close model).
- **Zero mechanical effect**: no `◈`, no interest, no score, no Free Time, no unlock that changes
  play.
- Copy is language-neutral keyed by milestone id, exactly like card copy; all three locales.

**Proposed v1 catalogue** (each an event the player already lived):

| id | fires when | why it matters |
|---|---|---|
| `first_pay` | the first payslip beat resolves | effort becomes a wage (ticket 02 concept 2) |
| `first_interest` | the first month interest credits (interest > 0) | compounding begins (concept 5) |
| `first_saved` | money first reaches Savings | "pay yourself first" |
| `goal_started` | the Named Goal first receives money | goal-setting (concept 4) |
| `goal_halfway` | the Named Goal passes 50% | the bar is real |
| `goal_reached` | the Named Goal fills (path-aware target) | ticket 05's goal |
| `debt_cleared` | Debt returns to 0 after having been > 0 | credit recovery (concept 6) |
| `first_month_inside_budget` | a month closes with Need and Want inside their envelopes | the plan held (concept 3) |
| `survived_a_shortfall` | the Shortfall Warning fired and the month closed without an overdraft | ticket 17's situation, survived |
| `insured_and_claimed` | insurer cover absorbed a shock (`insuredCost`) | the risk-wheel lesson (concept 8) |
| `held_through_the_crash` | the crash resolves with the Fund still held | investing discipline (concept 7) |
| `fork_chosen` | the Stage-5 Fork resolves | the Run's defining branch |

Every trigger is binary and event-shaped. None is a hidden numeric aggregate.

### 3.2 Concept Coverage (knowledge progression)

The eight Concepts, marked **met** when the player has played at least one card tagged with that
Concept (derived from `log` + `cardById(...).concept`; a Concept met in any Run is met forever on the
profile). This is progression-as-knowledge — the honest currency of an educational game — and it
gives replay a purpose: *meet the ones you missed.* No skill tree, no mastery level, no bar to fill.

### 3.3 The Journal (cross-Run memory)

A new localized route **`/journal`** — a private record of the player's own history:

- Every finished Run as a **Chapter**: its outcome band, turning points, Milestones, seed, and when
  it ended. **Chronological and story-first**, not ranked.
- **Concept Coverage** across all Runs.
- An honest empty state ("No chapters yet").
- Entry points: a **"Your Journal" section in the Money Story** (the moment a player is most
  receptive) and a quieter link in Settings.

The Journal is a **projection over the profile's existing `active` + `archive`** — no new datastore.
It is therefore automatically covered by the existing **Download my data**, **Delete everything** and
**12-month retention sweep**, and it adds no personal data at all.

### 3.4 Money Story "Your Journal" section

Added **after** the numbers and before "What next", preserving the story-first five-part order:
this Run's Milestones, its Concept Coverage, and an optional **retrospective streak** line
("your longest run inside your own budget was 14 months") — prose, not a counter, revealed where
ticket 05 already allows competence aggregates.

---

## 4. What is rejected (invariants)

No XP, levels, coins, gems, lives, energy, or any parallel currency. No live score, adherence or
savings-rate meter. No leaderboards, social comparison, or other players' numbers. No loot boxes,
random rewards, daily-login rewards, timers, or FOMO. No change to the economy, the deck, the
difficulty curve, or the a11y/privacy/i18n commitments. No new personal data and no analytics. No
badge grid or second visual language. No reward that changes play.

---

## 5. How it fits the existing domain

| Existing construct | How the addition uses it |
|---|---|
| **Stage ladder** (`economy.ts` `STAGES`, add-only) | Already the game's levels; **no second ladder**. |
| **Spine beats** (`spine.ts`) + **Teachable Moments** (ticket 02) | The natural anchors for several Milestones and for Concept Coverage. |
| **`flags` / `history` / `log`** (`types.ts`) | The only inputs to Milestone and Coverage derivation. |
| **Money Story** (ticket 05) | Gains the Journal section; order and story-first tone preserved. |
| **Stage-up year summary** (ticket 05) | Gains the year's Milestones and newly met Concepts. |
| **Run archive** (`RunProfile { active, archive }`, ticket 23) | The Journal's data source; export/delete/sweep already apply. |
| **Stats Sheet** (ticket 20) | **Unchanged** — it stays a live money view, not an achievement view. |
| **Message catalogue** (tickets 07/26) | All new strings are keys × en/it/ro, enforced by `messages.test.ts`. |
| **SFX bank** (ticket 30) | Reuse `stage_up`; at most one new quiet cue, off by default, never load-bearing. |
| **Beat art** (ticket 13/30) | Reuse `money_story`; at most one new `journal` beat, alt-texted in all locales. |
| **Vocabulary** | Milestone / Journal / Chapter / Concept Coverage / Honest-reveal rule (see `CONTEXT-delta.md`). |

---

## 6. Architecture sketch (design only, not implemented)

```
new pure derivations (no DOM, no Mongo — like metrics.ts / stats.ts)
  milestonesFor(run): MilestoneId[]        // over history/flags/log
  conceptsMet(run):   ConceptId[]          // over log + cardById().concept
  journal(profile):   Journal              // over active + archive
        ├── chapters: Array<{ seed, finishedAt, band, milestones, concepts, turnings }>
        └── coverage: Record<ConceptId, boolean>

new UI (presentation only)
  MonthClose (ResolveStep)  → one milestone line when new
  StageUp                   → year's milestones + newly met concepts
  MoneyStory                → "Your Journal" section + link
  /journal route            → chapters + coverage (localized, a11y-clean)
  Settings                  → link + derivation note

unchanged
  RunState, Mongo documents, stores, /api/run, export/delete/sweep, economy, deck
```

No endpoint, no schema, no migration, no back-compat shim beyond tolerating short/missing
`history`/`flags`/`log` on legacy saves (mirroring the existing `run.thread ?? null` defensiveness in
`stats.ts`).

---

## 7. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | Score optimisation / metric leakage | Honest-reveal rule; Milestones strictly event-tied; no live competence counter. |
| 2 | Extrinsic reward crowds out intrinsic motivation | Zero tangible reward; no streak-reset, no daily loop, no currency. |
| 3 | Rewarding the wrong behaviour (hoarding, speculation, money=score) | Milestones are competence/event-shaped (clear debt, hold the crash); never balance-size. |
| 4 | Moralising / patronising tone | Copy follows ticket 05's honest, non-judgemental voice. |
| 5 | A11y debt (toasts, motion, colour) | Display at the focused close region; text-first; no timer; reduced-motion; manual passes extended. |
| 6 | i18n debt | Catalogue keys + key-set equality test; no literals. |
| 7 | Privacy confusion ("profile record" ⇒ tracking?) | Derived, not collected; Settings/Journal copy says so; export/delete/sweep already cover it. |
| 8 | Scope creep (challenges, passes, cosmetics) | Invariant list; challenges deferred; zero mechanical effect. |
| 9 | Empty/offline disappointment | Honest empty copy; derived from whatever is stored; no fake progress. |

---

## 8. Success criteria

- The product's headline criterion is **unchanged: the Better-Choices Proof** (the you-vs-you
  comparison). Milestones must never become a competing success metric.
- With **no analytics permitted** (ticket 12), success is validated **qualitatively in the owed
  playtest** (tickets 09/10): *Did the Milestones feel earned or patronising? Did the Journal make
  you want to try the other path? Did anything tempt you to play for the badge instead of the life?*
- Optionally, a **device-local, player-visible** summary ("Runs played: 3", "Concepts met: 7/8")
  serves as both feature and self-report, with no server telemetry.

---

## 9. Sequence of decisions (how the tree was walked)

1. **Job** — replay-with-memory is the primary job; reinforcement is the co-benefit. (§R1 Q1)
2. **Constraints** — ticket 05's reveal rule, ticket 08's no-currency rule, tickets 12/13/14 are
   inviolable; gamification is reframed as acknowledgement, not reward loops. (Q2)
3. **Centre of gravity** — cross-Run, on the profile. (Q3)
4. **Audience** — the returning player; the feature is not an extrinsic hook. (Q4)
5. **Mechanics** — Milestones + Concept Coverage + Journal in; challenges deferred; cosmetics/XP/
   points/leaderboards/dailies out. (Q5)
6. **No second ladder** — Stages are the levels. (Q6)
7. **No mechanical effect** — money stays the only currency. (Q7)
8. **Surface** — month close + Stage-up; never a toast. (Q8)
9. **Reveal policy** — the Honest-reveal rule; Milestones event-tied, competence aggregates
   retrospective. (Q10, Q14)
10. **Trigger model** — authored catalogue + pure derived predicates. (Q11)
11. **Granularity** — ~10–14 over 60 months. (Q12)
12. **Streaks** — retrospective, prose-only. (Q13)
13. **Data** — derive everything; persist nothing new; privacy unchanged. (Q15–Q18)
14. **Gates** — i18n keys ×3, a11y manual passes extended. (Q19)
15. **Surfaces** — `/journal` route, additive Money Story/Stage-up, Stats untouched. (Q20, Q21)
16. **Budget** — zero new art (one beat at most), reuse audio. (Q22, Q23)
17. **Vocabulary** — Milestone / Journal / Chapter / Concept Coverage / Honest-reveal rule. (Q24)
18. **Risks / success / rollout** — see §7/§8 and below. (Q25–Q28)

---

## 10. Rollout sequence

1. **Domain lock** — adopt the vocabulary and Honest-reveal rule; record ADRs 0001/0002.
2. **Catalogue + derivations** — authored milestone definitions + pure functions + tests.
3. **In-Run surfacing** — month-close line + Stage-up recap.
4. **Money Story section** — this Run's Milestones, Coverage, optional retrospective streak.
5. **`/journal` route** — chapters + coverage, i18n ×3, a11y gate, links from Money Story/Settings.
6. **Retrospective streak line** — if the playtest supports it.
7. **(Later) Challenge Runs** — using the reserved optional seam.

---

## 11. ~~Still-open questions~~ Closed — settled by the orchestrator

*All four questions below were answered by the orchestrator; each was accepted with the recommended
option. The grill is not reopened. See "Settled decisions" at the end of this document.*

1. **Does the retrospective streak ship?** ➡️ Recommended: **yes**, prose-only in the Money Story.
2. **Is one new `journal` illustration worth the one-author budget?** ➡️ Recommended: **no** — reuse
   the `money_story` beat.
3. **Reserve the optional `challenge` save field now, or when Challenge Runs are built?** ➡️
   Recommended: **reserve as optional and write nothing**.
4. **Should the Journal ever be shareable?** ➡️ Recommended: **no** — sharing implies social
   comparison and contradicts "nobody else's numbers".

---

## 12. Artifacts produced by this run

- `docs/gamification-grill/run-3/grilling-log.md` — six rounds, every frontier question with its
  recommended answer; frontier ends empty.
- `docs/gamification-grill/run-3/CONTEXT-delta.md` — proposed glossary terms, amendments, notation,
  and rejected vocabulary.
- `docs/gamification-grill/run-3/adr/0001-gamification-is-acknowledgement-not-currency.md`
- `docs/gamification-grill/run-3/adr/0002-journal-is-derived-from-the-run-archive.md`
- `docs/gamification-grill/run-3/FINAL-DESIGN.md` — this document.

*No source code, no schema, no `CONTEXT.md`, and no `docs/adr/` was modified. Design/docs only.*

---

## Settled decisions (orchestrator answers)

The four previously open questions (§11) are now **closed** — each accepted exactly as recommended:

1. **Retrospective streak** — **ships**, prose-only in the Money Story.
2. **New `journal` illustration** — **none**; reuse the existing `money_story` beat.
3. **Reserve the optional `challenge` save field now** — **yes, reserve it; write nothing.**
4. **Journal shareable** — **no**; it stays private ("nobody else's numbers").
