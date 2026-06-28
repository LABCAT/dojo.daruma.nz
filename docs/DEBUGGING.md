# Debugging React Native / Expo bugs

Guidance from the Dojo rank-unlock incident (2026). Read before chasing
"navigation context" or MMKV errors.

## Why agents miss bugs like this

1. **Misleading error text** — `Couldn't find a navigation context` pointed at
   `useRouter()` while the real failure was **rendering rank rows** after storage
   contained `complete` statuses. Agents optimistically trust the redbox frame.

2. **Wrong layer** — Symptom appeared after `advanceRank` / `setRankStatus`, so
   agents refactored storage, imports, nested stacks, and router APIs. Storage
   was fine; **UI that only runs when `complete` rows exist** was the trigger.

3. **No isolation** — Agents skipped "does the same write work on home?" and
   "does Dojo work with header-only UI?" until very late. Without layer tests,
   every fix was a guess.

4. **Invented rules** — Fake guidance ("never use `router.replace`") made the
   codebase harder to reason about and wasted more cycles.

5. **No device verification** — Agents cannot see Expo Go. Without a human
   one-line result ("crash on Enter Dojo after unlock") or automated E2E,
   the loop never closes.

## Protocol — before changing architecture

Run these **in order**. Stop when one step fails; fix that layer only.

| Step | Test | Pass means |
|------|------|------------|
| 1 | Reproduce with **minimal state change** (e.g. dev screen that only writes storage, same pattern as a working screen like `difficulty.tsx`) | Storage + import layer OK |
| 2 | **Default app state** still works (e.g. Enter Dojo before any unlock) | Baseline OK |
| 3 | **Strip UI** on the crashing screen (header + readout only, no list/map) | Crash is in list/map JSX, not hooks/storage |
| 4 | **Binary search** inside the list (remove icons, then disabled Pressables, etc.) | Pin exact component |
| 5 | Compare with **working screen** in the same app (same storage module, same router stack) | Diff the patterns, not the framework |

**Stop rule:** If step 1 passes and step 3 fails, do **not** change MMKV,
monorepo imports, or router structure until step 4 is done.

## Misleading errors (React Native)

| Error message | Often actually |
|---------------|----------------|
| `Couldn't find a navigation context` | Render throw during mount/focus; check child components and new UI branches first |
| Points at `useRouter()` | Hook may have succeeded; read Metro `LOG` lines before the error |

## React Native UI pitfalls (this repo)

### Disabled `Pressable` for non-interactive rows

**Do not** wrap list items in `<Pressable disabled={!isActive}>` when some
items are never tappable. Use `Pressable` only for the active row; use `View`
for others. Confirmed crash on Dojo rank list when `complete` rows existed.

### NativeWind class names

Classes must match `tailwind.config.js` (**kebab-case**): `text-success-bright`,
not `text-successBright`. Wrong classes may not crash, but do not assume camelCase
tokens from `tokens.ts` map 1:1 to class names.

## What agents must not do when stuck

- Do not add `setTimeout`, import-path shuffling, or new nested route groups
  without a hypothesis from the protocol above.
- Do not add fake router rules to AGENTS.md or BUILD_PROMPTS.md.
- Do not claim a fix without a stated test ("unlock rank → Enter Dojo → no crash").
- Say **"I cannot verify on device"** and ask for one binary-test result instead
  of another multi-file refactor.

## Optional dev tooling

- **`dev-unlock-rank.tsx`** — mirror `difficulty.tsx` for rank writes (root stack).
- **Header-only screen** — temporary; remove after root cause is found.

## Reference

- Fix: `apps/multiplication-dojo/app/(dojo)/index.tsx` — Pressable vs View
- App rules: `apps/multiplication-dojo/AGENTS.md`
