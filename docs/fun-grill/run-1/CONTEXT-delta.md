# Context delta — fun & framing (run 1)

Proposed additions to `CONTEXT.md`. **Sandboxed proposal only** — this run must not edit the shared
`CONTEXT.md` (four parallel runs would clobber each other). When a single direction is chosen, these
terms merge into the root glossary in `CONTEXT-FORMAT.md` style.

Glossary only — no implementation detail. Terms are grouped under a **Feel & Framing** subheading
because they form one cluster; the existing `Glossary` and `Gamification` groups stay as they are.

---

## Proposed new terms

### Feel & Framing

**Watch-it-happen Rule**:
The game's rule for teaching: every Concept is learned from a consequence the player watched happen
in the fiction — never from a definition, a quiz or an instruction. It is the fun-side counterpart
of the **Honest-reveal rule**: that rule governs what may be *shown*; this one governs what may be
*taught*.
_Avoid_: lesson, tutorial, tip, explainer, quiz, exercise

**Game Feel**:
The moment-to-moment craft of the game: how a Choice's consequence is shown, heard and felt before
the end-of-Run review — the **Ledger Line**, the month close's beat, the strip, the cues and the
emphases. It is distinct from progression (the **Milestone** layer) and from scoring (the **Money
Story**'s numbers), and it grants nothing.
_Avoid_: juice, polish, dopamine, engagement, retention

**Card Format**:
The diegetic shape a card's own words are arranged into — a **message**, a **paper** document, a
**receipt** — so the fiction is felt rather than read flat. A format changes only the arrangement of
the words; it never changes the mechanics, the Choices or the meaning.
_Avoid_: skin, theme, template, layout, quiz card

**Cold Open**:
The single scene shown before month 1, replacing a tutorial sequence: who the character is, the
Named Goal in one line, and Start. Everything else about how a month works is taught at the moment
it is needed, by a hint or by the first card.
_Avoid_: onboarding, intro sequence, tutorial, splash screen

**Year Beat**:
The one authored, in-fiction line a Stage-up carries in place of a curriculum announcement — the
moment the new Stage turns on, told as life rather than as a module list.
_Avoid_: unlock line, syllabus, module, curriculum line

**Ledger Line**:
The one-line account, inside the Feedback, of what a Choice actually moved (the changed balances and
Free Time, with signs). It is the game's visible cause and effect; it appears only after the Choice,
so it can never leak an outcome.
_Avoid_: toast, popup, delta, counter, chip

**Play-the-Villain Card**:
A card in which the player is the one selling, lending or recruiting — so a predatory mechanic is
learned from the inside instead of being explained. The game never tells the player the choice was
wrong; the consequence is the lesson.
_Avoid_: villain card, evil option, shady choice, moral test

**Road Not Taken**:
The single end-of-Run line pointing at the other path's **Chapter** when one exists — a story already
lived, never a score to beat, and never a replay of the same seed.
_Avoid_: what-if, alternate ending, spoiler, do-over

**Chapter Title**:
The derived name a finished Run carries in the **Journal**, drawn from its most significant moment
(the market fall, the card, the loan), so the record reads as a shelf of lives rather than a ledger.
_Avoid_: rank, grade, label, tag

---

## Terms reused (definitions unchanged)

Listed so the merge does not accidentally redefine them; this pass leans on them.

- **Concept / Concept Coverage / Introduced / Experienced** — untouched in the model, the code and
  this glossary. What changes is the *player-facing copy* of the coverage surfaces (below), not the
  vocabulary.
- **Milestone / Year in Review / Journal / Chapter** — shipped by the gamification layer; this pass
  adds a Chapter Title to the Journal and adds no new recognition device.
- **Money Story** — unchanged in structure and figures; a **Road Not Taken** line joins its "What
  next" section.
- **Honest-reveal rule** — unchanged. The **Ledger Line** is post-Choice and therefore legal under
  it: balances are already legible in the fiction, and no competence-derived number is revealed.
- **Behavioural Measures / Better-Choices Proof** — unchanged; nothing in this pass is optimisable
  for competence.
- **Turning Point** — the raw material for **Chapter Title** derivation, as it already is for the
  Journal's moments.
- **Stage / Stage-up Card / Teachable Moment** — the Stage-up's **Year Beat** presents the same
  unlock and Teachable Moment in fiction's words; the ladder itself is untouched.
- **Wage Hint** — the pattern the **Cold Open**'s first-month hint follows: derived, self-retiring,
  contextual.

---

## Player-facing copy changes (not new terms)

These are labels, not vocabulary; the model terms stay exactly as the gamification merge fixed them.

| Surface | Today (player-facing) | Proposed (player-facing) |
|---|---|---|
| Stage-up banner | `Unlocks {concepts}` | The Stage's **Year Beat** line |
| Stats Sheet section | "Concept coverage" | "What money has shown you" |
| Money Story section | "Concept coverage" | "What the five years showed you" |
| Journal section | "Concept coverage" | "What you've met" |
| Coverage states | "Introduced" / "Experienced" / "Not yet" | "coming up" / "met" / "later" |
| App title | "Financial Life-Sim" | Working title "Leftover" (+ descriptive subtitle) |

---

## Notation

- **Card Formats** are keyed by card id, exactly as beats are keyed in `beats.ts`: the mapping lives
  with presentation, not in the deck. A multi-line format's extra prose lives in the message
  catalogues under `card_<id>_line_<n>` so the existing i18n gates can enumerate it (`forms.test.ts`
  mirrors `beats.test.ts`).
- **Year Beats** are catalogue keys derived from the Stage number (`stage_<n>_beat`), one per Stage,
  translated ×3 like every other string.
- **Chapter Titles** are language-neutral slugs derived from a Run's record (e.g. `market_fall`,
  `card_year`, `quiet_year`), with copy in the catalogues under `chapter_title_<slug>`.
- **Ledger Line**, **Cold Open**, **Road Not Taken** copy lives in ordinary catalogue keys; no prose
  in code, per the repo's existing rule.

---

## Note on a boundary this delta deliberately keeps

The gamification merge chose **Concept Coverage** as the canonical name of the learning-payoff
surface, and the terms **Introduced** / **Experienced** with it. This delta proposes **no change to
that model** — the coverage record still exists, still derives from `stage` + `log` + the deck, and
is still the learning legibility the layer exists for. Only the *words the player reads* change, so
that a curriculum tracker stops reading like a syllabus. A future reader should not "fix" the
player-facing names back to the model terms: the split is the decision.