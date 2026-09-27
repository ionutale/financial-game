# Gamification — final design (run 1)

**Ask:** "grill-with-docs — I want gamification added to this game."

**Status:** settled after five grilling rounds (see `grilling-log.md`). Design/docs only — no source
code was changed. Sandboxed under `docs/gamification-grill/run-1/` so the four parallel runs do not
clobber each other.

**One-line answer:** add **diegetic, behaviour-based progression** — derived Milestones, a
year-in-review beat, and a private cross-Run Record — using **money and behaviour as the only scores**,
with **no XP, no parallel currency, no leaderboards, no timers and no new stored data**.

---

## 1. What "gamification" means here

The repo already ruled on this. `research/08-prior-art.md` names XP/coins/lives as failure mode #1,
`map.md` puts leaderboards and social out of scope, and `issues/04` says no timers. That stance is
correct; the ask is best satisfied **without reopening it**.

Gamification here = three things, all built on mechanics the game already has:

1. **Milestones** — named accomplishments earned within a Run by behaviour.
2. **A visible in-run payoff beat** — the *Year in Review* on each Stage-up card (already promised by
   `issues/05`, missing from the build).
3. **A private cross-Run Record** — finished Runs and Milestones earned, derived from the archive that
   already exists.

It is **not**: XP, points, gems, levels, titles, badges-as-rewards, lives, energy, loot, dailies,
push, leaderboards, share cards, purchases, or analytics.

The governing rule, lifted from the project's own research: *if we use points at all, they must be the
money itself, not a parallel currency.* Here we use none.

---

## 2. How it fits the existing domain

| Existing concept | Role in this design |
| --- | --- |
| **Run / Turn / Stage** | Unchanged. The Run is still 60 months, fixed end at month 60. |
| **Behavioural Measures** | The admissible source for a Milestone, alongside Turning Points. |
| **Turning Point** (`flags`) | The other admissible source: card issued, overdraft, minimum payment, the Fork. |
| **Money Story** | Gains a Milestone recap; remains story-first, numbers second. |
| **Outcome Band** | Shown per finished Run in the Record; never aggregated into a rank. |
| **Anonymous Profile / Run Archive** | The Record's data source. No new data. |
| **Stage-up Card** | Carries the *Year in Review* line — closing the `issues/05` spec/build gap. |
| **Stats Sheet** | Gains a Milestones / Inside-budget Streak section. |
| **Named Goal** | Unchanged, but reaching it becomes a Milestone (`goal_reached`). |

New glossary terms (proposed in `CONTEXT-delta.md`): **Milestone**, **Inside-budget Streak**,
**Year in Review**, **Run Archive**, **Run Record**, **Celebration** — each with an `_Avoid_` list
that pushes the extrinsic vocabulary (badge, achievement, trophy, XP, reward, leaderboard) away.

---

## 3. The mechanics, precisely

### 3.1 Milestones are derived, not stored

A `milestones.ts` module evaluates predicates over the record the reducer already keeps
(`history`, `flags`, `log`, `score`) and returns the earned list. Nothing is added to `RunState`; old
saves and archived Runs still render. This is **ADR-0001**.

**Admissible sources: a Behavioural Measure, or a Turning Point. Never a raw balance.** And only
*process the game explicitly teaches* — no "always insure", no "never borrow" (the game teaches
judgement, not maxims).

Settled set (all derivable from existing fields):

| id | Label (en, illustrative) | Predicate |
| --- | --- | --- |
| `first_budget_month` | First month inside your budget | first `history[].insideBudget` |
| `quarter_inside_budget` | Three months in a row inside budget | 3 consecutive `insideBudget` |
| `half_year_inside_budget` | Six months in a row inside budget | 6 consecutive `insideBudget` |
| `first_save` | The first month money reached Save | `history[].saved > 0` |
| `first_interest` | The first interest the bank paid you | `history[].interest > 0` |
| `goal_reached` | The Named Goal, reached | `savings + fund >= goalTarget` |
| `payslip_read` | You read the first payslip properly | `log` has `first_taxed_payslip/read` |
| `debt_cleared` | A month closed owing nothing, after owing | `peakDebt > 0` then `debt === 0` |
| `not_fooled` | You checked before you trusted | `log` has `scam_opportunity/{check,block}` |
| `weathered_the_crash` | You held through the crash | `log` has `the_crash/{hold,buy}` |
| `both_paths` *(Run Record)* | Both paths lived | archive holds a Study and a Work Run |

**Deferred by decision** (each needs its own decision, because it would require extending
`MonthSnapshot`): "set hours in the first month"; "insured before a shock". **Blocked** (no signal
exists): any Fund-based investing Milestone — `RunState.fund` is never incremented (`loop.ts`,
`cards.ts:1298`).

### 3.2 Inside-budget Streak

A run of consecutive closed months with both envelopes held. It exists **only as a Milestone /
recognition** — no "at risk", no reset guilt, no daily framing, no loss language. There is no daily
loop and no notification, so the usual streak dark patterns are impossible by construction.

### 3.3 Surfacing (no timers, no toasts)

- **Month Close:** a Milestone line joins the existing labelled region; announced via the existing
  `aria-live="polite"` discipline; no auto-dismiss.
- **Stats Sheet:** a Milestones / Streak section.
- **Money Story:** a Milestone recap beside the you-vs-you comparison.
- **Stage-up Card (Year in Review):** one behavioural sentence + the money headline + that year's
  Milestones — the recurring in-run payoff beat.

### 3.4 Juice

One synthesised `milestone` cue in `src/lib/audio/sfx.ts` (off by default, never load-bearing,
positive-only); a reduced-motion-respecting emphasis using the existing motion patterns; no confetti,
no new accent, colour never load-bearing. `docs/art-audio.md` gains a row.

### 3.5 The Run Record (cross-Run)

A private screen derived **entirely from `profile.archive`**: finished Runs (band, path, final net
worth, the behavioural measures, Milestones earned) plus a private aggregate (Runs finished, the
Milestone set across Runs, best adherence, best savings rate, both paths done). **Zero new stored
data** — the archive already holds full `RunState`, and is already exported, deleted and swept. This
is **ADR-0003**. It compares the player only with their own past Runs. This is the game's first
surface for the archive, which today is only visible through `/api/profile/export`.

---

## 4. Module boundaries (codebase shape)

Keep `src/lib/game` pure (no Svelte, no Mongo, no DOM), matching `metrics.ts` / `stats.ts`.

```
src/lib/game/milestones.ts   pure predicates; earnedMilestones(run); milestonesForYear(run, year); view types only
src/lib/game/record.ts       pure aggregation over ArchivedRun[] -> RunRecord
src/lib/game/milestones.test.ts, record.test.ts
```

- Nothing new is written to `types.ts` except read-only view interfaces.
- No persistence path is added.
- Milestone ids are language-neutral slugs; text lives in `messages/{en,it,ro}.json` under
  `milestone_<id>_label`, enumerated by a test like the deck's i18n gate.
- Components render only; the Run Record needs a small loader that reads `profile.archive`.

---

## 5. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| **Goodhart** — players chase Milestones the way they'd chase a score | Milestones derive only from Behavioural Measures / Turning Points, grant nothing, and add no new gameable axis; the Better-Choices Proof stays the single source of truth. Residual: adherence is itself inflatable — a pre-existing exposure, unchanged. |
| **Tone drift** toward points/ranks | Neutral copy, no ranks/titles/medals/emoji-status, no loss framing; the `_Avoid_` lists make the wrong words explicit. |
| **The inert Fund** — an investing Milestone would be vacuous | No Fund-based Milestone; `weathered_the_crash` uses the *choice*, not a balance; the gap is logged. |
| **Privacy creep** via cross-Run data | The Record is a derived view; ADR-0003 forbids a stored index; export/delete/retention already cover the archive. |
| **Accessibility regressions** | New route + Stage-up beat added to `tests/a11y/seed.ts`, `screens.spec.ts`, `zoom.spec.ts`; no timers/auto-dismiss; reduced motion; 44px targets; text carries all meaning. |
| **i18n breakage** | Milestone slugs like card ids; parity + placeholder tests extended. |
| **Determinism** | No RNG, draw, or `RunState` mutation; post-hoc pure functions only. |
| **Scope creep** | Four independently shippable phases; explicit non-goals checklist (below). |

---

## 6. Non-goals checklist (review gate)

No parallel currency · no points · no levels or titles · no leaderboards · no other-player comparison ·
no timers · no auto-dismiss · no push or daily loop · no loot/variable ratio · no purchases · no
analytics · no new personal data · no RNG or `RunState` mutation · no economy change · no content
gated behind Milestones · no loss-framed streaks · no moralising copy.

---

## 7. Sequence of decisions (and the delivery plan)

**The decisions, in the order they were made** (full Q&A in `grilling-log.md`):

1. Gamification = game-feel + meta-progression; **not** a parallel currency or social layer (Q1).
2. Refine, don't override, the documented no-XP/no-leaderboard stance (Q2).
3. Job = completion + learning legibility, not retention (Q3).
4. Both layers, in-run first (Q4).
5. Fences set: no timers, dailies, social, loot, purchases (Q5).
6. Money/behaviour are the only scores; Milestones grant nothing (Q6).
7. Milestones are **derived**, never stored (Q7 → ADR-0001).
8. Milestones come only from Behavioural Measures / Turning Points; the settled set (Q8).
9. Streaks exist only as recognitions (Q9).
10. Surfacing is inline in existing regions, never a toast (Q10).
11. Juice is confined to one optional cue + reduced-motion emphasis (Q11).
12. In-run payoff = the Year in Review on the Stage-up card (Q12).
13. No quest/side-goal system (Q13).
14. Cross-Run = the **Run Record**, derived from the archive (Q14 → ADR-0003).
15. Private, never compared to others (Q15).
16. Same-seed replay deferred (Q16).
17. No stored-data, export or retention change (Q17).
18. Goodhart guard: measure/turning-point only, grants nothing, metrics stay hidden (Q18).
19. Accessibility bar unchanged (Q19).
20. Neutral tone (Q20).
21. Determinism untouched (Q21).
22. i18n via slugs + paraglide gates (Q22).
23. No Fund-based Milestone; Fund gap logged (Q23).
24. Four-phase delivery, everything reversible (Q24).
25. Six new glossary terms (Q25).
26. Pure `milestones.ts` / `record.ts` modules (Q26).
27. Non-goals checklist (Q27).
28. Definition of done (Q28).

**Phases:**

- **P0 — Terms + module.** Merge `CONTEXT-delta.md`; write `milestones.ts` + tests. No UI.
- **P1 — In-run beat.** Year in Review on the Stage-up card; Milestone lines in the Month Close and
  Stats Sheet; the `milestone` cue; Money Story recap.
- **P2 — Cross-Run.** The Run Record screen + loader + links from the Money Story and Settings;
  axe/zoom coverage.
- **P3 — Polish + docs.** Extend the i18n gate to Milestones; update `docs/art-audio.md`,
  `docs/accessibility.md`, `docs/privacy/lia.md`.

Each phase is independently shippable and touches neither the economy nor the seeded RNG.

---

## 8. Definition of done

The feature is done when the existing `pnpm verify` suite plus the new `milestones`/`record` unit
tests and a11y coverage pass; the design still reads as compatible with the Better-Choices Proof (no
Milestone can be earned by a move that makes the year-1-vs-year-5 comparison worse); and a playtest
shows players can name one thing they did better by year 5 and can find their own Milestones. **No
engagement metric is claimed, because none is collected.**

---

## 9. Open questions

**None.** The tree is fully visited.

Deferred by explicit decision:

- **Same-seed replay** (Q16) — a promising learning device, but it invites optimising the score over
  living the life; revisit with playtest evidence.
- **Fund-based investing Milestone** (Q23) — blocked until `RunState.fund` is actually wired into the
  economy; a separate, larger decision.

---

## 10. Files in this run

- `grilling-log.md` — every round: questions + recommended answers, in ❓/➡️ form.
- `CONTEXT-delta.md` — proposed glossary terms and notation, sandboxed.
- `adr/0001-milestones-are-derived-not-stored.md`
- `adr/0002-money-and-behaviour-are-the-only-scores.md`
- `adr/0003-run-record-derived-from-archive.md`
- `FINAL-DESIGN.md` — this file.
