# @daruma/ui

The shared user interface, design system, and state management layer for Daruma Dojo apps.

## Overview

This package serves as the single source of truth for the Japanese-themed UI and persistence layer across the monorepo. Individual apps must import their visual components, tokens, and storage helpers from here rather than implementing them locally.

## Contents

- **Components**: Shared React Native components (`<Text>`, `<Button>`, etc.) styled with NativeWind.
- **Theme**: Tokens (`colors`, `difficultyThemes`) and aliases (`PRESETS`, `RANKS`) found in `theme/tokens.ts`.
- **Storage**: Typed helpers for reading and writing app state using `react-native-mmkv` (`storage/index.ts`).

## Storage Layer (MMKV)

All persistent game state (active difficulty, rank statuses, progress) is managed through typed helpers. **Do not write to MMKV directly from screen components.**

### Usage

```tsx
import { 
  getActiveDifficulty, 
  setActiveDifficulty, 
  getRankStatus,
  advanceRank
} from '@daruma/ui';

// Read state
const difficulty = getActiveDifficulty(); // e.g. 'ashigaru'
const status = getRankStatus('samurai', 1); // 'locked' | 'current' | 'complete'

// Write state
setActiveDifficulty('ronin');
const newlyUnlockedRank = advanceRank('ashigaru', 1); // Marks rank 1 complete, rank 2 current
```

### Resetting Progress (Dev Only)

To clear progress during development:

```tsx
import { resetProgress, resetAllProgress } from '@daruma/ui';

resetProgress('ashigaru'); // Clears one preset
resetAllProgress();        // Wipes all local MMKV storage
```
