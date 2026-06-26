# @daruma/ui â€” Shared UI Package Rules

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
â”œâ”€â”€ index.ts              # Re-export everything
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ Text.tsx
â”‚   â”œâ”€â”€ Button.tsx
â”‚   â”œâ”€â”€ Card.tsx
â”‚   â””â”€â”€ WeaponRankBadge.tsx
â”œâ”€â”€ theme/
â”‚   â””â”€â”€ tokens.ts         # Colours, ranks, presets as const
â””â”€â”€ storage/
    â””â”€â”€ index.ts          # Typed MMKV wrappers
```

## Rules

- Export everything from `index.ts` â€” no deep imports from apps
- All components must accept `className` prop for NativeWind overrides
- All components must be typed â€” no implicit `any`
- Peer deps only: `react` and `react-native` â€” never install these here
- No app-specific logic â€” this package must be reusable across all Dojo apps
- Test every new component in `multiplication-dojo` before considering it stable

## Adding a New Component

1. Create `packages/ui/components/ComponentName.tsx`
2. Export from `packages/ui/index.ts`
3. Follow DESIGN.md for all visual decisions
4. Accept and forward `className` prop for NativeWind customisation
5. Document props with TypeScript interface â€” no inline type literals

## Storage Helpers

All MMKV access goes through typed wrappers in `packages/ui/storage/index.ts`.
Never use raw string keys inline in app code.

```ts
// Correct
import { getRankStatus, setRankStatus } from '@daruma/ui/storage'

// Wrong
storage.getString('daruma:dojo:ashigaru:3')
```
