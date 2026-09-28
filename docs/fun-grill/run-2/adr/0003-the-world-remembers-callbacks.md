# The world remembers: Callbacks derive from the run record

**Status:** proposed (run 2 of the fun grill; merge decides).

We decided the game may refer back to a player's own past — **one authored Callback per card at
most**, derived at render time from `log`, `flags` and `history` by a pure module in the
`milestones.ts` tradition. Nothing is persisted, no `RunState` field is added, no RNG is consulted
(the choice is deterministic), and callbacks are fiction: text, never a number, never a maxim, never
in contradiction with a Milestone. This extends ADR-0002's derivation discipline to the *voice*
layer, and deliberately makes the same card say different things in two Runs.

## Considered options

- **Store "world memory" on `RunState`.** Rejected: a schema change for something already
  reconstructible from the record, with export/erasure/retention surface for no gain.
- **Leave cards fully static.** Rejected: with ~60 draws a Run, a deck that never references a choice
  reads as sixty worksheets — the core of the classroom complaint.
- **Derive callbacks (chosen).** No migration, old saves render by construction, archived Runs
  re-render theirs, and the device is droppable per card.

## Consequences

- A card's rendering becomes state-dependent; the a11y and i18n surface grows (each callback is a
  catalogue key ×3), so v1 caps the authored set at ~12.
- Determinism is preserved: same record + same month → same callback; no RNG, no economy, no metrics.
- Adding a callback is a copy change plus one predicate; the recall test suite mirrors
  `milestones.test.ts` (predicate firing, the one-per-card cap, empty/legacy records).
- A future reader will wonder why the same card reads differently in two runs; this ADR is the reason.
