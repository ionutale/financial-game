# The Fund is wired and the money model tells the truth

**Status:** accepted (2026-09-27), merged from the four fun-grill runs.

Three verified truth gaps are repaired, because the classroom feel is partly the game contradicting
its own numbers: (1) `RunState.fund` is never incremented and `the_fund` destroys the money it
promises to invest — so **the Fund is wired**: a `sets.fund` deposit moves Save→Fund (never borrowed
money; blocked when unaffordable), a seeded monthly return runs in `closeMonth` through the existing
`turnRng` (mean ≈ 7 %/yr, vol ≈ 16 %/yr, clipped), the spine's month-55 crash takes ~25 % with a
scripted recovery, and hold / sell / buy become real; (2) the card's "minimum payment" claims interest
the loop never charges — the minimum becomes a real **six-month Repayment** through the existing
recurring-payment state; (3) several "put it aside" Choices withdraw from Save and destroy the money —
a **deck audit** removes every choice that withdraws while promising to set aside.

## Considered options

- **Leave the Fund a display field** — the crash scene stays hollow and the Named Goal half-false.
- **A full investment system** — out of the one-author, wide-and-shallow scope.
- **Bounded seeded market, prototype first, harness gate (chosen).**

## Consequences

- The Fund lives in Stage 5 (deposits once the spine opens it), so the balance impact is small; the
  harness asserts the bands, the goal, the metrics and the Better-Choices Proof are unaffected.
- The gamification block on Fund-based Milestones is **lifted**: `fund_opened` and `rode_the_recovery`
  may join the catalogue, derived and next to the shipped `weathered_the_crash`.
- Old saves carry `fund: 0`; nothing new is persisted — the field already exists.
- **Named v2 debt, not smuggled:** a real card balance with APR, a `MonthSnapshot.deposited` row for
  the savings-rate measure, and the Lean-year-5 retune are explicitly out of scope here.
