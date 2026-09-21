# 08 — Prior art: teen financial-literacy games

Type: research
Status: resolved
Blocked by: —

## Question

Survey existing teen financial-literacy games and money-education products so the MVP borrows what
works and avoids what does not.

- Which products exist (classroom sims, mobile apps, web games, bank/charity offerings), what they
  teach, and how they play.
- Which of the eight Concepts have **proven interactive treatments** worth borrowing, and which
  consistently collapse into quizzes.
- What makes money feel consequential and fun rather than moralising, for a 13–18 audience.
- Known failure modes: gamification that trivialises, lectures disguised as choices, reward loops
  that teach the wrong lesson.
- Any evidence on what actually changes teen financial behaviour.

Output: a short findings document feeding tickets 01, 02, 04 and 05.

## Answer

Findings: [`../research/08-prior-art.md`](../research/08-prior-art.md). Research date: 2026-09-20.

**Resolution.** The closest prior art is **ESSI Money** (web life-sim: budget, earn, borrow, invest,
insure, net worth; 2–6 h, classroom-framed, starts as an employed 18-year-old) and **Banqer High**
(live classroom economy with a ladder of rent/jobs/cards/insurance/stock exchange). **NGPF Arcade** is
the best single catalogue of one-concept mechanics. Bank/charity offerings (Visa *Financial Football*,
EverFi, Greenlight Level Up, Zogo, Experian) are **quizzes or content in a game skin** — the failure mode
to avoid.

**Which concepts have proven interactive treatments:** budgeting (allocation under constraint), saving
(named goal + progress), interest/compounding (visible curve), earning/work (hours↔money, payslip),
credit/debt (take it, then live with the minimum), investing/risk (passive volatile holding + crash).
**Which collapse into quizzes:** taxes, scams and needs-vs-wants almost everywhere — so teach them as
consequences inside other mechanics (payslip reveal; scam decision with tells; forced constrained choice)
rather than standalone lessons.

**What makes money consequential and fun:** legible cause-and-effect, real agency, recoverable failure,
a character you care about, scarcity, and letting the player *play the villain* (NGPF *Shady Sam*).
**Failure modes:** XP/coins/lives detached from competence; leaderboards rewarding luck and wealth;
lectures disguised as choices; reward loops that teach speculation or hoarding; poverty sims producing
pity; confidence without competence; and knowledge gains without behaviour change.

**Evidence:** financial education moves knowledge ≈+0.2 SD and behaviour ≈+0.1 SD (76 RCTs, 160k people;
youth 14–25 behaviour +0.12 SD); game-based delivery specifically is effective for knowledge (+0.313 SD
in a four-country RCT of 2,220 students). Rules of thumb, just-in-time delivery and experiential
simulation work better than curricula. This supports the MVP's plan to prove **better in-run choices**,
not real-world behaviour change.

**Recommendations handed to the design tickets:** 01 — budget as a constraint, monthly visible interest,
debt you live with, passive volatile investing, payslip tax reveal, insurance premium + seeded event;
02 — Banqer-style ladder starting at 13, one concept/mechanic per stage, social pressure as a theme;
03 — add recurring-consequence, counterfactual and scam-tells fields; 04 — two beats per month (allocate,
then decide), animate the money, no timers/coins/leaderboards, phone-native; 05 — "Money Story" timeline,
compare the player to their own past, show counterfactuals, no single score.
