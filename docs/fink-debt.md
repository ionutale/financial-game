# Fink debt register — the it/ro human pass

`messages/it.json` and `messages/ro.json` are **machine-authored**. Every voice
line the fun pass wrote — tickets 01–12 — was drafted in English and rendered
into Italian and Romanian by an agent, with the mechanical gates holding it
(`pnpm i18n:check`: parity, orphans, placeholders ×3) but no native reader.
**The Fink pass** (design §8, `docs/voice.md` §8) is the release gate for that
work: a human reads it and ro on the surfaces below, against `docs/voice.md`
and `docs/translation-brief.md`, and fixes what a machine cannot hear.

This file is the register of what that pass owes. It is not a test; nothing in
the suite can close it. If a line changes here, the catalogues change together
(the parity gate enforces it).

## Machine polish (2026-09-28)

A machine best-effort pass ran the register's priorities 1–3 over
`messages/it.json` and `messages/ro.json` (`en` untouched; no key, placeholder or
glossary term changed). **It does not close the pass.** Fixed: all six
**Epilogues** (the ro ones had shipped the Italian word *Diciannove* for
`nouăsprezece`; one had “keeps roughly up with it” reversed; “the rest is still
being worked out” read as work-in-progress in both; the it/ro “on the record”
lines now match `story_band_behind`), the **villain cards'** prose and thread
copy, the eight **Rules of Thumb** (the ro interest rule had no agreement; “you
cannot time it” was a calque in both), the Stage-4 **Life Line**, and
`milestone_the_climb` / `story_band_behind`. The **Repayment** vocabulary was
checked and left as shipped: the ro plurals render “2 plăți” / “20 de plăți”,
and `◈47.5` is exact.

Left to the human ear (detail in the report): `thread_referral_sold_payoff`
(“the check-in”), the “in anticipo” / “din timp” gloss in
`event_covered_reaction`, the Epilogues' “gli anni di scuola che i tuoi amici
vivevano ancora” / “pe care prietenii tăi îi trăiau încă” and “incastrato nei
turni”, the it term “referral”, and the participle in `milestone_the_climb`
(“Risalito” / “Urcat din nou…”). See
`.scratch/fun/reports/fink-machine-pass.md`.

## How to run the pass

```sh
pnpm i18n:check          # the mechanical half (parity/orphan/placeholder, ×3)
pnpm dev                 # then open /it/… and /ro/… for the same screen
```

Read `docs/voice.md` first: the house register, the rule of thumb translated
*as a rule*, the Reaction as one in-fiction breath, the Why as personal — and
no maxim added. Do not translate the cast's names, the `◈` glyph, the ids, or
the language endonyms.

## The register

| # | Area | Where it lives | What the pass owes |
| --- | --- | --- | --- |
| 1 | **The Feedback waves** — 218 Reactions and 218 Whys across all 109 cards (tickets 03 for Stages 1–2, 12 for Stages 3–5, 07/08 for the new cards) | `card_*_choice_*_reaction`, `card_*_choice_*_feedback` | The whole voice: does each pair read as *world, then person* — or as a translated lecture? Watch word order in long Whys and the dry register. |
| 2 | **The Eight Rules of Thumb** | one Why per Concept: `the_allowance`, `two_wants`, `phone_plan`, `savings_goal`, `interest_first`, `minimum_payment`, `the_crash`, `scam_opportunity` | Translated as rules, quoted as rules: no extra lesson, no softened rule, no idiom. `docs/voice.md` §4.2 is the canonical list. |
| 3 | **Situations, titles and labels** — 109 situations, 109 card titles, 218 Choice labels, odds, Card-Format lines | `card_*_situation`, `card_*_title`, `card_*_choice_*_label`, `card_*_odds`, `card_*_line_*` | The pre-pass machine translation; the waves rewrote some situations (`savings_goal`, `phone_shop_shift`). Length limits and the scam/villain register apply. |
| 4 | **The Repayment vocabulary** (ticket 10, ADR-0006) | `hud_bnpl` (plural), `resolve_bnpl`, `flag_minimum_payment`, chip copy | it “Rimborso”, ro “Rambursare”; check the ro plural word order (“au mai rămas {months} de plăți”) and that the six-month figure never rounds (`◈47.5`). |
| 5 | **The Life Lines** (ticket 04) | `hud_life_stage_1` … `hud_life_stage_5` | One authored line per Stage: the register is the person, not the timetable; check for stray idiom. |
| 6 | **The Settings preview names** (ticket 04) | `settings_preview_*` (7 keys) | The cues' names must read as sounds, not as mechanics; no music vocabulary. |
| 7 | **The new cards** (tickets 07, 08, 10) | every key of the 16 ticket-07 cards + `phone_shop_shift`/`split_comes_due`/`app_referral`/`referral_follow_up` + `the_drop`/`trip_balance_due` | Names, Threads and family scenes (Mum, Priya, Ravi, Grandma, Danny) in natural speech; the villain cards may tempt but never scold (ADR-0007). |
| 8 | **Reflections, Epilogue, Chapter Titles, The Other Path** (ticket 11) | `reflection_*` (5), `epilogue_*` (6, bands × paths), `chapter_title_*` (7), `story_other_path_*` (5) | The highest-risk register: band honesty without verdict, no rank, no score language; the Epilogue's clauses must stay true to their band; titles are idioms (“The climb”, “The quiet year”) and need a native ear. |
| 9 | **The covered Reaction and the record repairs** (ticket 11) | `event_covered_reaction`, `milestone_the_climb`, `story_band_behind` | Short and checkable; the fixed “behind” line must not soften back into a promise. |
| 10 | **Callbacks** (ticket 07) | `callback_*` (11) | Memories, not lessons; no maxim, no number, unchanged across the run. |
| 11 | **The Cast's prose** (ticket 07) | `cast_*` (identifiers, do not translate), the cast cards' lines and situations | Names stay identical (Priya, Ravi, Danny, Mum, Grandma); prose may say *la nonna* / *Bunica*, as the shipped windfall card already does. |
| 12 | **Chrome and vocabulary** (tickets 02–04, 10–11) | `intro_*`, `plan_*`, `event_*`, `resolve_*`, `hud_*` (excluding the Life Lines), `stats_*`, `story_*`, `journal_*`, `settings_*`, `milestone_*`, `thread_*`, `concept_*`, `band_*`, `flag_*`, `goal_*`, `stage_*_name`, `chip_*`, `beat_art_*_alt`, `app_title` | The fun pass's display vocabulary (“What you'll meet”, “What money's shown you”, “What you've met”, *coming up* / *met* / *later*, “Why it happened”, the date line) and the working title **Nineteen**; the title's final wording is the owner's call. |

## Not in the register

- **en** — the source of truth; changes there are the voice sheet's business.
- The **privacy policy body** — deliberately English until legal review
  (see `src/routes/privacy/+page.svelte`), not a translation debt.
- **Cast names, `◈`, ids, `DELETE`, the language endonyms** — do not translate;
  the parity gate would flag them, and `docs/translation-brief.md` §"Do not
  translate" lists them.

## Priority when the pass begins

1. The Epilogues (band honesty) and the villain cards (the no-scold fence) —
   the two places a machine translation does real damage.
2. The eight Rules of Thumb — a rule that lands only in en, or lands wrong, is
   a teaching bug.
3. The Repayment vocabulary, the Life Lines, the preview names, the cast's
   prose, and the new cards' scenes.
4. The rest of the chrome and the older situations.
