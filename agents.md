# Daruma Dojo â€” Monorepo Agent Rules

Pnpm + Turborepo monorepo for **Daruma Dojo** â€” Japanese-themed micro learning
apps and games by Daruma NZ (daruma.nz). Solo developer (Shane), Windows,
PowerShell. Read this file before doing anything.

## Stack

- **Package manager**: pnpm workspaces â€” never npm or yarn
- **Build**: Turborepo
- **Apps**: React Native + Expo (Expo Router, EAS Build)
- **Styling**: NativeWind v4 + Tailwind CSS v3
- **Storage**: MMKV for local persistence
- **Language**: TypeScript strict mode everywhere â€” no `any`, no `.js` files

## Monorepo Structure

```
dojo.daruma.nz/
â”œâ”€â”€ AGENTS.md
â”œâ”€â”€ DESIGN.md
â”œâ”€â”€ apps/
â”‚   â””â”€â”€ multiplication-dojo/   # nz.daruma.dojo.multiplicationdojo
â””â”€â”€ packages/
    â””â”€â”€ ui/                    # @daruma/ui â€” shared components + theme
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
- Never import between apps â€” always go through `@daruma/ui`
- Never commit `.env` files
- Never override React Native or React versions manually
- Never use `expo-cli` â€” use `npx expo` instead
- Bundle IDs: `nz.daruma.dojo.<appname>` (e.g. `nz.daruma.dojo.multiplicationdojo`)
- Always aim to use the latest versions of all tech that is compatible with Expo Go

## Debugging runtime bugs

Read **`docs/DEBUGGING.md`** before refactoring navigation, storage, or monorepo
layout in response to Expo / React Native redbox errors. Summary:

1. **Trust symptoms over error text** — "navigation context" may mean a render crash.
2. **Isolate layers** — prove storage on a working screen pattern before touching router.
3. **Strip UI** on the crashing screen to confirm the bug is in JSX, not hooks.
4. **Compare with a working screen** in the same app (e.g. `difficulty.tsx` vs rank unlock).
5. **Stop guessing** — one hypothesis, one test, then decide. No fake router rules.

React Native list rule: **never use `Pressable disabled` for non-interactive rows**
— use `View`. See `apps/multiplication-dojo/AGENTS.md`.

## Adding a New App

1. `cd apps && npx create-expo-app <name> --template blank-typescript`
2. Set name in `package.json` to match folder
3. Add `"@daruma/ui": "workspace:*"` to dependencies
4. Configure `metro.config.js` for monorepo (see multiplication-dojo as reference)
5. Add NativeWind following existing app config
6. Create `eas.json` with bundle ID `nz.daruma.dojo.<appname>`
7. Add scripts to root `package.json`
