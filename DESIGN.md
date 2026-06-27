# Daruma Dojo — Design System

Japanese samurai aesthetic. Dark, cinematic, dramatic. Ink, stone, steel.
NOT cartoon, NOT child-like, NOT bright/playful. Think: a dojo at midnight.

## Premium Aesthetic Rules
- **Dynamic Theming Context**: UI components MUST consume the current difficulty theme (`getDifficultyTheme()`). Base gold (`#C9A84C`) should only be used as a fallback. Accents, active borders, and highlights must shift dynamically based on whether the user is playing Ashigaru, Samurai, Ronin, or Shogun.
- **Tactile Micro-interactions**: The UI should feel like forged steel or carved stone. Every interactive element MUST have `active:` states that visually respond (e.g. background color shifts to `theme.primaryDim` or a darker `#2A2A2A` active surface). 
- **Depth & Texture**: Do not use drop shadows. Instead, use varying border opacities (`border`, `border-t`, `border-b`) or subtle `bg-surface` layering to emulate 3D lighting without the cheap feel of CSS shadows.

## Colour Palette

| Token           | Hex       | Usage                          |
|-----------------|-----------|--------------------------------|
| `background`    | `#0A0A0A` | Screen backgrounds             |
| `surface`       | `#141414` | Cards, panels, modals          |
| `border`        | `#2A2A2A` | Subtle dividers                |
| `primary`       | `#C9A84C` | Gold — rank, achievement, CTA  |
| `primary-dim`   | `#8A6F2E` | Muted gold — inactive states   |
| `accent`        | `#8B1A1A` | Blood red — wrong answer       |
| `accent-bright` | `#E53535` | Bright red — alerts            |
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
- Full-screen layouts preferred — no scroll on challenge screens

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
// Must use dynamic theme primary/primaryDim where applicable!
bg-primary, rounded-lg, px-6 py-4
active:scale-95 active:bg-primary-dim transition-transform
text: text-background (dark), font-bold, uppercase, tracking-wider
```

### Ghost Button
```
// Must use dynamic theme primary/primaryDim for borders!
border border-border, bg-transparent, rounded-lg, px-6 py-4
active:bg-surface transition-colors
text: text-text, font-bold, uppercase
```

### Card / Panel
```
bg-surface, rounded-lg, border border-border, p-4
// Add subtle active states if interactive: active:bg-[#1a1a1a]
```

### Question Display
```
text-6xl font-bold text-text text-center — the multiplication question
text-2xl text-text-muted text-center — operator symbols
```

## Weapon Rank System

Progress within each difficulty level. Display weapon name + Japanese:

| Rank | Weapon    | Japanese | Icon hint          |
|------|-----------|----------|--------------------|
| 1    | Bokken    | 木刀     | Wooden rod shape   |
| 2    | Tanto     | 短刀     | Short dagger       |
| 3    | Wakizashi | 脇差     | Medium blade       |
| 4    | Katana    | 刀       | Curved long blade  |
| 5    | Nodachi   | 野太刀   | Great sword        |

- Locked ranks: `opacity-40`, greyscale
- Current rank: dynamic theme border `border-[theme.primary]`, full colour
- Completed ranks: dynamic theme checkmark overlay

## Difficulty Presets

| Preset   | Japanese meaning | Range  |
|----------|-----------------|--------|
| Ashigaru | Foot soldier    | 1–10   |
| Samurai  | Warrior         | 1–20   |
| Ronin    | Masterless      | 1–50   |
| Shogun   | Supreme command | 1–100  |

Display preset name large, range small below in `text-muted`.

## Animations

- Correct answer: brief green flash on question container + scale up tick
- Wrong answer: red flash + subtle shake animation
- Rank unlock: full-screen dynamic theme burst, weapon reveals from centre
- Screen transitions: fade or slide — never bounce/elastic (too playful)
- Buttons/Keys: `active:scale-95` or background color shift for immediate tactile response

## What NOT to Do

- No bright backgrounds — dark mode only
- No hardcoded base gold (`#C9A84C`) when a dynamic theme is available!
- No rounded avatars or cartoon characters
- No emoji in UI (Japanese characters only for authenticity)
- No pastel colours
- No drop shadows (use borders instead)
- No gradients except subtle dark-to-darker on background panels
