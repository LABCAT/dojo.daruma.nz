# Daruma Dojo â€” Design System

Japanese samurai aesthetic. Dark, cinematic, dramatic. Ink, stone, steel.
NOT cartoon, NOT child-like, NOT bright/playful. Think: a dojo at midnight.

## Colour Palette

| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| `background`    | `#0A0A0A` | Screen backgrounds             |
| `surface`       | `#141414` | Cards, panels, modals          |
| `border`        | `#2A2A2A` | Subtle dividers                |
| `primary`       | `#C9A84C` | Gold â€” rank, achievement, CTA  |
| `primary-dim`   | `#8A6F2E` | Muted gold â€” inactive states   |
| `accent`        | `#8B1A1A` | Blood red â€” wrong answer       |
| `accent-bright` | `#E53535` | Bright red â€” alerts            |
| `text`          | `#F0EDE8` | Primary text (warm white)      |
| `text-muted`    | `#8A8580` | Secondary / helper text        |
| `success`       | `#2D6A2D` | Correct answer                 |
| `success-bright`| `#4CAF50` | Success states                 |

## Typography

- Headings: bold, `tracking-wide`, uppercase
- Body: clean, adequate line height, warm white
- Question numbers: extra large (`text-6xl`+), bold, centred, high contrast
- Japanese characters: display at ~60% of the English label size alongside

## Spacing & Layout

- Base padding: `p-4` (16px)
- Card radius: `rounded-lg`
- Screen safe area: always use `SafeAreaView` or `useSafeAreaInsets`
- Full-screen layouts preferred â€” no scroll on challenge screens

## Component Patterns

### Screen Layout
```tsx
<SafeAreaView className="flex-1 bg-background">
  <View className="flex-1 px-4 py-6">
    {/* content */}
  </View>
</SafeAreaView>
```

### Primary Button
```
bg-primary, rounded-lg, px-6 py-4
text: text-background (dark), font-bold, uppercase, tracking-wider
```

### Ghost Button
```
border border-border, rounded-lg, px-6 py-4
text: text-text, font-bold, uppercase
```

### Card / Panel
```
bg-surface, rounded-lg, border border-border, p-4
```

### Question Display
```
text-6xl font-bold text-text text-center â€” the multiplication question
text-2xl text-text-muted text-center â€” operator symbols
```

## Weapon Rank System

Progress within each difficulty level. Display weapon name + Japanese:

| Rank | Weapon    | Japanese | Icon hint          |
|------|-----------|----------|--------------------|
| 1    | Bokken    | æœ¨åˆ€     | Wooden rod shape   |
| 2    | Tanto     | çŸ­åˆ€     | Short dagger       |
| 3    | Wakizashi | è„‡å·®     | Medium blade       |
| 4    | Katana    | åˆ€       | Curved long blade  |
| 5    | Nodachi   | é‡Žå¤ªåˆ€   | Great sword        |

- Locked ranks: `opacity-40`, greyscale
- Current rank: gold border `border-primary`, full colour
- Completed ranks: gold checkmark overlay

## Difficulty Presets

| Preset   | Japanese meaning | Range  |
|----------|-----------------|--------|
| Ashigaru | Foot soldier    | 1â€“10   |
| Samurai  | Warrior         | 1â€“20   |
| Ronin    | Masterless      | 1â€“50   |
| Shogun   | Supreme command | 1â€“100  |

Display preset name large, range small below in `text-muted`.

## Animations

- Correct answer: brief green flash on question container + scale up tick
- Wrong answer: red flash + subtle shake animation
- Rank unlock: full-screen gold burst, weapon reveals from centre
- Screen transitions: fade or slide â€” never bounce/elastic (too playful)

## What NOT to Do

- No bright backgrounds â€” dark mode only
- No rounded avatars or cartoon characters
- No emoji in UI (Japanese characters only for authenticity)
- No pastel colours
- No drop shadows (use borders instead)
- No gradients except subtle dark-to-darker on background panels
