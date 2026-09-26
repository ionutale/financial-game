# 16 — Deck content pass: the pool is under target

Type: task
Status: resolved
Blocked by: —

## Question

[03 — Event Card schema](03-event-card-schema.md) targets **~15 cards per Stage** (81 total) so that
a Stage's 12 draws never run out. The build currently ships **28 cards**, which is roughly 6 per
Stage — so each year exhausts its pool around month 9 and the no-repeat rule falls back to repeats.

Also still unimplemented from ticket 03's schema:

- **`requires`** — conditions like `credit_card_open` that gate a card.
- **`thread`** — the light arc where a card plants a consequence resolved turns later, one live
  thread at a time, visible as a chip on the month screen.

And one rule now enforced by a test that all future cards must satisfy:

> **Every Choice must differ from its siblings in money or hours.** Under the reveal model costs are
> visible and outcomes are not, so two Choices that chip identically are a coin flip. Thirteen cards
> were rewritten to satisfy this when the rule was encoded; the check lives in
> `presentation.test.ts`.

## Output

- Author the additional cards to reach ~15 per Stage, holding to the visible-difference rule.
- Implement `requires` and `thread`, including the thread chip on the month screen.
- Re-check the concept quota test still passes as the pool grows.

## Answer

Resolved in one content pass, with `requires` and `thread` implemented test-first before the
authoring. **The deck is now 69 distinct cards**, filling pools of **15 / 15 / 16 / 15** across
Stages 1–4 and 25 drawable in Stage 5 (13 shared · 6 study · 6 work) behind five spine beats. No
Stage can exhaust its pool inside twelve draws, so the repeat fallback is unreachable in a normal
Run.

### `requires`

The predicate vocabulary agreed in the grilling: `credit_card_open`, `bnpl_active`, `has_debt`,
`insured`, `thread:<id>`. Unknown conditions are never satisfied, so a typo fails closed. Cards
currently use `credit_card_open` (the limit letter) and `bnpl_active` (the instalment week); the
rest are implemented and unit-tested, waiting for the cards that will need them.

### `thread`

- **State**: one live Thread per Run (`{ id, since }`), persisted with the Run.
- **Plant**: a Choice's `sets.thread`. Plant cards do not deal while another Thread is live, and a
  plant that could not fall due before month 60 never deals at all.
- **Resolve**: the card carrying `resolves: <id>` and `requires: ['thread:<id>']`, so it cannot
  appear before its Thread. It is heavily weighted while live and **forced the month the Thread
  falls due** — a Thread cannot dangle.
- **Chip**: `The course — certificate in 3 months`, counting down to `this month`, persistent on
  the month screen (ticket 04). The BNPL chip's label changed from "Open thread —" to "BNPL —",
  because BNPL is an instalment plan, not a Thread in the ticket 03 sense.

Three Threads ship: **course_enrolled** (Stage 3, 3 months), **friend_loan** (Stages 3–4,
3 months), **risky_tip** (Stage 5, 2 months). Each has a plant, a resolve card, and coverage
tested for every month a plant can deal.

### Content highlights

- Stage 1: lunches, dog-walking, selling games, the lost bus pass, windfalls, a trip deposit.
- Stage 2: the first bill overshoot, a zero-spend week, birthdays, the first milestone, an
  honest plan downgrade.
- Stage 3: overtime, and inflation arriving as a sandwich.
- Stage 4: a bounced payment, the instalment week (gated on `bnpl_active`), reading the score.
- Stage 5: a limit letter, cash-in-hand tax, a refund scam, the boring fund; textbooks, exam
  crunch, a placement, a railcard, café study groups; commute, late shifts, the raise ask, a
  departing flatmate, work boots.
- Spine additions: `first_statement` (month 51) and `scam_opportunity` (month 53) now guarantee
  ticket 03's "first card statement" and "the scam" teachable moments; both carry weight 0.

### Tests

- `threads.test.ts` — planting, chip countdown, the one-live rule, no-plant-past-the-Run-end,
  forced resolve and clearing, every `requires` predicate, and deck integrity (known ids only;
  every Thread has a plant and a resolve covering every due Stage).
- `deck.test.ts` — the concept quota now runs across **all five Stages × four seeds**; a new
  structural test proves every Stage has enough ungated cards to fill its random draws.
- `presentation.test.ts` — the visible-difference rule holds across all 69 cards.
- A whole Run still plays sixty months without stalling, includes the three Thread arcs, and ends
  at the Money Story.
