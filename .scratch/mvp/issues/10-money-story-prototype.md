# 10 — Prototype: the Money Story report

Type: prototype
Status: resolved
Blocked by: 05

## Question

Build a **throwaway prototype** of the end-of-run Money Story and its metrics, to check that
"better choices" is legible to the player rather than merely recorded.

- Render a fake Run's metrics — savings rate, debt, budget adherence, etc. — as an end-of-run
  report a teen would actually read, using the five-part structure from [05](05-ending-report-metrics.md):
  the five-years paragraph, **turning points drawn from `flags`**, **you-vs-you** on the three
  behavioural measures, the seven numbers plus the sparkline and outcome band, then what-next.
- The fake Run must include **flags** (minimum-payment streak, a skipped Obligation, the scam loss,
  the crash) — the turning points are the part being tested.
- Test at least two framings (e.g. chart-led vs story-led) and note which lands. Ticket 05 chose
  story-first; this prototype is where that gets challenged.
- Success is a felt answer to: could a player point at one line and say "I got better at that"?

Link the prototype as an asset. Findings feed the spec's metrics and report sections.

Output: a link to the prototype plus what it taught us.

## Prototype (in progress — awaiting a human look)

**File:** [`prototypes/money-story.html`](../../../prototypes/money-story.html) — one self-contained
HTML file, no build step. Open it directly, or at `http://localhost:8791/money-story.html`.

Three **structurally different** framings of the *same* fake run, switchable with the floating bar
at the bottom (or ← / →). The fake run is a Work-path finish: **Ahead**, ◈4,314 at 19, with six
flags — first card debt at month 12, the scam at 28, the minimum-payment streak at 34, the skipped
obligation at 41, the crash at 47, the goal passed at 52.

| | Framing | What leads |
|---|---|---|
| **A** | Story-led | prose, then the six moments as a timeline, then the numbers — ticket 05's choice |
| **B** | Chart-led | a large annotated net-worth chart, then a six-cell stat grid, story reduced to captions |
| **C** | You vs you | the three behavioural measures as year-1 vs year-5 bars — "you got better at this" — with money as context |

**Verified in a real browser:** all three variants render, the switcher and keyboard arrows cycle
correctly, the hash is shareable and reload-stable, the 60-point trajectory plots, and the final
net worth (◈4,314) is consistent with the Ahead band. No console errors.

## Verdict — closed without human validation

**Technical verification passed** (see above): all three framings render, the switcher and keyboard
arrows cycle, the hash is shareable and reload-stable, and the fake run is internally consistent
(◈4,314 at 19 against the Ahead band).

**Human validation was not performed.** Which framing makes a player point at a line and say "I got
better at that" is a judgement only a person can make, and that step was declined in favour of
moving to the spec. The prototype stays available for later review.

**Risk carried into the spec, explicitly:** ticket 05 chose story-first, and that choice is
**untested against the alternatives**. The spec adopts story-first as the default *and* notes that
the comparison framing (C) is the fallback if story-first does not land in build-time testing.
