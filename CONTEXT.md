# Context

Glossary for this project. Terms only — no implementation detail.

## Glossary

- **Financial Life-Sim** — the game: one character whose life unfolds as a sequence of money
  decisions over in-game time, intended to teach financial capability.
- **Run** — one complete playthrough of the game, spanning five in-game years. A Run always has an
  end.
- **Turn (Month)** — the atomic unit of play: one in-game month, in which the player faces one
  Event Card and chooses.
- **Stage** — a life phase within a Run (e.g. school years, first job, independence). Each Stage
  unlocks specific Concepts and frames its Event Cards. Stages only ever add — the **Add-only
  rule**: nothing a player has learned is taken away.
- **Stage-up Card** — the interstitial that announces a new Stage: its age, income tier, unlocked
  Concept and that Concept's Teachable Moment. It also carries the **Year in Review** for the Stage
  just ended. It is not one of a Stage's Event Cards.
- **Wage Hint** — the one-time note at the start of Stage 3 that the allowance has stopped and
  hours are the money; it stays while the plan holds zero hours and never returns once hours are set.
- **Teachable Moment** — the single first experience that introduces a Concept (the first payslip,
  the first dry Want envelope, the crash).
- **Concept** — one of the eight financial capabilities the game teaches: budgeting & tracking,
  saving & goals, interest & compounding, earning & work, needs vs wants, credit & debt,
  investing & risk, and taxes/insurance/scams.
- **Event Card** — one authored, data-driven scenario a Turn draws: a situation plus a set of
  Choices, tagged to a Stage and a Concept.
- **Choice** — one option presented by an Event Card.
- **Choice Effect** — the consequence of a Choice: a mechanical change (money, state) and an
  educational Feedback explaining why it played out that way.
- **Feedback** — the in-game explanation shown after a Choice, connecting the outcome to the
  Concept it teaches.
- **Card Kind** — one of `decision`, `shock`, `risk-moment`, `scam`, `stage-up`; every Event Card
  is exactly one.
- **Effect Chip** — the mechanically-derived cost label shown on a Choice (`◈12 · 2h`). Chips
  surface costs; they never leak outcomes.
- **Spine** — the authored schedule of fixed beats that guarantees every Teachable Moment lands
  whatever the seeded draw does.
- **Pool** — the surplus of authored Event Cards beyond the number of draws; the source of variety
  between Runs.
- **Thread** — a consequence one Event Card plants that resolves in a later Turn. At most one is
  live at a time.
- **Month Screen** — the single scrolling screen a Turn is played on, carrying all three phases.
- **Plan Step** — the first phase: allocate money across the Envelopes and hours to work, before
  the month's card is known.
- **Shortfall Warning** — the Plan Step's plain-arithmetic line for a month whose Obligations
  outrun expected income; it names whether the buffer absorbs the gap or Debt does, and never
  mentions the month's card.
- **Month Close** — the third phase: the compact sheet showing income, obligations, interest, goal
  progress and net-worth change, and where progress commits.
- **Stats Sheet** — the on-demand view of Savings, Fund, Debt, Credit Score, the net-worth
  sparkline, Obligations and Thread history.
- **Income Tier** — a step on the earning ladder (allowance, odd jobs, part-time, full-time) that a
  Stage assigns to the character.
- **Obligation** — a recurring cost the character is committed to each Turn.
- **Envelope** — one of the three monthly allocations — Need, Want and Save — that Choices draw
  from.
- **Need** — the Envelope for unavoidable spending.
- **Want** — the Envelope for discretionary spending.
- **Save** — the Envelope that funds the Named Goal.
- **Named Goal** — the single savings target shown with a progress bar; funding it from early in a
  Run is what makes the final year's Obligations survivable.
- **Cascade** — the order in which an overspent Envelope is absorbed: Save first, then Debt.
- **Fund** — the market-investment pot; the only place money can grow faster than inflation.
- **Credit Score** — the number representing creditworthiness, moved by payment behaviour.
- **Overdraft** — what an uncoverable missed Obligation becomes.
- **Net Worth** — Cash + Savings + Fund − Debt; the single figure that rewards good play across
  every Concept.
- **Risk Moment** — a seeded decision point where the player either buys cover or gambles, with the
  odds shown.
- **Shock** — a seeded adverse event, bounded so that no single Shock can sink a Run.
- **Free Time** — the monthly hours resource spent by extra work and by cards; it shrinks as
  Obligations grow. It is a resource, not a wellbeing stat.
- **BNPL** — buy-now-pay-later: four on-time instalments at 0%, with late fees on default — and it
  builds no Credit Score, which is the lesson it exists to teach.
- **Study Path** and **Work Path** — the Stage-5 Fork: part-time study funded by a Student Loan,
  or full-time work with a full Obligation load.
- **Student Loan** — the Study Path's up-front 3,000, carried as Debt from the moment it is taken.
- **Anonymous Profile** — a player's identity and progress, keyed to a device and carrying no
  personal data.
- **Money Story** — the end-of-Run report showing the player's decisions and their financial
  trajectory across the Run. It also carries the Run's **Milestones**, its **Concept Coverage** and
  the way into the **Journal**.
- **Outcome Band** — the descriptive verdict at the end of a Run — Ahead / Treading water /
  Behind — computed from money, the path's goal and the Credit Score, never from behaviour.
- **Turning Point** — a flagged moment in a Run (debt taken, a minimum-payment streak, a skipped
  Obligation, the crash) that the Money Story narrates.
- **Behavioural Measures** — the three metrics a player can actually improve — budget adherence,
  savings rate and want spend — and the only ones the you-vs-you comparison uses.
- **Better-Choices Proof** — the MVP's success criterion: the player's money decisions measurably
  improve over the course of a Run.

## Gamification

**Gamification**:
The game's layer of recognition and memory — the **Milestones**, the **Year in Review** and the
**Journal** — built from the Run's own money and the player's own past. It adds no parallel currency,
no score and no competition.
_Avoid_: rewards, points system, achievements, meta-game

**Reward Loop**:
An extrinsic progression layer — XP, points, coins, lives, stars, gems, streak mechanics,
leaderboards — that measures something other than the money. Excluded by design.
_Avoid_: gamification (when the thing meant is a Reward Loop)

**Milestone**:
A one-time, event-shaped recognition of a moment the player lived — a month held inside budget, a
debt cleared, a scam declined, the Named Goal reached. It grants nothing, is never a checklist and is
never shown as an ongoing meter.
_Avoid_: badge, achievement, trophy, medal, sticker, reward, bonus

**Year in Review**:
The retrospective carried by every **Stage-up Card** for the year just ended: the money headline, one
behavioural line and the year's Milestones. It reports a closed year and cannot be acted on.
_Avoid_: scorecard, report card, grade, dashboard

**Concept Coverage**:
The record of which of the eight **Concepts** the player has met — within a Run as **Introduced**
then **Experienced**, and across Runs in the **Journal**. It records exposure, never performance.
_Avoid_: skill tree, mastery, progress bar, completion

**Introduced**:
A **Concept** state: the Stage that unlocks it has opened.
_Avoid_: unlocked, available

**Experienced**:
A **Concept** state: an **Event Card** carrying the Concept has been played at least once in the Run.
_Avoid_: learned, mastered, completed, passed

**Journal**:
The player's private, cross-Run record kept on the **Anonymous Profile**: every finished Run as a
**Chapter**, the Milestones earned and the Concepts met. Derived from the stored Runs, never
collected separately.
_Avoid_: record book, archive wall, trophy case, profile page, leaderboard

**Chapter**:
One finished Run as it appears in the **Journal** — its **Outcome Band**, its **Turning Points**, its
Milestones, its seed and when it ended. A Run is the play; a Chapter is its record.
_Avoid_: save, replay, record

**Honest-reveal rule**:
A thing may be shown live during a Run only if it is already legible in the fiction and does not
invite the player to optimise a number; anything competence-derived and numeric is held for the
**Year in Review** or the **Money Story**.
