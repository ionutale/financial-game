# Gamification is recognition and memory, not a reward economy

**Status:** accepted (2026-09-27), merged from the four grill runs.

We decided the gamification layer adds **recognition and memory only** — Milestones, the Year in
Review and the Journal — and never a parallel reward economy: no XP, points, coins, lives, stars,
gems, levels, badges-as-payoffs, streak mechanics or leaderboards. The money (◈, the Named Goal, the
Credit Score) and the story remain the only scores, and a Milestone grants nothing. Ticket 08's
prior-art finding — *"if we use points at all, they must be the money itself, not a parallel
currency"* — is reaffirmed, not reversed.

## Considered options

- **A parallel currency (XP / points / coins).** Rejected: rewards attach to completing prompts
  rather than to financial competence, and expected tangible rewards reliably undermine intrinsic
  motivation — the documented failure mode in ticket 08.
- **Milestones that pay a small cash bonus.** Rejected: either the payout is trivial (no motivation)
  or it moves the balance and the Better-Choices Proof.
- **Leaderboards / any other-player comparison.** Rejected: they reward luck and starting position,
  and the seeded draw makes runs only partially commensurable. Out of scope since charting.
- **Recognition and memory only (chosen).** A player optimising for a Milestone is optimising for a
  behaviour the game already teaches.

## Consequences

- There is nothing to farm and nothing to lose, so no loss-framed streak or daily-return pressure is
  possible by construction.
- Any future "reward" proposal must answer *"what competence does this point at?"* before it can be
  added.
- A future reader will look for a points system in a game that calls itself gamified; this ADR is the
  reason there is none.
