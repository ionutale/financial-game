# CONTEXT.md — proposed delta (gamification, run 2)

Proposed additions to the root `CONTEXT.md` glossary. **Not applied** — this run is sandboxed; the
delta is offered for the orchestrator to merge. Terms are written in the existing `CONTEXT.md`
style (a flat `- **Term** — definition` list) with an `_Avoid_` line per term, per the
domain-modeling `CONTEXT-FORMAT.md` rule that every overloaded word gets one canonical choice and
its synonyms recorded. No implementation detail.

Suggested grouping: these belong with the meta/progression vocabulary, near **Money Story**,
**Outcome Band** and **Behavioural Measures**.

---

## Proposed new terms

- **Gamification** — the set of **Progression Devices** that make a Run's forward movement legible
  and satisfying, using the game's own money and story as the reward. It adds no parallel currency,
  no score and no competition.
  _Avoid_: points, XP, rewards, engagement layer, badges (those are a **Reward Loop**).

- **Reward Loop** — an extrinsic progression layer (XP, coins, lives, stars, gems, streaks,
  leaderboards) that measures something other than the money. Excluded by design.
  _Avoid_: gamification (when a Reward Loop is what is meant).

- **Progression Device** — one legible element of forward movement inside a Run or across Runs: the
  Named Goal bar, a **Concept Journal** entry, a **Milestone**, the **Year in Review**, or the
  **Archive Wall**. Each is derived from a Run and never a stored score.
  _Avoid_: feature, widget, reward, unlock.

- **Concept Journal** — the in-Run record of the eight **Concepts** and how far the player has got
  with each: **Introduced** at its Stage, **Experienced** once a card carrying it is played. It
  records exposure, never performance.
  _Avoid_: skill tree, unlock list, mastery, progress bar.

- **Introduced** — a **Concept** state: the Stage that unlocks it has opened, which the **Stage-up
  Card** announces.
  _Avoid_: unlocked, available.

- **Experienced** — a **Concept** state: an **Event Card** carrying the Concept has been played at
  least once in the Run. The second and final state a Concept reaches.
  _Avoid_: learned, completed, mastered (a performance claim the game does not make), passed.

- **Milestone** — a money-native threshold crossed once in a Run (first ◈500 saved, first month
  clear of Debt, the Named Goal reached), surfaced as a quiet line at the **Month Close**. Not a
  score, not a checklist, and not kept across Runs.
  _Avoid_: achievement, badge, trophy, reward, target, goal (the Named Goal is a different thing).

- **Year in Review** — the one-line progress note carried by each **Stage-up Card**: the year's
  money summary and the months spent inside budget. The only recurring behavioural surface inside a
  Run.
  _Avoid_: scorecard, grade, report card, dashboard.

- **Archive Wall** — the player's own finished Runs, shown as a small gallery of **Outcome Bands**
  and final Net Worth; the cross-Run you-vs-you.
  _Avoid_: leaderboard, ranking, high scores, history (ambiguous with Thread history).

## Proposed clarifications to existing terms

- **Stage-up Card** — currently says it announces the unlocked Concept and its Teachable Moment.
  Proposed: it also carries the **Year in Review** for the Stage just ended, plus the Fork's own
  line in Stage 5. (Ticket 05 promised this; the build did not ship it.)

- **Add-only rule** — proposed to extend explicitly to progression: nothing a player has
  **Experienced** or crossed as a **Milestone** is ever removed or downgraded. Restating, not
  changing, the rule.

## Explicitly *not* added

The following are deliberately absent from the language, because naming them would make them
available as designs: **streak**, **XP**, **level**, **badge**, **achievement**, **coin**,
**leaderboard**, **ranking**, **daily reward**. They live only in **Reward Loop**'s `_Avoid_`.
