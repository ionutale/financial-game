# Fund tuning — the human-owed runbook

The design (§8, ADR-0006) charters one economy tuning surface: the Fund's market. The shipped
parameters came from ticket 09's prototype; this file says what a human may change, what must not
move, and how a change is accepted.

## The surface (only these)

`src/lib/game/market.ts`:

| constant | shipped | meaning |
| --- | --- | --- |
| `MARKET_MEAN_ANNUAL` | `0.07` | ≈7 %/yr, applied as lognormal-corrected monthly drift `ln(1+m)/12 + σ²/2` |
| `MARKET_VOL_ANNUAL` | `0.16` | ≈16 %/yr, Box–Muller normal, clipped per month |
| `MARKET_CLIP` | `0.15` | per-month clip (binds ~0.13 % of months) |
| `CRASH_MONTH` | `55` | the spine's crash lands once, before the month's Choice |
| `CRASH_FACTOR` | `0.75` | −25 % at the crash |
| `RECOVERY_MONTHS` | `56–58 ×1.1` | scripted recovery (`0.75 × 1.1³ ≈ 0.99825`) |

## What must NOT move

- The Named Goal, the outcome bands, the Behavioural Measures, the Better-Choices Proof.
- The draw/RNG outside the market; the deck; the reducer's semantics.
- The crash/recovery **shape** (bounded, recoverable, Stage-5-only, one crash per Run).

## Procedure

1. Vary **one** constant (start with the mean).
2. `pnpm exec vitest run src/lib/game/market.test.ts src/lib/game/fund.test.ts src/lib/game/balance.test.ts`.
   The bounds test pins mean ∈ [6.5, 7.5] % and vol ∈ [15, 17] % — update it only with a recorded
   ruling and a provenance note, never to go green.
3. If the harness moves: **report the deviation and rule before re-recording** (ticket-09
   precedent: the impulse spread was re-recorded once, consciously, with provenance).
4. Full `A11Y_PORT=4199 pnpm verify`.
5. Record: what changed, why, the measured harness before/after, and the playtest evidence that
   motivated it — a tuning without playtest evidence is a hypothesis, not a tuning.

## Done when

The playtest's Fund observations (did the crash land? did hold/sell/buy feel like real choices?)
are answered, and any parameter moved only within the bounds the harness records.
