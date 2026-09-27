# Translation brief — en (source) / it / ro

For whoever translates `messages/it.json` and `messages/ro.json`, and for the next tickets that
replace the drafts with real translations. Read `CONTEXT.md` first: the game's vocabulary is
defined there, and the English wording in the catalogues follows it exactly.

## Status: `it` and `ro` are drafts

`messages/en.json` is the source of truth and is complete. `messages/it.json` and
`messages/ro.json` currently **copy the English values** so that every key exists and the build is
green (ticket 26). They are not translations. Ticket 26 deliberately did not machine-translate
them; the next tickets are where they get real text.

_2026-09-26: both `it` and `ro` were machine-translated by an agent (ticket 27) and are complete but unreviewed — they still want a human pass in Fink._

## The key convention

Card prose never lives in TypeScript. Keys are derived from immutable ids:

| Key | Content |
| --- | --- |
| `card_<cardId>_title` | the card's title |
| `card_<cardId>_situation` | the situation paragraph |
| `card_<cardId>_odds` | the odds line (only some Risk Moments have one) |
| `card_<cardId>_choice_<choiceId>_label` | a Choice's button label |
| `card_<cardId>_choice_<choiceId>_feedback` | the Why (ADR-0004): the Feedback's second part |
| `card_<cardId>_choice_<choiceId>_reaction` | the Reaction, optional: what the world did, in the fiction. Absent means the Feedback renders as today's single Why paragraph |

UI strings use descriptive keys grouped by screen: `intro_*`, `plan_*`, `event_*`, `resolve_*`,
`hud_*`, `stats_*`, `story_*`, `settings_*`, `privacy_*`, `link_*`, `beat_art_*`, `language_*`, plus
vocabulary keys (`concept_*`, `stage_<n>_name`, `thread_*`, `band_*`, `flag_*`, `comparison_*`,
`goal_*`).

**Never rename or invent keys.** The deck-integrity test (`src/lib/i18n/messages.test.ts`) fails on
a missing key, an orphan `card_*` key, an empty value, a key set that differs between locales, or
parameters that disagree across locales.

## Tone

Read `docs/voice.md` first: it is the style sheet for the game's one narrator
and for the Feedback's two parts (Reaction + Why, ADR-0004), including the ban
list and the translation rules. The lines below are its short form.

- Second person, present tense, direct. "You kept the weekend." Not "The player kept the weekend."
- Dry and honest, never scolding and never chirpy. No exclamation marks, no emoji.
- The game teaches through consequences; the prose states what happened and why, without moralising.
- Money is the in-game unit `◈`. It is neutral by design and stays `◈` in every locale — it is a
  glyph, not a word. Grouping and decimal marks are handled by `Intl.NumberFormat`, never typed into
  the text.
- Keep sentence rhythm. Most card prose is 1–3 short sentences; the situation sets a scene, the
  feedback explains the trade.

## The eight Concepts (glossary)

Use these terms consistently; they are the game's curriculum. The catalogue keys are
`concept_needs_wants`, `concept_earning_work`, `concept_budgeting`, `concept_saving_goals`,
`concept_interest`, `concept_credit`, `concept_investing`, `concept_tax_insurance_scams`.

| Concept | English wording |
| --- | --- |
| needs vs wants | needs vs wants |
| earning & work | earning & work |
| budgeting & tracking | budgeting & tracking |
| saving & goals | saving & goals |
| interest & compounding | interest & compounding |
| credit & debt | credit & debt |
| investing & risk | investing & risk |
| taxes, insurance & scams | taxes, insurance & scams |

Other vocabulary that must stay consistent across all three locales (see `CONTEXT.md` for
definitions): Run, Turn/Month, Stage, Event Card, Choice, Feedback, Effect Chip, Spine, Pool,
Thread, Month Screen, Plan Step, Shortfall Warning, Month Close, Stats Sheet, Income Tier,
Obligation, Envelope (Need / Want / Save), Named Goal, Cascade, Fund, Credit Score, Overdraft,
Net Worth, Risk Moment, Shock, Free Time, BNPL, Study Path / Work Path, Student Loan, Anonymous
Profile, Money Story, Outcome Band (Ahead / Treading water / Behind), Turning Point,
Behavioural Measures, Wage Hint.

The Envelope names are keys too (`plan_need`, `plan_want`, `plan_saving`): Need / Want / Save.

## Getting context for a card

Open `src/lib/game/cards.ts` and find the card by its id (the id is in the message key). Each entry
carries everything a translator needs, and nothing cosmetic:

- `kind` — `decision`, `shock`, `risk_moment`, `scam`, `stage_up`. A scam card must read like an
  opportunity, never announce itself as a scam.
- `stages` — which life phases can deal it (1 = age 14, 5 = age 18).
- `concept` — which of the eight Concepts the card teaches.
- `branch` — `shared`, `study` or `work` (Stage 5 only).
- `teaches` — the author's one-line note on the intended lesson. **Never visible to players**; it is
  context for you and for future authors.
- `requires` / `resolves` — the Thread or state this card waits on (`thread:friend_loan`,
  `bnpl_active`, `credit_card_open`, …).
- each Choice's effects: `cost` / `gain` (money), `freeTime` (hours), `category` (which Envelope
  pays), `insuredCost`, `sets` (state the Choice flips).

Costs are shown as mechanically derived Effect Chips (`◈12 · 2h`), built from that data at render
time — do not encode numbers in labels; where today's English prose mentions an amount, it is part
of the sentence and should be translated with it. Labels name the action; feedback explains the
consequence.

## Length limits (mobile, 430 px column)

- Choice labels: aim for ≤ 60 characters; they are full-width buttons and wrap, but short reads better.
- Card titles: ≤ 40 characters.
- Situations and feedback: up to about 200 characters is safe; the longest English feedback is ~190.
- Kickers and button labels (`hud_stats`, `plan_start`, `event_continue`, …): 1–3 words.
- UI headings must fit one or two lines at 320 px width (the accessibility suite checks reflow).

## Placeholders and plurals

- Placeholders are `{name}` and must survive translation. You may move them within the sentence if
  the grammar requires it, but never drop, rename or add one: the integrity test compares the
  parameter set across locales. Values that arrive already formatted (e.g. `{amount}`) carry the
  `◈` and locale-correct grouping.
- Plurals use the inlang variant form, not ICU syntax. The catalogue holds an array:

```json
"hud_bnpl": [
	{
		"declarations": ["input months", "input amount", "local monthsPlural = months: plural"],
		"selectors": ["monthsPlural"],
		"match": {
			"monthsPlural=one": "…",
			"monthsPlural=other": "…"
		}
	}
]
```

Romanian needs `few` as well: add a `"monthsPlural=few"` branch for 2–19 (see `Intl.PluralRules` —
the `plural` declaration is locale-aware automatically). Keep the `input` names identical in every
locale.

## Do not translate

- Card, choice, thread, concept and flag **ids** (they are keys, not prose).
- `◈`, the minus/plus signs, `h` for hours, `×` in the BNPL chip: symbols generated by code.
- `BNPL` (it is the term the glossary defines), `DELETE` (the typed confirmation token), and the
  JSON export filename.
- The language names `language_name_en` / `language_name_it` / `language_name_ro`: they are
  **endonyms** ("English", "Italiano", "Română") and deliberately carry the same value in all three
  catalogues, so the switcher stays usable to someone who cannot read the page they are on. Never
  translate them to the target language's exonym.
- The privacy policy body: legal text awaiting review, kept in English on purpose (see the comment
  in `src/routes/privacy/+page.svelte`).

## Checking the work

```sh
pnpm check        # compiles Paraglide, then svelte-check: typed keys, static usage
pnpm test         # includes src/lib/i18n/messages.test.ts, the deck-integrity gate
pnpm i18n:check   # inlang validate + inlang lint + the integrity test
pnpm i18n:lint    # the inlang CLI entry point wired for CI
```

Notes for CI maintainers:

- inlang CLI **v3 removed lint rules** (the CLI prints a deprecation notice and does nothing). The
  project config still raises `messageLintRule.inlang.missingTranslation` to `error` for editors
  (Fink) and for the validation system that replaces linting, but today the missing-translation
  guarantee comes from the Vitest gate, which is stronger: it also checks orphan keys and
  cross-locale parameters. `pnpm i18n:check` runs both the CLI and that gate.
- Locales are reached by URL: `/` is English, `/it/…` is Italian, `/ro/…` is Romanian, and the
  `PARAGLIDE_LOCALE` cookie remembers a choice. To eyeball a screen in `it` or `ro`, open
  `/it/<path>`; the `<html lang>` follows.
