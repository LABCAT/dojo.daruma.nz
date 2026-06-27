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

- Each rank MUST use its own sub-theme color from `theme.ranks[rankIndex]` to create a visual progression.
- Locked ranks: visible but dimmed (e.g. `opacity-70`), clearly showing the requirements so the player is motivated. Do NOT use greyscale.
- Current rank: vibrant glowing borders using the rank's specific color, slightly tinted background.
- Completed ranks: rank color checkmark, prominent but less visually demanding than the current rank.

## Difficulty Presets

| Preset   | Japanese meaning | Range  |
|----------|-----------------|--------|
| Ashigaru | Foot soldier    | 1–10   |
| Samurai  | Warrior         | 1–20   |
| Ronin    | Masterless      | 1–50   |
| Shogun   | Supreme command | 1–100  |

Display preset name large, range small below in `text-muted`.

## Animations — General

- Correct answer: brief green flash on question container + scale up tick
- Wrong answer: red flash + subtle shake animation
- Rank unlock: full-screen dynamic theme burst, weapon reveals from centre
- Screen transitions: fade or slide — never bounce/elastic (too playful)
- Buttons/Keys: `active:scale-95` or background color shift for immediate tactile response

## Visual Hierarchy — Challenge Screens

The question is king. Nothing competes with it. Follow this sizing hierarchy:

| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Question numbers (a, b) | 72px+ (font-size) | The dominant element on screen — impossible to ignore |
| Answer input display | 36–40px | Clear but secondary to question |
| × operator symbol | 32–36px | Styled in rank color, not muted |
| = ? | 24–28px | Text-muted, suggestive |
| Question counter | 14px label, 18px number | Number in rank color, label in text-muted |
| Score display (header) | 24–26px for count | Bold, rank-colored. Must be readable at a glance |
| Header rank name | 14–15px | Truly centred (absolute overlay), tracked, uppercase, rank-colored |

The answer display box must be compact — just enough to wrap the number.
Do NOT make it a large card. `paddingVertical: 10–12px`, `minWidth: 140px`.

### Rank Color Usage

Each weapon rank within a difficulty theme has its own color defined in
`difficultyThemes[preset].ranks[rankIndex]`. This rank-specific color **MUST**
be used as the dominant accent throughout the challenge screen:

- Submit button background
- Progress bar fill
- × operator symbol color
- Question counter number
- Score count in header
- Header rank name
- Slash animation color

The base `theme.primary` should only appear in pressed/disabled fallback states.
Never use a flat gold (#C9A84C) when a rank-specific color is available.

## Advanced Styling & Layout Fixes

### 3D Buttons & NativeWind Bugs
NativeWind (v4/Tailwind) frequently strips or ignores dynamic inline styles on React Native `<Pressable>` components (e.g. `style={({ pressed }) => ({...})}`). 
To build premium 3D buttons (like Submit):
1. **Bypass NativeWind** for the styling: Wrap the inner content of the `Pressable` in a standard `<View>`. Apply all backgrounds, shadows, and dynamic borders directly to this inner `<View>`.
2. **Always retain geometry**: Disabled states must NOT remove borders or shadows. A disabled button is just dim (`opacity: 0.35`), it is never flat. 
3. **Bevels & Shadows**: Buttons must look premium. Use `borderTopWidth: 1.5` with a white semi-transparent color for a glass-morphic highlight, and `borderBottomWidth: 4` with a black semi-transparent color for a physical lip. Add a heavy glowing drop shadow (`shadowColor: rankColor`).

### Optical Illusions in Layout
When centring small text (like `= ?`) beneath massive text (like a `72px+` question), the massive text has invisible line-height padding below its baseline. If you use equal vertical margins on the `= ?`, it will look misaligned. You must use uneven margins (e.g., `marginTop: 4`, `marginBottom: 24`) to achieve *optical* vertical centring.

## Animations — Combat Feel

### Correct Answer: Sword Slash
When a correct answer is submitted, a diagonal slash cuts across the question
area — a thin white blade line (2px) with a wider rank-colored glow (10px)
behind it. The slash scales outward from the centre (`scaleX` 0→1) at ~−28°,
creating the impression of a blade cutting through. Duration: 200–300ms.
Combined with a subtle scale pulse (1→1.1→1) on the answer display.

### Wrong Answer: Shake
The answer box shakes horizontally — 3 damped oscillations (±14→±10→±5→0px)
over ~300ms. No slash. The red danger background provides the emotional weight.

### Screen Transitions
Fade only. Never bounce or elastic — too playful for this aesthetic.

## What NOT to Do

- No bright backgrounds — dark mode only
- No hardcoded base gold (`#C9A84C`) when a dynamic theme is available!
- No rounded avatars or cartoon characters
- No emoji in UI (Japanese characters only for authenticity)
- No pastel colours
- No drop shadows (use borders instead)
- No gradients except subtle dark-to-darker on background panels
