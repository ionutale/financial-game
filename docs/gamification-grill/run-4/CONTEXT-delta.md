# CONTEXT-delta — proposed glossary additions (sandboxed, run-4)

Proposed changes to the repo's `CONTEXT.md`, in `domain-modeling`'s [CONTEXT-FORMAT.md](../../../../.agents/skills/domain-modeling/CONTEXT-FORMAT.md) style.
**Not applied to the repo.** `CONTEXT.md` is shared by four parallel runs; this file is the proposal only. Additions only — no existing term is redefined, in keeping with the **Add-only rule**.

## Proposed new entries

Grouped in a new **Progression** cluster, because gamification terms form a cohesive area distinct from the existing money/loop vocabulary.

**Gamification**:
The game's layer of progress and recognition — the Year in Review, Milestones and the Record Book. It exists to make a five-year Run worth finishing and a second Run worth starting.
_Avoid_: rewards, points system, meta-game, achievements (for the layer as a whole)

**Milestone**:
A named recognition the Run awards the moment a specific money act happens — *Cleared the card*, *Held through the crash*, *Fund opened*, *Goal reached*. Milestones observe; they never change money or state.
_Avoid_: badge, achievement, trophy, medal, unlock

**Mark**:
The visual token of a Milestone: a small, flat, non-colour-dependent glyph shown with the Milestone's name. A Mark never carries meaning alone.
_Avoid_: icon, sticker, star

**Year in Review**:
The retrospective shown when a Stage-up opens: the year's money, one behavioural line, and the Milestones earned that year. It reports a closed year and can never be acted on.
_Avoid_: scorecard, report card, grade, dashboard

**Record Book**:
The profile-level history of the player's own Personal Bests across finished Runs.
_Avoid_: leaderboard, ranking, high score, profile

**Personal Best**:
The player's own best figure for one behavioural measure across their finished Runs — adherence, savings rate, want share, final net worth.
_Avoid_: record, high score, best run

## Notation changes

- **RunState** gains an ordered list of earned Milestones (id + the month each was earned), alongside the existing `flags` and `log`. The announcement of a Milestone is UI state and never enters `RunState`.
- **Profile** gains an optional `records` field holding Personal Bests. Existing documents without it must read as an empty Record Book, the same graceful-degradation rule the pre-ticket-23 single-Run shape already follows.
- **Turning Point** and **Milestone** overlap in source (`flags`) but not in purpose: a Turning Point is *narrated* and may be a mistake; a Milestone is *earned* and positive-only.

## Not in this language

These must not appear in the glossary, the code, the catalogue or the UI. They are the vocabulary the design deliberately rejected (ticket 08; `.scratch/mvp/map.md` "Out of scope"):

> XP · points · coins · lives · level (as a noun) · loot · streak (as a mechanic) · leaderboard · ranking · reward currency · daily bonus

The money (`net worth`, `◈`) is the only score, and the player's own past is the only benchmark.
