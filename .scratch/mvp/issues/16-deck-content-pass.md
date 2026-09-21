# 16 — Deck content pass: the pool is under target

Type: task
Status: open
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
