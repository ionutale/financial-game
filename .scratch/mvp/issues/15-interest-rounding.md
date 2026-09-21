# 15 — Interest rounding and the invisible compounding curve

Type: grilling
Status: open
Blocked by: —

## Question

Surfaced by building the month loop. With whole-number money ([01](01-economy-model.md)) and 3%/yr
on a small balance, **interest renders as ◈0 for most of the early run**. On a ◈34 balance the
monthly interest is ◈0.085 — real, credited, and rounded out of sight.

Ticket 01 requires that "compounding must be shown as a **visible curve**, not a number". Right now
the mechanic is invisible in its own close sheet, exactly when the player first meets it.

Decide:

- whether the close sheet shows a sub-unit interest figure (one decimal), or
- whether interest accrues silently and surfaces only on a curve / year summary, or
- whether the whole-number rule is relaxed for *credited* amounts but kept for *spendable* ones,
  or
- whether early balances are simply too small for interest to be worth teaching yet, and the
  concept should unlock later than Stage 3.

Also settle: what the curve looks like, when it first becomes visible, and whether the player can
see it before the Money Story — given [05](05-ending-report-metrics.md) hides the teaching metrics
until the end.

Output: the rule the build follows for displaying small money, and the compounding curve's home.
