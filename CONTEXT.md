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
- **Stage-up Card** — the interstitial that announces a new Stage: its age, income tier, the Concept
  it carries and that Concept's Teachable Moment, plus the **Year in Review** for the Stage just
  ended. It carries a **Year Beat** and "What you'll meet" in place of a curriculum list. It is not
  one of a Stage's Event Cards.
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
- **Choice Effect** — the consequence of a Choice: a mechanical change (money, state) and the
  **Feedback** that shows it — the **Reaction** first, then the **Why**.
- **Feedback** — the two-part answer shown after a Choice: the **Reaction** — what the world did — and
  the **Why** — why it mattered. It replaced the single teaching paragraph.
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
- **Fund** — the market-investment pot: money moved out of Save grows or falls with the Run's seeded
  market, and the scripted crash is its risk made real. It counts toward the Named Goal and Net Worth.
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
  the way into the **Journal**. It closes with its **Reflections**, an **Epilogue**, the Run's
  **Chapter Title** and **The Other Path**.
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

## Voice and feel

**Reaction**:
The first part of a **Feedback**: what actually happened, in the fiction — a person's line, a
message, a fact. It never states a general rule.
_Avoid_: explanation, narration, verdict

**Why**:
The second part of a **Feedback**: why the outcome mattered, short and personal. It is shown as
"Why it happened" and is the only place a **Rule of Thumb** may appear.
_Avoid_: lesson, tip, explainer, teaching text

**Rule of Thumb**:
One of the eight short money rules — one per **Concept** — taught by a **Why** at its **Teachable
Moment** and quoted nowhere else in the moment.
_Avoid_: maxim, moral, takeaway

**Taught once, trusted after**:
The rule that a **Concept**'s **Why** opens by itself at its **Teachable Moment** and stays collapsed
at every later card: the first encounter carries the guarantee, the rest of the Run trusts the player.
_Avoid_: tutorial, drip-feed

**Cold Open**:
The short scene shown before month 1, in place of a tutorial sequence: who the character is and the
**Named Goal** as the horizon. How a month works is taught where it is needed.
_Avoid_: onboarding, intro sequence, tutorial, splash

**Year Beat**:
The one authored, in-fiction line a **Stage-up Card** carries in place of a curriculum announcement,
beside "What you'll meet".
_Avoid_: unlock line, syllabus, module

**Ledger Line**:
The one-line account inside a **Feedback** of what a **Choice** actually moved — the changed balances
and Free Time, with signs. It appears only after the Choice.
_Avoid_: toast, popup, delta, counter

**The Cast**:
The small set of named recurring people in the character's life — Priya, Ravi, Danny, Mum, Grandma.
Authored content, never data about the player; a finished Run's Cast derives from its log.
_Avoid_: characters, NPCs, personas

**Callback**:
One authored line, derived from the Run's record, in which the world shows it remembers a past
**Choice**. At most one per card; never a number; never a maxim.
_Avoid_: easter egg, flashback, cameo

**Life Line**:
The one authored sentence in the HUD that says what the character's life is outside money, this
**Stage**. Text only; never a wellbeing stat.
_Avoid_: mood, status, vibe

**True Dilemma**:
An **Event Card** whose **Choices** are all defensible — the tension is in values, not arithmetic —
and whose Feedback declares no winner. Authoring rule: at least one card in three per **Stage**.
_Avoid_: hard choice, no-win, impossible choice

**Villain Card**:
An **Event Card** that casts the player as the one selling, lending or recruiting, so a predatory
mechanic is learned from the inside; a **Thread** carries the buyer's consequence back. The game never
flags the choice as wrong.
_Avoid_: Shady Sam card, evil option, role-play card

**Repayment**:
A recurring monthly payment a **Choice** commits the character to — a BNPL instalment or a card
minimum carried. Distinct from an **Obligation** (living costs): a Repayment services debt.
_Avoid_: loan, debt schedule

**Reflection**:
One derived, personal observation about the player's own finished record, shown only in the **Money
Story** — never an imperative, never a general law, never live.
_Avoid_: insight, grade, summary

**Epilogue**:
The closing passage of the **Money Story**: where the character is at 19, written per path and per
**Outcome Band**. It says what the five years bought and cost; it never ranks the Run.
_Avoid_: ending, verdict, grade

**Chapter Title**:
The story-led name a finished Run carries in the **Journal**, drawn from its own record — never a
band label, never ranked.
_Avoid_: grade, rank, tag

**The Other Path**:
The **Money Story**'s view of the unchosen Stage-5 Fork branch — a link to the other **Chapter** when
one exists, otherwise an authored portrait. It describes; it never simulates.
_Avoid_: counterfactual, what-if, simulation
