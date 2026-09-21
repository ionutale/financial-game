# 17 — The default plan is a trap

Type: grilling
Status: open
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
