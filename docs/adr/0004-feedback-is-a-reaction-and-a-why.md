# Feedback is a Reaction and a Why; rules of thumb are taught once

**Status:** accepted (2026-09-27), merged from the four fun-grill runs.

We decided **Feedback** becomes two parts: the **Reaction** — what actually happened, in the fiction,
concrete and short — and the **Why** ("Why it happened") — why it mattered, short and personal, with
a general **Rule of Thumb** allowed only where the card is that Concept's **Teachable Moment**. The
Why **auto-opens at a Concept's first card and stays collapsed after** (*taught once, trusted
after*). Today every one of the ~190 Feedback strings ends in a general principle, which is the
single biggest source of the "teaching class" feel; the general rules move to first encounters and to
the retrospective (Reflections, the Epilogue), and a copy lint plus `docs/voice.md` hold the line.

## Considered options

- **Keep the single paragraph** (status quo) — the lecture remains.
- **Explain less everywhere** — loses the learning guarantee.
- **Tap-to-reveal hidden lessons** — rejected: the lesson must stay visible, just not on top.
- **Reaction + Why, taught once (chosen).**

## Consequences

- The Reaction may never state a general rule, and a Rule of Thumb may be quoted nowhere else in the
  moment; the copy lint is a review gate, not a style preference.
- The build seam is additive: an optional `_reaction` key beside today's `_feedback` (the Why), with
  today's rendering as the fallback — no schema change, old saves and unauthored cards unchanged.
- The educational guarantee moves from "every card repeats the rule" to "the first card of each
  Concept teaches it, and the record reflects the rest" — a deliberate pedagogy decision.
