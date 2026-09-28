# The Fund is wired: investing must be real

**Status:** proposed (fun-grill run 3, 2026-09-27).

We decided to **wire the Fund into the economy** — deposits move money out of Save into `fund`, a
seeded monthly market moves it, the scripted crash is a real ~25 % fall, and the crash card's shipped
choices (hold / sell / buy) do what their copy says. Today `RunState.fund` is initialised and **never
incremented**: `the_fund` "open" spends ◈400 into nothing, `the_crash` "buy" spends ◈200 into
nothing, `boring_fund` "fund" spends ◈50 into nothing, while `CONTEXT.md` calls the Fund "the only
place money can grow faster than inflation", the crash copy promises a recovery, and the Work path's
goal is net worth ≥ ◈4,000. Following the game's own investing advice currently costs up to ◈650 of
that goal and buys nothing — so this is a correctness fix before it is a fun one. It was deferred as
"a separate, larger decision" in the gamification pass; this is that decision.

## Considered options

- **Leave it (status quo).** Rejected: three cards give money away for nothing and the investing
  Concept — one of the eight the game promises — has no mechanic, no risk and no payoff.
- **Minimal honesty: move the money into `fund` and stop.** Rejected: a static pot teaches nothing;
  the crash would still be a vignette and the copy would still promise a recovery that never comes.
- **A bounded, seeded market (chosen).** Deposits move Save→Fund (never borrowed money), the monthly
  return is drawn from the Run's existing per-month seed, the crash falls ~25 %, months 56–60 carry a
  scripted partial recovery, and selling liquidates at the crashed value.
- **A full investing system (units, prices, rebalancing).** Rejected: a different game, a new state
  model, and a UI the phone screen and the one-author budget do not have room for.

## Consequences

- The market is deterministic: same seed, same market — which is what makes the **Twin Run**
  (ADR-0004) an honest same-start experiment and keeps the seeded-RNG rule (locale never feeds it).
- `netWorth`, the Work-path goal, the Study-path buffer and the outcome bands now include a number
  that can move; the **balance harness** (ADR-0002) is the gate, and its market parameters — mean
  (~7 %/yr), volatility (~16 %/yr), the crash depth, the recovery — are the tuning surface. The goal,
  the bands and the Better-Choices Proof are not.
- The Month Close gains one **Fund** row when the Fund holds money (the crash's landing place); the
  Stats Sheet's existing Fund row becomes live; no HUD change. At most two new Milestones become
  possible (`fund_opened`, `rode_the_recovery`), beside the shipped choice-derived
  `weathered_the_crash` — the block the gamification design placed on Fund milestones is lifted.
- Build order: prototype first (the loop, the fall, the recovery, the sell), then the wiring, then
  the harness; a tuning change after playtest is expected and cheap by design.
