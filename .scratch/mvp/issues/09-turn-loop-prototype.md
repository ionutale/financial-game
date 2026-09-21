# 09 — Prototype: the month-turn loop

Type: prototype
Status: resolved
Blocked by: 04

## Question

Build a **throwaway prototype** of the month-turn loop to feel its pacing and decision weight
before the spec commits to it.

- A runnable, rough SvelteKit page (or single HTML file) that plays several Turns using a handful
  of stub Event Cards, structured as the **Plan → Event → Resolve** month screen from
  [04](04-turn-loop-ux.md): two allocations in the Plan step (money envelopes *and* work hours),
  then the card, then the month-close sheet.
- Exercises: opening a Turn, planning, reading the card, choosing, seeing the Effect and Feedback,
  closing the month, advancing — and the **money cascades / time is hard** rule.
- Success is a felt answer to: does a month feel like a decision or a formality? Is the Feedback
  read or skipped? **How many taps and how many seconds does a month take on a phone** — because 60
  of these is the whole game.

Link the prototype as an asset on this ticket. Findings feed the spec's turn-loop section.

Output: a link to the prototype plus what it taught us.

## Prototype (in progress — awaiting a human click-through)

**File:** [`prototypes/month-loop.html`](../../../prototypes/month-loop.html) — one self-contained
HTML file, no build step. Open it directly, or at `http://localhost:8791/month-loop.html` while the
throwaway server is running.

The state module inside is the liftable part: a pure `(state, action) => state` reducer over
ticket 04's loop, with envelopes holding **real money** so the cascade is real rather than cosmetic.

**Verified in a real browser (Chrome via DevTools MCP):**

- A full month plays end to end: plan → card → choice → Feedback → close → next month.
- **The cascade works:** with Want at 0 and a ◈25 Want purchase, ◈20 came out of the Save envelope
  and ◈5 went onto Debt.
- **Time is hard:** with all 80 hours worked, the 12-hour shift choice renders disabled.
- **BNPL recurs:** taking four instalments sets a ◈30 × 4 obligation that is paid and decremented
  at each close.
- **The Fork lands:** choosing Study adds the ◈3,000 loan to Debt and switches obligations to 750.
- Pacing counter is correct across consecutive months (4 taps/month in an automated click-through,
  which does not include slider drags). No console errors.

**Finding already surfaced:** the close sheet shows "Income in ◈350" alongside "Net worth change
−◈210", because income lands at the *Plan* step. The sheet reads as a contradiction. Either income
should land at the close (making the sheet a true month P&L), or the close sheet should not present
income as if it arrived then.

## Verdict — closed without human validation

**Technical verification passed** (see above): the loop plays end to end, the cascade, the time-hard
rule, BNPL recurrence and the Fork all behave as designed, the pacing counter is correct, and there
are no console errors.

**Human validation was not performed.** The ticket is HITL — it exists so a person can feel whether
a month is a decision or a formality — and that step was declined in favour of moving to the spec.
The prototype stays available for later review.

**Risk carried into the spec, explicitly:** a month *may* prove to be a formality once played by a
human, and the real tap/second cost is unmeasured. The spec records this as an assumption with a
build-time checkpoint rather than a validated fact.

**One finding already banked:** the close sheet showed "Income in" beside a negative net-worth
change, because income lands at the Plan step. The spec fixes the framing as a rule.
