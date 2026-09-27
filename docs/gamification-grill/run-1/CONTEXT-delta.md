# Context delta — gamification (run 1)

Proposed additions to `CONTEXT.md`. **Sandboxed proposal only** — this run must not edit the shared
`CONTEXT.md` (four parallel runs would clobber each other). When a single direction is chosen, these
terms merge into the root glossary in `CONTEXT-FORMAT.md` style.

Glossary only — no implementation detail. Terms are grouped under a `Gamification` subheading because
they form one cluster; the existing `Glossary` list stays flat.

---

## Proposed new terms

### Gamification

**Milestone**:
A named accomplishment earned *within a Run* by behaviour — months held inside budget, a Named Goal
reached, a scam refused. It is derived from the Run's own record, is never a balance, and grants
nothing.
_Avoid_: badge, achievement, trophy, medal, star, XP, point, reward

**Inside-budget Streak**:
A run of consecutive closed months in which both the Need and the Want envelope were held. It is a
recognition, never a possession: nothing is lost when it ends.
_Avoid_: streak (bare), combo, multiplier

**Year in Review**:
The single behavioural line and money headline shown when a Stage opens — the annual moment where
progress is felt without a scoreboard.
_Avoid_: recap, report card, grade, score

**Run Archive**:
The finished Runs kept on the Anonymous Profile for replay, each as a complete Run record.
_Avoid_: history, saves, leaderboard

**Run Record**:
The private, cross-Run view of finished Runs and the Milestones earned across them, derived from the
Run Archive. It compares the player only with their own past Runs.
_Avoid_: profile, account, stats page, career, leaderboard

**Celebration**:
The restrained, non-load-bearing acknowledgement of a Milestone — a cue, a line, a movement. It is
never a reward and never a score.
_Avoid_: reward, prize, loot, payout

---

## Terms reused (definitions unchanged)

These already exist in `CONTEXT.md` and the design leans on them; listed here so the merge does not
accidentally redefine them.

- **Behavioural Measures** — the three metrics a player can improve (budget adherence, savings rate,
  want spend). The only admissible *source* for a Milestone alongside a Turning Point.
- **Turning Point** — a flagged moment in a Run that the Money Story narrates. Also an admissible
  Milestone source.
- **Money Story** — the end-of-run report. Gains a Milestone recap section.
- **Outcome Band** — the Way to be hidden private descriptive verdict; the Run Record shows it per
  finished Run and never aggregates it into a rank.
- **Better-Choices Proof** — the MVP's success criterion. Milestones must remain compatible with it.
- **Anonymous Profile** — the device-keyed identity; the Run Archive lives on it. No new personal data
  is introduced by this design.

---

## Notation

Milestones are identified by **language-neutral slugs** (e.g. `first_budget_month`,
`half_year_inside_budget`), exactly as Event Cards and Concepts are. Their human text lives in the
message catalogues under keys derived from the slug (`milestone_<id>_label`), so the deck-style i18n
gate can enumerate and parity-check them. No prose lives in code.

---

## Note on a pre-existing gap (not a new term)

`CONTEXT.md` defines **Fund** as "the market-investment pot; the only place money can grow faster than
inflation." In the built game the Fund is displayed and counted but never actually funded — no Choice
or rule moves money into it. This delta proposes **no** new investing vocabulary and **no** Fund-based
Milestone until that mechanic exists; the gap is recorded in `FINAL-DESIGN.md` as a risk.
