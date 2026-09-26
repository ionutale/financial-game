# 17 — The default plan is a trap

Type: grilling
Status: resolved
Blocked by: —

## Question

Surfaced by playing a Run end to end. From Stage 3 the character earns **nothing** unless the work
hours slider is moved: income is `base + hours × rate`, and the Stage 3 and 4 bases are zero. The
Plan step opens with **0 hours**, so the default plan is *earn nothing while obligations of ◈120–180
a month keep arriving*.

A player who never touches the slider — a 14-year-old meeting a slider for the first time — watches
their net worth fall every month with no obvious cause. The Run that produced the first Money Story
ended at **−◈8,597** precisely this way, having never worked a single shift.

The game does show `Income ◈0`, so it is not lying. It is simply that **doing nothing is the worst
possible plan, and nothing says so.**

Decide:

- whether the work-hours slider should default to something sane per Stage (e.g. the tier's typical
  hours: 35 at Stage 3) rather than zero;
- whether the Plan step should warn when expected income cannot cover this month's obligations
  ("◈180 due, ◈0 coming in");
- whether a first-time player gets a nudge on the slider, given ticket 04 chose no tutorial;
- whether the Stage 3/4 income bases should be non-zero so that zero hours is survivable but poor,
  rather than ruinous.

This is a balance question as much as a UX one: the floor of the difficulty curve is currently below
"recoverable" for a player who is passive.

Output: the default plan rule, the shortfall warning, and any change to the Stage income bases.

## Answer

Resolved over two grilling rounds. **The trap is legibility, not arithmetic: the economy does not
change, and the Plan step stops being silent.**

Evidence first — same seed, same first-affordable-choice policy:

| Scenario | Final net worth |
|---|---|
| Never works | −◈8,648 |
| Works 35h through S3–S4, stops at S5 | +◈7 |
| Starts 35h only from month 37 | −◈4,434 |
| S3/S4 base 40, never works | −◈7,687 |
| S3/S4 base 120/180, never works | −◈5,038 |

Bases are a weak lever — one big enough to stop the bleed is a wage for no work, which undoes Stage
3's teachable moment ("effort becomes a wage", ticket 02) — and a pre-filled slider does the
choosing for the player. So the default stays zero and the screen says what zero means.

### What ships

1. **Default-plan rule: hours carry month to month and start at 0.** No auto-work, no base income;
   the 50/30/20 preset is unchanged and still disabled at 0 income. Doing nothing remains allowed,
   and is now legible.
2. **The Shortfall Warning**, directly above *Start the month*: fires whenever expected income is
   below this month's Obligations, states the two numbers, and names where the gap lands —
   `Covered from savings.` when cash + savings absorb it, `The ◈120 gap becomes debt.` when they
   cannot. It never blocks the month and never mentions the card. Rule in `planWarning()`
   (`presentation.ts`), tested against the debt, savings, covered and pre-fork states.
3. **The Wage Hint**, one card above the Work-hours slider while Stages 3–4 still plan 0 hours:
   *"The allowance stopped. This year, hours are the money."* It retires for good the first time
   hours are set above zero (`workHintDone`), and deliberately has no dismiss — the failure being
   fixed is the screen staying quiet. `workHintVisible()` owns the rule.
4. **No economy change.** Stage 3/4 bases stay 0 and obligations are untouched; a late conversion
   is still hard (month-37 starter ends −◈4,434) and that is the point — real consequences, never
   unwinnable.
5. **Regression insurance**: the conditions are pure functions with tests, and the screen was
   verified in a browser at Stage 1 (quiet), Stage 3 0h (hint + debt warning), Stage 3 with hours
   (both gone) and Stage 5 pre-Fork (suppressed).

Adjacent problem found and split out: month 49's Plan runs before the Fork is chosen, so it quotes
the Work-path obligation (◈1,150) while a Study player will owe ◈750. Ticket 17 suppresses its
warning there; [18 — The Fork plans before it is chosen](18-fork-before-plan.md) owns the fix.
