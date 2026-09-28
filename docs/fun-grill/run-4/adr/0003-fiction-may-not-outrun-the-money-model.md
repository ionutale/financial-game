# Fiction may not outrun the money model

**Status:** proposed (2026-09-27), from the `fun-grill` run-4. Governs the money-model work in v1.1 and names the v2 debt.

The deck's copy and the loop's mechanics have drifted apart, always in the direction of the copy promising more than the numbers do — and the player feels the contradiction before they read the lesson, which is the deepest possible source of "this is a worksheet". Verified in code:

- `RunState.fund` is never incremented, so `the_fund`'s *"Put some in"* (`cost: 400, category: 'save'`) **destroys ◈400**; `the_crash`'s *"buy"* and `boring_fund`'s *"fund"* do the same. The crash cannot crash anything the player owns.
- Ticket 01 promised *"One credit card. APR 19.9%/yr (1.66%/mo). Minimum payment 5%"*; the loop has no card balance and charges no debt interest, yet the copy says *"almost all of it was interest."*
- Choices whose copy says *"put it aside"* (`interest_first.more`, `quarterly_interest.leave`, `savings_milestone.add`, `savings_goal.bike`, `hype_trainers.save`, `trip_deposit.deposit`) are `cost` draws on the Save envelope: in this model that money is **spent**, not saved.

We decided the rule and the boundary. **The rule: no string may assert a mechanic the loop does not run.** **v1.1 repairs the three untruths that are cheap and bounded:** the **Fund is wired** (`invest` moves money into it, blocked when unaffordable; 7%/yr growth; the Spine opens it at month 52 so every Run invests before the crash; the crash lands at 55 with a scripted recovery to 60; the crash's buy/hold/sell finally mean something); the **minimum payment becomes a real six-month Repayment** using the existing recurring-payment state, so *"the balance stays alive"* is lived rather than scored; and the **deck audit** removes every withdraw-while-promising-to-set-aside Choice, routing the commitment to a Thread when the fiction has a deadline and to the Plan's Save envelope when it does not. **The card balance with real APR is deliberately deferred to v2** as a named "Living Money" ticket.

## Considered options

- **Leave the copy and the model as they are.** Rejected: it is the exact failure mode the project's own research names ("lectures disguised as choices"), and it makes the game teach the opposite of what its numbers do.
- **Build the full card model now (a `cardDebt` field, 19.9% APR, 5% minimum, and a `deposit` verb with a `deposited` history row).** Rejected for this layer: it is an economy rebuild with a save-shape change, it needs its own re-tuning of the Lean year 5 and the Outcome Band, and it risks the Better-Choices Proof for a lesson that the Thread-and-Repayment repair already makes live. It is worth doing — later, on its own terms.
- **Remove the investing cards until the Fund exists.** Rejected: `investing` can only be Experienced through cards; removing them freezes Concept Coverage at 7/8 and guts Stage 5's spine.
- **Wire the Fund + make the minimum real + audit the deck (chosen).** Bounded, additive, no new `RunState` field, and it turns the game's own principle — legible cause and effect — back on.

## Consequences

- The Fund is a **Stage-5 story beat, not a balance lever**: it opens at month 52 and the Run ends at month 60, so its effect on final net worth is small while the crash–recovery arc does the teaching. The Outcome Band thresholds are re-checked after implementation, not expected to move.
- The crash and its recovery are **scripted and deterministic** (no seeded volatility in v1.1); a seeded wiggle is a v2 tuning option.
- `netWorth` already counts the Fund, and **old saves carry `fund: 0`**, so nothing migrates.
- The minimum-payment Repayment generalises the HUD chip from "BNPL" to "Repayment"; `bnpl_active` conditions now also fire after a minimum month, which is consistent.
- The v2 "Living Money" sketch, for the record: `cardDebt` on `RunState`; 19.9%/yr charged monthly; a 5%-of-balance minimum that actually pays down interest first; a `deposit` Choice verb and a `MonthSnapshot.deposited` row so saving-by-card counts toward the savings-rate measure; a re-tuned Lean year 5; and a fresh Better-Choices Proof run.
- A Why may never assert the card balance or APR until that ticket ships; where the model is thinner than the fiction, the copy says what the model does and the Thread carries the consequence.
