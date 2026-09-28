# Feedback is taught once, then trusted

**Status:** proposed (2026-09-27), from the `fun-grill` run-4. Reopens the shipped Feedback contract of ticket 04.

The shipped game explains every Choice: each `card_<id>_choice_<id>_feedback` string ends in a rule or a verdict, ~190 times, in one omniscient voice. That was the design's teaching guarantee and it is also the single largest reason the game reads as a class. We decided to split **Feedback** into a **Reaction** (the short in-fiction line shown when the Choice lands; never a lesson) and a **Why** (the explanation, behind a disclosure; the only home of the **Rule of Thumb**). The Why **opens by itself at a Concept's first card** — the Teachable Moment — and is collapsed at every later card. The lesson still lands exactly where the design promised; it is no longer imposed every month.

## Considered options

- **Keep explaining every Choice (status quo).** Rejected: it is the diagnosis's number-one classroom signal, and a lesson repeated ~190 times stops being a lesson and becomes a register.
- **Delete the explanations; let the numbers teach.** Rejected: it silently drops the educational guarantee, makes the three locales' copy smaller but the game less honest about what it is, and abandons the Teachable Moment contract.
- **Show everything (Reaction and Why both open).** Rejected: a wall of text at the moment of decision, and still a lecture — just a longer one.
- **Reaction + Why, taught once (chosen).** The first encounter keeps the full guarantee; every later encounter is a moment, not a class.

## Consequences

- The catalogue's `_feedback` keys become `_reaction` and `_why`; the migration is code + catalogue only, with no player data involved.
- A **Concept's first card in a Run** becomes load-bearing: it is derived from the log prefix by a pure helper (beside `planWarning`), tested, and it is what makes "taught once" true. The Spine already guarantees those moments.
- A player may open no Why after the first encounter. Accepted: the mechanical consequence is always in the month close, the **Reaction** often carries the rule in disguise, and the four carriers in the final design (consequence, first encounter, retrospective recognition, the world's reaction) do not depend on the player reading.
- Any future proposal to re-lecture must answer *"which Teachable Moment is this?"* before it can add copy.
- ADR-0003 governs the sibling risk: a Why may never assert a mechanic the loop does not run.

## Considered-and-deferred

- Auto-opening the Why for the whole **first Run** rather than the first card per Concept. Deferred: it entrenches the lecture for a whole Run to spare one, and the Stage-up already names the Concept.
