# CONTEXT-delta — proposed glossary additions (sandboxed, run-4)

Proposed changes to the repo's `CONTEXT.md`, in `domain-modeling`'s CONTEXT-FORMAT.md style.
**Not applied to the repo.** `CONTEXT.md` is shared by four parallel runs; this file is the proposal only. Additions only — no existing term is retired; **Feedback** is the single redefinition, proposed explicitly rather than silently.

The work these terms cover: the v1.1 Feel layer ("more fun, more attractive, less like a teaching class", `docs/fun-grill/run-4/FINAL-DESIGN.md`). The cluster is **Voice & Story**, because the terms describe *how the game speaks and remembers*, distinct from the money/loop vocabulary and from the shipped **Gamification** cluster.

## Proposed new entries

**Reaction**:
The short in-fiction line shown the moment a **Choice** lands — a person's line, a message, a fact, your own thought. It is never a verdict on the Choice and never a lesson.
_Avoid_: feedback (when the in-fiction line is meant), outcome, response, verdict

**Why**:
The explanation behind a Choice outcome, opened on demand; the only home of a **Rule of Thumb**. It opens by itself at a **Concept**'s first card and stays collapsed at every later card.
_Avoid_: lesson, tip, explainer, tooltip, teaching text

**Taught once, trusted after**:
The rule that a Concept's explanation is shown open at its **Teachable Moment** and collapsed at every later card. The guarantee that the learning lands moves to the first encounter; afterwards the game trusts the player.
_Avoid_: tutorial, onboarding, drip-feed

**Cast**:
The small authored set of recurring people in the character's life. Authored content, never data about the player; the same people recur across cards and Runs, and a finished Run's Cast is derived from its log.
_Avoid_: characters (in code), NPCs, personas, avatars

**Rule of Thumb**:
One of the eight short money rules — one per **Concept** — delivered by a **Why** at its Teachable Moment. A rule may be quoted nowhere else and never appears in a **Reaction**.
_Avoid_: lesson, takeaway, maxim, moral

**Choice Tally**:
A retrospective count of repeated **Choices** drawn from a Run's log, narrated as prose in the Money Story and the Journal. It records what the player did, never what it meant, and is never compared across Runs.
_Avoid_: habit tracker, streak, stats, score, personal best

**Chapter Title**:
The one-line name a finished Run earns from its own story — its flags, Milestones and band. Descriptive and story-led, never a band label and never ranked.
_Avoid_: grade, achievement title, rank, rating

**The Other Path**:
The authored portrait of the **Stage-5 Fork**'s unchosen branch, shown in the Money Story's "What next". It describes; it never simulates or claims a counterfactual.
_Avoid_: counterfactual, what-if, simulation

**Repayment**:
A recurring monthly payment a **Choice** can commit the character to — a BNPL instalment or a card minimum carried. The HUD shows it as one chip; the name "BNPL" is a card's term, not the mechanic's.
_Avoid_: loan, instalment plan (as the general term), debt schedule

## Proposed redefinition

**Feedback**:
The pair of **Reaction** and **Why** shown after a Choice — the moment in the story's voice, and the explanation behind a disclosure. It replaces the reading of Feedback as a single teaching paragraph shown every time.
_Avoid_: (unchanged) lecture, quiz answer, grade

The existing **Teachable Moment** is unchanged in meaning, and gains one mechanical consequence: it is where the Why opens unaided.

## Display vocabulary map (internal term → player-facing copy)

The glossary is internal; the catalogues may speak the game's language. One canonical display phrase per term, so the two vocabularies cannot drift:

| Internal term | Player-facing copy |
|---|---|
| **Concept Coverage** | "Money you've met" |
| **Introduced** | "Seen" |
| **Experienced** | "Lived" |
| locked | "Later" |
| the Stage-up unlocks line | "New this year: {concepts}" |
| the **Why** disclosure | "Why it happened" |
| **Milestone**, **Journal**, **Chapter**, **Year in Review**, **Money Story**, **Turning Point** | unchanged — they already read as life, not as class |

## Notation changes

- `RunState` gains **no** field. The Fund, the Repayment and every new story surface are computed from state that already exists.
- `MonthSnapshot` gains **no** field in v1.1. (The v2 economy sketch in ADR-0003 proposes an additive `deposited` row for the savings-rate measure.)
- The **Choice Effect** vocabulary gains two verbs: `invest` (money moved into the **Fund**, blocked when unaffordable — it cannot cascade) and `sets.sellFund` (the Fund returned to Savings). A "cost" from the **Save** envelope remains money *spent*; a Choice may never withdraw while promising to set aside.
- The existing recurring-payment state generalises: the per-choice amount joins the per-choice count, so a minimum payment can be a six-month **Repayment** rather than a score nudge.
- **Reaction** and **Why** are catalogue keys, language-neutral per Choice id; the key migration carries no player data.

## Not in this language

These must not appear in the glossary, the code, the catalogue or the UI:

> XP · points · coins · lives · energy · stars · gems · levels (Stages are the only ladder) · badge / achievement / trophy · leaderboard · ranking · streak (as a mechanic) · timer · FOMO · daily bonus · loot · reward currency · quiz · correct / incorrect · grade · "well done" · score (as a noun for behaviour)

The money (`net worth`, `◈`) is the only score; the player's own past is the only benchmark; the story is the only reward.
