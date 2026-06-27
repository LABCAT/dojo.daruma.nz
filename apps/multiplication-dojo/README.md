# Multiplication Dojo

A Japanese-themed micro learning app for mastering multiplication, part of the **Daruma Dojo** monorepo.

## Architecture

- **Framework**: React Native + Expo (Expo Router)
- **Styling**: NativeWind v4
- **Shared UI & State**: `@daruma/ui` workspace package
- **Storage**: `react-native-mmkv` (handled entirely via `@daruma/ui` helpers)

## Local Development

From the repository root (`dojo.daruma.nz`):

```bash
# Install dependencies
pnpm install

# Start the Expo development server for this app
pnpm --filter multiplication-dojo start

# Run on iOS or Android (requires emulator/simulator)
pnpm --filter multiplication-dojo ios
pnpm --filter multiplication-dojo android
```

## Persistence Layer

This app does **not** directly interface with local storage or MMKV. All reads and writes for player progress, rank unlocks, and selected difficulty are routed through strictly typed helpers in the `@daruma/ui` package.

```tsx
import { getActiveDifficulty, getRankStatus } from '@daruma/ui';
```

See the `@daruma/ui` README for the complete storage API and design system tokens.
