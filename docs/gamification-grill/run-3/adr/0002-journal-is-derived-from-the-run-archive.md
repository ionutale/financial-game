# The Journal is derived from the Run archive, not stored

The cross-Run Journal shows every finished Run as a Chapter, the Milestones earned and the Concepts
met. We decided it will be a **pure projection over the profile's existing data** — the active Run
plus the `archive` of finished Runs, both of which already store `history`, `flags` and `log` — with
**no new `RunState` field, no new Mongo field, no new endpoint and no migration.**

## Status
accepted (proposed by grill run 3; not yet merged into the repo)

## Considered options

- **A durable `journal` collection** of earned milestones, independent of the Run archive. Rejected
  for v1: a second source of truth that can disagree with the archive, a schema and migration, a new
  privacy surface, and a new write path.
- **Milestone ids stored on `RunState`** as they fire. Rejected for v1: derivation from `history`
  `flags`/`log` already yields the same set with no save-shape change; adding a field would need
  back-compat handling for old saves.
- **Derive from the archive** (chosen).

## Consequences

- The Journal is automatically covered by the existing **export**, **delete** and **12-month retention
  sweep** (tickets 12/23): no new privacy obligation, and no new copy is needed to disclose it — only
  copy to *reassure* that the Journal is built from stored Runs, not collected.
- Old-shaped documents keep loading; derivation reads only fields that already exist, tolerating
  short or missing `history`/`flags`/`log` on legacy saves.
- Accepted cost: if the archive is pruned, or the device is cleared, the Journal shrinks with it.
  This matches the documented contract that clearing storage loses progress. A future durable
  "trophy case" would be a deliberate reversal of this ADR and a new persisted surface.
