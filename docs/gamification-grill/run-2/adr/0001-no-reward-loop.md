# Gamification uses the game's own money and story, never a Reward Loop

Status: proposed

## Context

The ask was "add gamification". The obvious reading — XP, coins, stars, lives, levels, streaks,
badges, leaderboards — was already rejected on evidence when the project was charted: ticket 08
found that tangible rewards undermine intrinsic motivation (Deci, Koestner & Ryan, 1999), that
Banqer-style leaderboards measure luck and starting position, and concluded *"no XP/coins/lives or
leaderboards"* and *"if we use points at all, they must be the money itself, not a parallel
currency."* Leaderboards and multiplayer were taken out of scope in charting, and teaching metrics
are hidden during a Run (ticket 05) so players cannot optimise a score instead of living the life.

## Decision

Gamification means **Progression Devices built from the Run's own money and story** — the Named Goal
and its ticks, the Concept Journal, money-native Milestones, the Year in Review, the Archive Wall —
and **never** a parallel reward currency. Rewards, XP, lives, stars, gems, streaks, badges awarded
for performance, and any cross-player comparison are excluded by design. Ticket 08 is reaffirmed,
not reversed.

## Considered options

- **A parallel reward layer** (XP/coins/stars) — rejected: the evidence in ticket 08 says it moves
  motivation to the wrong object and is the exact "quiz-collapse" failure the project exists to
  avoid.
- **Streaks / daily cadence** — rejected: a streak is a timer in disguise, it breaks punitively
  (against the recoverable-failure principle), and the game has no push and no accounts, so cadence
  pressure has nothing to stand on.
- **Leaderboards** — rejected: out of scope since charting; they measure the seeded RNG and the
  starting position, not capability.

## Consequences

- All future content and UI reviews test new ideas against one question: *does this reward the money,
  or does it reward a number beside the money?*
- The Concept Journal measures **exposure**, not mastery, so the game never makes a performance claim
  it cannot support.
- This is the boundary a future reader would most expect to be violated by a "gamification" folder,
  which is why it is written down.
