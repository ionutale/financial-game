# The beat art — a machine-assisted review

The fun pass chartered a **human art review** of the ten existing pieces (design §8,
`docs/art-audio.md`). This file is the machine-assistable half of that gate: all ten pieces
rendered from `src/lib/components/BeatArt.svelte` with the app's own design tokens, read piece by
piece at desktop and phone widths. **The aesthetic call is the owner's and remains open; nothing
in the art was changed.**

Renders (gitignored, in `reports/`): `beat-art-contact-sheet.png` (1240px) ·
`beat-art-390.png` (390px, the design's legibility target) · the source sheet
`beat-art-contact-sheet.html`.

## What the ten pieces are

| id | intent (from the source) | composition |
| --- | --- | --- |
| `allowance` | coins dropping into a wallet | three coins (middle one money-blue) above a wallet |
| `phone_plan` | a phone beside a calendar, one month marked | phone + signal arcs + a calendar with one blue dot |
| `first_payslip` | effort becomes a wage | a payslip with a ruled money line and a coin at its corner |
| `bnpl_offer` | four instalments, the first taken | a bag + four squares, first filled blue |
| `first_statement` | a statement over a payment card, balance marked | card behind, statement in front, money-blue balance bar |
| `first_taxed_payslip` | one pay bar, split | a bar cut by a dashed line, a blue-wash chunk, a down arrow |
| `scam` | a coin caught on a hook | dashed line to a hook, the coin in the money wash |
| `crash` | a chart climbing then falling | axes + a money-blue line peaking and dropping |
| `fork` | one path forking in two | a line splitting to a book and a briefcase |
| `money_story` | five years, five bars | five ascending bars, the last in the money wash |

## What reads well (machine)

- **Token discipline is exact.** One accent (`--money`), three ink washes, paper. No second
  colour, no gradient, no baked text, no mascot — the pictures are shapes only.
- **Greyscale-safe by construction.** Each piece carries its money-meaning in the blue shape
  alone, so the composition survives without colour; the washes and rules do the rest.
- **Phone legibility holds.** At 390px every piece still reads: the blue shape anchors each
  drawing, and the small details (calendar dots, instalment squares, bars) stay distinguishable.
- **Consistent framing.** All ten sit in the same 300×120 viewBox with generous margins; inline
  SVGs inherit the tokens and cost no requests; `role="img"` + `beat_art_*_alt` ×3 is asserted
  by `beats.test.ts`.

## Candidates for the human eye

1. **`phone_plan`** — the two arcs between the phone and the calendar read as Wi-Fi/signal more
   than as "the bill recurs". Decide whether that ambiguity is a feature or noise.
2. **`first_statement`** — the payment card behind the statement is heavily occluded; at phone
   width it reads as a soft corner rather than a second object.
3. **`first_taxed_payslip`** — the down arrow is the only arrow in the set; check it reads as
   "deducted", not "scroll down".
4. **`allowance`** — the middle coin carries the piece at small sizes; check it reads as
   "arrives" rather than "drops past".

## The human pass still owes

- The aesthetic call per piece (tone, warmth, consistency of voice).
- Device checks: 390px and greyscale on a real screen.
- The alt text read in it/ro by a native reader (Fink register, area 12).
- Any redraw decision — the design budgets a human pass, not a machine rewrite.

**Disposition:** no code changed; `docs/art-audio.md` remains the owner of the art notes, and the
human gate stays open.
