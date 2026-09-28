# Card formats are presentation, mapped outside the deck

**Status:** proposed (fun-grill run 1, 2026-09-27). Sandboxed — not merged.

We decided that a card's **Card Format** — message thread, paper document, receipt — is
presentation and lives in a pure code map beside `beats.ts` (`src/lib/game/forms.ts`), not as a new
field on the deck's `Card` data. The deck stays language-neutral data with its existing schema; the
format changes only how a card's own words are arranged. Multi-line formats carry their extra prose
in the catalogues under `card_<id>_line_<n>`, enumerated by a `forms.test.ts` gate in the
`beats.test.ts` tradition. This is what makes the deck stop looking like a worksheet without a
schema change, a migration, or prose in code.

## Considered options

- **A `format` field on `Card`.** Rejected for now: it would put presentation into the language-
  neutral deck, invite per-card variation nobody has drawn yet, and turn an experiment into a schema
  commitment. Revisit only if formats exceed ~20 cards or need per-locale structure.
- **Deriving the format from card kind or concept.** Rejected: the deck's tags are about teaching,
  not presentation; several scam-kind cards should stay flat prose, and the payslip pair is a
  *moment*, not a kind.
- **A code map (chosen).** Same shape as `beats.ts` (card id → presentation), same tests, no stored
  state, no deck change; a missing or unknown card id is a failing test, not a silent fallback.

## Consequences

- The deck stays exactly as authored; the i18n gate grows one convention
  (`card_<id>_line_<n>`), and `forms.ts` must be extended in lockstep with any new format copy.
- A card whose format needs more lines than the catalogue carries fails a test, not a render.
- Because the format is presentation, a future redesign can strip every format without touching the
  deck or the economy — the change is cheap to reverse, which is exactly why it is a map and not a
  field.
- A future reader will see a card's words split between `card_<id>_situation` and
  `card_<id>_line_<n>`; that split is deliberate and documented here so it is not "fixed" into the
  deck.