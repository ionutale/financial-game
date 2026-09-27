# The Run Record is derived from the existing Run Archive, not stored separately

**Status:** proposed

We considered giving the cross-Run gamification layer its own persistence — a stored collection of
earned Milestones and career aggregates on the Anonymous Profile — and instead decided the **Run
Record is a pure view over `profile.archive`**, the finished Runs already kept for replay as complete
`RunState` values (`ArchivedRun`, ticket 23).

## Considered options

- **A stored achievement/career document.** Faster to read and independent of the archive, but it is
  a second source of truth, it reintroduces the exact "personal data collection" the project's privacy
  posture avoids, and it must be added to the export, the delete and the retention sweep or it becomes
  a data-rights hole.
- **Derived from the archive (chosen).** Zero new stored data, no migration, no new privacy surface:
  the archive is already exported by `buildProfileExport`, already deleted by `DELETE /api/profile`,
  and already dated by the retention sweep. The only cost is CPU — computing Milestones over a handful
  of archived runs on render.

## Consequences

- Nothing about the game's data holdings changes; `docs/privacy/lia.md` gains a sentence naming the
  new *surface*, not a new data class.
- The Run Record is capped by whatever the archive retains; if the archive is ever bounded or pruned,
  the Record shrinks with it. That is honest (it reflects what is actually kept) and is preferred to an
  index that outlives its source.
- Cross-Run Milestones (e.g. "finished both paths") are computable at render time, so no write path is
  needed to award them.
