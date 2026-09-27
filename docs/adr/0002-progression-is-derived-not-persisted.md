# Progression is derived, never persisted

**Status:** accepted (2026-09-27), merged from the four grill runs.

Every progression device is **computed at render time** from state the game already keeps —
`history`, `flags`, `log`, `stage`, `path`, and the profile `archive` — by pure modules in the
`metrics.ts` / `stats.ts` tradition. **No new `RunState` field, no profile field, no new document, no
migration.** This includes one-time announcements: a Milestone is announced in the Month Close where
its predicate *first* holds, derived by comparison, not by a stored "seen" set.

## Considered options

- **Store earned Milestones on `RunState`** (and/or a profile `records` index). Rejected: a schema
  change for state that is already reconstructible, a write path for bookkeeping that is not a
  consequence of a choice, and export/erase/retention surface for no gain.
- **Derive everything (chosen).** No migration, old saves render correctly by construction, the
  reducer stays pure and deterministic, and an archived Run can re-render its Milestones from the
  state already saved.

## Consequences

- `buildProfileExport`, the erasure route and the retention sweep stay correct unchanged: the Journal
  *is* the archive, so it is already exported and deleted with the profile.
- A change to a Milestone's definition retroactively changes what a finished Run "earned" — accepted:
  the Money Story and the Journal are narratives over the record, not certifications.
- A device recomputes on every render. These are trivial folds over ≤ 60 rows; this is recorded so a
  future engineer does not "optimise" it into stored state.
- Milestones can only reference fields the record already keeps; the never-incremented `RunState.fund`
  is the live example of a signal that stays out until the Fund is actually wired into the economy.
