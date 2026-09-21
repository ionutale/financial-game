# 15 — Interest rounding and the invisible compounding curve

Type: grilling
Status: resolved
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

## Answer

Resolved while building, without a grilling round — the decision is narrow and the alternatives are
all worse in obvious ways.

**The rule: interest, and the balance it lands in, are the one place decimals survive.**

- `formatMoney()` stays whole for prices, income, obligations, cash and net worth.
- `formatMoneyExact()` shows up to two decimals, and drops them when the amount is whole, for
  **the Interest credited row** and **the saved figure on the goal bar**.
- Internally nothing changed: interest still accrues on the exact balance in
  [loop.ts](../../src/lib/game/loop.ts).

Verified in the browser: the close sheet reads **Interest credited ◈0.12**, and the goal bar reads
**◈49.21 / ◈4,000** — so the balance visibly creeps upward month to month instead of appearing
frozen.

### Why the other options lost

- **Show a sub-unit as "<◈1"** — honest, and it still hides the growth. The point is to watch the
  number move.
- **Relax whole numbers everywhere** — the HUD is a statement; ◈100 is the design. Decimals belong
  where precision teaches, not on the masthead.
- **Accrue silently, surface only on a curve** — the curve does not exist yet, so the mechanic would
  have no home in the MVP at all.
- **Unlock the concept later than Stage 3** — the spine is `earn → budget → save → borrow → invest →
  tax`; interest has to arrive with the first real balance, not after it.

### What is still owed

Ticket 01 asked for a **visible curve**. That lands with the Money Story slice, where
[05](05-ending-report-metrics.md) already owns the net-worth sparkline. Until then the in-run signal
is the exact balance and the goal bar. Recorded here so it is not quietly dropped.

### Consequence

`formatMoneyExact` is the only sanctioned exception to ticket 01's whole-number rule. Any other
place a decimal appears is a bug.
