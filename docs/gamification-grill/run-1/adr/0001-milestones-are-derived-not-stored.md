# Milestones are derived views, never stored in RunState

**Status:** proposed

We considered persisting earned Milestones on `RunState` as a new field (and denormalising them onto
the Anonymous Profile), and instead decided that a **Milestone is a pure, derived view** computed from
the Run's existing record — `history`, `flags`, `log` and the Credit Score — by a `milestones.ts`
module, exactly as `metrics.ts` and `stats.ts` derive their views today.

## Considered options

- **Stored on `RunState`.** Simple to read, but it adds schema surface, forces every old save and
  every test fixture to migrate, duplicates a truth the record already contains, and makes the
  reducer responsible for bookkeeping that is not a consequence of a choice. It also invites a
  Milestone to *exist* in the economy, which the design forbids.
- **Stored on the profile (an achievement index).** Creates a second source of truth, a second
  export/delete obligation, and a reason for the archive and the index to disagree after a deck change.
- **Derived (chosen).** No migration, old saves keep working, the reducer stays pure and
  deterministic, "same seed, same Run" is untouched, and an *archived* Run can re-render its
  Milestones from the state already saved for replay.

## Consequences

- Milestones can only reference fields the record already keeps. A Milestone that needs a field the
  `MonthSnapshot` does not record (e.g. "set hours in the first month") is **not** smuggled in; it
  waits for its own explicit decision to extend the snapshot. The Fund-based investing Milestone is
  the live example of this boundary (the Fund is never incremented).
- A change to a Milestone's definition retroactively changes what a finished Run "earned". This is
  accepted: the Money Story and Run Record are narratives over the record, not certifications.
