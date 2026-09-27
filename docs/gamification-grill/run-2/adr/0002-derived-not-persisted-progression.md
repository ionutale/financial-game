# Progression state is derived from the Run, never persisted

Status: proposed

## Context

Adding progression devices raises the obvious question of where their state lives. The Run already
carries everything needed: `history` (one `MonthSnapshot` per closed month), `log` (every card
played), `stage` and `path`. The alternative is new fields in `RunState` (a `milestonesSeen` or
`conceptsExperienced` set), which would mean a schema change, a write-path change, and old saves
that predate the fields. `store.ts` already goes out of its way to read legacy document shapes, and
`stats.ts` already guards a missing `thread` field — schema stability is a value here.

## Decision

Every Progression Device is **computed from the Run at render time** and is **never stored**. The
Concept Journal derives from `stage` + `log`; Milestones and the Year in Review derive from
`history`; the Archive Wall reads the existing archived Runs. No new field is added to `RunState`
and no new document is stored on the Anonymous Profile.

## Considered options

- **Persist a `milestonesSeen` / `conceptsExperienced` set** — rejected: a schema change for state
  that is already reconstructible, plus export/erase/retention surface for no gain.
- **A separate profile-level progression document** — rejected: it is the shape that turns a Run's
  progression into a lifetime collection, which is the first step toward the Reward Loop excluded by
  ADR-0001.

## Consequences

- No migration; old saves render the new devices correctly by construction.
- `buildProfileExport`, the erasure route and the retention sweep stay correct unchanged: the
  Archive Wall *is* the archive, so it is already exported and deleted with the profile.
- Cross-Run progression is deliberately impossible without a future decision to break this rule; the
  cost (no lifetime collection) is accepted. The Archive Wall supplies the cross-Run continuity we
  want without it.
- Devices recompute on render. The functions are trivial folds over ≤ 60 rows, so this is not a
  performance concern; it is recorded so a future engineer does not "optimise" it into stored state.
