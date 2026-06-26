# Daruma Dojo — Agent Rules

You are a coding agent working on the **Daruma Dojo** monorepo, a portfolio of
micro learning apps and games built by a solo developer (Shane) under the brand
**Daruma NZ** (daruma.nz). This repo (`dojo.daruma.nz`) contains all Daruma
Dojo sub-brand apps — gamified micro-learning experiences with a Japanese
aesthetic.

---

## Monorepo Structure

```
dojo.daruma.nz/
├── apps/
│   └── multiplication-dojo/   # First app — Multiplication Dojo
├── packages/
│   └── ui/                    # Shared @daruma/ui package
│       ├── components/        # Shared components
│       ├── theme/             # Shared design tokens & theme
│       └── index.ts
├── AGENTS.md                  # This file
├── package.json               # Root workspace package.json
├── pnpm-workspace.yaml        # pnpm workspace config
├── .npmrc                     # Hoisted deps config for React Native
└── turbo.json                 # Turborepo config
```

---

## Tech Stack

### Package Manager
- **pnpm** with workspaces
- Always use `pnpm` — never npm or yarn
- Always install app-specific deps with `--filter`: `pnpm --filter <app> add <pkg>`
- Always install shared/root deps with `-w`: `pnpm add -Dw <pkg>`

### Mobile Framework
- **Expo SDK** (latest stable) with **Expo Router** (file-based routing)
- **React Native** (version managed by Expo SDK — never override)
- **EAS Build** for production builds and App Store submission
- Target platforms: iOS and Android

### Styling
- **NativeWind v4+** with Tailwind CSS v3
- All styling via `className` props — no inline StyleSheet objects unless
  absolutely necessary for animated values
- Dark mode first — all screens default to dark theme
- Theme tokens defined in `packages/ui/theme/` and consumed via Tailwind config

### Shared Package (`@daruma/ui`)
- All reusable components live here
- Consumed by all apps in `apps/`
- Never import directly between apps — always go through `@daruma/ui`
- Export everything from `packages/ui/index.ts`

### State Management
- **MMKV** for local persistent storage (progress, settings, scores)
- React state (`useState`, `useReducer`) for ephemeral UI state
- No global state library needed for v1 apps

### Navigation
- **Expo Router** file-based routing in all apps
- Tab navigation for main app shell where needed
- Stack navigation for flows within tabs

---

## Brand & Design System

### Daruma Dojo Identity
- Sub-brand of Daruma NZ
- Japanese martial arts / samurai aesthetic
- Dark, cinematic, dramatic — NOT cartoon or child-like
- Ink, stone, steel, brushstroke textures
- Typography: bold, strong, high contrast

### Colour Palette (Dark Mode First)
```
background:     #0A0A0A   (near black)
surface:        #141414   (card/panel backgrounds)
border:         #2A2A2A   (subtle borders)
primary:        #C9A84C   (gold — achievement, rank)
primary-dim:    #8A6F2E   (muted gold)
accent:         #8B1A1A   (blood red — danger, wrong answer)
accent-bright:  #E53535   (bright red — alerts)
text:           #F0EDE8   (warm white)
text-muted:     #8A8580   (secondary text)
success:        #2D6A2D   (correct answer green)
success-bright: #4CAF50
```

### Typography
- Headings: bold, tracking-wide, uppercase where appropriate
- Body: clean, readable, adequate line height
- Numbers (for questions): extra large, high contrast, centre-aligned

### Weapon Rank System (Multiplication Dojo)
Ranks earned within each difficulty level:
1. Bokken (木刀) — wooden sword
2. Tanto (短刀) — dagger
3. Wakizashi (脇差) — short sword
4. Katana (刀) — sword
5. Nodachi (野太刀) — great sword

### Difficulty Presets (Multiplication Dojo)
| Preset    | Range   |
|-----------|---------|
| Ashigaru  | 1–10    |
| Samurai   | 1–20    |
| Ronin     | 1–50    |
| Shogun    | 1–100   |

---

## Coding Conventions

### General
- **TypeScript** everywhere — no `.js` files
- Strict mode enabled
- Named exports preferred over default exports (except Expo Router screens)
- No `any` types — use `unknown` and narrow properly

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` prefixed with `use`
- Utils: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE` for values, `camelCase.ts` for files
- Expo Router screens: `kebab-case` folders, `index.tsx` files

### Component Structure
```tsx
// 1. Imports
// 2. Types/interfaces
// 3. Constants (if local)
// 4. Component function
// 5. Styles (if any inline needed)
// 6. Export
```

### NativeWind Usage
```tsx
// ✅ Correct
<View className="flex-1 bg-background p-4">

// ❌ Wrong — no StyleSheet
const styles = StyleSheet.create({ container: { flex: 1 } })
```

### MMKV Storage
```ts
import { storage } from '@daruma/ui/storage'
// Always use typed wrappers — never raw MMKV string keys inline
```

---

## EAS & Deployment

- EAS project configured per app in `apps/<app-name>/eas.json`
- Bundle IDs follow pattern: `nz.daruma.dojo.<appname>`
  - e.g. `nz.daruma.dojo.multiplicationdojo`
- App Store: iOS first, then Google Play
- OTA updates via EAS Update for JS-only changes

---

## What NOT to Do

- Never use `yarn` or `npm` — pnpm only
- Never use `StyleSheet.create` for layout/spacing — use NativeWind
- Never import between apps directly — use `@daruma/ui`
- Never commit `.env` files
- Never override React Native or React versions manually
- Never use `expo-cli` legacy commands — use `npx expo` instead
- Never add unnecessary dependencies — keep apps lean
- Never use `any` TypeScript type

---

## Adding a New App

1. `cd apps && npx create-expo-app <app-name> --template blank-typescript`
2. Add NativeWind following the standard setup
3. Add `@daruma/ui` as a workspace dependency
4. Configure `metro.config.js` for monorepo
5. Update root `package.json` scripts
6. Create `eas.json` with bundle ID `nz.daruma.dojo.<appname>`
