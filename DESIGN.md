# Daruma Dojo — Design System

Japanese **anime / arcade game** aesthetic. Bright, energetic, satisfying —
like a mobile training game or shōnen power-up screen. **Fun for kids, sharp
enough for adults.**

Still Japanese-themed (weapons, kanji, dojo framing). **Not** grim midnight
samurai. **Not** corporate ed-tech grey.

## Design north star

- **Exciting** — colour, motion, feedback when you succeed
- **Readable** — big numbers, high contrast, obvious CTAs
- **Shippable** — polish in layers; never block release on perfect art

Reference feel: anime battle UI, mobile gacha training screens, rhythm-game
hit feedback — **not** dark cinematic letterboxing.

## Premium rules

- **Dynamic theming**: Use `getDifficultyTheme(preset)` and `getRankColor(preset, rankId)` everywhere. Base gold (`#C9A84C`) is fallback only.
- **Rank colours are the hero**: Each weapon rank has its own saturated colour in `theme.ranks[]`. Use them for buttons, glows, progress, and celebration — not flat gold.
- **Tactile feedback**: Buttons and keys must respond on press (`scale`, colour shift, or both). Correct answers should **feel good** (flash + motion).
- **Depth without mud**: Prefer **soft glow + tinted panels** over pure black-on-black. Subtle gradients and coloured ambient backgrounds are OK.

## Colour palette (global tokens)

| Token            | Hex       | Usage                              |
|------------------|-----------|------------------------------------|
| `background`     | `#0F0F18` | Screen base — dark blue-black, not pure `#000` |
| `surface`        | `#1C1C28` | Cards, panels                      |
| `surface-bright` | `#252536` | Elevated / active cards            |
| `border`         | `#3A3A50` | Visible but soft dividers          |
| `primary`        | `#C9A84C` | Fallback gold only                 |
| `primary-dim`    | `#8A6F2E` | Pressed / muted gold               |
| `accent`         | `#8B1A1A` | Wrong answer                       |
| `accent-bright`  | `#E53535` | Wrong answer highlight             |
| `text`           | `#F0EDE8` | Primary text                       |
| `text-muted`     | `#8A8580` | Secondary text                     |
| `success`        | `#2D6A2D` | Correct (subtle)                   |
| `success-bright` | `#4CAF50` | Correct (pop)                      |

Add `surface-bright` to `tailwind.config.js` when implementing design pass.

## Difficulty themes & rank sub-colours

Each preset has a **primary** (path identity) and **five rank colours** (weapon
progression). Rank colours are **intentionally varied** — each weapon tier feels
like a new “form”, not just a tint of the path colour. They should still read as
**escalation** ( trainee → master ), not random noise.

| Preset   | Path vibe        | Rank progression idea                          |
|----------|------------------|-----------------------------------------------|
| Ashigaru | Copper / earth   | Wood → steel → bronze → silver → gold         |
| Samurai  | Steel blue       | Cool blues → electric → neon → royal → climax |
| Ronin    | Crimson          | Ember → flame → gold → blood → void           |
| Shogun   | Royal purple     | Arcane → cyan → magenta → solar → white mastery |

Do **not** flatten rank colours to `primary` tints unless explicitly redesigning
`packages/ui/theme/tokens.ts`.

## Typography

- Headings: bold, uppercase or wide tracking — **game menu** energy
- Body: clean, warm white, generous line height
- Question numbers: **huge** (`72px+`), bold, centre stage
- Japanese (kanji): bold, can be **larger** on celebration screens — anime title card energy
- Avoid wall-of-small-caps grey text on dark cards

## Spacing & layout

- Base padding: `p-4`
- Card radius: `rounded-xl` or `rounded-2xl` for softer, game-y panels
- Always `SafeAreaView` / safe area insets
- Challenge: question dominates; support UI stays compact

## Component patterns

### Ambient background (screens)

Soft **coloured glow** behind content using path or rank colour at low opacity
(e.g. 10–20%). Stops screens feeling like a void.

```tsx
// Example: large blurred circle behind hero content
<View style={{ position: 'absolute', width: 280, height: 280, borderRadius: 140,
  backgroundColor: theme.primary, opacity: 0.12, top: -40, left: -60 }} />
```

### Primary button

- Fill: `rankColor` or `theme.primary`
- Chunky: `py-4`, `rounded-xl`
- Press: `scale(0.97)` + slight opacity dip
- Optional: light top highlight (`borderTopColor: rgba(255,255,255,0.35)`)
- **NativeWind on Pressable**: put 3D/bevel styles on inner `<View>`, not Pressable (see below)

### Cards (Dojo rank list, home summary)

- `surface` or `surface-bright` background
- **Current rank**: bright border in rank colour + tinted fill (`rankColor + '20'`)
- **Complete**: rank colour accents + check — use `<View>`, not disabled `Pressable`
- **Locked**: dimmed but still **colourful** — show what they’re missing (no greyscale)

### Question display

- Numbers: 72px+, white or near-white
- `×`: rank colour, 32px+
- Answer box: compact, clear border in rank colour when active

## Arcade symbology (no custom art)

Identity comes from **Lucide icons + kanji + rank colours** — not bespoke SVG,
mon crests, or emoji. All icon names live in `packages/ui/theme/tokens.ts`.

### Path icons (difficulty presets)

Each path has a distinct Lucide icon in `PRESETS[].icon`:

| Preset   | Icon (Lucide) | Role on screen                          |
|----------|---------------|-----------------------------------------|
| Ashigaru | Footprints    | “First steps” — training path badge     |
| Samurai  | Swords        | Standard warrior path                   |
| Ronin    | Flame         | Wild / masterless energy                |
| Shogun   | Crown         | Ultimate command path                   |

Show path icon on **home** (current path), **Change Path** list, and **Dojo**
header. Render inside a **circular medallion**: `theme.primary` border, tinted
fill, icon at 24–32px.

### Rank icons (weapon tiers)

Each rank has `RANKS[].icon` + `RANKS[].japanese`. Use on **every** rank surface:

| Rank | Weapon    | Icon (Lucide) | Japanese |
|------|-----------|---------------|----------|
| 1    | Bokken    | Flame         | 木刀     |
| 2    | Tanto     | Shield        | 短刀     |
| 3    | Wakizashi | Sword         | 脇差     |
| 4    | Katana    | Swords        | 刀       |
| 5    | Nodachi   | Crown         | 野太刀   |

**Medallion pattern** (home badge, Dojo row, celebration hero):

```tsx
// Resolve icon: (LucideIcons as Record<string, LucideIcon>)[rank.icon]
<View style={{
  width: 48, height: 48, borderRadius: 24,
  borderWidth: 2, borderColor: rankColor,
  backgroundColor: rankColor + '22',
  alignItems: 'center', justifyContent: 'center',
}}>
  <RankIcon size={28} color={rankColor} />
</View>
```

- **Dojo list**: rank medallion left of name; kanji beside English name (not
  hidden in muted footnote).
- **Celebration**: medallion 64–80px; kanji **large** (title-card size).
- **Challenge header**: small rank icon (20–24px) next to rank name.
- **Status icons** (Lock, Check, ChevronRight): secondary — rank medallion is
  the hero.

Resolve Lucide components dynamically from the string in tokens — same pattern
as home screen today. No new icon packages.

## Animations

| Moment           | Feel                                              |
|------------------|---------------------------------------------------|
| Correct answer   | Slash or burst + green flash + scale pop (existing OK, can punch up saturation) |
| Wrong answer     | Shake + red flash                                 |
| Rank unlock      | **Big** — flash, scale, hold 1–2s, then Continue  |
| Button press     | Quick scale                                       |
| Screen transition| Fade or slide — **light ease-out OK** on celebration |

Use `useNativeDriver: true` for transform/opacity. Avoid long chained sequences
that block shipping.

**Do not** add new animation libraries for v1.

## Visual hierarchy — challenge

| Element          | Size / treatment                          |
|------------------|-------------------------------------------|
| Question a, b    | 72px+, dominant                           |
| ×                | 32px+, rank colour                        |
| Answer input     | 36–40px                                   |
| Score (header)   | 24px+, rank colour, bold                  |
| Rank name header | Centred, rank colour                      |

## NativeWind + Pressable (critical)

NativeWind may strip dynamic styles on `<Pressable>`. For 3D buttons:

1. `Pressable` handles hit area only
2. Inner `<View>` gets background, borders, shadow/glow
3. Disabled = lower opacity, **same shape** (not flat)

## Dojo rank list (critical)

Only **current** rank is `Pressable`. Complete and locked rows are `<View>`.
Never `<Pressable disabled={true}>` — causes crashes. See `docs/DEBUGGING.md`.

## What NOT to do

- No pure `#0A0A0A` empty screens without ambient colour
- No “stealth mode” UI — if it’s important, make it **visible and coloured**
- No disabled `Pressable` for non-tappable list rows
- No hardcoded gold when rank colour exists
- No new navigation/storage refactors during design-only passes
- No emoji in UI (kanji + icons only)
- No scope creep: design pass ≠ rewrite game logic

## Ship-first polish tiers

**Tier 1 (do before store):** ambient glow, brighter surfaces, rank-colour CTAs,
**path + rank medallions on all core screens**, kanji visible on rank cards,
celebration overlay punch-up, home + dojo card contrast.

**Tier 2 (nice later):** custom mon/SVG art, particles, sound, Lottie.

**Tier 3 (defer):** full art pass, illustrated backgrounds, character mascot.

Prompt 11 targets **Tier 1 only**.
