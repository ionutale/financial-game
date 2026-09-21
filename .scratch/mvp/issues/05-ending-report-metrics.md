# 05 — Run ending, Money Story & success metrics

Type: grilling
Status: resolved
Blocked by: 01

## Question

Define how a Run ends and how the game proves Better-Choices.

- **Ending**: what concludes the 5-year Run, and what "doing well" means when consequences are
  recoverable and there is no hard game-over.
- **Metrics**: exactly what is recorded per Turn — e.g. savings rate, debt taken, budget
  adherence, needs-vs-wants ratio, investment behaviour — and how each is computed.
- **Storage**: the metric shape held against the Anonymous Profile in MongoDB.
- **Money Story**: what the end-of-run report shows, in what order, and how it makes the player's
  improvement legible to themselves.
- **Thresholds**: any milestone, streak or comparison used to express "better".
- **Path-aware**: per [02](02-stage-ladder.md), the Named Goal must reflect the Stage-5 Fork — the
  4,000 goal is comfortably reachable on the Work path and is not the story on the Study path,
  where the student loan is. Decide what "doing well" means on each path.

Depends on 01 (the economy supplies the variables).

Output: metrics model, storage shape, and the report's content.

## Answer

Resolved over two grilling rounds. The governing principle: **the teaching metrics are never
visible during the Run.** Balances are live; adherence and savings rate are not. A player who can
see a score optimises the score instead of living the life — the exact failure mode the prior-art
research flagged. The numbers are the ending's payoff, not a dashboard.

### The ending

**Fixed: month 60, age 19, always.** No early exit, no goal-gated finish — a shared finish line is
what makes runs comparable.

### Outcome bands

Three descriptive bands, computed from **money, the path's goal, and the final Credit Score** —
never from behaviour. Behaviour is what the you-vs-you comparison is for; the band is the result.
Each path defines a **goal** and a **floor**:

| Path | Goal | Floor |
|------|------|-------|
| **Work** | net worth ≥ 4,000 | net worth ≥ 1,000 |
| **Study** | buffer ≥ 1,000 with the loan at ≤ 3,000 | loan ≤ 3,000 — you did not borrow more |

- **Ahead** — goal met, card debt zero, score ≥ 670.
- **Treading water** — floor met but goal missed, or goal met with a blemish (card debt > 0 or
  score < 670).
- **Behind** — floor missed.

Bands are private. No leaderboards, no comparison to other players.

### The compact seven

Recorded per Turn; computed as described.

| # | Metric | How |
|---|--------|-----|
| 1 | **Budget adherence** | months where Need and Want stayed inside envelope, counted per year |
| 2 | **Savings rate** | income routed to Save ÷ total income |
| 3 | **Debt taken** | total incurred, plus peak balance |
| 4 | **Want spend** | Wants as a share of income |
| 5 | **Goal progress** | the path's goal at month 60 |
| 6 | **Net worth** | final value plus the 60-point trajectory |
| 7 | **Credit score** | final value |

Metrics **1, 2 and 4 are the behavioural measures** — the only ones the year-1-vs-year-5
comparison uses, because they are the only ones a player can actually get better at.

### Storage shape

One document per Run, against the Anonymous Profile:

```jsonc
{
  "seed": 481923, "engineVersion": 1, "path": "work", "turnIndex": 60,
  "state":   { "cash": 0, "savings": 0, "fund": 0, "debt": 0, "score": 0, "goal": 0 },
  "history": [ { "turn": 1, "netWorth": 60, "debt": 0, "score": null, "adherence": 1 } ],
  "aggregates": {
    "adherenceByYear": [3, 6, 8, 9, 10], "savingsRate": 0.18, "wantShare": 0.22,
    "debtTaken": 1400, "peakDebt": 900, "finalNetWorth": 4120, "finalScore": 690
  },
  "flags": [ { "turn": 34, "kind": "minimum_payment_streak", "months": 4 } ]
}
```

`history` is 60 compact snapshots; `flags` records the turning points — first debt, minimum-payment
streaks, a skipped Obligation, the scam loss, the crash, the goal being reached. **The flags are
the Money Story's raw material**; the metrics are its evidence.

### The Money Story

Story first, numbers second. Five parts, in order:

1. **The five years in one paragraph** — where the character started, where they ended.
2. **The turning points** — three to six moments drawn from `flags`, in order, **named honestly and
   without judgement**: *"In month 34 you took the card and paid only the minimum for four months."*
   The mistake is the lesson; hiding it wastes the Run.
3. **You vs you** — the three behavioural measures, year 1 against year 5. The player is their own
   benchmark, which needs no accounts and no aggregate data.
4. **The numbers** — the seven metrics, the net-worth sparkline, the outcome band.
5. **What next** — Play again with a fresh seed, or try the other path.

### After the story

The finished Run is **archived on the Anonymous Profile** and the player starts a new one — same
path or the other — with a fresh seed. Replay is how the two paths get compared.

### Year-in-review

The stage-up card carries **one metric line plus the money summary** — *"You stayed inside budget 8
of 12 months; net worth ◈1,240."* Progress is felt annually without a scoreboard.

### Consequences for other tickets

- **[10](10-money-story-prototype.md)** — the prototype must test story-first against chart-first
  using this flag-and-turning-point structure, and check that the you-vs-you comparison reads as
  progress rather than as a report card.
- **[06](06-architecture.md)** — the storage shape is one Run document; the archive keeps finished
  Runs alongside the active one.
- **[12](12-privacy.md)** — how long archived Runs are retained is a privacy decision.
- **[11](11-spec-assembly.md)** — this ticket supplies the report's structure and the Run's
  acceptance criteria.
