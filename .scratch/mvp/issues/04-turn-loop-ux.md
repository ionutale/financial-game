# 04 — Month-turn loop & decision UX

Type: grilling
Status: resolved
Blocked by: 03

## Question

Define what a Turn actually is on screen, from the moment a month starts to the moment it resolves.

- What the player sees when a Turn opens: balance, obligations, goals, upcoming costs.
- How the Event Card and its Choices are presented on a phone.
- What happens after a Choice: Effect applied, Feedback shown, month-close summary.
- How a month resolves and advances, and how the player sees their trajectory so far.
- What the player can do **outside** an Event Card (any planning/allocation screen, or none).
- Where progress is saved within a Turn, and how a resumed Run looks.

Depends on 03 (card shape). Per [03](03-event-card-schema.md): 2–3 Choices carrying mechanically
derived **cost chips**, Feedback ≤ 40 words, and a live **Thread** that has to be visible somewhere
in the UI. Mobile-first, touch, teen-appropriate, flat-vector playful.

Output: the loop and the screens the spec must describe.

## Answer

Resolved over two grilling rounds. **A Turn is one scrolling month screen with three phases:
Plan → Event → Resolve.** The order is the design: you commit to a plan, then life interrupts it,
and the envelopes genuinely constrain what you can do about it.

### Phase 1 — Plan

The player allocates before knowing what the month holds.

- **Money**: three sliders — Need / Want / Save — with the unallocated remainder live. A
  **50/30/20 preset** and **"same as last month"** exist so a month can be planned in seconds. The
  sliders must sum to expected income; deliberate leftover falls to Save.
- **Time**: one **work-hours slider** — hours × rate = expected income, costing Free Time 1:1. At
  Stage 1 this is odd jobs; by Stage 5 it is a full working week.
- Persistent on screen throughout: HUD (**Cash**, **Net worth**, **Free time**), the **Named Goal
  progress bar**, and the **open Thread chip** (`Course starts in 3 months`).

### Phase 2 — Event

The month's card arrives — situation ≤ 60 words, 2–3 Choices, each with mechanically derived cost
chips (`◈12 · 2h`).

- **Money cascades, time is hard.** A Choice the player can't afford in money is still tappable and
  pulls from Savings, then Debt. A Choice costing more Free Time than exists is **unavailable** —
  time is the one thing that cannot be borrowed.
- On tap the Effect applies and the **Feedback appears immediately under the Choice** (≤ 40 words),
  while the decision is still fresh.

### Phase 3 — Resolve

The **month-close sheet** is where cause and effect becomes legible:

- income received · obligations paid automatically · interest credited · goal progress ·
  net-worth change · **next month's known obligations**.
- **Progress commits here** — one idempotent, turn-keyed write, matching
  [06](06-architecture.md). Mid-month state is client-side; closing the tab returns the player to
  the start of the current month.

### Rules the loop enforces

- **A shock or a Risk Moment IS the month's card** — never two events in one month. This is also
  what keeps the 12-draws-per-year count honest.
- **Obligations auto-pay at close.** Skipping one is possible **only when a card offers it** — the
  drama stays card-driven and the schema stays shallow.
- **One Thread live at a time**, always visible as a chip.
- **Stage-up cards are interstitials**, not draws. They fold in the year just ended: new age, new
  income tier, the unlocked Concept, its Teachable Moment, and a year summary.

### Screens the spec must describe

1. **Intro** — three screens: who you are, what the goal is, how a month works. No tutorial; the
   first card teaches.
2. **Month screen** — Plan → Event → Resolve, one vertical scroll, primary actions in the lower
   third for one-handed play.
3. **Stats sheet** — Savings, Fund, Debt, Credit score, the **net-worth sparkline**, the obligation
   list and thread history, opened on demand.
4. **Stage-up card** — the interstitial above.
5. **The Fork** — Stage 5's stage-up, carrying the study/work `branch` choice.
6. **Money Story** — owned by [05](05-ending-report-metrics.md).

### Consequences for other tickets

- **[09](09-turn-loop-prototype.md)** — the prototype must exercise two allocations in one Plan
  step, the money-cascades/time-is-hard rule, immediate Feedback and the close sheet; and it must
  measure **taps and seconds per month**, since 60 of these is the whole game.
- **[05](05-ending-report-metrics.md)** — the close sheet's figures and the stage-up year summary
  are the Money Story's raw material.
- **[06](06-architecture.md)** — commit-at-close means exactly one write per Turn, as designed.
