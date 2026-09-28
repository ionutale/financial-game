# CONTEXT-delta — Fun Grill Run 2 (proposed, sandboxed)

**Not applied to `CONTEXT.md`.** Run 2 of 4 parallel grill runs; per the run's sandbox rule this file
proposes glossary changes only. The orchestrator merges — or discards — them. Format follows
`domain-modeling/CONTEXT-FORMAT.md`: one term, one or two sentences, an `_Avoid_` line where a word
is dangerous.

## Proposed amendment

**Feedback** *(amend the existing entry)*:
The in-game response shown after a Choice: what happened, in the **Narrator**'s voice — never a named
Concept in the moment. The Concept is linked retrospectively, by Concept Coverage and the Money Story.
_Avoid_: explanation, lesson, debrief, takeaway

*From (current):* "the in-game explanation shown after a Choice, connecting the outcome to the Concept
it teaches." The rename keeps the term and changes what it means — this is the pass's core pedagogy
change (see ADR-0001 and log Q9/Q15), not a new device. The Retrospective Epigraphs are the
**Closing Note**.

## Proposed additions

**Narrator**:
The game's single in-game voice — someone who has already lived it and will not lie to you. Dry, warm,
unsentimental; it never congratulates, never scolds, and never names a Concept mid-Run.
_Avoid_: teacher, guide, coach, tone of voice

**Callback**:
One authored line, derived from the Run's record, in which the world shows it remembers a past Choice.
At most one appears per card, it never carries a number, and it is never a maxim.
_Avoid_: easter egg, flashback, reference, memory

**The Cast**:
The small set of named recurring characters (Priya, Ravi, Danny, and two more) who make consecutive
Event Cards feel like one life. They recur by name and small authored facts, never as lesson-carriers.
_Avoid_: NPCs, characters, cameos, cast list

**Life Line**:
The one authored sentence in the HUD that says what the character's life is, outside money, this
Stage ("Football Thursdays. The phone's on a plan now."). Text only; never a wellbeing stat.
_Avoid_: mood, status, wellbeing, vibe

**Closing Note**:
The one short, authored line of rule-of-thumb prose at the end of a Chapter and the Money Story — the
only place the game says the rule out loud. It reports a closed Run and cannot be acted on.
_Avoid_: moral, lesson, takeaway, epilogue

**True Dilemma**:
An Event Card whose Choices are all defensible — the tension is in values, not in arithmetic, and the
Feedback declares no winner. Authoring rule: at least one card in three per Stage.
_Avoid_: hard choice, no-win, impossible choice

**Villain Card**:
An Event Card that casts the player as the one selling — the predatory terms are theirs to offer, and
a Thread carries the buyer's consequence back to them. It teaches by letting the player play the
villain, never by telling them off.
_Avoid_: Shady Sam card, role-play card, scam card (a scam is something done *to* the player)

## Notes for the merge (commentary, not for `CONTEXT.md`)

- **Kept untouched on purpose:** Reward Loop, Milestone, Year in Review, Concept Coverage, Journal,
  Chapter, Honest-reveal rule. The Fun Pass adds no reward surface and changes no reveal boundary —
  ADR-0001 of the repo stands (reaffirmed by this run's ADR-0001).
- **`Feedback` is the only amendment.** If the merge rejects it, the voice pass loses its glossary
  anchor and the copy rules fall back to a style guide (`docs/voice.md`) alone.
- **`Callback` vs `Thread`:** Thread is a planted consequence with a resolve card (a mechanic);
  Callback is a line that refers back to the record (a voice device). They are independent; a Callback
  may reference a Thread's plant or resolve.
