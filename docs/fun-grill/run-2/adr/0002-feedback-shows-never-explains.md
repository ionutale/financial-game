# Feedback shows, never explains

**Status:** proposed (run 2 of the fun grill; merge decides).

We decided the game never names the lesson in the moment. A **Feedback** states what happened in the
fiction — one concrete, checkable fact, no abstract noun, no named Concept, no maxim, no sentence
addressed to a student. The Concept connection is carried retrospectively by Concept Coverage, the
Year in Review and the Money Story, and by the consequence itself. The same rule removes "Unlocks
{concepts}" from the Stage-up headline (the Concept name moves to a quiet secondary line), which
deliberately reopens ticket 02's stage-up announcement: the moment is announced in fiction, the
curriculum word stays available one tap away in the Stats Sheet.

## Considered options

- **Keep explicit explanations (status quo).** Rejected: it is the loudest single classroom tell in
  the shipped build ("that is what insurance is…", "This is the whole lesson"), and it makes every
  Choice read as a comprehension question.
- **Label the Concept on the card** ("now: credit & debt"). Rejected: converts a decision into a
  lesson immediately, the exact failure ticket 08 names.
- **Show-don't-explain, with retrospective naming (chosen).** Just-in-time *consequences* are what the
  evidence says works; naming is deferred to surfaces that report a closed Run and cannot be acted on.

## Consequences

- The learning payload moves from the sentence into the outcome and the retrospective surfaces; the
  copy rules and a lint live in `docs/voice.md`, and the Fink translation pass becomes a launch gate
  for the voice work because the voice is the product.
- Rules of thumb survive as **Closing Notes** (the Journal / Money Story close) — memories, not live
  instructions, so they create no optimisation pressure.
- The hardest four Concepts (tax, scams, insurance, credit) are the recorded fallback for explicit
  explanation if a playtest shows the consequence is not carrying them.
- Any future card authoring must satisfy the rule; a copy-lint test enforces the mechanical list.
