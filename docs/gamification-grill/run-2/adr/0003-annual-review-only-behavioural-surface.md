# The annual Year in Review is the only recurring behavioural surface inside a Run

Status: proposed

## Context

Ticket 05 decided that teaching metrics are never visible during a Run — *"a player who can see a
score optimises the score instead of living the life"* — while still promising a yearly recognition
moment: *"The stage-up card carries one metric line plus the money summary… Progress is felt
annually without a scoreboard."* That line was never built. Adding gamification reopens the
temptation to go further: a live budget-adherence meter, a "months inside budget" streak, a
savings-rate dial. The ask makes this the most likely place for the design to drift.

## Decision

The **Year in Review** on each Stage-up Card — the year's money summary plus months spent inside
budget, shown once at the Stage boundary — is the **only** behavioural surface inside a Run. There
is no live adherence meter, no savings-rate display, no behaviour streak, and no in-Run score of any
kind. The Money Story remains where the three Behavioural Measures and the you-vs-you comparison
live. The Month Close may state the month's own facts (as it already does), but must not aggregate
them into a running behavioural score.

## Considered options

- **A live "months inside budget" streak** — rejected: it is a behavioural score during the Run
  (against ticket 05), it breaks punitively, and a rational player would optimise adherence at the
  expense of the life being simulated.
- **A savings-rate dial** — rejected for the same reason; savings rate is a Money Story measure.

## Consequences

- The in-Run feedback loop is deliberately annual, not monthly; the Month Close carries money facts
  and Milestones, which are outcomes, not measures of behaviour.
- A future reader who wonders why a gamified game withholds a score finds the answer here.
- Any change to this boundary is a re-decision of ticket 05 and must say so explicitly.
