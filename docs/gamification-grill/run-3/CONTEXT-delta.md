# CONTEXT-delta — gamification (grill run 3)

> **Status: proposal, sandboxed to this run.** These terms are *not* applied to the repo's
> `CONTEXT.md`; the four parallel grill runs must not clobber each other. This file records the
> glossary changes run 3 recommends, in the style of the domain-modeling `CONTEXT-FORMAT.md`
> (`**Term**: definition` + `_Avoid_:`), and the amendments to existing terms that follow from them.
>
> The repo's real `CONTEXT.md` groups terms under `## Glossary` and uses `- **Term** —`. The
> definitions below are written to be pasted under that heading if accepted.

## Why a glossary delta at all

The single highest-leverage decision in this design is **what not to call things**. "Badge",
"achievement", "XP", "level" and "streak" are loaded: adopting them silently re-imports the reward
model the project's own prior-art research (ticket 08) rejected. Naming the additions *Milestone*,
*Journal*, *Chapter* and *Concept Coverage* — and writing the rejected words under `_Avoid_` — is
what keeps the feature from sliding back into a parallel currency. The vocabulary is the boundary.

---

## New terms

**Milestone**:
An authored acknowledgement of a competence moment the player has just lived through — triggered by
something already visible in the Run, shown at the month close, and kept in the Journal. It grants
nothing; it is recognition, not reward.
_Avoid_: badge, achievement, trophy, reward, bonus, unlock, sticker

**Journal**:
The player's private, cross-Run record, kept on the Anonymous Profile: every finished Run as a
Chapter, the Milestones earned, and the Concepts met. It is derived from the stored Runs, never
collected separately.
_Avoid_: scrapbook, album, trophy case, dashboard, profile page, leaderboard

**Chapter**:
One finished Run as it appears in the Journal — its outcome band, its turning points, its
Milestones, its seed, and when it ended.
_Avoid_: save, replay, record, run (a Run is the play; a Chapter is its record)

**Concept Coverage**:
The Journal's record of which of the eight Concepts the player has met, across every Run played.
_Avoid_: skill tree, progress bar, completion, level, mastery

**Honest-reveal rule**:
A named design rule: a thing may be shown live during a Run only if it is already legible in the
fiction and seeing it would not invite the player to optimise a number; anything competence-derived
and numeric is held for the ending. Extends the governing principle of ticket 05 to every
gamification surface.
_Avoid_: (n/a — this is the rule's own name)

**Challenge Run** *(deferred; seam only)*:
An optional Run begun under a self-imposed constraint, recorded in its Chapter and conferring no
mechanical advantage.
_Avoid_: mode, difficulty, quest, modifier, battle pass

---

## Amendments to existing terms

**Behavioural Measures** — unchanged definition, with one boundary added:
The three metrics a player can actually improve — budget adherence, savings rate and want spend —
and the only ones the you-vs-you comparison uses. **Boundary:** a Behavioural Measure is numeric and
hidden until the end of a Run; a Milestone is event-tied and may be shown live. A Milestone must
never be a Behavioural Measure in disguise.
_Avoid (for the boundary)_: live metric, scoreboard, meter

**Money Story** — extended:
The end-of-Run report showing the player's decisions and their financial trajectory across the Run.
**It now also carries the Run's Milestones, its Concept Coverage, and a link to the Journal,
after the numbers and before "What next".**
_Avoid_: report card, grade, summary

**Stage** — clarified, not changed:
A life phase within a Run; each unlocks specific Concepts. **It is the game's only level system:**
Stages are what other games call levels, and no second ladder is added.
_Avoid (for the clarification)_: XP level, rank, tier-up

**Run** — clarified:
One complete playthrough of the game, spanning five in-game years. **A finished Run persists as a
Chapter in the Journal** (the play vs the record distinction).
_Avoid_: save file, playthrough record

---

## Notation

- **Milestone ids** are language-neutral slugs, exactly like card ids (`first_interest`,
  `debt_cleared`, `held_through_the_crash`). Human names live in the message catalogue, keyed by
  id, in all three locales — no literal strings in code.
- **Journal** is a *projection*, not a stored entity: it is computed over the profile's `active`
  Run and `archive`. If the archive is cleared or pruned, the Journal shrinks with it; that is the
  intended contract, not a bug.
- A **Milestone** is evaluated once per Turn, at the month close, by a pure function over
  `history`, `flags` and `log`. There is no milestone state in `RunState`.

---

## Explicitly rejected vocabulary (recorded so it is not re-proposed)

| Rejected term | Why, in the project's own language |
|---|---|
| **XP / level** | The Stage ladder is already the level system; a second ladder runs on a hidden competence metric and dilutes the add-only rule. |
| **Points / coins / gems** | Ticket 08: *"they must be the money itself, not a parallel currency."* Money is the only currency. |
| **Badge / achievement / trophy** | Connotes a detached merit reward; the design uses event-tied acknowledgement instead. |
| **Live streak** | Leaks a hidden Behavioural Measure and invites farming; a retrospective streak in prose is permitted. |
| **Leaderboard** | Out of scope and anti-thesis; the you-vs-you comparison exists precisely to avoid it. |
| **Battle pass / daily reward / timer** | Ticket 14 forbids timers; research finds tangible extrinsic rewards crowd out intrinsic motivation. |
| **Cosmetic unlock** | One-author art budget (ticket 13) and no second visual language. |
