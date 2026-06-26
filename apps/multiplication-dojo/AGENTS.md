# Multiplication Dojo â€” App Agent Rules

First Daruma Dojo app. Gamified times tables for all ages with Japanese samurai
theme. Read `../../AGENTS.md` and `../../DESIGN.md` first.

## App Identity

- **Bundle ID**: `nz.daruma.dojo.multiplicationdojo`
- **Package name**: `multiplication-dojo`
- **Platforms**: Android first (EAS cloud build), iOS later

## Key Dependencies

```json
{
  "expo": "latest stable",
  "expo-router": "latest",
  "nativewind": "^4",
  "tailwindcss": "^3",
  "react-native-mmkv": "latest",
  "react-native-reanimated": "latest",
  "react-native-safe-area-context": "latest",
  "@daruma/ui": "workspace:*"
}
```

## Screen Structure (Expo Router)

```
app/
â”œâ”€â”€ _layout.tsx          # Root layout â€” import global.css here
â”œâ”€â”€ index.tsx            # Home screen
â”œâ”€â”€ (dojo)/
â”‚   â”œâ”€â”€ _layout.tsx
â”‚   â”œâ”€â”€ index.tsx        # Dojo Mode â€” difficulty + rank overview
â”‚   â””â”€â”€ challenge.tsx    # Active challenge screen
â”œâ”€â”€ (practice)/
â”‚   â”œâ”€â”€ _layout.tsx
â”‚   â””â”€â”€ index.tsx        # Practice Mode screen
â””â”€â”€ rank-unlock.tsx      # Rank unlock celebration (modal)
```

## Game Logic

### Difficulty Presets
```ts
const PRESETS = {
  ashigaru: { label: 'Ashigaru', max: 10 },
  samurai:  { label: 'Samurai',  max: 20 },
  ronin:    { label: 'Ronin',    max: 50 },
  shogun:   { label: 'Shogun',   max: 100 },
} as const
```

### Weapon Ranks (per difficulty)
```ts
const RANKS = [
  { id: 1, name: 'Bokken',    japanese: 'æœ¨åˆ€'  },
  { id: 2, name: 'Tanto',     japanese: 'çŸ­åˆ€'  },
  { id: 3, name: 'Wakizashi', japanese: 'è„‡å·®'  },
  { id: 4, name: 'Katana',    japanese: 'åˆ€'    },
  { id: 5, name: 'Nodachi',   japanese: 'é‡Žå¤ªåˆ€' },
]
```

### Question Generation
```ts
function generateQuestion(max: number): { a: number; b: number; answer: number } {
  const a = Math.floor(Math.random() * max) + 1
  const b = Math.floor(Math.random() * max) + 1
  return { a, b, answer: a * b }
}
```

### Challenge Format
- 20 random questions per rank attempt
- Pass condition: 16/20 correct (80%)
- Questions are fully randomised â€” never sequential
- No time limit in v1 (add in v2)
- Wrong answers shown immediately with correct answer revealed

### Progress Storage (MMKV)
```ts
// Key pattern: daruma:dojo:<preset>:<rankId>
// Value: 'locked' | 'current' | 'complete'
storage.set(`daruma:dojo:${preset}:${rankId}`, status)

// Current difficulty
storage.set('daruma:dojo:difficulty', presetId)
```

## Screens â€” Behaviour Spec

### Home (`app/index.tsx`)
- App logo / title centred
- Difficulty selector (4 preset buttons â€” highlight active)
- Two CTAs: "Enter the Dojo" â†’ Dojo Mode, "Practice" â†’ Practice Mode
- Show current weapon rank for selected difficulty

### Dojo Mode (`app/(dojo)/index.tsx`)
- Vertical rank progression (5 weapon ranks)
- Locked / current / complete states per rank
- Tap current rank â†’ challenge screen
- Cannot skip ranks

### Challenge Screen (`app/(dojo)/challenge.tsx`)
- Large question: `{a} Ã— {b} = ?`
- Custom number pad input (no system keyboard)
- Submit button
- Progress indicator: `3 / 20` + score `2 correct`
- On pass: navigate to rank-unlock screen
- On fail: retry prompt with score shown

### Practice Mode (`app/(practice)/index.tsx`)
- Same as challenge screen but:
  - Uses selected difficulty preset
  - No rank progression â€” infinite questions
  - Shows running score only
  - "End Session" button to quit

### Rank Unlock (`app/rank-unlock.tsx`)
- Full screen celebration
- Weapon name large (English + Japanese)
- Gold animation
- "Continue" â†’ back to Dojo Mode

## What NOT to Do

- No system keyboard for number input â€” use custom number pad
- No time pressure in v1
- No backend calls â€” everything is local
- No skip rank functionality
- Never reveal correct answer before user submits (only after wrong answer)
