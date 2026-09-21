# 02 — Life-stage ladder & concept-unlock map

Type: grilling
Status: resolved
Blocked by: —

## Question

Define the life-stage ladder and how it delivers all eight Concepts shallowly across a 5-year Run.

- How many **Stages**, what ages/years each covers, and the starting situation of each.
- Which **Concept(s)** unlock at each Stage, and in what order.
- For each Concept: the **one mechanic** and **one teachable moment** that introduces it — no
  Concept may demand content depth beyond a handful of Event Cards.
- How a Stage transition is signalled to the player, and whether any Stage changes the rules.

Constraint: all eight Concepts covered wide-and-shallow. Modern, realistic teen life. This is the
map that Event Card authoring (03) and the turn loop (04) both depend on.

Output: the stage table plus the concept-unlock schedule.

## Answer

Resolved over three grilling rounds. **The Run is 14 → 19** — one year longer than charted, so that
the independent year is actually played rather than implied (see *The 14→19 correction* below).
Income tiers from [01](01-economy-model.md) are age-agnostic, so this cost the economy nothing.

### The ladder

Five Stages, one per game-year, 12 Event Cards each. A Stage-up card is an **interstitial** — it
does not consume one of the 12.

| Stage | Age | Name | Income | Obligations | Concepts unlocked |
|-------|-----|------|--------|-------------|-------------------|
| 1 | 14 | **Pocket Money** | T0 allowance 40 + T1 odd jobs | 0 | Needs vs wants · Earning & work |
| 2 | 15 | **First Budget** | T0 + T1 | phone 15/mo | Budgeting & tracking · Saving & goals |
| 3 | 16 | **First Wage** | T2 part-time ≈ 350/mo | ≈ 120/mo | Interest & compounding |
| 4 | 17 | **First Credit** | T2 + BNPL | ≈ 180/mo | Credit & debt *(via BNPL)* |
| 5 | 18 | **The Fork** | study **or** work (below) | study ≈ 750 / work ≈ 1,150 | Investing & risk · Taxes, insurance & scams |

### The concept-unlock schedule, with one teachable moment each

| # | Concept | Unlocks | The one mechanic | The one teachable moment |
|---|---------|---------|------------------|--------------------------|
| 1 | Needs vs wants | S1 | Spend tagged Need/Want; a forced constraint when the Want envelope is thin | The first month the Want envelope runs dry and two wants compete |
| 2 | Earning & work | S1 | Hours slider: pay = hours × rate, hours cost Free Time 1:1 | The first payslip where effort maps visibly to money |
| 3 | Budgeting & tracking | S2 | Envelopes: Need / Want / Save allocated at month start | The first month the plan and the actual spend diverge |
| 4 | Saving & goals | S2 | Named Goal with a progress bar, fed by the Save envelope | The first goal tick — and the first time the bar fills |
| 5 | Interest & compounding | S3 | Savings credited monthly; growth shown as a visible curve | The first interest line on the savings balance |
| 6 | Credit & debt | S4 | BNPL instalments, then the card and Credit Score at 18 | The first BNPL due date — *and that it built no score* |
| 7 | Investing & risk | S5 | The Fund; scripted crash with recovery | The crash, and the months after it |
| 8 | Taxes, insurance & scams | S5 | Payroll withholding; insure-or-gamble Risk Moments; authored scam cards with real tells | The first payslip deduction reveal |

Concepts arrive in the spine **earn → budget → save → borrow → invest → tax**. Nothing is ever
removed — Stages only add (add-only rule). Allowance simply stops being offered once wages exist.

### Free Time

A plain resource on the HUD — not a wellbeing stat. Base **100 h/month at 14**, shrinking as
obligations arrive (~90 / 80 / 70 / 60 across S2–S5); the Stage's school or job is the baseline, so
**extra** work hours and card costs come out of it. Study and social cards cost **10–30 h**. The
hours slider spends Free Time 1:1 — more money, less life.

### New economy: BNPL (Stage 4)

Not defined in [01](01-economy-model.md) — recorded here, with a pointer left from 01.

- Four monthly instalments on a purchase; **0% if every instalment is on time**.
- A missed instalment costs **15** and makes the remainder fall due immediately.
- **It does not build a Credit Score** — and the game says so out loud. That is the lesson.
- The Credit Score therefore does not exist until the card is issued at 18.

### New economy: the age-18 Fork (Stage 5)

At the start of Stage 5 the player chooses, once:

- **Study** — part-time income ≈ **900/mo**; costs ≈ **750/mo** (fees 300, books/transport 200,
  food 235, phone 15); **no rent**; and a **3,000 student loan** credited at the start and carried
  as Debt (0% while studying). Net worth starts the Stage flat, not rich — the lesson being that
  deferred debt is still debt.
- **Work** — full-time income 1,600 net; obligations ≈ 1,150/mo — ticket 01's Lean year.

Roughly 6 cards are shared and ~6 are branch-specific per path: about **+6 cards** over the 60
budget.

### Stage transitions

A **Stage-up card** announces the new age, the new income tier, the unlocked Concept and its
teachable moment. Everything after that is **just-in-time Feedback** inside ordinary cards — no
tutorials, no interruptions.

### The 14→19 correction

Charting settled on starting at 13 with an allowance, which would have ended the Run at 18 — the
exact moment real independence begins — leaving the most consequential year of a financial life
implied rather than played. Starting at 14 (ages 14–18, ending at 19) gives independence a full
playable year. Ticket 01 defines income as **tiers, not ages**, so nothing in the economy changed.

### Consequences for other tickets

- **[01](01-economy-model.md)** — amended: BNPL and the Fork economics are defined above, not
  there. The credit card's Credit Score now has only 12 months of play.
- **[03](03-event-card-schema.md)** — the effect vocabulary must cover BNPL state, Free Time, and
  branch-conditional effects; cards need a `stage` and a branch tag.
- **[05](05-ending-report-metrics.md)** — the Named Goal must be **path-aware**: 4,000 is
  comfortably reachable on the Work path and not on Study, where the story is the loan.
- **[09](09-turn-loop-prototype.md)** — the prototype must exercise a month's Free Time spend
  alongside the envelope allocation; two allocations per Turn, not one.
