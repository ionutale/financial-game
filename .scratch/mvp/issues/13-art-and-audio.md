# 13 — Art & audio direction

Type: grilling
Status: resolved
Blocked by: —

## Question

[11 — Spec assembly](11-spec-assembly.md) must carry an **art/audio direction** section, and nothing
on the map covers it. Define what the MVP looks and sounds like, and what it costs one author to make.

- **Visual language**: "flat vector, playful" was charted — but what is that concretely? A style
  reference, a palette, how a month screen composes, whether the character is drawn or represented
  by emoji and type.
- **Assets**: what actually ships — icons, backgrounds, character art, decals — and where it comes
  from. The workspace precedent is CC0-only with licences recorded (see `kids-games`' asset guide).
- **Audio**: does the MVP ship sound at all? Music and/or SFX, and whether the hybrid
  synthesised-plus-CC0-stings approach of the sibling project is worth repeating.
- **Motion**: what animates — choice feedback, the month close, the crash — and what stays static.
- **Constraint**: mobile-first, three locales, one author. The load has to be affordable and every
  asset licence-clean, because a spec that presumes an illustrator is not buildable.
- **Verification**: what makes the art/audio section checkable rather than aspirational.

Output: the visual and audio direction, the asset plan, and the licence rule.

## Answer

Resolved over two grilling rounds.

**Direction in one line: typographic-first, illustrated at the beats.** The game is type, space and
money, with flat-vector art only where a moment earns it.

### Visual language

- **Type is the interface.** A single vertical column on a phone; hierarchy comes from size, weight
  and space rather than panels and chrome.
- **Illustration is rationed to about ten images** — the 4–6 spine beats (first payslip, the BNPL due
  date, the crash, the Fork) and the five stage-up cards. **Nothing per event card**, because 81
  cards is 81 illustrations and one author cannot draw them.
- **One accent colour, reserved for money and state.** The accent means *your money* and nothing
  else. Stages differ by typography and illustration, never by hue. Colour never carries meaning
  alone — which is what keeps [14 — Accessibility](14-accessibility.md) achievable.
- **Restrained motion**: choice feedback, the envelope bars moving, month-close counters ticking, and
  the crash drawing itself on the chart. Motion carries meaning; nothing decorates.
- **Light theme only in the MVP.** Stated as a scope boundary, not an oversight; dark mode is a v2
  question once the accent has been contrast-checked against one surface rather than two.

### The avatar

- **An abstract silhouette** — no face, no markers of gender or ethnicity; it ages by proportion and
  posture across the five Stages. Hand-authored SVG, a handful of paths, optionally tinted by the
  player so there is a small identity choice at no artwork cost.
- It appears as a small presence on the month screen and on stage-up cards — not as a scene
  character, and not as a stand-in for the player's decisions.

### Art assets

- **About ten illustrations**, sourced mixed: CC0 where a good one exists, our own simple shapes
  where it does not. Every source recorded either way.
- **No text baked into any image** — an image with words in it cannot be translated into it/ro, so
  the rule is absolute.
- **No photography, no 3D, no emoji as a cast** — emoji was considered and rejected as reading young
  for a 13–18 audience.

### Audio

- **SFX only, no music.** Behind a sound toggle, **off by default** — mobile autoplay blocks
  unprefixed audio anyway, and the events are what carry meaning.
- **Hybrid production**: synthesised Web Audio for the frequent micro-events (choice tap, envelope
  move, month tick, the failure thud) plus a handful of CC0 stings for the big ones (goal reached,
  the crash, the Fork, the end of the Run). Zero-asset for the sounds that fire constantly; real
  audio where it earns it.
- **Positive-only** where it matters: a wrong choice is answered with information, never with a
  punitive noise.
- **Audio is never load-bearing** — every sound has a visual counterpart, so the game is fully
  playable muted.

### Licences

| Category | Rule |
|---|---|
| Art and audio | **CC0 only**, every source in `ATTRIBUTION.md` |
| Icons and fonts | **Permissive allowed** — MIT / ISC / Apache-2.0, with a `NOTICE` file |
| Text and code | Our own |

Strict CC0 would have excluded Lucide, Feather and every good variable font; permissive licences
carry no attribution burden in the UI, so they are allowed for the things that need them while art
and audio hold the stricter line.

**Rule of thumb, recorded in the spec: if a licence requires a credit line *in the UI*, it does not
ship.**

### Type

- **One open variable font** for headings and numbers — chosen for tabular figures, because money is
  the game and the HUD is numbers.
- **System stack for body text**, so the body costs nothing.
- Number and date formatting is already settled by [07 — i18n](07-i18n.md).

### Verification

- Every shipped asset has a row in `ATTRIBUTION.md` with source URL and licence — a missing row is a
  failing check.
- No image contains rendered text; checked by review against the asset list.
- The accent is contrast-checked against the single light surface it ships on.
- Every sound has a visual counterpart, verified by playing a month muted.

### Inventory, for the spec

~10 illustrations · 1 silhouette (5 ages) · one small icon set · one variable display font ·
a synthesised SFX bank + ~4 CC0 stings.

### Consequence for other tickets

- **[14](14-accessibility.md)** must contrast-check the accent and confirm no state is signalled by
  colour alone.
- **[11](11-spec-assembly.md)** copies this section verbatim into the spec's art/audio direction.
