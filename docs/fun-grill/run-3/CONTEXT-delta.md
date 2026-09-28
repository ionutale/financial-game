# CONTEXT-delta — fun-grill run 3 (proposed, not applied)

**Sandbox:** this file is a *proposal*. It does not edit `CONTEXT.md`. Merge = paste the entries
below into `CONTEXT.md` in the positions indicated, and apply the three edits. Format follows
`docs/agents/domain.md` / `CONTEXT-FORMAT.md`: term, one- or two-sentence definition, `_Avoid_` line
where synonyms exist.

---

## 1. Edits inside the existing Glossary

### `Feedback` — revise (was: *"The in-game explanation shown after a Choice, connecting the outcome to the Concept it teaches."*)

**Feedback**:
The game's answer to a Choice, in two parts: the **Reaction** — what the world did — and the
**Lesson** — why it mattered, naming the Concept where the Choice is a Teachable Moment.
_Avoid_: explanation, verdict, judgement, popup

### `Fund` — revise (was: *"the market-investment pot; the only place money can grow faster than inflation."*)

**Fund**:
The market-investment pot: money moved out of Save grows or falls with the Run's seeded market, and
the scripted crash is its risk made real. It counts toward the Named Goal and Net Worth.
_Avoid_: portfolio, stocks, investment account

*Why the edit:* the current definition promises growth the economy never implemented (`fund` is
initialised and never incremented; three cards spend into it and the money vanishes). After the
Fund is wired (this run's ADR-0003) the definition becomes true; until then this edit is a bug report
as much as a glossary change.

### `Stage` and `Introduced` — wording only (drop the class word "unlock")

- **Stage**: a life phase within a Run (e.g. school years, first job, independence). Each Stage is
  **met with** specific Concepts and frames its Event Cards. Stages only ever add — the **Add-only
  rule**: nothing a player has learned is taken away.
  _Avoid_: level, chapter, unlock
- **Introduced**: a **Concept** state: the Stage that carries it has opened.
  _Avoid_: unlocked, available

*Why the edits:* player-facing copy moves from "Unlocks …" to "What you'll meet: …" (the Journal
already says "Concepts met"), and the glossary should not keep a vocabulary the game has retired.

---

## 2. New cluster — Voice and feel

*(Suggested placement: after the main Glossary, before `## Gamification`.)*

**Beat**:
A moment in the Run that earns a treatment beyond plain type — an illustration, a motion, a cue, a
composition. The illustrated beats are the ten the art budget funds; a beat may be a beat without a
drawing.
_Avoid_: cutscene, animation, effect, juice

**Deal**:
The moment a Turn's Event Card arrives, at the end of the Plan Step — the Run's recurring reveal.
_Avoid_: draw, pull, random event

**Reaction**:
The first part of a **Feedback**: what actually happened, in the fiction, concrete and in the world's
voice. It never states a general rule.
_Avoid_: explanation, narration

**Lesson**:
The second part of a **Feedback**: why the outcome mattered, short and specific to this life; a
general rule of thumb is allowed only where the card is that Concept's **Teachable Moment**.
_Avoid_: takeaway, moral, teaching

---

## 3. New cluster — Record and replay

*(Suggested placement: after `## Gamification`.)*

**Reflection**:
One derived, personal observation about the player's own finished record — *"Year 3: eleven months
of twelve inside your own budget"* — shown only in the **Money Story**. Never an imperative, never a
general law, never live.
_Avoid_: insight, feedback, grade, summary

**Epilogue**:
The closing passage of the **Money Story**: where the character is at 19, written per path and per
**Outcome Band**. It says what the five years bought and cost; it never ranks the Run.
_Avoid_: ending, verdict, grade

**Twin Run**:
A Run started from a finished **Chapter**'s seed — the same starting world, lived differently.
Choices diverge the worlds by design; nothing of the first Run is shown during the twin, and any
comparison stays retrospective and in the **Journal**.
_Avoid_: replay, rematch, challenge run, best run

---

## 4. Notes for the merge

- **The Gamification cluster is unchanged** by the fun pass: Milestones, Year in Review, Journal,
  Chapter, Concept Coverage, Introduced/Experienced, the Honest-reveal rule and the Reward Loop
  boundary all stand. The pass builds on them; it adds no device to that layer.
- **The Honest-reveal rule stands as written** (`…anything competence-derived and numeric is held for
  the Year in Review or the Money Story`). The new live surfaces this pass adds are money and
  arithmetic — the Fund's value and monthly move, the receipt's rows — and are legible in the
  fiction; the new retrospective surfaces are the Reflections and the Epilogue.
- **Add-only, deterministic seeds, recoverable consequences, no timers, colour never load-bearing:**
  all unchanged and not restated here.
