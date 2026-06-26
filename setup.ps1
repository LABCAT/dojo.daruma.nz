# Daruma Dojo — One-shot setup script
# Run from repo root: C:\Users\PC\Documents\WWW\react\dojo.daruma.nz
# ---------------------------------------------------------------

Write-Host "Setting up Daruma Dojo agent docs..." -ForegroundColor Cyan

# --- AGENTS.md (root) ---
@'
# Daruma Dojo — Monorepo Agent Rules

Pnpm + Turborepo monorepo for **Daruma Dojo** — Japanese-themed micro learning
apps and games by Daruma NZ (daruma.nz). Solo developer (Shane), Windows,
PowerShell. Read this file before doing anything.

## Stack

- **Package manager**: pnpm workspaces — never npm or yarn
- **Build**: Turborepo
- **Apps**: React Native + Expo (Expo Router, EAS Build)
- **Styling**: NativeWind v4 + Tailwind CSS v3
- **Storage**: MMKV for local persistence
- **Language**: TypeScript strict mode everywhere — no `any`, no `.js` files

## Monorepo Structure

```
dojo.daruma.nz/
├── AGENTS.md
├── DESIGN.md
├── apps/
│   └── multiplication-dojo/   # nz.daruma.dojo.multiplicationdojo
└── packages/
    └── ui/                    # @daruma/ui — shared components + theme
```

## Commands

```powershell
pnpm install                                   # install all deps
pnpm --filter multiplication-dojo start        # start dev server
pnpm --filter multiplication-dojo android      # run on Android
pnpm --filter multiplication-dojo ios          # run on iOS
pnpm build                                     # turbo build all
pnpm lint                                      # turbo lint all
pnpm typecheck                                 # turbo typecheck all
```

## Rules

- Always use `pnpm --filter <app> add <pkg>` for app deps
- Always use `pnpm add -Dw <pkg>` for root/dev deps
- Never import between apps — always go through `@daruma/ui`
- Never commit `.env` files
- Never override React Native or React versions manually
- Never use `expo-cli` — use `npx expo` instead
- Bundle IDs: `nz.daruma.dojo.<appname>` (e.g. `nz.daruma.dojo.multiplicationdojo`)

## Adding a New App

1. `cd apps && npx create-expo-app <name> --template blank-typescript`
2. Set name in `package.json` to match folder
3. Add `"@daruma/ui": "workspace:*"` to dependencies
4. Configure `metro.config.js` for monorepo (see multiplication-dojo as reference)
5. Add NativeWind following existing app config
6. Create `eas.json` with bundle ID `nz.daruma.dojo.<appname>`
7. Add scripts to root `package.json`
'@ | Set-Content AGENTS.md -Encoding UTF8

# --- DESIGN.md (root) ---
@'
# Daruma Dojo — Design System

Japanese samurai aesthetic. Dark, cinematic, dramatic. Ink, stone, steel.
NOT cartoon, NOT child-like, NOT bright/playful. Think: a dojo at midnight.

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
- Current rank: gold border `border-primary`, full colour
- Completed ranks: gold checkmark overlay

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
- Rank unlock: full-screen gold burst, weapon reveals from centre
- Screen transitions: fade or slide — never bounce/elastic (too playful)

## What NOT to Do

- No bright backgrounds — dark mode only
- No rounded avatars or cartoon characters
- No emoji in UI (Japanese characters only for authenticity)
- No pastel colours
- No drop shadows (use borders instead)
- No gradients except subtle dark-to-darker on background panels
'@ | Set-Content DESIGN.md -Encoding UTF8

# --- apps/multiplication-dojo/AGENTS.md ---
New-Item -ItemType Directory -Force -Path apps\multiplication-dojo | Out-Null
@'
# Multiplication Dojo — App Agent Rules

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
├── _layout.tsx          # Root layout — import global.css here
├── index.tsx            # Home screen
├── (dojo)/
│   ├── _layout.tsx
│   ├── index.tsx        # Dojo Mode — difficulty + rank overview
│   └── challenge.tsx    # Active challenge screen
├── (practice)/
│   ├── _layout.tsx
│   └── index.tsx        # Practice Mode screen
└── rank-unlock.tsx      # Rank unlock celebration (modal)
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
  { id: 1, name: 'Bokken',    japanese: '木刀'  },
  { id: 2, name: 'Tanto',     japanese: '短刀'  },
  { id: 3, name: 'Wakizashi', japanese: '脇差'  },
  { id: 4, name: 'Katana',    japanese: '刀'    },
  { id: 5, name: 'Nodachi',   japanese: '野太刀' },
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
- Questions are fully randomised — never sequential
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

## Screens — Behaviour Spec

### Home (`app/index.tsx`)
- App logo / title centred
- Difficulty selector (4 preset buttons — highlight active)
- Two CTAs: "Enter the Dojo" → Dojo Mode, "Practice" → Practice Mode
- Show current weapon rank for selected difficulty

### Dojo Mode (`app/(dojo)/index.tsx`)
- Vertical rank progression (5 weapon ranks)
- Locked / current / complete states per rank
- Tap current rank → challenge screen
- Cannot skip ranks

### Challenge Screen (`app/(dojo)/challenge.tsx`)
- Large question: `{a} × {b} = ?`
- Custom number pad input (no system keyboard)
- Submit button
- Progress indicator: `3 / 20` + score `2 correct`
- On pass: navigate to rank-unlock screen
- On fail: retry prompt with score shown

### Practice Mode (`app/(practice)/index.tsx`)
- Same as challenge screen but:
  - Uses selected difficulty preset
  - No rank progression — infinite questions
  - Shows running score only
  - "End Session" button to quit

### Rank Unlock (`app/rank-unlock.tsx`)
- Full screen celebration
- Weapon name large (English + Japanese)
- Gold animation
- "Continue" → back to Dojo Mode

## What NOT to Do

- No system keyboard for number input — use custom number pad
- No time pressure in v1
- No backend calls — everything is local
- No skip rank functionality
- Never reveal correct answer before user submits (only after wrong answer)
'@ | Set-Content apps\multiplication-dojo\AGENTS.md -Encoding UTF8

# --- packages/ui/AGENTS.md ---
New-Item -ItemType Directory -Force -Path packages\ui | Out-Null
@'
# @daruma/ui — Shared UI Package Rules

Shared component library for all Daruma Dojo apps. Read `../../AGENTS.md` and
`../../DESIGN.md` first.

## Purpose

Single source of truth for:
- Design tokens (colours, spacing, typography)
- Reusable components (Button, Text, Card, etc.)
- Game constants (weapon ranks, difficulty presets)
- MMKV storage helpers

## Package Structure

```
packages/ui/
├── index.ts              # Re-export everything
├── components/
│   ├── Text.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   └── WeaponRankBadge.tsx
├── theme/
│   └── tokens.ts         # Colours, ranks, presets as const
└── storage/
    └── index.ts          # Typed MMKV wrappers
```

## Rules

- Export everything from `index.ts` — no deep imports from apps
- All components must accept `className` prop for NativeWind overrides
- All components must be typed — no implicit `any`
- Peer deps only: `react` and `react-native` — never install these here
- No app-specific logic — this package must be reusable across all Dojo apps
- Test every new component in `multiplication-dojo` before considering it stable

## Adding a New Component

1. Create `packages/ui/components/ComponentName.tsx`
2. Export from `packages/ui/index.ts`
3. Follow DESIGN.md for all visual decisions
4. Accept and forward `className` prop for NativeWind customisation
5. Document props with TypeScript interface — no inline type literals

## Storage Helpers

All MMKV access goes through typed wrappers in `packages/ui/storage/index.ts`.
Never use raw string keys inline in app code.

```ts
// Correct
import { getRankStatus, setRankStatus } from '@daruma/ui/storage'

// Wrong
storage.getString('daruma:dojo:ashigaru:3')
```
'@ | Set-Content packages\ui\AGENTS.md -Encoding UTF8

# --- Install Expo official skills ---
Write-Host "`nInstalling official Expo agent skills..." -ForegroundColor Cyan
npx skills@latest add expo/skills --skill '*'

# --- Install React Native best practices skills ---
Write-Host "`nInstalling React Native best practices skills..." -ForegroundColor Cyan
npx skills@latest add callstackincubator/agent-skills --skill react-native-best-practices

# --- Git commit ---
Write-Host "`nCommitting docs to git..." -ForegroundColor Cyan
git add .
git commit -m "docs: add agent rules, design system, and install Expo + RN skills"
git push origin main

Write-Host "`nDone! Your repo is now agent-ready." -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  AGENTS.md"
Write-Host "  DESIGN.md"
Write-Host "  apps/multiplication-dojo/AGENTS.md"
Write-Host "  packages/ui/AGENTS.md"
Write-Host "`nSkills installed for Antigravity, Cursor, Claude Code, and more." -ForegroundColor Yellow