# Voice — the style sheet

The reviewer's reference for the fun pass's copy (design §3.1, ADR-0004). It is
written to be applied in three languages, by an author or a reviewer, without
losing the teaching. Its mechanical half is the **copy lint**
(`src/lib/i18n/copy-lint.ts`, run by `src/lib/i18n/copy-lint.test.ts` beside
the i18n gate); everything the lint cannot read — the register, the humour, the
teaching move — is a review rule here.

Terms follow `CONTEXT.md`: **Feedback** is a **Reaction** and a **Why**, a
**Rule of Thumb** may be said only in a Why and only at a **Teachable Moment**,
and the general lessons live in the record (the Year in Review, the Money
Story), never in the moment.

## 1. One narrator

One voice, everywhere: **dry, warm, unsentimental, never congratulates, never
scolds.**

- Second person, present tense, past tense for what just happened. "You kept
  the weekend." Never "the player", never "the user".
- It notices; it does not grade. No praise, no disappointment, no moral. The
  money already said it.
- It is never certain. Confidence is the smell of a classroom; the narrator may
  be surprised, dry, puzzled or quietly pleased. "The statement does not
  explain itself" beats "the minimum is a trap".
- It never steps outside the fiction. No "in this game", no "next you will
  learn", no address from the interface into the life.
- Failure is named plainly and briefly. A Shock is not an occasion for a
  lesson; it is an occasion for a bill.
- No exclamation marks, no emoji, no money puns, no chirp. Kindness here is
  precision.

## 2. The shape of Feedback: Reaction + Why

Every Choice is answered in two parts (ADR-0004). Both are visible; nothing is
hidden behind a tap except the Why's own disclosure (open at a Concept's first
card, collapsed after — *taught once, trusted after*).

| | Reaction | Why |
| --- | --- | --- |
| Shown as | under “How it went” | under “Why it happened” |
| Length | one or two sentences, ≲ 15 words | one or two sentences, ≲ 40 words |
| Job | what the world did, in the fiction | why it mattered, short and personal |
| May state a general rule? | **never** | only where the card is that Concept's Teachable Moment |
| May carry imperative, "remember", "should", "always", "never"? | no | no, except the one Rule of Thumb at the Teachable Moment |
| Voice | a person's line, a message, a fact on a page | *this* month, *this* money |
| Fallback | absent → the Why stands alone, exactly as today | always present (`_feedback`) |

The key convention, beside the shipped ones:

| Key | Content |
| --- | --- |
| `card_<id>_choice_<choice>_feedback` | the **Why** (the old single paragraph, rewritten) |
| `card_<id>_choice_<choice>_reaction` | the **Reaction** — optional; absent means today's rendering, byte for byte |

A Reaction is never a summary of the Why and never a second explanation. If it
could be said by a teacher, it belongs in the Why or nowhere.

## 3. The rules

1. **The Reaction speaks only from inside the fiction.** It may not know more
   than the character knows at that moment.
2. **No maxims, no imperatives in the Reaction.** "Remember", "should",
   "always", "never", "the point is" are the classroom's words; keep them out
   of the moment (and out of a Why except at a Teachable Moment).
3. **The Why is short and personal.** Prefer *this* month and *this* money to a
   general law. One Rule of Thumb, at the first encounter, is the budget.
4. **The narrator may be surprised, dry or pleased; it is never certain.**
5. **A decision card offers two defensible choices.** If one choice is
   obviously correct, the card is a comprehension check — fix the card, not
   the copy.
6. **Humour is situational, never idiomatic** (§5).
7. **No numbers the player cannot see; no outcome leaks** in labels or chips.

## 4. Show, don't explain — worked before/after

The shipped strings below are the *before*. The *after* columns began as
illustrations of the shape; the waves (tickets 02–03, 12) have since landed
the whole catalogue, so where a landing chose different words than the sheet's
first illustration, the catalogue is now the record and this section shows the
landed shape. The pattern: the general principle moves out of the moment, or
becomes a Why at the first encounter — and the Rule of Thumb is quoted only at
its Concept's Teachable Moment (§4.2).

**the_allowance / spend — the first money**

| | |
| --- | --- |
| Before (the whole Feedback) | "◈40 in and ◈40 out in the same month. The first money you ever control is the easiest to spend, because nothing is asking for it yet." |
| Reaction (landed) | "The thing is yours. Forty is already gone." |
| Why (teachable: earning & work) | "The first money costs no hours, and nothing is asking for it yet. Every hour you sell is an hour you cannot buy back." |

**odd_job / take — the word "point" goes**

| | |
| --- | --- |
| Before | "Fourteen hours for ◈30. That is about two an hour — and you will never forget it, which is exactly the point." |
| Reaction | "Two weekends gone. Thirty, in cash, in your hand." |
| Why | "Fourteen hours for thirty. The first work you are paid for feels different from money someone handed you." |

**subscription_creep / cut — "this game" goes**

| | |
| --- | --- |
| Before | "◈14 a month back, forever, for ten minutes of admin. Nothing else in this game pays that well." |
| Reaction | "Ten minutes on the phone, and fourteen a month stops leaving." |
| Why | "Fourteen a month is small enough to never notice and permanent enough to matter." |

**credit_limit_rise / ignore — "teaches" goes**

| | |
| --- | --- |
| Before | "A credit limit is a permission slip, not a raise. Knowing the difference is most of what this stage teaches." |
| Reaction | "The trip waits for the savings, and the limit sits unused." |
| Why | "The limit was never your money. It is the bank's number, not your raise." |

**birthday_gift / make — an idiom, replaced by the scene**

| | |
| --- | --- |
| Before | "Six hours instead of ◈25. Free is never free — you paid in the only currency you cannot borrow." |
| Reaction | "Six hours at the kitchen table, and a present the others did not buy." |
| Why | "It cost no money and it cost the evening. Both ledgers are real." |

**hype_trainers / save — the maxim goes, and the moment is *not* this card**

| | |
| --- | --- |
| Before | "Now the drop is something you are ready for. Saved-for things cost less than wanted things — always." |
| Reaction | "The drop goes in the calendar: four months out." |
| Why (personal; the rule lives at `savings_goal`) | "The money stays in the envelope, and the drop has a date now. The date is the commitment." |

### 4.1 Two rules of thumb, one place

At the Teachable Moment the Why may carry **one** short general rule — the
Concept's Rule of Thumb — because a first experience is where a rule lands.
Every later card of the Concept gets a Why about *this* month: the record and
the Year in Review carry the rest. If a Why needs two rules to make sense, the
card is teaching two Concepts. The lint does not read Whys for maxims (that is
the review's job, §6); the rule below is the budget it checks against.

### 4.2 The eight Rules of Thumb and where each is said

One rule per Concept, quoted in the Whys of the **designated card** only (both
— or all three — Choices of it, because only the chosen Choice's Why renders).
Ticket 03 landed the four Stage 1–2 rows; ticket 12 landed the rest.

| Concept | Rule (canonical) | Designated card |
| --- | --- | --- |
| needs vs wants | Money you do not spend is the only money you keep. | `two_wants` |
| earning & work | Every hour you sell is an hour you cannot buy back. | `the_allowance` |
| budgeting & tracking | Decide where it goes before the month decides for you. | `phone_plan` |
| saving & goals | Give the money a name and it survives. | `savings_goal` |
| interest & compounding | Interest is the only money that works while you sleep. | `interest_first` |
| credit & debt | The minimum is designed to be affordable forever. | `minimum_payment` |
| investing & risk | You cannot time it. You can only stay in it. | `the_crash` |
| taxes, insurance & scams | Urgency is the tell. | `scam_opportunity` |

**Where the rule lands when the draw decides.** The Why auto-opens at the
Concept's first *played* card (the first-encounter helper, ticket 01), and the
designated card is the author's first-experience card. For the spine Concepts
(`the_allowance`, `phone_plan`) the two coincide, so the rule renders open in
every Run; for `the_crash` and `scam_opportunity` the spine still guarantees
the rule is said at month 55 / 53, even where an earlier pool card met the
Concept first. For the pool Concepts (`two_wants`, `saving_goals`,
`interest_first`, `minimum_payment`) the draw decides which card comes first,
so on some Runs the designated card's rule sits behind the collapsed
disclosure at that card — present, one tap away, but not auto-opened. Ticket 12
considered a guaranteed first card (a draw/spine change — frozen by the spec)
and a `concept_<id>_rule` seam rendered above the Why (a presentation change
outside a copy wave's authority). The accepted line, recorded for the Fink pass
and the review: **the rule is said only in its designated card's Whys; the
disclosure still opens at the true first encounter.** A future ticket may add
the seam without touching this copy.

## 5. Humour

Funny here is **the situation the player recognises**, told dryly — not a
joke told at them.

- **Situational.** The countdown on an investment app, the card statement
  that is one page and two numbers, the friend with screenshots. The humour is
  in the world being exactly like that.
- **Translatable.** No puns, idioms, wordplay, proverbs, quotes, emoji or
  exclamation marks. If a literal translation of the line is nonsense, the
  line is wrong. "The button says invest and the countdown says nine minutes"
  survives; "an interest-ing idea" does not.
- **Never at the player's expense.** The villain may seduce; the game never
  sneers at the buyer or the seller. There is no tone of "gotcha".
- **Nothing funny where the player was just hurt.** Scams and shocks are named
  plainly; the absurdity, if any, sits with the scammer, and the numbers stay
  the numbers.
- Dry understatement beats a punchline: the narrator noticing the fact is the
  joke.

## 6. The ban list and the copy lint

The lint scans the **en** catalogue's moment strings — every
`card_*_situation`, `card_*_choice_*_feedback` (the Why) and
`card_*_choice_*_reaction` (the Reaction) — and fails on:

| Rule | Banned | Scopes |
| --- | --- | --- |
| `classroom` | lesson(s), learn/learned/learning, teach/teaches/taught, quiz, test(s/ed/ing), unlock(s/ed/ing), curriculum, mastery/mastered, course(s), streak(s) | situation, Why, Reaction |
| `frame` | "this game", "the point" | situation, Why, Reaction |
| `reward` | points, score (the reward/behaviour sense) | situation, Reaction |
| `maxim` | always, never, should, remember | situation, Reaction |

Two deliberate line-drawings, both from ADR-0004 and `CONTEXT.md`:

- The **Why is not checked for maxim words** (`always`, `never`, `should`)
  and not for `score`/`points`: a Why may state a Rule of Thumb at a Teachable
  Moment, and it may name the Credit Score — a money fact, not a score of the
  person. The *moment* (situation and Reaction) may do neither.
- The lint is a **review gate, not a natural-language checker**. It catches
  lexemes and frames; it cannot tell "the version of you who is not always at
  work" from "extra money always costs something". The reviewer catches the
  second one; this sheet is what the review applies.

The it/ro catalogues are **not** held by a lexical test: the same idea does not
translate to the same letters. They are held by the translation brief
(§8) and the Fink pass.

### The curated allow-list

`COPY_ALLOW_LIST` in `src/lib/i18n/copy-lint.ts` records the catalogue's
exceptions, one per offending word. The test fails on a **stale** entry (the
word is gone — remove the entry) and on any **new** banned word on an allowed
key, so the list can only shrink. Every row is a decision, not a shrug. After
the copy waves, the only rows left are these five — the fiction's own words:

| Key | Rule | Word | Why it stands |
| --- | --- | --- | --- |
| `card_evening_course_situation` | classroom | course | the college runs an evening coding course; design §3.1's own example |
| `card_credit_limit_rise_situation` | reward | points | "a friend points out" — the verb, not a count |
| `card_score_check_situation` | reward | points | the Credit Score's points, shown in the app |
| `card_score_goal_situation` | reward | score | the credit check and the file |
| `card_credit_check_free_situation` | reward | score | the Credit Score, seen for free |

**The sweep debt is paid.** The gate landed before the waves with an
allow-list of old single-paragraph copy ("this game", "the point", "the
lesson"); ticket 03 paid every Stage 1–2 row and ticket 12 paid the rest, and
the staleness test forced each row's removal. A copy-lint test now asserts the
catalogue's *raw* violations are exactly those five words — any other banned
word in a situation, Why or Reaction fails before the allow-list can excuse it.
The same test pins the month-loop chrome (`intro_*`, `plan_*`, `event_*`,
`resolve_*`) free of the ban list: ticket 03's chrome change had no regression
pin until ticket 12.

Review-gate cousins the lint does not match, and the review does:
"that is what … is for", classroom nouns not on the list (homework, syllabus,
grade, pupil), a maxim in a Why that is not the Teachable Moment, and any line
that would read as a lecture in it or ro. Card **titles, Choice labels and
odds** are review-gated rather than linted — the moment is where the lecture
bites — and their current copy holds none of the ban list's words but one
label: `card_score_goal_choice_wait_label` (“Wait and build the score”) keeps
the Credit Score's own word, the same precedent the allow-listed situations set.

## 7. The cast

Five recurring people — **Priya, Ravi, Danny, Mum, Grandma** (a school friend
or flatmate is the optional sixth). The rules:

- Each appears **2–3 times per Run**, one line each, and has their **own
  wants** — the app, the shift, the grandchild, the money that arrives late.
- They are people, **never lesson-carriers**: they do not explain a Concept or
  point at the mechanic. Danny has the app because a friend has an app; Priya
  offers the shift because the shop needs covering.
- Their **names are identical in every locale**. Priya is Priya in it and ro.
- Their copy obeys this sheet — no maxims, no idiom, dry and concrete.
- A finished Run's Cast **derives from its log**: who appeared is who was
  played, never a new stored field.

What each is already doing in the deck, to keep them continuous: Danny — the
investing-app friend (`app_tip`, `app_vanishes`); Priya — the café shift after
the course (`course_pays_off`); Ravi — the colleague who is ill
(`overtime_offer`); Grandma — the late card with ◈50 (`grandma_windfall`);
Mum — family scenes, authored with the cast's copy wave (ticket 07).

## 8. Translation guidance

For `messages/it.json` and `messages/ro.json`, and for the Fink pass:

- **en is the source of truth.** New keys land in all three catalogues
  together; the parity gates (`src/lib/i18n/messages.test.ts`) fail on a
  missing key, an orphan `card_*` key, an empty value or disagreeing
  placeholders. **Never rename or invent keys.**
- **Translate the move, not the words.** The lint's letters are English. The
  translator's question is the same one the style sheet asks: *would a person
  in this situation say this — or is this a teacher talking?* A literal
  translation of a dry fact is right; a literal translation of an idiom is
  wrong.
- **Keep the two parts.** The Reaction is one breath of what the world did;
  the Why is short and personal. If a translation needs to explain the
  situation, the English is wrong — fix the source, not the translation.
- **Sentences stay whole where they can.** Short declaratives survive
  machine translation ×3; nested clauses, dashes carrying clauses and
  sentence-long metaphors do not.
- **No new rules of thumb.** A Why gains a general law only where the English
  Why has one, and only at the Teachable Moment; a translator who adds a
  lesson has added a bug.
- **Do not translate**: the cast's names, the money glyph `◈` (the code
  formats amounts through `Intl`), and the game's own vocabulary — use the
  glossary wording from `docs/translation-brief.md` and `CONTEXT.md`.
- **No exclamation marks, no emoji, no chirp** in any locale. The dry register
  is the product, not the English.
- The **Fink pass** is the release gate for the voice work; a rule of thumb
  that lands only in en is a debt, recorded and paid. The register of what the
  pass owes — every machine-authored it/ro line from tickets 01–12 — is
  `docs/fink-debt.md`.

## 9. Where the general lessons live now

The moment teaches by showing. The general rules have three homes, all earned
from the record:

1. the **Why** at a Concept's Teachable Moment (one Rule of Thumb, `§2`);
2. the **Year in Review** and the **Money Story** — Reflections, the Epilogue,
   the Chapter Title (design §3.7);
3. the **Journal** and Concept Coverage — "met", never "mastered".

Nothing general is said live anywhere else. That is the whole move: the game
stops telling you how money works and shows you how *yours* worked.
