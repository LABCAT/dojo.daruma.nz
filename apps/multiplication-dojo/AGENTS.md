# Multiplication Dojo — App Agent Rules

First Daruma Dojo app. Gamified times tables for all ages with Japanese samurai
theme. Read `../../AGENTS.md`, `../../DESIGN.md`, and **`../../docs/DEBUGGING.md`**
before debugging crashes or changing navigation/storage architecture.

## App Identity

- **Bundle ID**: `nz.daruma.dojo.multiplicationdojo`
- **Package name**: `multiplication-dojo`
- **Platforms**: Android first (EAS cloud build), iOS later

## Screen Structure (Expo Router)

```
app/
├── _layout.tsx
├── index.tsx
├── difficulty.tsx
├── dev-unlock-rank.tsx   # Dev-only
├── (dojo)/
│   ├── _layout.tsx
│   ├── index.tsx         # Dojo rank list — Pressable/View rule applies here
│   └── challenge.tsx     # Challenge + celebration overlay
└── (practice)/
    ├── _layout.tsx
    └── index.tsx
```

## Expo Router

Use standard APIs (`push`, `back`, `replace`). Do **not** invent router rules
during debugging (see `docs/DEBUGGING.md`).

**Misleading errors:** `Couldn't find a navigation context` often means a **render
crash** in the screen being opened — not a missing `NavigationContainer`. If
Metro shows `[dojo] useRouter ok` before the error, the bug is **not** `useRouter()`.

When debugging: compare with **`difficulty.tsx`** (storage write + `router.back()`
on root stack, works). If rank writes work on home/dev-unlock but Dojo crashes,
strip Dojo to header-only readout before changing MMKV or route structure.

## Rank list UI — required pattern (Dojo)

**Confirmed bug:** Wrapping every rank row in `<Pressable disabled={!isCurrent}>`
crashes Dojo when any rank is `complete`. The redbox falsely blames navigation
context.

**Rule:** Only the **current** rank is a `Pressable`. Complete and locked ranks
use plain `View`.

```tsx
// ✅ Current rank — tappable
<Pressable onPress={() => router.push('/challenge', …)}>{…}</Pressable>

// ✅ Complete / locked — not pressable
<View>{…}</View>

// ❌ Never do this on the rank list
<Pressable disabled={!isCurrent} onPress={…}>{…}</Pressable>
```

## NativeWind class names

Use kebab-case from `tailwind.config.js`: `text-success-bright`, `text-text-muted`,
`text-primary-dim` — not camelCase.

## Progress Storage (MMKV)

Use `@daruma/ui` helpers (`getRankStatus`, `setRankStatus`, `advanceRank`, etc.).
Keys live in `packages/ui/storage/index.ts`:

```ts
storage.set('difficulty', presetId)
storage.set(`rank:${preset}:${rankId}`, status)
```

## Rank advance flow

1. Pass challenge → `advanceRank(preset, rankId)` in `challenge.tsx`
2. Show `RankCelebrationOverlay` on same screen
3. Continue → `router.replace('/(dojo)')`

## What NOT to Do

- No system keyboard — use `NumberPad` from `@daruma/ui`
- No backend calls — everything is local
- No skip rank in production UI
- Never use disabled `Pressable` for non-interactive rank rows in Dojo
- Never refactor routes/storage/imports as a first response to a redbox — follow
  `docs/DEBUGGING.md`
