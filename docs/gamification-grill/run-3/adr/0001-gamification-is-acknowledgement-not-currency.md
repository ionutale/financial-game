# Gamification is acknowledgement, not currency

The game already has the two game-feel systems that survive its own prior-art research: the **Stage
ladder** (levels) and **the money itself** (the score). We decided that the gamification addition
will therefore add **acknowledgement and memory only** — Milestones, Concept Coverage and a
cross-Run Journal — and will add **no XP, levels, points, coins, lives, live streaks, cosmetics,
leaderboards, timers or daily rewards, and no reward of any kind that has a mechanical effect.**
Recognition is shown only for moments already legible in the fiction, and never as a live competence
number, because ticket 05 established that a player who can see a score optimises the score instead
of living the life.

## Status
accepted (proposed by grill run 3; not yet merged into the repo)

## Considered options

- **Conventional gamification** (XP + levels + badges + streaks + leaderboards). Rejected: it
  contradicts ticket 05's reveal rule and ticket 08's ruling, and its currency is detached from
  competence — the exact failure mode the prior-art research quantified in Greenlight Level Up.
- **A parallel soft currency** ("miles"/"coins" for effort). Rejected: ticket 08 — *"they must be the
  money itself, not a parallel currency"* — and it would distort the difficulty curve.
- **Acknowledgement and memory only** (chosen). Milestones are event-tied and grant nothing;
  progression is knowledge (Concepts) and history (Journal); the only currency stays `◈`.

## Consequences

- The difficulty curve, the deck and the economy are untouched; the feature cannot be gamed for
  advantage because there is no advantage to gain.
- Milestone copy must be authored carefully (event-tied, non-judgemental) and translated into all
  three locales; a sloppy milestone is the main way this could read as patronising.
- Future contributors will look for a points system and find none; this ADR is the reason.
- Reversing this later is expensive: once players are trained on a reward loop and content is built
  around it, removing it costs trust and rework. That is why the decision is recorded rather than
  left implicit.
