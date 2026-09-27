# Art & audio

What the MVP looks and sounds like, and where it lives in the code. The direction is ticket 13's:
**typographic-first, illustrated at the beats** — one accent colour reserved for money and state,
colour never load-bearing, light theme only, SFX only and off by default.

## What exists

| Piece | Where | Notes |
| --- | --- | --- |
| Ten beat illustrations | `src/lib/components/BeatArt.svelte` | One inline SVG, `viewBox="0 0 300 120"`, keyed by art id |
| The beat map | `src/lib/game/beats.ts` | Card id → art id, plus the Money Story panel |
| Alt text | `messages/{en,it,ro}.json`, keys `beat_art_<id>_alt` | Every piece, every locale; `beats.test.ts` enforces it |
| The abstract silhouette | `src/lib/components/Avatar.svelte` | Pre-existing (ticket 13); ages by proportion and posture |
| The five-cue SFX bank | `src/lib/audio/sfx.ts` | `choice`, `month_close`, `stage_up`, `crash`, `milestone`; Web Audio synthesis |
| The sound toggle | `src/routes/settings/+page.svelte` | `role="switch"`; off by default; a `localStorage` preference |
| Rights | `ATTRIBUTION.md` | Self-authored, dedicated CC0-1.0 |

## The beat map

`spine.ts` fixes which card is dealt at which month; `beats.ts` says which of those cards — plus the
Stage-5 Fork — gets a picture. The rule is *beats only, never per card*: about eighty cards stay
typographic, nine card moments and the Money Story get art.

- `EventStep.svelte` renders `<BeatArt>` only when `beatArtFor(card.id)` returns a piece, and never
  for a `stage_up` card.
- `StageUp.svelte` renders the Fork's own piece above its banner (it contains an `EventStep`, so
  EventStep's stage-up guard is what stops the drawing appearing twice).
- `MoneyStory.svelte` renders `MONEY_STORY_BEAT` directly, because the closing panel is not a card.

Adding a beat is three edits, one of them a drawing:

1. add a branch to `BeatArt.svelte` and a member to `BeatArtId`,
2. add the card id to `BEAT_ART` (or use `MONEY_STORY_BEAT`),
3. add `beat_art_<id>_alt` to all three catalogues.

`src/lib/game/beats.test.ts` fails if the map stops covering every spine beat exactly once, if a
piece is missing its alt text in any locale, or if two pieces share an id.

### Inline SVG, not static files — why

- The drawings are drawn with the app's tokens (`--money`, `--ink-40`, `--wash`, `--surface`). A
  static `.svg` cannot read `:root` variables, so the same colour would have to be typed as a hex
  literal in ten files and kept in sync by hand — exactly how an accent stops being the only accent.
- Alt text lives in the catalogue; an inline `role="img"` with `aria-label` gets the translated
  string at render time, while a static file would need the text duplicated per locale in markup.
- One component is one place to review, and it costs zero extra requests on a phone-first screen.
- There are therefore no files under `static/` for this ticket; the rights note is `ATTRIBUTION.md`.

## Sound

`src/lib/audio/sfx.ts` synthesises all five cues with oscillators and gain envelopes — no files, no
licences, nothing to download.

| Cue | Fires when | Sound |
| --- | --- | --- |
| `choice` | a Choice is tapped; also the confirmation when sound is switched on | two short triangle notes, a fifth apart |
| `month_close` | the month close replaces the Feedback (`CONTINUE`) | two rising sine ticks |
| `stage_up` | a Stage-up opens (`NEXT_MONTH`) | a C–E–G triangle arpeggio |
| `crash` | the crash card is dealt (`CONFIRM_PLAN`) | one low sine sliding down |
| `milestone` | a Month Close carries a Milestone line (`CONTINUE`); it replaces the close's ticks that month | one sine gliding up a fifth |

The `milestone` cue is gamification ticket 06's one addition to the bank: the close's two ticks
fused into a single rising note, on the same off-by-default, never-load-bearing terms. Nothing
links it to money or progress — only a Milestone plays it — so a missed Milestone is simply silent
and no cue ever answers a mistake.

Design rules, all deliberate:

- **Off by default.** `readSfxEnabled` only accepts the literal `on`; the Settings toggle writes it
  to `localStorage` under `financial-game:sfx`. It is a device preference, never part of `RunState`,
  so it survives deleting every Run.
- **Never load-bearing.** Each cue confirms something already on screen; nothing is announced by
  sound alone, and the game is complete muted.
- **Gestures only.** The `AudioContext` is created and resumed inside the click that causes the
  sound, which is what browser autoplay rules ask for. If Web Audio is missing, storage is blocked,
  or anything throws, `playCue` is a silent no-op.
- **Quiet and tonal.** No note exceeds `0.05` peak gain; the frequency table uses real pitches.
- **Positive-only.** A wrong Choice gets information, never a punitive noise.

The a11y suite covers the toggle (name, `aria-checked`, persistence across reload) — audio itself is
not asserted, because "silent" is a correct outcome in CI.

## What a human designer should revisit

- **Line weight and composition** at 320px, 390px and 430px: the pieces are geometric on purpose,
  but each one has never been seen by a person with a pen. The alt texts in the catalogues are a
  useful specification to compare against.
- **The two emotional plates** — the scam hook and the crash — should be checked by a human for
  tone: restrained is right, but they must not read as decorative either.
- **The Fork's symmetry.** Neither path may *look* better funded; the accent sits on the junction,
  not a branch. Worth a second pair of eyes.
- **Whether the Money Story panel earns its place.** It is the tenth piece and the only one not
  demanded by ticket 13's beat list; if the closing screen reads better without it, remove it and
  drop `money_story` from `BEAT_ART_IDS`.
- **A CC0 sting pass.** Ticket 13 allowed a handful of CC0 stings for the biggest moments. None
  shipped: the synthesised crash carries the moment, and stings bring licences and downloads. If
  they are added, `ATTRIBUTION.md` gets their rows.
- **Motion.** The illustrations are static; motion is reserved for choice feedback, bars and the
  close, plus gamification ticket 06's two emphases — the Named-Goal bar's quarter ticks pulse when
  a threshold lands, and the Month Close's Milestone line eases in — both `aria-hidden` or
  text-backed decoration and both reduced-motion-gated. If the art ever animates, it must respect
  `prefers-reduced-motion` like the rest of the app.
- **Dark mode (v2).** The tokens are read through CSS variables, so dark mode is a token change —
  but the accent must be contrast-checked against the dark surface first, exactly as ticket 14 did
  for the light one.
