# Behavioural numbers are retrospective

**Status:** accepted (2026-09-27), merged from the four grill runs.

Teaching metrics stay hidden during a Run, as ticket 05 requires — *"a player who can see a score
optimises the score instead of living the life."* The new recognition surfaces are the **Year in
Review** at each Stage-up and the Money Story; **Milestones are event-shaped** (a thing that
happened), never rate-shaped (a level maintained), and never aggregate into a live counter. The
Named Goal bar remains the only live metric in the HUD.

## Considered options

- **A live adherence meter or streak counter.** Rejected: a behavioural score during the Run, it
  breaks punitively, and a rational player would optimise the meter instead of the life.
- **Everything at month 60 (the status quo).** Rejected: deferred recognition is the problem this
  layer exists to fix.
- **A Year in Review the player can act on.** Rejected by construction: it reports a closed year.
- **The annual retrospective (chosen).** Progress is felt once a year without a scoreboard.

## Consequences

- The Year in Review is a small fixed block, never a dashboard, and must never grow a live row; a
  regression test asserts it appears only at a Stage-up.
- A milestone predicate must never read a live rate mid-Run.
- Turning Points remain the place mistakes are narrated honestly; Milestones stay positive-only, so
  the two never contradict.
- Any change to this boundary is a re-decision of ticket 05 and must say so explicitly.
