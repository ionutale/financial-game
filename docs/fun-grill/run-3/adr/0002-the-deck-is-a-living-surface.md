# The deck is a living surface; the economy stays frozen

**Status:** proposed (fun-grill run 3, 2026-09-27).

The gamification design froze "the economy, the deck, the draw and the reducer" together
(`.scratch/gamification/design.md` §6). The fun pass **reopens content only**: Event Cards, Threads
and their copy may be added under a balance gate, while the `Card`/`Choice` shapes, the effect
vocabulary, the draw algorithm, the deadline/thread rules, the reducer and the economy's numbers stay
untouched. The reason is that variety is this game's cheapest fun and its thinnest resource — Stages
2–4 can already consume every card that no earlier Stage could have shown, so a second Run re-meets
most of the deck — and that content can be added without moving
the Better-Choices Proof, whereas an economy change can.

## Considered options

- **Keep the full freeze.** Rejected: it leaves replay and variety — the fun the ask is about — with
  no lever at all, and the deck's small surplus was a launch constraint, not a design value.
- **Reopen content and economy together.** Rejected: the goal (◈4,000), the bands and the seven
  metrics are calibrated against one economy; a content pass is not the place to recalibrate them.
- **Content only, gated (chosen).** New situations, no new systems.

## Consequences

- Every content PR runs a **balance harness** (seeded, scripted-policy Runs through the real reducer)
  and must not move the outcome-band distribution, the final-net-worth spread, or the year-5
  obligations ratio outside bands recorded from the current deck. If it does, the cards are tuned,
  never the economy.
- Content rules are part of the decision: two defensible options per decision card (no quizzes);
  shocks stay rare and bounded; windfalls stay windfalls. Every Stage's **guaranteed-unseen floor**
  (`deck.test.ts`) must reach at least its draws + 3 (the longer-term aim is draws + 6).
- The one content decision that also reverses a scope note: the **play-the-villain card** (the
  gamification design put it out of scope) ships as a single Stage 4–5 card, taught as a consequence
  and never as a maxim.
- The cost is translation: every card is 2–4 strings × 3 locales and grows the machine-translation
  ("Fink") debt. New copy is written short and idiom-free for that reason.
- The one intended exception to the frozen economy is the Fund (ADR-0003), decided and gated
  separately because it is a correctness fix, not a content addition.
