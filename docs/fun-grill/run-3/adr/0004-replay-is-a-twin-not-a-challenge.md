# Replay is a twin, not a challenge

**Status:** proposed (fun-grill run 3, 2026-09-27).

We decided to ship **same-seed replay as the Twin Run**: a Run started from a finished Chapter's
seed — the same starting world (spine, seeded draws, and once the Fund is wired the market of this
run's ADR-0003), lived differently. The gamification pass deferred same-seed replay ("revisit with
playtest evidence") and kept "Challenge Runs" vocabulary-only. We reopen the first and still refuse
the second: a Twin Run is not a harder mode, has no modifiers, no score and no ranking — it is the
purest form of the game's own you-vs-you philosophy, and the seed is already stored on every Chapter,
so nothing new is collected.

## Considered options

- **Fresh random replay only (status quo).** Rejected: it discards the game's strongest comparative
  idea — the same life, two ways — and reduces the seed, already a stored fact, to a line of text.
- **A challenge/scenario system (modifiers, constraints, scores).** Rejected: it would create a
  second way to win and invite optimisation; still deferred.
- **The Twin Run (chosen).** Same seed, clearly framed as "same start, your choices change what comes
  next" — the world diverges by design, because the deck's `requires`/`seen` state follows the
  player's choices; promising an identical deck would be false.

## Consequences

- **Retrospective only.** Nothing from the first Run is shown while the twin plays; after it finishes
  it is another Chapter in the order lived, and any comparison is verbal and in the Journal. The
  Honest-reveal rule holds unchanged (ADR-0003 in `docs/adr/`).
- **Safe entry:** the action appears on a Chapter only when no Run is in progress (never overwriting
  a live Run) and only for a seed the player's own archive holds; validated server-side, nothing new
  stored. Export, delete and retention already cover the seed and the Runs.
- **A required fix before it ships:** the Journal keys Chapters by `seed`, and a twin can share its
  seed by definition — the key becomes `seed + finishedAt` (the same latent duplicate-key class the
  gamification ledger already flagged for turning points).
- **A playtest question, not a metric:** whether replaying the same start feels meaningful or
  repetitive is exactly what the human playtest (and the Journal's growth over time) will answer;
  no telemetry is collected to find out.
