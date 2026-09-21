# 03 — Event Card schema & authoring rules

Type: grilling
Status: resolved
Blocked by: 01, 02

## Question

Define the data-driven Event Card schema and the rules a single author follows to write ~60 cards.

- **Fields**: id, Stage, Concept, situation text, Choices, Choice Effects, per-Choice Feedback,
  art/emoji reference, weight/rarity.
  **No locale strings in the card** — per [07 — i18n](07-i18n.md), prose lives in
  `messages/{locale}.json` under deterministic keys derived from immutable card/choice ids
  (`card_042_situation`, `card_042_choice_save_feedback`).
- **Seeded selection**: how the deck is drawn per Turn so runs differ but are reproducible.
- **Effect vocabulary**: the exact set of mechanical effects a Choice may apply — must cover Cash,
  Savings, Fund, Debt, Credit Score, Obligation deltas, time-limited modifiers (from 01), **and**
  BNPL state, **Free Time**, and branch-conditional effects (from 02).
- **Tags**: every card carries a `stage` and, where relevant, a **branch tag** (shared / study /
  work) — Stage 5 splits roughly 6 shared + 6 per branch.
- **Feedback rules**: how a Feedback connects an outcome to the Concept it teaches, without being
  a lecture.
- **Authoring rules**: tone, reading level, length limits, how many Choices per card, how to avoid
  moralising, how a card is reviewed.
- **Volume plan**: how the ~66 cards distribute across Stages, Concepts and the Stage-5 branches —
  12 per year, plus ~6 over budget for the Fork.

Depends on 01 (effects vocabulary) and 02 (Stage/Concept tags).

Output: the schema plus the authoring guide.

## Answer

Resolved over two grilling rounds. Cards are **language-neutral JSON, one card per file**, at
`content/cards/<stage>/<id>.json`, with the fixed beat schedule in `content/spine.json`. Prose
never enters the card — keys only, per [07](07-i18n.md).

### Ids and i18n keys

Ids are **immutable slugs**, not numbers (`first_payslip`, not `card_042`) — a translator reading
`card_first_payslip_choice_take_shift_feedback` knows what they are translating. This refines
07's numeric example; the principle (deterministic keys derived from immutable ids) is unchanged.

```
card_<id>_situation
card_<id>_choice_<choiceId>_label
card_<id>_choice_<choiceId>_feedback
```

### The card

```jsonc
{
  "id": "first_payslip",
  "kind": "decision",            // decision | shock | risk_moment | scam | stage_up
  "stage": 3,                     // 1–5
  "concept": "earning_work",      // one of the eight, or null for life-flavour
  "branch": "shared",             // shared | study | work
  "weight": 3,                    // relative draw weight inside its pool
  "teaches": "effort maps to money",   // authoring metadata, never shown
  "requires": [],                 // e.g. ["credit_card_open", "thread:course_enrolled"]
  "thread": null,                 // { "plants": "course_enrolled" }
  "odds": null,                   // risk_moment only: shown to the player
  "art": "emoji:💼",
  "choices": [
    {
      "id": "take_shift",
      "effects": [
        { "type": "cash", "amount": 80 },
        { "type": "free_time", "amount": -12 }
      ]
    },
    {
      "id": "stay_in",
      "effects": [
        { "type": "free_time", "amount": 8 },
        { "type": "savings", "amount": -10 }
      ]
    }
  ]
}
```

### Effect vocabulary

One-shot amounts plus recurring modifiers. Percentages only for permanent drifts.

| `type` | Payload | Chip? |
|--------|---------|-------|
| `cash` | `amount` ± | **yes** — immediate money movement |
| `free_time` | `amount` ± hours | **yes** — immediate hours cost |
| `savings`, `fund`, `debt` | `amount` ± | no — outcome |
| `credit_score` | `amount` ± | no — outcome |
| `obligation` | `delta` or `delta_pct`, `permanent` or `months` | **yes** when adding |
| `income` | `delta_pct`, `months` | no |
| `bnpl` | `amount`, `instalments: 4` | **yes** — shows the instalment |
| `insurance` | `policy` or `claim` | no |
| `goal` | `amount` ± toward the Named Goal | no |
| `thread` | `plants` or `resolves` | no |
| `branch` | `select: "study" \| "work"` | n/a — `stage_up` only |

Recurring form: `{ "type": "cash", "amount": 15, "per": "month", "months": 6 }`.

**Chips are derived mechanically from this whitelist**, never written by the author — that is what
makes the *costs-visible-outcomes-hidden* rule unbreakable. Score changes, pot internals, future
modifiers and threads are all invisible until Feedback.

### Kinds

One schema, one loader, one validator. Kind-specific payloads are small:

- **`decision`** — the ordinary card. 2–3 Choices, authored per card.
- **`shock`** — no real choice; effects apply and one acknowledgement button advances. Fed by the
  seeded shock system from [01](01-economy-model.md) (capped ◈400, never two in a row).
- **`risk_moment`** — carries `odds`, shown to the player: insure or gamble. The one deliberate
  exception to outcomes-hidden, because odds *are* knowable in life.
- **`scam`** — a decision with authored tells (too-good-to-be-true, urgency, odd payment method).
- **`stage_up`** — interstitial, not one of the 12 draws.

### Seeded selection

Cards are drawn **server-side**; the client receives one card view per Turn and never the deck
(per [06](06-architecture.md)).

1. If `spine.json` maps this Turn to a card, that card is played. The spine guarantees every
   Teachable Moment: stage-ups, first payslip, first BNPL due date, first card statement, the scam,
   the crash.
2. Otherwise filter the pool by `stage` + `branch` + `requires` satisfied + not already played this
   Run + thread rules (a `plants` card only draws when no thread is live; a `resolves` card is
   boosted while its thread is live).
3. Draw weighted by `weight`, with a **concept quota**: within a Stage, each of its Concepts must
   appear at least twice, enforced by boosting under-quota concepts.
4. PRNG derived from `(seed, turnIndex)` — reproducible, and per 07 the locale never touches it.

A card plays **at most once per Run**. At most **one thread** is live at a time.

### Volume plan

| | Pool | Drawn |
|---|---|---|
| Stages 1–4 | 15 each = 60 | 12 each |
| Stage 5 | 9 shared + 6 study + 6 work = 21 | 12 (9 shared + 6 branch) |
| **Total** | **81 cards** | **60** |

That is **21 cards of surplus** — enough that every run skips roughly a quarter of the pool, so
runs genuinely differ. It is ~15 more than the ~66 estimated at charting; the surplus *is* the
variety. Each Stage's pool is **10 concept-tagged + 5 life-flavour**.

### Authoring guide

**Length limits** — situation ≤ 60 words · choice label ≤ 8 words · Feedback ≤ 40 words. These are
the translation budget for it/ro as much as a reading-level rule.

**Voice** — the game speaks plainly in the second person, 2–3 sentences. It names the mechanic and
what it cost. No mascot, no coach, no lecture. A Feedback that says "you were foolish" has failed;
one that says "the minimum payment cost you ◈14 in interest and ◈0 off the balance" has worked.

**Choice rules**
- Never offer a straw man. Every choice must be one a real 14–19-year-old might plausibly take.
- **Strictly bad choices are allowed and are punished** — the scam, the minimum payment, the
  skipped rent. The mistake is the lesson. Feedback is honest, never smug.
- Every card states its `teaches` in metadata, so a reviewer can check the card earns its place.

**Card review checklist** (blocking)
1. Length limits met in `en`.
2. `concept` and `teaches` present, or `concept: null` and life-flavour declared.
3. All three locales have every key; interpolation params match (the Vitest integrity test from 07).
4. Chips derivable — no cost hidden in prose, no outcome leaked into a label.
5. `stage`, `branch`, `weight`, `requires`, `thread` valid against the JSON Schema.
6. No straw-man choices; at least one choice is the one a real player would take.
7. A wrong answer exists somewhere in the card (except `shock`).
