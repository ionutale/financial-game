# 01 — Game economy model & difficulty curve

Type: grilling
Status: resolved
Blocked by: —

## Question

Define the game's economy precisely enough that the spec can state it as numbers and rules.

- **Starting position** — what the character begins with at 13: money, obligations, assets.
- **Income** — sources per Stage (allowance, part-time job, full-time wage) and how they grow.
- **Recurring costs** — rent, food, transport, phone, subscriptions; which are unavoidable.
- **Saving** — interest rate on savings; is it visible only at year-end or per turn?
- **Credit & debt** — how loans work, APR, minimum payments, and whether a credit score exists.
- **Investing** — return distributions, volatility, and how risk is conveyed.
- **Tax & insurance** — how much rule complexity is worth it, given "wide & shallow".
- **Difficulty curve** — how pressure rises across 5 years so the last choices bite hardest.

Constraint: simple enough to explain in-game in a sentence per rule, deep enough that the 60
choices differ meaningfully. Real consequences, always recoverable. Seed for reproducibility.

Output: the numbers, formulas and rules the spec will carry.

## Answer

Resolved over three grilling rounds, incorporating tickets
[08 — prior art](../issues/08-prior-art.md) and [06 — architecture](../issues/06-architecture.md).
The whole model below is **one tunable config** (single source of truth) so balancing never touches
the cards.

### Unit and scale

- Neutral glyph **`◈`**, whole numbers only, no decimals. Locale-independent (see
  [07 — i18n](07-i18n.md)); `Intl.NumberFormat` handles grouping/separators only.
- Anchor prices authors must write coherently against: cinema **12**, takeaway **10**, trainers
  **90**, bike **300**, phone **400**, laptop **900**.
- Larger is fine late-run: first flat deposit **650**, emergency fund goal **4,000**.

### Visible state

- **Primary HUD** (always): **Cash** and **Net worth**.
- **Detail view**: **Savings**, **Fund**, **Debt**, **Credit score**.
- **Net worth = Cash + Savings + Fund − Debt** — the single number that rewards good play across
  all concepts, shown at year close and in the Money Story.
- Starts at 13 as: Cash 60 · Savings 0 · Fund 0 · Debt 0 · no credit score yet · Net worth 60.

### Income ladder

Tiers, not ages — the Stage ladder ([02](02-stage-ladder.md)) assigns which tier belongs to which
Stage.

| Tier | Source | Amount | Tax |
|------|--------|--------|-----|
| T0 | Allowance | 40/mo | none |
| T1 | Odd jobs | 15–60 one-off | none |
| T2 | Part-time | 10/h × ~35h ≈ **350/mo** | none (below threshold) |
| T3 | Full-time | 2,000 gross → **1,600 net** | 20% withheld above 500/mo |

Income is *expected* income: the envelope allocation at month start is based on it, so a missed
shift or an odd-job month is felt immediately.

### Obligations and costs

Phone plan **15** · transport **30** · subscriptions **25** · groceries **240** · utilities
**120** · shared-flat rent **650** · insurance (see below).

Capital (one-off): phone 400, bike 300, laptop 900, deposit 650.

Ramp across the run: **Y1 ≈ 0 → Y5 ≈ 1,150/mo** — about **70% of net income**, the Lean setting.

### Tax

- Flat **20% withheld** on wage income above **500/mo**. Allowance and odd jobs are untaxed.
- Taught by the **first-payslip deduction reveal** (prior art: teach tax as a consequence inside
  earning, never as a quiz). Shown as a payslip line; **no filing mechanic**.

### Saving and inflation

- Savings interest **3.0%/yr**, credited monthly (0.25%). Visible from month one.
- Inflation **2.5%/yr**, applied monthly to recurring living costs (rent, groceries, utilities,
  transport, subscriptions). Prices drift up all run.
- Real return on savings ≈ **+0.5%/yr** — savings defend, they don't grow. Investing is how the
  player grows. Compounding must be shown as a **visible curve**, not a number (prior art).

### Budgeting — envelopes + a named goal

- At each month's start, allocate expected income across **Need / Want / Save**.
  Choices draw from their envelope. The step takes seconds (mobile).
- The **Save** envelope feeds one **named goal with a progress bar** — *Emergency fund:
  ◈1,240 / ◈4,000* — research-backed as the treatment that lands.
- Unspent Save auto-transfers to Savings at month close.
- **Cascade on overspend**: Save first, then Debt — each with explicit Feedback naming the broken
  envelope and its cost.
- **Voluntary default is allowed**: the player may deliberately skip an obligation to spend
  elsewhere → late fee **25**, score **−40**, plus a recovery path. Real agency; let the player
  play the villain.
- **Budget-adherence metric** = share of months where Need and Want stayed within envelope.

### Credit

- One credit card. **APR 19.9%/yr** (1.66%/mo). **Minimum payment 5%** of balance, floor 10.
- Limit starts **200**, grows **+100 per 50 score points above 600** (cap 1,000).
- Score on issue **600**, range **300–850**. Bands: <580 poor · 580–669 fair · 670–739 good ·
  740+ very good (affects limit growth and narrative only).
- Score moves: **+8** on-time payment in full · **−5** minimum-only month · **−40** missed
  payment · **−3/mo** while utilisation > 50% of limit.
- Uncoverable missed obligation becomes a **bank overdraft**: fee 15, score −40.
- Debt only exists once the credit Stage unlocks it.

### Investing

- One **market fund** (no stock-picking — deliberately).
- Expected **+7%/yr**, volatility **±16%/yr** (Moderate), drawn from a small seeded monthly
  outcome table weighted to ≈ +0.58%/mo.
- **One crash scripted** in the investing Stage: −25% across two months, guaranteed in every run.
- No fees, no minimum hold; Savings ↔ Fund transfers are instant.
- Risk is conveyed by showing the observed range, not a disclaimer.

### Insurance — insure-or-gamble risk moments

- **3–5 seeded risk moments** per run (phone damage, bike theft, contents damage, medical). At
  each, the player is offered cover with **the odds shown**, and chooses: premium or gamble.
- Premiums **6–12/mo** once taken. Insured shock → payout minus **50** excess. Uninsured → full
  loss. This replaces flat premiums and is the research-blessed treatment.

### Shocks

Seeded, weighted, capped at **◈400** each, **never two in a row**, never making a run unwinnable:

| Shock | Weight |
|-------|--------|
| Phone breaks | 6% |
| Bike stolen | 4% |
| Minor medical | 3% |
| Hours cut (income −30% for one month) | 5% |
| Price rise (one obligation +10% permanently) | 8% |
| Fines / fees | 4% |

### Difficulty curve

- Obligations **0 → ~1,150/mo** while net income reaches **1,600/mo**: the final year consumes ~70%.
- Want-side temptations scale with income, so the last cards offer the biggest, best-framed
  distractions — the curve bites through the Want envelope, not through arithmetic.
- The **4,000 emergency-fund goal** is comfortably reachable only if Save was funded from Y1 and
  the Fund was used once unlocked. Missing both still ends the run recoverably, never fatally.

### Cross-ticket consequences

- **02** must assign the income tiers to Stages and decide when credit/investing unlock.
- **03** must carry the effect vocabulary matching these fields (cash, savings, fund, debt, score,
  obligation deltas, time-limited modifiers).
- **05** owns the ending and the Money Story; the metrics it tracks are listed above.
- **06** resolves card views server-side; the economy config never ships whole to the client.
- **Amended by [02 — Life-stage ladder](02-stage-ladder.md)**: the Run is **14→19**, and **BNPL**
  plus the **age-18 study/work Fork** are defined there — not here. The credit card's Credit Score
  now has only 12 months of play.
