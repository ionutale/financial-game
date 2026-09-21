# 08 — Prior art: teen financial-literacy games and money-education products

Findings for ticket [`08-prior-art`](../issues/08-prior-art.md). Research date: 2026-09-20.
Feeds design tickets **01 economy-model**, **02 stage-ladder**, **04 turn-loop-ux**, **05 ending-report-metrics**.

Method: surveyed classroom sims, mobile apps, web games, bank/charity offerings and notable indie games,
then weighed them against peer-reviewed meta-analyses and regulator reports (OECD/PISA, CFPB, FINRA-funded
evaluations). Marketing claims are labelled as such; independent evidence is separated from product copy.

---

## Recommendation (short)

1. **The closest prior art to this MVP is ESSI Money** — a web life-sim where a player runs a virtual
   six-month financial life (earn, budget, spend, borrow, invest, insure, net worth). It proves the
   format works for 13–18s and is used at scale, but it takes **2–6 hours**, is classroom-framed, and
   plays an **employed 18-year-old**. Our advantage is a **shorter, phone-native, 60-card run** that
   starts at 13 and *grows into* the adult concepts.
2. **Banqer High** is the best example of making money feel consequential: a live classroom economy with
   rent, cards, jobs, KiwiSaver, insurance, a stock exchange and even peer landlords. Borrow its
   **ladder of mechanics**; avoid its **leaderboards and gems-for-the-class-store** reward loop.
3. **Never build a quiz and call it a game.** The products that collapse into quizzes are the bank/charity
   offerings (Visa Financial Football, Greenlight Level Up, EverFi modules, Kahoot-style FinCap Friday).
   The concepts that *survive* as interactive mechanics are **credit/debt, interest/compounding,
   investing/risk, budgeting and earning** — because each has a visible number that moves. The concepts
   that consistently collapse to quizzes are **taxes, scams and needs-vs-wants**; for those, teach the
   *consequence inside another mechanic*, not a standalone lesson.
4. **Borrow three specific devices**: play the villain (NGPF *Shady Sam* — you are the loan shark), the
   risk wheel (NGPF *Bummer!* — buy insurance, then spin bad events), and the compound-interest
   time-lapse (NGPF *Cat Insanity* / *STAX* — 20 years in 20 minutes).
5. **Evidence says a game can move knowledge reliably (+0.2–0.3 SD) and behaviour modestly (+0.1 SD)**;
   it does **not** support "one 20-minute quiz changes behaviour". Design for **rules of thumb**,
   **just-in-time** consequences and **experiential simulation** — the three things the literature
   consistently finds work — and keep the MVP's success claim to *in-run* decisions.

---

## 1. The landscape

### 1.1 Classroom sims

| Product | Form / play | What it teaches | Verdict for us |
|---|---|---|---|
| **ESSI Money** (Financial Basics Foundation, AU; rebuilt 2016) | Browser game. Player is an employed, independent 18-year-old over a **virtual six months**, aiming for the best financial result; sets goals, builds a budget, keeps diary entries; opens accounts, term deposits, credit cards; buys/sells shares; pays insurance. Play time **2–6 h**; ~30,000 unique players/year. | Earning, saving, spending, investing; **net worth** and **insurance** flow through. | **Closest model.** Life-sim + budget + consequences + net-worth scoreboard is exactly our shape. Weaknesses to beat: long sessions, desktop/classroom framing, adult starting point. ([financialbasics.org.au](https://financialbasics.org.au/essimoney/); designer's account [roboconnorfolio.com](https://www.roboconnorfolio.com/works/essi-money-game-design/)) |
| **Banqer High Junior/Senior** (NZ) | Live classroom economy. Students open accounts, choose cards with different rates/fees/limits, build a CV and apply for jobs, check in to work and get promoted, choose KiwiSaver funds, rent a property, buy a home, **become a landlord of peers**, budget, buy personal-risk and contents insurance, and trade on a school stock exchange. Real-life events (market shifts, job promotions) are injected. | Banking, credit/debit, careers, retirement, renting, home ownership, budgeting, insurance, investing. | **Best consequence model.** Borrow the *ladder*: accounts → cards → job → rent → invest → insure. Avoid leaderboards ("savings to investments") and gems redeemed in a class store. ([banqer.co](https://banqer.co/nz/high/junior/how-it-works)) |
| **Banzai** (US, free via banks/credit unions) | "Gamified courses" with **decision trees** and choose-your-own-adventure scenarios; a lemonade stand teaches revenue/expenses/loan repayment/savings goal; pre- and post-tests; 20 languages; teacher dashboards show each student's decision path. | Budgeting, savings, debt, credit, loans, banking; also digital citizenship and entrepreneurship. | **Borrow the decision-tree + teacher-view idea**; do **not** borrow the pre/post-test framing (it signals "worksheet"). Marketing-heavy; I found no independent efficacy evidence. ([banzai.org/courses](https://banzai.org/courses)) |
| **EverFi** (US, sponsored, free to schools) | Self-paced interactive modules across financial literacy, "Marketplaces: Investing Basics", digital wellness, careers. Often readings/videos + embedded questions. | Broad: budgeting, saving, debt, investing. | **The archetypal "lecture disguised as a choice."** Broad but shallow; knowledge-forward. Useful as a *content checklist*, not a design model. ([everfi.com](https://everfi.com/courses/k-12/financial-literacy-high-school/)) |
| **The Stock Market Game** (SIFMA Foundation) | Team portfolio simulation; buy/sell stocks over a semester; competition. | Investing, markets, math. | **Independently evaluated** (Learning Point Associates, FINRA-funded, 2009): participants scored significantly higher on **maths and financial-literacy** tests. But it is a **trading** game; a rising market rewards speculation. If we simulate markets, we must simulate **crashes and diversification**, not stock-picking. ([stockmarketgame.org](https://www.stockmarketgame.org/impact.html); [2009 study brief](https://www.stockmarketgame.org/assets/pdf/2009_Learning_Point_Study_Brief_Report.pdf)) |
| **NGPF Arcade** (Next Gen Personal Finance, US nonprofit) | A suite of short (5–20 min) web games, each targeting one concept: *Payback* (student debt), *Money Magic* (budget to reach a goal), *Bummer!* (pick insurance, spin the Wheel of Bummers), *Shady Sam* (play the loan shark), *Shady Sam's Slick Wheels* (play the car dealer), *Credit Clash* (card-battle to a credit score), *STAX* (20 years of investing in 20 min), *Cat Insanity* (debt, interest, minimum payments), *Spent* (make it through the month), *The Uber Game* (gig work), *Influenc'd* (influencer entrepreneurship), *Crypto Craze* (pick coins, win or lose it all). | Almost all eight concepts, one game each. | **The single best mechanic catalogue for this MVP.** Each game isolates one concept and gives it a verb. Steal the verbs. ([ngpf.org/arcade](https://www.ngpf.org/arcade/)) |
| **Junior Achievement Finance Park / "Bite of Reality" / "Mad City Money"** (in-person) | Physical simulation: students get a salary, a family and a month of bills, then walk a circuit of stalls (housing, transport, food, insurance) and try to balance. | Budgeting, needs vs wants, cost of living. | The **allocation-under-constraint** feel is right; the in-person format is out of scope, but the mechanic (walk through categories until the money runs out) translates directly to a phone allocation screen. |

### 1.2 Mobile apps and fintech

| Product | Play | Verdict |
|---|---|---|
| **Greenlight Level Up** (US, paid family app) | Bite-sized challenges: short video + **multiple-choice / true-false / scenario questions**; XP, coins, 3 stars, lives; coins redeemable for rewards; "exceeds national standards". | **This is the quiz-collapse failure mode, quantified.** The reward is coins, not money competence. Useful only as a *scope* reference (K–12 curriculum, bite-sized). ([help.greenlight.com](https://help.greenlight.com/hc/en-us/articles/10412843038491-How-to-play-Greenlight-Level-Up)) |
| **Zogo** (US, bank/credit-union sponsored) | Gamified bite-sized finance lessons; rewards (often gift cards) for completion; streaks/pins. | Same reward-loop critique. Marketing claims "behavioural psychology + learning science"; no independent efficacy evidence surfaced. |
| **GoHenry / Mydoh / RoosterMoney / BusyKid / FamZoo** | Chores → allowance → savings goals/pots → virtual card; some add lessons. | The **goal-pot + auto-save** interaction is proven and worth borrowing (a named goal with a progress bar). Not a game. |
| **BitLife** (Candywriter, huge with teens) | Text life-sim: you age a character, get random life events, and pick choices that cascade; runs from birth to death. | **The UX model our audience already knows.** Monthly/annual turns, character attachment, consequences that stick. Commonsense Media notes "often the choices don't have consequences, but other times it can result in… being jailed". Our differentiator: **money choices always have consequences**. ([commonsensemedia.org](https://www.commonsensemedia.org/app-reviews/bitlife-life-simulator)) |

### 1.3 Web games, bank/charity offerings and indie

| Product | Play | Verdict |
|---|---|---|
| **Visa Financial Football / Financial Soccer** | "Answer fast-paced, **multiple-choice** money-management questions correctly to advance down the field for a chance to score." | **Quiz with a sports skin.** Taught us what to avoid. ([Visa fact sheet](https://www.practicalmoneyskills.com/content/dam/financial-literacy/practical-money-skills/presskit/Visa_FactSheet_FinancialFootball.pdf)) |
| **Experian** (B.A.L.L. for Life; "Funny Money" game round-ups) | Online **courses**, roadshows and competitions in the US; content marketing that *lists* money games. | Not a game product; a content/CSR play. Confirms the pattern: **banks produce quizzes and content, not simulations.** ([experianplc.com](https://www.experianplc.com); [experian.com](https://www.experian.com)) |
| **PlayMoolah / WhyMoolah** (Singapore) | Avatar taken through **life stages** making decisions about buying a house, daily expenses, etc.; earlier products taught 6–12s to "earn, spend, give and invest". Now pivoted to adult money-anxiety courses. | The **life-stage avatar** idea is right; the product never proved a durable teen loop. ([Yahoo/PlayMoolah](https://sg.finance.yahoo.com/news/playmoolah-growing-launches-whymoolah-teach-090214576.html); [NUS](https://enterprise.nus.edu.sg/startup-story/playmoolah/)) |
| **Spent** (Urban Ministries of Durham + McKinney, 2011) | You have a small balance and a month; you make brutal trade-offs (job, rent, insurance, childcare) and try to survive paycheck-to-paycheck. Hugely played (top NGPF arcade game). | **Best example of scarcity creating tension.** Also a **poverty sim**, and academic work on it is mixed: useful for shifting attitudes, criticised for producing pity/guilt rather than mechanics. ([Hernandez-Ramos et al., 2019](https://scholarcommons.scu.edu/cgi/viewcontent.cgi?article=1091&context=tepas); [Layth, 2023](https://journals.sagepub.com/doi/10.1177/0092055X231172598)) |
| **Financial Entertainment** (Doorways to Dreams Fund; *Farm Blitz*, *Bite Club*, *Refund Rush*, *Celebrity Calamity*) | Casual games each targeting one behaviour: *Farm Blitz* = compound interest/emergency savings; *Bite Club* = debt (vampire theme); *Refund Rush* = payday loans/tax refunds; *Celebrity Calamity* = credit-card management. | **The original "one behaviour, one casual game" project**; the Boston Fed published its design rationale. The **humour** (vampires) is a deliberate anti-moralising device worth copying. ([Boston Fed, 2012](https://www.bostonfed.org); [D2D report](https://www.bostonfed.org)) |
| **Board games**: *Monopoly*, *The Game of Life*, *Pay Day*, *Act Your Wage*, *Cashflow* | *Monopoly* = buy property, extract rent (originally a Georgist lesson against monopoly — the standard rules invert it). *Game of Life* = money as score. *Pay Day* = monthly bills and loans with "Buyer's Remorse" and interest. *Act Your Wage* (Ramsey) = envelope/zero-based budgeting. | **Do not use *Monopoly* or *Game of Life* as models**: they teach rent extraction and "money = score". *Pay Day* and *Act Your Wage* are closer to us (recurring obligations, envelopes). ([Smithsonian on Monopoly's origin](https://www.smithsonianmag.com/arts-culture/monopoly-was-designed-teach-99-about-income-inequality-180953630/)) |
| **Kahoot-style quizzes** (e.g. NGPF *FinCap Friday*) | Multiple-choice, fast, competitive, projected on a screen. | Excellent for **recall/engagement in a classroom**, useless as a life-sim mechanic. Tests the *testing effect*, not behaviour. |

---

## 2. Concept by concept: what has a proven interactive treatment, and what collapses

| # | Concept | Strongest interactive treatments found | Does it collapse to a quiz? | What to borrow |
|---|---|---|---|---|
| 1 | **Budgeting & tracking** | NGPF *Money Magic* (allocate to hit a goal), ESSI Money (budget + diary), Banqer (budget from income/expenses), *Spent* (survive the month), envelope board games. | Rarely — budgeting is inherently an allocation. But "what is a budget?" quizzes do exist (Greenlight, EverFi). | Make the budget a **constraint the player must satisfy before the month resolves** (zero-based envelopes), not a lesson. Show the gap between plan and reality at month-close. |
| 2 | **Saving & goals** | Named goal + progress bar + auto-transfer (GoHenry/Mydoh/Greenlight pots); ESSI savings goals/term deposits; Banqer savings accounts with interest. | Sometimes — "why save?" quizzes. | **Named goal with a target and a deadline**, progress visible on the home screen, small monthly friction. Milestone celebrations, not points. |
| 3 | **Interest & compounding** | NGPF *Cat Insanity* (minimum payments + compounding), *STAX* (20 years in 20 min), D2D *Farm Blitz* (compound growth), ESSI term deposits/super. | Often — "what is APR?" definition questions. | **A visible curve.** A monthly "interest earned/charged" line plus a time-lapse graph so a small number becomes large — or a debt balloons. This is the single most demo-able concept; show the curve, don't explain it. |
| 4 | **Earning & work** | Banqer careers (CV → job → promotions), ESSI jobs, NGPF *The Uber Game* (gig economics), Banzai lemonade stand, *Influenc'd*. | Sometimes — "what is a wage?" | **Hours ↔ money ↔ time trade-off.** Let the player pick shifts, see the gross paycheck, then watch deductions appear. Work competes with study and social life. |
| 5 | **Needs vs wants** | Almost always a sorting/multiple-choice exercise; best version is a **forced choice under scarcity** (Spent; allocation screens). PISA itself places "recognise needs vs wants" at its **lowest** proficiency level. | **Yes — this is the concept that collapses most reliably.** | Don't build a needs-vs-wants lesson. Build a **constrained choice** ("you can afford one of these this month") and let the budget make the point. |
| 6 | **Credit & debt** | NGPF *Shady Sam* (you are the loan shark), *Credit Clash* (card battle to a credit score), *Cat Insanity* (minimum payments), D2D *Bite Club*, *Refund Rush*; Banqer cards with rates/fees/limits; ESSI credit-card choice. | Sometimes — "what is a credit score?" | **Let the player take credit, then live with the minimum payment.** Show total cost, not just the monthly. A credit-score-like meter that moves on payment history and utilisation (no real FICO needed). This is our richest mechanic. |
| 7 | **Investing & risk** | NGPF *STAX*, *Crypto Craze*; Stock Market Game; ESSI shares + risk assessment + super; Banqer stock exchange. | Sometimes — "what is a stock?" | **A passive holding with volatile seeded returns**, showing time and diversification — plus an explicit **crash and recovery**. Do **not** build a stock-picker with a leaderboard (teaches speculation and luck). |
| 8 | **Taxes / insurance / scams** | Insurance: NGPF *Bummer!* (premium choice + Wheel of Bummers), Banqer personal-risk and contents insurance (premiums, claims), ESSI insurance. Taxes: Banzai sales tax; payslip deductions. Scams: Banzai digital citizenship; NGPF *Influenc'd*. | **Yes, all three collapse almost everywhere.** | Insurance → **choose cover, then roll the seeded bad event** (the wheel is the mechanic). Taxes → **the first-payslip reveal** ("where did it go?") plus a simple refund moment. Scams → **a decision under social pressure with tells**, not a definition quiz. |

**Opinionated read:** five of the eight concepts (budgeting, saving, interest, credit, investing) have
genuinely good interactive treatments in the wild and should be our *mechanical spine*. Earning and
needs-vs-wants are best expressed *through* the spine (income and constraints) rather than as their own
screens. Taxes, insurance and scams need one bespoke interaction each — and insurance already has a
proven one (the risk wheel).

---

## 3. What makes money feel consequential and fun — not moralising

Synthesised from the products above plus CFPB and game-based-learning research.

1. **Legible cause and effect.** Money must visibly move the moment a choice is made. ESSI, Banqer and
   NGPF's best games all animate the number. CFPB's five principles put "actionable, relevant and
   timely information" and "make it easy to follow through" at the centre. ([CFPB, 2017](https://www.consumerfinance.gov/archive/blog/effective-financial-education-five-principles-and-how-use-them/))
2. **Real agency.** PISA 2022 finds students who can decide independently how to spend their money score
   **~30 points higher** in financial literacy than those who cannot, after controls. The game should hand
   the player the decision, not narrate it. ([OECD, 2024](https://www.oecd.org/en/publications/pisa-2022-results-volume-iv_5a849c2a-en.html))
3. **Failure is the norm and must be recoverable.** PISA 2022: **~82%** of 15-year-olds reported buying
   something that cost more than they intended; **60%** bought something because their friends had it.
   A game that punishes overspending with shame will lose the audience it most needs. Recoverable
   consequences are both kinder and more realistic. ([OECD, 2024](https://www.oecd.org/en/publications/pisa-2022-results-volume-iv_5a849c2a-en.html))
4. **A character you care about beats a ledger.** *BitLife*'s popularity with teens is the proof; our
   life-sim frame is already correct. Keep the character's name, face, friendships and small life visible
   behind the numbers.
5. **Scarcity creates tension; abundance kills it.** *Spent* is compelling because the money runs out.
   ESSI and Banqer work because obligations are unavoidable. But *Spent* is also grim — pair scarcity with
   humour and small wins.
6. **Let the player be the villain.** *Shady Sam* (play the loan shark) and *Slick Wheels* (play the car
   dealer) teach predatory terms by making the player *sell* them. This is the strongest anti-moralising
   device in the catalogue: nobody is told off, and the lesson is felt from the inside.
7. **Irreverence over instruction.** D2D's *Bite Club* uses vampires; NGPF's games are funny. Finance
   content for teens should sound like a friend, not a bank.
8. **Students want the mess, not the tidy version.** In a 2026 HICSS study, upper-secondary students who
   played a financial-education game said finance is "uncertain and complex" and wanted games to match
   that reality through simulations that are **challenging and applicable to real-life contexts**. The
   authors' four design principles: constructivist bias education, **agency through scaffolding**,
   **contextualised decision-making**, and attention to **motivation/attention limits**. ([Ahmad et al., HICSS 2026](https://researchportal.tuni.fi/en/publications/designing-educational-games-for-financial-literacy-and-bias-aware))
9. **CFPB's developmental model says 13–21 is exactly when knowledge and decision skills solidify**, and
   recommends **experiential learning** as the way to build them. ([CFPB Building Blocks, 2016](https://www.consumerfinance.gov/data-research/research-reports/building-blocks-help-youth-achieve-financial-capability/))

---

## 4. Known failure modes (honest list)

1. **Gamification that trivialises.** XP, coins, stars and "lives" attach reward to *completing questions*,
   not to financial competence (Greenlight Level Up). Expected tangible rewards reliably **undermine
   intrinsic motivation** (128-experiment meta-analysis, [Deci, Koestner & Ryan, 1999](https://pubmed.ncbi.nlm.nih.gov/)). If we use points at all, they must be *the money itself*, not a parallel currency.
2. **Leaderboards reward luck and wealth, not capability.** Banqer ranks students on savings/investments;
   with a stock exchange and peer landlords, the ranking partly measures the random walk and starting
   position. Our map already rules leaderboards out of scope — the evidence supports that decision.
3. **Lectures disguised as choices.** EverFi-style modules and Visa's *Financial Football* present a
   question with one obviously correct answer and call it interactivity. A "choice" that is really a
   comprehension check teaches nothing about trade-offs.
4. **Reward loops that teach the wrong lesson.** Trading sims with a rising market teach "stocks always go
   up" and reward speculation; *Monopoly* teaches rent extraction; *The Game of Life* teaches "money =
   score"; saving-as-score teaches hoarding rather than goals. Every mechanic must be interrogated: *what
   behaviour would a player optimise if they played this to win?*
5. **Knowledge without behaviour.** The best evidence finds financial education moves **knowledge about
   twice as much as behaviour** (≈+0.2 SD vs ≈+0.1 SD; [Kaiser, Lusardi, Menkhoff & Urban, 2022](https://www.nber.org/papers/w27057)). A game that only raises quiz scores has not done the job. This is why the MVP's
   success metric (ticket 05) should be **in-run decisions**, and why the ending must show the player
   their own trajectory rather than a knowledge test.
6. **Poverty sims produce pity or guilt, not mechanics.** Research on *Spent* is mixed: it can shift
   attitudes toward poverty, but it risks reading as misery tourism and can stereotype. Use scarcity for
   tension, but keep the player's agency real and the tone non-judgemental.
7. **Confidence without competence.** PISA 2022 finds **64% of low-performing students feel confident**
   about managing money. Handing a teen a virtual brokerage account can inflate confidence faster than
   skill. Simulate losses and volatility, not just wins.
8. **Quiz collapse in the hard concepts.** Taxes, scams and needs-vs-wants default to multiple choice
   everywhere. Plan bespoke interactions for them (payslip reveal, scam decision under pressure, forced
   constrained choice) or accept they will be the weakest part of the game.
9. **Duration and framing.** ESSI Money is 2–6 hours and classroom-framed; EverFi and Banzai live inside a
   teacher dashboard. A public, anonymous, phone-first web game must be **short, self-contained and
   homework-free** — that is our edge, not a constraint.
10. **Moralising tone.** "Skip the latte" content patronises a 15-year-old. PISA shows peer influence is
    real (60% bought because friends had it); model the social pressure and let the consequence land
    instead of lecturing.

---

## 5. What actually changes teen financial behaviour

**The headline numbers.**

- **Financial education works, modestly and durably enough to be worth doing.** A meta-analysis of **76
  randomised experiments / 160,000+ people** finds causal effects of **+0.2 SD on financial knowledge**
  and **+0.1 SD on financial behaviour**; for **youth aged 14–25 the behaviour effect is +0.12 SD**; the
  authors find **no strong evidence of rapid decay**, though no proof of very-long-run persistence
  either. ([Kaiser, Lusardi, Menkhoff & Urban, 2022](https://www.nber.org/papers/w27057); [JFE version](https://doi.org/10.1016/j.jfineco.2021.09.022))
- **This is a correction of the older pessimism.** Fernandes, Lynch & Netemeyer (2014) found financial
  education explained a vanishingly small share of behaviour variance and decayed; the newer RCT-based
  estimate is **3–5× larger**, comparable to health-behaviour interventions.
- **Game-based delivery specifically works for knowledge.** An RCT of an online game-based financial
  education course with **2,220 students across four countries** found **+0.313 SD** in financial literacy
  — larger than the general financial-education average and the strongest direct evidence that a game
  format is at least as effective as traditional instruction. ([Cannistrà et al., 2024, *Journal of Comparative Economics*](https://research.ou.nl/en/publications/the-impact-of-an-online-game-based-financial-education-course-mul))
- A Finnish study of lower-secondary students found gamified methods were **significantly associated with
  financial-knowledge accumulation** ([Kalmi & Rahko, 2022, *Journal of Economic Education*](https://www.tandfonline.com/doi/abs/10.1080/00220485.2022.2038320)).
- A large-scale school experiment in Peru found **immediate improvements in financial literacy and some
  downstream behaviour** (financial autonomy, "savviness"), with follow-up work showing long-lasting
  effects ([Frisancho, 2023, *The Economic Journal*](https://academic.oup.com/ej/article/133/651/1147/6840224)).
- The Stock Market Game's FINRA-funded evaluation found **significantly higher maths and financial-literacy
  scores** for participants ([Learning Point Associates, 2009](https://www.stockmarketgame.org/assets/pdf/2009_Learning_Point_Study_Brief_Report.pdf)) — but it measured test scores, not behaviour.

**What the evidence says works *better*.**

- **Rules of thumb, not full curricula.** A field experiment with microentrepreneurs found a simple
  rule-of-thumb training produced **better financial practices than a full accounting course**
  ([Drexler, Fischer & Schoar, 2014, *AEJ: Applied*](https://doi.org/10.1257/app.6.2.1)). For us: teach
  "pay yourself first", "if it's borrowed, it costs more tomorrow", "cover the thing you can't afford to
  replace" — not the mechanics of APR calculation.
- **Targeted / just-in-time content** beats generic education; effects are larger for those with lower
  initial literacy ([Kaiser & Menkhoff, 2017, *World Bank Economic Review*](https://openknowledge.worldbank.org/bitstreams/f60db227-f3a0-563e-af3f-1c3921f5031b/download)). In a life-sim, the
  event *is* the just-in-time delivery.
- **Simulation and experiential learning** — practice choices and experience consequences in a safe
  environment ([CFPB, 2017](https://www.consumerfinance.gov/archive/blog/effective-financial-education-five-principles-and-how-use-them/)).
- **More hours and interactive methods** improve school-based outcomes ([Amagir et al., 2018, *Citizenship, Social and Economics Education*](https://journals.sagepub.com/doi/full/10.1177/2047173417719555)).

**What the evidence does *not* support.** A single short quiz; badges/points as the goal; leaderboards as
the measure; and any claim that in-game improvement equals real-world behaviour change. The MVP should
claim the honest thing: **the player's in-run decisions get better**, and the run teaches rules of thumb.

**Who the audience is (PISA 2022, 15-year-olds).** ~60% already hold a bank account/debit card; **86%**
bought online in the last year; **93%** saved at least once; **18%** are below baseline financial literacy
(26% across all 20 participating economies); only **two in three** have been exposed to financial tasks in
school; and **~50%** say they *enjoy* talking about money while **36%** say money matters are "not relevant
to them right now". That last number is the design brief in one line: make it relevant, make it fun.
([OECD PISA 2022, Volume IV](https://www.oecd.org/en/publications/pisa-2022-results-volume-iv_5a849c2a-en.html))

---

## 6. Concrete recommendations for this MVP

Mapped to the design tickets this research feeds.

### 01 — Economy model
- **Make the budget a constraint, not a lesson** (ESSI/Banqer/JA Finance Park). The player allocates
  income across envelopes before the month resolves; unallocated money is the failure state.
- **Show interest monthly and let it compound visibly** (Cat Insanity/Farm Blitz). One line on the
  home screen: interest earned / interest charged.
- **Debt must be lived with.** After a credit choice, the minimum payment recurs; show **total cost**, not
  just the monthly. Use a simple credit-score-like meter driven by payment history and utilisation.
- **Investing = a passive, volatile, seeded distribution**, with at least one crash and recovery. No
  stock-picking, no leaderboard.
- **Taxes = a payslip reveal** (gross → net) rather than a tax-return minigame.
- **Insurance = premium vs cover choice**, then a seeded bad event (the *Bummer!* wheel).
- Keep all numbers **small and legible** (teen-scale income) and keep the seeded RNG for reproducible runs.

### 02 — Stage ladder
- Follow Banqer's ladder but start younger: **13–14 earn & budget → 14–15 save & interest → 15–16 needs
  vs wants under pressure + first credit → 16–17 work, payslip, tax → 17–18 invest, insurance, scams.**
- One concept per stage, one mechanic per concept. Don't front-load all eight.
- Model the **social pressure** of the teen years (PISA: 60% bought because friends had it) as a recurring
  stage theme, not a single card.

### 03 — Event-card schema (design implication)
- Add a **recurring-consequence** field (some choices echo in later months) so money feels like it
  compounds rather than resetting.
- Add a **counterfactual** field (what would have happened otherwise) so the ending report can show the
  road not taken.
- Add a **tells** field for scam cards (the observable signals, not the definition).

### 04 — Turn loop & UX
- **Two beats per month: allocate, then decide.** A short envelope/allocation screen, then the Event Card.
- **Animate the money** on every choice — the number must move visibly (CFPB: actionable, timely;
  ESSI/Banqer/NGPF all do this).
- **Month-close summary**: what came in, what went out, interest/fees, and one sentence of feedback
  framed as a **rule of thumb**.
- **No timers, no lives, no coins.** Bite-sized (a month should take well under a minute) and phone-native.
- Consider one **"play the villain"** card (a *Shady Sam*-style predatory-lender role) per relevant stage.

### 05 — Ending report & metrics
- **A "Money Story" timeline, not a grade.** The project's existing name is exactly right.
- **Prove better choices against the player's own past** — month 1 vs month 60 on savings rate, debt taken,
  budget adherence, needs-vs-wants ratio, investment behaviour — not against other players.
- **Show counterfactuals** ("if you'd taken the minimum-payment loan in month 22, you'd have paid X more").
- Avoid a single score; a score invites optimisation of the wrong thing and turns the ending into a quiz
  result. Frame it as *what your money did over five years*.

---

## Sources

**Evidence and regulator reports**
- Kaiser, T., Lusardi, A., Menkhoff, L. & Urban, C. (2020/2022), *Financial Education Affects Financial Knowledge and Downstream Behaviors* — <https://www.nber.org/papers/w27057>; <https://doi.org/10.1016/j.jfineco.2021.09.022>
- Fernandes, D., Lynch, J. & Netemeyer, R. (2014), *Financial Literacy, Financial Education, and Downstream Financial Behaviors* (older, more pessimistic estimate) — summarised in the NBER paper above.
- Kaiser, T. & Menkhoff, L. (2017), *Does Financial Education Impact Financial Literacy and Financial Behavior, and If So, When?* — <https://openknowledge.worldbank.org/bitstreams/f60db227-f3a0-563e-af3f-1c3921f5031b/download>
- Kaiser, T. & Menkhoff, L. (2019), *Financial education in schools: A meta-analysis of experimental studies*, *Economics of Education Review* 78 — <https://www.sciencedirect.com/science/article/abs/pii/S0272775718306940>
- Drexler, A., Fischer, G. & Schoar, A. (2014), *Keeping It Simple: Financial Literacy and Rules of Thumb*, *AEJ: Applied* 6(2) — <https://doi.org/10.1257/app.6.2.1>
- Amagir, A. et al. (2018), *A review of financial-literacy education programs for children and adolescents* — <https://journals.sagepub.com/doi/full/10.1177/2047173417719555>
- Cannistrà, M. et al. (2024), *The impact of an online game-based financial education course: Multi-country experimental evidence*, *Journal of Comparative Economics* 52(4):825–847 — <https://research.ou.nl/en/publications/the-impact-of-an-online-game-based-financial-education-course-mul>
- Kalmi, P. & Rahko, J. (2022), *The effects of game-based financial education: New survey evidence*, *Journal of Economic Education* 53(2) — <https://www.tandfonline.com/doi/abs/10.1080/00220485.2022.2038320>
- Frisancho, V. (2023), *Is School-Based Financial Education Effective? Immediate and Long-Lasting Impacts on High School Students*, *The Economic Journal* 133(651) — <https://academic.oup.com/ej/article/133/651/1147/6840224>
- Hinojosa, T. et al. (2009), *The Stock Market Game Study* (Learning Point Associates, FINRA-funded) — <https://www.stockmarketgame.org/assets/pdf/2009_Learning_Point_Study_Brief_Report.pdf>
- OECD (2024), *PISA 2022 Results (Volume IV): How Financially Smart Are Students?* — <https://www.oecd.org/en/publications/pisa-2022-results-volume-iv_5a849c2a-en.html>
- CFPB (2016), *Building Blocks to Help Youth Achieve Financial Capability* — <https://www.consumerfinance.gov/data-research/research-reports/building-blocks-help-youth-achieve-financial-capability/>
- CFPB (2017), *Effective Financial Education: Five Principles and How to Use Them* — <https://www.consumerfinance.gov/archive/blog/effective-financial-education-five-principles-and-how-use-them/>
- Ahmad, A. et al. (2026), *Designing Educational Games for Financial Literacy and Bias Awareness*, HICSS 59 — <https://researchportal.tuni.fi/en/publications/designing-educational-games-for-financial-literacy-and-bias-aware>; DOI <https://doi.org/10.24251/HICSS.2026.589>
- Deci, E. L., Koestner, R. & Ryan, R. M. (1999), *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation* — <https://pubmed.ncbi.nlm.nih.gov/>
- Doorways to Dreams Fund / Federal Reserve Bank of Boston (2012), *Can Games Build Financial Capability?* — <https://www.bostonfed.org>
- Hernandez-Ramos, P. et al. (2019) and Layth, H. A. (2023) on *Spent* — <https://scholarcommons.scu.edu/cgi/viewcontent.cgi?article=1091&context=tepas>; <https://journals.sagepub.com/doi/10.1177/0092055X231172598>

**Products**
- ESSI Money — <https://financialbasics.org.au/essimoney/>; designer's account <https://www.roboconnorfolio.com/works/essi-money-game-design/>
- Banqer High Junior — <https://banqer.co/nz/high/junior/how-it-works>
- Banzai — <https://banzai.org/courses>
- Next Gen Personal Finance Arcade — <https://www.ngpf.org/arcade/>
- EverFi financial literacy — <https://everfi.com/courses/k-12/financial-literacy-high-school/>
- Visa Financial Football fact sheet — <https://www.practicalmoneyskills.com/content/dam/financial-literacy/practical-money-skills/presskit/Visa_FactSheet_FinancialFootball.pdf>
- Greenlight Level Up — <https://help.greenlight.com/hc/en-us/articles/10412843038491-How-to-play-Greenlight-Level-Up>
- Zogo — <https://play.google.com/store/apps/details?id=com.zogo.child>
- Experian (B.A.L.L. for Life) — <https://www.experianplc.com>
- PlayMoolah / WhyMoolah — <https://sg.finance.yahoo.com/news/playmoolah-growing-launches-whymoolah-teach-090214576.html>; <https://enterprise.nus.edu.sg/startup-story/playmoolah/>
- BitLife (Common Sense Media review) — <https://www.commonsensemedia.org/app-reviews/bitlife-life-simulator>
- Monopoly's origin (Smithsonian) — <https://www.smithsonianmag.com/arts-culture/monopoly-was-designed-teach-99-about-income-inequality-180953630/>
- The Stock Market Game — <https://www.stockmarketgame.org/impact.html>

**Confidence notes.** Effect sizes come from peer-reviewed meta-analyses of RCTs and are reported as
standardised mean differences. Product mechanics were read from first-party documentation (help centres,
product pages) where possible; claims about classroom reach or impact made only in vendor marketing are
flagged as such. No independent efficacy evaluation was found for Banzai, EverFi, Greenlight Level Up,
Zogo, Visa Financial Football or Experian's offerings.
