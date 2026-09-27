# FINAL DESIGN — Gamification of the Financial Life-Sim (v1.1, additive)

Run: `run-4` · Date: 2026-09-27 · Status: **settled** (frontier empty; see `grilling-log.md`)
Scope: design/docs only. No game source changed, no commit. Artifacts sandboxed under `docs/gamification-grill/run-4/`.

## 1. The one-sentence design

Make a five-year Run worth finishing and a second Run worth starting by adding **recognition and replay value built from the game's own money and the player's own past** — never a parallel reward currency.

> The money is the score. The story is the reward. The player is their own benchmark.

## 2. Why this shape, and not the obvious one

The obvious "add gamification" answer — XP, coins, levels, badges, leaderboards — was **already considered and rejected on evidence** by the MVP (ticket 08; `.scratch/mvp/map.md`). The research found that detached reward currencies teach players to optimise the counter, and that ranking rewards luck and starting position. The MVP's governing rule is stronger still: *"The teaching metrics are never visible during the Run. A player who can see a score optimises the score instead of living the life."*

That leaves a genuine, unclaimed middle: **narrative progression + event-based recognition + a private record**, all of which the game already has the raw material for and one of which the design already promised but never built:

| Raw material that exists | Where |
|---|---|
| 60 monthly snapshots (`insideBudget`, `saved`, `interest`, net worth) | `RunState.history` / `MonthSnapshot` |
| Turning-point flags | `RunState.flags`, `metrics.turningPoints` |
| Stage/Chapter progression + the Stage-up interstitial | `loop.ts`, `StageUp.svelte` |
| Named-Goal progress bar (the one live metric) | `Hud.svelte` |
| Thread history surface | `StatsSheet.svelte` |
| Finished-Run archive | `RunStore.archive` / `ArchivedRun` |
| **An unbuilt promise:** a year-in-review metric line on every Stage-up | ticket 05 vs `StageUp.svelte` |

**Discrepancy found and used:** ticket 05 promises *"You stayed inside budget 8 of 12 months; net worth ◈1,240."* on the Stage-up card; the build shows only `Unlocks {concepts}`. Gamification's first ticket closes that gap.

## 3. What to add

### 3.1 Year in Review (Phase 1 — the backbone)
Every Stage-up becomes the "level up" beat, reporting the **closed** year:
- money: net-worth change, saved, interest credited;
- one behavioural line: months inside budget, out of twelve;
- any Milestones earned that year.

Retrospective only. Nothing here can be acted on, so nothing here can be farmed. It closes the ticket-05 gap and is the single highest-value change.

### 3.2 Milestones (Phase 1)
A **Milestone** is a named recognition awarded the moment a specific money act happens. Event-shaped, positive-only, ~12–16 authored, derived from state the game already holds.

Candidate set (illustrative; both paths must be represented):
- **Earning:** *First payslip*, *Fifty shifts*, *The raise asked for*.
- **Saving:** *Named Goal reached*, *Fund opened*, *First interest credited*.
- **Debt/credit:** *Card cleared*, *Never dipped on the card*, *Score built to 670*.
- **Investing/risk:** *Held through the crash*, *Bought the dip*.
- **Budgeting:** *A clean year* (no over-budget month), *Obligations met all year*.
- **Scams/tax:** *The scam declined*, *The deduction actually read*.

Rules: no money/stat payout; never reads a live rate mid-Run; reachable on both the Study and Work paths; names non-judgemental ("Fund opened", not "Smart investor"). Listed permanently in the Stats Sheet; announced once, quietly, at the month close (`aria-live="polite"`).

### 3.3 Record Book (Phase 2)
At the Money Story: a **Milestones** block and a private **Record Book** of the player's own **Personal Bests** across archived Runs — best adherence year, best savings-rate year, largest final net worth, longest debt-free stretch. You-vs-you; an empty Book on a first Run rather than a zero. Persisted as an additive `records` field on the stored profile document; appears in `buildProfileExport`, is removed by *Delete everything*, and is covered by the existing 12-month inactivity sweep.

### 3.4 Small touches
- **Intro:** one added line naming the loop (five chapters, marks for the acts that matter, your own record to beat). No tutorial, no new screen.
- **Stage-up:** expanded contents; **no new illustrations** (ticket 13's "beats only" rule).
- **HUD:** unchanged — one live metric, the Named Goal bar.

## 4. How it fits the existing domain

- **Add-only rule:** nothing already learned or shown is removed; the layer is strictly additive to `RunState`, the profile doc (`records` optional, degrading like the pre-ticket-23 shape), and existing components.
- **Vocabulary:** new terms group under a *Progression* cluster (`CONTEXT-delta.md`); existing terms untouched. Forbidden vocabulary: XP, points, coins, lives, level (noun), loot, streak, leaderboard.
- **Turning Point vs Milestone:** Turning Points narrate (and may name mistakes); Milestones are earned and positive-only. They share a source (`flags`) but never contradict.
- **Money Story order:** preserved; the new blocks are sections *within* it.
- **Economy / Outcome Band / Better-Choices Proof:** untouched — no Milestone grants money, and no live behavioural metric is introduced.
- **Privacy:** no analytics, no new identifier, no PII; all new player data is exported, deletable and swept.
- **i18n:** every new string is a catalogue key in `en/it/ro`; Milestone ids stay locale-free; key parity enforced by the existing gate.
- **Accessibility:** WCAG 2.2 AA maintained; Marks never colour-only; announcements are polite live regions and never the sole carrier; new states added to the axe/seed suite with no excludes.

## 5. Design tree (all branches visited)

```
Gamification of the financial game
├── Framing
│   ├── Destination ................................. additive v1.1 layer; no economy change
│   ├── Definition .................................. recognition & replay, not a reward currency
│   ├── The earlier "no XP/coins/lives/leaderboards" . reaffirmed as a boundary → ADR-0001
│   └── Player problem .............................. mid-Run drift · no replay hook · deferred payoff
├── Motivational model
│   ├── Live metric during a Run .................... keep Named Goal as the only one → ADR-0002
│   ├── In-Run vs cross-Run ......................... both; in-Run Phase 1, cross-Run Phase 2
│   ├── Recognition primitive ....................... Milestone (event-shaped)
│   ├── Mechanical reward? .......................... none; recognition only → ADR-0001
│   └── Streaks ..................................... none; year-scoped clean-year event only
├── Surfaces & beats
│   ├── Year in Review at Stage-up .................. yes (closes the ticket-05 gap)
│   ├── Stage-up contents / art ..................... expand; no new drawings
│   ├── Milestone discovery ......................... month-close announcement + Stats Sheet section
│   ├── Money Story layer ........................... Milestones block + Record Book → ADR-0003
│   └── Onboarding .................................. one intro line
├── Domain model
│   ├── Canonical terms ............................. Milestone · Mark · Year in Review · Record Book · Personal Best
│   ├── Definition home ............................. code registry + catalogue prose
│   └── Boundaries .................................. observe, never change state
├── Data / privacy / i18n / a11y / verification
│   ├── Run state ................................... earned Milestones in RunState (id + month)
│   ├── Profile records ............................. optional `records`; export/delete/sweep
│   ├── Localisation ................................ 3-locale keys, stable ids, existing plurals
│   ├── Accessibility ............................... seed + axe screens; polite live region; no excludes
│   └── Success measure ............................. unit + gates + human playtest; no telemetry
└── Risks, non-goals, sequence
    ├── Dark patterns ............................... forbidden list
    ├── Risks ....................................... score optimisation · reward distortion · moralising · path inequity
    ├── Sequencing .................................. seven dependency-ordered tickets
    └── Still open .................................. cosmetics · profile home · villain card · milestone-as-data
```

## 6. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Score optimisation** — a visible metric becomes the thing played for | Behavioural metrics are retrospective only; Milestones are event-shaped, never rate-shaped (ADR-0002) |
| **Reward-loop distortion** — rewards bend the economy or the Outcome Band | Milestones grant no money/stat; the economy is untouched (ADR-0001) |
| **Moralising tone** — recognition reads as a report card | Non-judgemental names; honest Turning Points stay the place mistakes are named |
| **Path inequity** — a set only the Work path can complete | Every Milestone audited against both Study and Work paths |
| **Scope creep** — a second progression system grows alongside | Seven bounded tickets; the layer is strictly additive and small |
| **Dark patterns** — engagement mechanics sneak in | An explicit forbidden list (`FOMO`, streaks, notifications, loss aversion, loot, leaderboards, guilt copy) |

## 7. Sequence of decisions → tickets

1. **Vocabulary + ADRs** — this run's docs (no code).
2. **Year in Review at Stage-up** — uses existing `history`; smallest, highest value.
3. **Milestone registry + evaluation + month-close announcement** — pure function + catalogue.
4. **Stats Sheet Milestones section** — UI only.
5. **Record Book + profile `records`** — persistence, export, delete, retention.
6. **Intro line + full i18n + a11y coverage.**
7. **Playtest protocol + playtest** — human-owed.

## 8. Verification

- **Unit:** the Milestone evaluator as a pure function, table-driven like `metrics.test.ts` / `stats.test.ts`; a regression test that the Year in Review appears only at a Stage-up and that no milestone reads a live rate.
- **Gates:** existing `pnpm verify` (check · test · i18n · a11y). New a11y states in `tests/a11y/seed.ts` + `screens.spec.ts`.
- **Success (human-owed):** a playtest protocol — finish a Run, record where motivation dipped, whether a second Run was started — in the spirit of `docs/accessibility.md`'s manual passes. No telemetry, by design.

## 9. Open questions — CLOSED

All four items below were accepted exactly as recommended. The design tree is fully visited; nothing remains open.

| Question | Settled answer |
|---|---|
| Cosmetic unlocks (avatar tints) | Defer to v2 |
| A profile "home" screen between Runs | Do not build; the Money Story's *What next* stays the hub |
| A "play the villain" card (*Shady Sam*-style) | Out of scope for this layer |
| Milestones as authored data rather than code | Keep code + catalogue until the set exceeds ~20 |

### Settled decisions (orchestrator answers)

1. **Cosmetic unlocks (avatar tints):** defer to v2.
2. **Profile "home" screen between Runs:** don't build; the Money Story's "What next" stays the hub.
3. **"Play the villain" card (Shady Sam):** out of scope for this layer.
4. **Milestones as authored data:** keep code + catalogue until the set exceeds ~20.

## 10. Artifacts in this run

- `docs/gamification-grill/run-4/grilling-log.md` — all 6 rounds, 26 questions, recommended answers.
- `docs/gamification-grill/run-4/CONTEXT-delta.md` — proposed glossary additions + anti-vocabulary.
- `docs/gamification-grill/run-4/adr/0001-recognition-not-reward-currency.md`
- `docs/gamification-grill/run-4/adr/0002-behavioural-progress-is-retrospective.md`
- `docs/gamification-grill/run-4/adr/0003-cross-run-progression-is-private.md`
- `docs/gamification-grill/run-4/FINAL-DESIGN.md` — this file.
