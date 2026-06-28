# Multiplication Dojo — Agent Build Prompts

## How to use these prompts
Paste one complete prompt section into Antigravity at a time. Complete every
verification item before moving to the next prompt. Read `AGENTS.md` and
`DESIGN.md` in every session.

**Status:** Prompts 02–08 are largely **implemented**. **Prompt 09 (Practice Mode) is
NOT done** — `(practice)/index.tsx` is still a NumberPad test stub. **Do Prompt
09 next**, then optional Prompt 10 (verify/copy animations), then Prompt 11
(visual pass), then Prompt 12 (EAS, **public Play launch prep**, store listing ASO,
metrics + crash-reporting guides). **Android only** — no iOS.

Superseded patterns: Prompt 02 inline difficulty → `difficulty.tsx`; Prompts
06/08 rank-unlock route → celebration overlay on `challenge.tsx`.

---

## PROMPT 02 — Home Screen

### Mission
Build the Home screen: the player's launchpad into the dojo. It shows their
current rank, lets them choose a difficulty, and sends them into battle or
practice.

### Read First
Read `AGENTS.md` and `DESIGN.md` in full before writing a single line.

### Aesthetic Direction
This is the first thing a player sees. It must feel like standing at the
entrance of a real dojo — dark, deliberate, earned. Think brushed steel and
paper lanterns, not an app store screenshot. The title "MULTIPLICATION DOJO"
should feel like it was carved into stone. The difficulty options should feel
like choosing your path, not picking from a dropdown. Use the full dark canvas
— negative space is your friend. Every element earns its place. Reference
DESIGN.md for all colour tokens and typography rules.

### Prerequisites
- Prompt 01 complete: `pnpm dojo` starts Metro, placeholder screen renders on
  device

### File to create
`apps/multiplication-dojo/app/index.tsx`

### TypeScript Contracts
```ts
import { PRESETS, RANKS, getActiveDifficulty, setActiveDifficulty, getRankStatus } from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
```
`PRESETS`, `RANKS`, `PresetId` are defined in `packages/ui/theme/tokens.ts`.
`getActiveDifficulty`, `setActiveDifficulty`, `getRankStatus` are defined in
`packages/ui/storage/index.ts`.

**Note:** Storage functions do not exist yet — add these temporary stubs to
`packages/ui/index.ts` so the Home screen compiles while Prompt 03 is pending:
```ts
export function getActiveDifficulty(): PresetId { return 'ashigaru' }
export function setActiveDifficulty(_id: PresetId): void {}
export function getRankStatus(_preset: PresetId, _rankId: number): 'locked' | 'current' | 'complete' {
  return _rankId === 1 ? 'current' : 'locked'
}
```
These stubs are replaced by real implementations in Prompt 03.

### Business Rules
- Active difficulty is stored in MMKV (stubs above for now), read on mount
- When player taps a difficulty preset: update local state + call
  `setActiveDifficulty(id)` immediately
- `useFocusEffect` (from `expo-router`) must re-read active difficulty and
  current rank from storage every time the screen gains focus, so returning
  from a challenge shows updated rank
- Current rank = the rank with status `'current'` for the active preset.
  If none found, default to Bokken (rank id 1)
- "ENTER THE DOJO" navigates to `/(dojo)` using `useRouter().push`
- "PRACTICE" navigates to `/(practice)` using `useRouter().push`

### Screen Sections (top to bottom)
1. **App title block** — app name, Japanese subtitle, decorative divider
2. **Difficulty selector** — 4 tappable cards, one active at a time
3. **Current rank display** — compact card showing weapon name, Japanese,
   rank number for the active difficulty
4. **CTA buttons** — primary "ENTER THE DOJO" and ghost "PRACTICE"

### What NOT to do
- No ScrollView — all content must fit one screen
- No images or icons yet — typography and colour only
- Do not hardcode colour values — use only tokens from DESIGN.md
- Do not use `StyleSheet.create` — use NativeWind `className` props
- Do not hardcode difficulty options — iterate over the `PRESETS` constant

### Verification — test every item on a physical device
- [ ] Screen background is `#0A0A0A` (near black), no white flash on load
- [ ] App title reads "MULTIPLICATION DOJO" — impactful, not generic
- [ ] Japanese subtitle "乗算道場" appears below title in muted colour
- [ ] All 4 difficulty presets visible with correct labels and ranges:
      Ashigaru 1–10, Samurai 1–20, Ronin 1–50, Shogun 1–100
- [ ] Default selected preset is Ashigaru with gold accent
- [ ] Tapping each preset: gold accent moves, previous deselects
- [ ] Current rank section shows "Bokken" with "木刀" and "01" for Ashigaru
- [ ] Switching difficulty updates current rank display immediately
- [ ] "ENTER THE DOJO" navigates to Dojo Mode (placeholder is fine)
- [ ] "PRACTICE" navigates to Practice Mode (placeholder is fine)
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: home screen with difficulty selector and rank display
```

---

## PROMPT 03 — MMKV Storage Layer

### Mission
Build the persistence layer. All game state that survives app restarts — active
difficulty, rank statuses, progress — lives here. No screen ever writes to
storage directly; everything goes through these typed helpers.

### Read First
Read `AGENTS.md` before starting.

### Prerequisites
- Prompt 02 complete and verified on device

### Install
Run from repo root:
```bash
pnpm --filter multiplication-dojo add react-native-mmkv@2.12.2
pnpm install
```

### File to create
`packages/ui/storage/index.ts`

### TypeScript Interface (implement exactly this API)
```ts
// Read active difficulty. Returns 'ashigaru' if nothing stored.
export function getActiveDifficulty(): PresetId

// Persist active difficulty selection.
export function setActiveDifficulty(preset: PresetId): void

// Read rank status for a given preset + rank combination.
// Default: rank 1 = 'current', ranks 2–5 = 'locked'
export function getRankStatus(preset: PresetId, rankId: RankId): RankStatus

// Write a rank status directly.
export function setRankStatus(preset: PresetId, rankId: RankId, status: RankStatus): void

// Read all 5 rank statuses for a preset as a keyed object.
export function getAllRankStatuses(preset: PresetId): Record<RankId, RankStatus>

// Call after player passes a challenge.
// Marks completedRankId as 'complete', sets next rank (completedRankId + 1)
// to 'current'. Returns the newly unlocked RankId, or null if rank 5 was
// just completed (all ranks done).
export function advanceRank(preset: PresetId, completedRankId: RankId): RankId | null

// DEV ONLY — reset one preset's progress to initial state
export function resetProgress(preset: PresetId): void

// DEV ONLY — wipe all storage
export function resetAllProgress(): void
```

### Storage Schema
MMKV instance ID: `'daruma-dojo'`

| Key | Value type | Example |
|-----|-----------|---------|
| `'difficulty'` | string (PresetId) | `'samurai'` |
| `'rank:ashigaru:1'` | string (RankStatus) | `'complete'` |
| `'rank:ashigaru:2'` | string (RankStatus) | `'current'` |
| `'rank:samurai:1'` | string (RankStatus) | `'locked'` |

Key pattern for rank status: `rank:${preset}:${rankId}`

### Business Rules
- `getRankStatus` must validate the stored string before returning it —
  only return `'complete' | 'current' | 'locked'`. If stored value is
  anything else, return the default
- `getActiveDifficulty` must validate — if stored value is not a valid
  PresetId, return `'ashigaru'`
- `advanceRank` is idempotent on rank 5: if completedRankId is 5, mark it
  complete and return null. Do not write rankId 6.

### Update `packages/ui/index.ts`
Remove the temporary stubs added in Prompt 02. Add:
```ts
export * from './storage'
```

### Verification
- [ ] `pnpm install` completes without errors
- [ ] `pnpm dojo` starts without errors
- [ ] On device: select Samurai → close app → reopen → Samurai still selected
- [ ] On device: complete Bokken challenge (will test properly in Prompt 06) —
      for now manually call `advanceRank('ashigaru', 1)` in a temp useEffect
      and verify `getAllRankStatuses('ashigaru')` returns Bokken complete,
      Tanto current, rest locked
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: MMKV typed storage layer in @daruma/ui
```

---

## PROMPT 04 — NumberPad Component

### Mission
Build the custom number input. No system keyboard ever appears in this app —
the NumberPad is the only way to enter answers. It must feel like a weapon
rack: purposeful, precise, immediate.

### Read First
Read `AGENTS.md` and `DESIGN.md` before starting.

### Prerequisites
- Prompt 03 complete and verified

### File to create
`packages/ui/components/NumberPad.tsx`

### Export
Add to `packages/ui/index.ts`:
```ts
export * from './components/NumberPad'
```

### TypeScript Contract
```ts
interface NumberPadProps {
  value: string           // current input string e.g. "42"
  onValueChange: (value: string) => void
  disabled?: boolean      // greys out all keys, ignores taps
}
export function NumberPad(props: NumberPadProps): JSX.Element
```

### Key Layout (exactly this grid, top-to-bottom, left-to-right)
```
[ 1 ] [ 2 ] [ 3 ]
[ 4 ] [ 5 ] [ 6 ]
[ 7 ] [ 8 ] [ 9 ]
[ C ] [ 0 ] [ ⌫ ]
```

### Business Rules
- Digit keys: append digit to value string
- `C` key: clear entire value (set to `''`)
- `⌫` key: remove last character
- Max input length: 6 characters — digit keys do nothing when length is 6
- Prevent leading zeros: if value is `''`, tapping `0` does nothing
- `C` and `⌫` label in `primary` gold colour to distinguish from digits
- When `disabled` is true: keys are visually dimmed and do not respond to taps
- Pressed state: brief visual feedback on key press (colour change on press in)

### Aesthetic Direction
Minimal and tactical. Think calculator meets dojo training pad. Each key should
feel satisfying to press — immediate visual response, clean geometry. No
rounded pill shapes — square-ish keys with a subtle border. The gold on C and ⌫
gives them authority over the plain digit keys.

### Verification — test using a temp screen
Create `app/test-pad.tsx` temporarily. Navigate to `/test-pad`. Verify:
- [ ] 3×4 grid renders correctly with correct key labels
- [ ] Digits 1–9, 0 append to displayed value
- [ ] Leading zero prevented: tap 0 on empty input → nothing happens
- [ ] Max 6 digits: 7th tap does nothing
- [ ] ⌫ removes last character
- [ ] C clears to empty
- [ ] C and ⌫ visually distinct from digit keys (gold)
- [ ] All keys show pressed feedback (colour change)
- [ ] `disabled` prop: all keys dimmed, no response
- [ ] `pnpm typecheck` — zero errors

Delete `app/test-pad.tsx` after verification.

### Commit
```
feat: NumberPad component in @daruma/ui — no system keyboard
```

---

## PROMPT 05 — Game Logic Hooks

### Mission
Build the two game logic hooks that power all challenge and practice gameplay.
All game state lives in these hooks — screens are purely presentational. This
is the most critical code in the app: get the contracts and rules exactly right.

### Read First
Read `AGENTS.md` before starting.

### Prerequisites
- Prompt 04 complete and verified

### Files to create
- `packages/ui/hooks/useChallenge.ts`
- `packages/ui/hooks/usePractice.ts`

### Export
Add to `packages/ui/index.ts`:
```ts
export * from './hooks/useChallenge'
export * from './hooks/usePractice'
```

---

### `useChallenge` — Exact Specification

#### Exported types
```ts
export interface Question {
  a: number
  b: number
  answer: number  // always a * b
}

export type ChallengeStatus = 'idle' | 'active' | 'passed' | 'failed'

export interface UseChallengeReturn {
  status: ChallengeStatus
  currentQuestion: Question | null  // null when status is 'idle'
  questionIndex: number             // 0-based, 0–19
  totalQuestions: number            // always 20
  correctCount: number              // running correct count
  lastAnswerCorrect: boolean | null // null = no answer submitted yet for this question
  start: () => void                 // initialise and begin
  submitAnswer: (value: string) => void
  retry: () => void                 // reset and restart with fresh questions
}

export function useChallenge(preset: PresetId): UseChallengeReturn
```

#### Business Rules — implement exactly
- `totalQuestions` is always `20`
- Pass threshold: `17` correct or more (85%) → status becomes `'passed'`
- Fewer than 17 correct → status becomes `'failed'`
- Question generation: both `a` and `b` are random integers from `1` to
  `preset.max` inclusive, independently random
- No duplicate `(a, b)` pairs within a single session — track used pairs.
  If `max` is small (e.g. 10×10 = 100 pairs, need 20) there are enough unique
  pairs; if somehow exhausted (shouldn't happen), allow duplicates as fallback
- `submitAnswer(value)`: parse `value` as integer, compare to
  `currentQuestion.answer`. Empty string or non-numeric → wrong
- After `submitAnswer`: set `lastAnswerCorrect` immediately
- Auto-advance: exactly `800ms` after `submitAnswer`, advance to next question
  (or set `passed`/`failed` if it was question 20). This must use a ref-based
  approach to avoid stale closure bugs — do NOT read state directly inside
  `setTimeout`
- `lastAnswerCorrect` resets to `null` when advancing to next question
- Submitting again while `lastAnswerCorrect !== null` (waiting for auto-advance)
  does nothing
- `start()` and `retry()` both cancel any pending timeout and generate a fresh
  question set
- Cleanup: cancel pending timeout on unmount

#### Critical implementation note — stale closures
The `setTimeout` callback in `submitAnswer` must know the correct count and
question index at the time of submission, not at the time the timeout fires.
Use `useReducer` (recommended) or capture values in local constants before the
`setTimeout` call. Do not read `state.correctCount` or `state.questionIndex`
from inside the setTimeout callback.

---

### `usePractice` — Exact Specification

#### Exported types
```ts
export interface UsePracticeReturn {
  currentQuestion: Question
  correctCount: number
  totalCount: number
  streak: number        // consecutive correct answers — resets to 0 on wrong
  lastAnswerCorrect: boolean | null
  submitAnswer: (value: string) => void
}

export function usePractice(preset: PresetId): UsePracticeReturn
```

#### Business Rules
- No `start()` needed — hook generates first question immediately on mount
- Infinite questions — no pass/fail, no status, always active
- `streak`: increments on correct, resets to 0 on wrong
- Avoid repeating the last 10 questions — maintain a recent history buffer
  of `(a, b)` keys and exclude them when generating the next question
- Same 800ms auto-advance timing as `useChallenge`
- Same stale closure precautions apply
- Cleanup: cancel pending timeout on unmount

---

### Verification
```bash
pnpm typecheck
```
- [ ] Zero TypeScript errors across the whole repo
- [ ] Both hooks importable in app code without errors
- [ ] No `any` types used

### Commit
```
feat: useChallenge and usePractice game logic hooks in @daruma/ui
```

---

## PROMPT 06 — Challenge Screen

### Mission
Build the Dojo Mode challenge screen — the heart of the game. A player arrives
here to prove themselves worthy of their next weapon rank. Every design and UX
decision should reinforce that this moment matters.

### Read First
Read `AGENTS.md` and `DESIGN.md` in full before writing a single line.

### Prerequisites
- Prompt 05 complete. `pnpm typecheck` passes with zero errors.

### Files to create
- `apps/multiplication-dojo/app/(dojo)/_layout.tsx`
- `apps/multiplication-dojo/app/(dojo)/challenge.tsx`
- `apps/multiplication-dojo/app/(dojo)/index.tsx` (placeholder only — see below)
- `apps/multiplication-dojo/app/(dojo)/rank-unlock.tsx` (placeholder only — see below)

### Placeholders (minimal, enough to compile)
**`app/(dojo)/index.tsx`**
```tsx
import { View, Text } from 'react-native'
export default function DojoIndex() {
  return <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#F0EDE8' }}>Dojo Mode — Prompt 07</Text>
  </View>
}
```

**`app/(dojo)/rank-unlock.tsx`**
```tsx
import { View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
export default function RankUnlock() {
  const router = useRouter()
  return <View style={{ flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
    <Text style={{ color: '#C9A84C', fontSize: 24, fontWeight: '700' }}>Rank Unlocked!</Text>
    <Pressable onPress={() => router.replace('/(dojo)')} style={{ borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 }}>
      <Text style={{ color: '#F0EDE8' }}>Continue</Text>
    </Pressable>
  </View>
}
```

### Navigation Contract
**Incoming params** (via `useLocalSearchParams`):
```ts
{ preset: string, rankId: string }
```
Validate both: `preset` must be a valid PresetId (default `'ashigaru'`),
`rankId` must parse to a number 1–5 (default `1`).

**Outgoing navigation:**
- On `status === 'passed'`: navigate to `/(dojo)/rank-unlock` with params:
  `{ preset: safePreset, completedRankId: String(safeRankId) }`
  Use `router.replace` (not `push`) so back button skips the challenge
- On "Back to Dojo" button (fail state): `router.back()`

### Imports Required
```ts
import { useChallenge, NumberPad, RANKS, PRESETS } from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { BackHandler } from 'react-native'
```

### Screen Sections
1. **Header bar**: back arrow (disabled during active challenge), rank name +
   Japanese subtitle centred, score chip showing `correctCount / totalQuestions`
2. **Progress indicator**: thin full-width bar showing proportion of questions
   answered. Reflects answered count — only fills after answer is submitted,
   not when question index changes
3. **Question area**: large `{a} × {b} = ?` centred vertically in remaining space
4. **Answer display box**: shows current input. State-driven background:
   neutral (idle), success colour (correct), danger colour (wrong). When wrong:
   show correct answer as secondary text below input
5. **NumberPad**: from `@daruma/ui`, disabled while waiting for auto-advance
6. **Submit button**: full width, primary style. Disabled when input is empty
   OR when waiting for auto-advance

### Fail State (inline — do not navigate)
When `status === 'failed'`, replace the entire screen content with:
- Final score display: `{correctCount} / {totalQuestions}`
- Explanation of how many were needed: "You need 17 to advance"
- "TRY AGAIN" primary button → calls `challenge.retry()`, resets local input
- "BACK TO DOJO" ghost button → `router.back()`

### Business Rules
- Call `challenge.start()` in `useEffect` on mount (empty deps array)
- On `status === 'passed'`: `useEffect` watching `challenge.status` triggers navigation
- Input resets to `''` whenever `challenge.lastAnswerCorrect` returns to `null`
  (i.e. when the hook auto-advances to next question)
- Block Android hardware back button while `status === 'active'` using
  `BackHandler.addEventListener('hardwareBackPress', () => true)`
- Back arrow in header is visually muted and non-functional while `status === 'active'`

### Aesthetic Direction
This screen demands focus. A student does not enter the dojo distracted.
The question should dominate — huge, unavoidable. Everything else recedes:
header minimal, progress bar subtle, number pad clean and purposeful.
When an answer is correct, the feedback should feel like a blade finding its
mark — swift, clean, satisfying. When wrong — a moment of stillness before
the next question. The fail state should feel sombre, not punishing — a sensei
showing you how far you fell short, with a path back.

### Visual Requirements — Non-negotiable

These are hard requirements, not guidelines:

- **Question numbers**: `fontSize: 80+`. These dominate the screen.
- **× symbol**: `fontSize: 36+`, colored with `rankColor` — not muted grey.
- **= ?**: `fontSize: 28`, `text-muted` color.
- **Question counter**: "Question X of 20" — the number X must be `fontSize: 18` in `rankColor`, surrounding text `fontSize: 14` in `text-muted`.
- **Header score**: `fontSize: 24–26` for the correct count, `fontWeight: '900'`, colored with `rankColor`. The `/totalQuestions` is `fontSize: 14–15` in `text-muted`.
- **Header rank name**: Must be **truly centred** using `position: 'absolute'` overlay (left: 0, right: 0, top: 0, bottom: 0). Back arrow and score sit on top via `zIndex: 1`.
- **Answer box**: Compact. `paddingVertical: 10–12`, `minWidth: 140`. NOT a large card.
- **Submit button**: MUST be a 3D physical-looking button. Background color = `rankColor`. 
  - **CRITICAL NativeWind Bug**: NativeWind strips inline styles on `<Pressable>`. You MUST wrap the inner content in a `<View>` and apply all borders/shadows/background to that inner `<View>`.
  - **Geometry**: `width: 220`, `borderRadius: 16`. `borderBottomWidth: 4` for a lip, `borderTopWidth: 1.5` for a white highlight, and a glowing drop shadow (`elevation: 6`).
  - **Disabled State**: Do NOT remove the borders or shadows when disabled. Simply drop `opacity: 0.35`. It must ALWAYS look like a 3D button.
- **Progress bar**: Fill color = `rankColor`.

### Rank Color Rule

Each rank has its own color from `getDifficultyTheme(preset).ranks[rankId - 1]`.
This color MUST be used for every accent on screen: submit button, progress bar,
× symbol, score, question counter number, header rank name, and slash animation.
Do NOT use `theme.primary` or hardcoded gold as the main accent.

### Sword Slash Animation (Correct Answer)

On correct answer, play a diagonal sword slash across the question area:
- Two overlapping `Animated.View` elements positioned absolutely in the question area
- **Core blade**: 2px height, white (`#FFFFFF`), rotated −28°
- **Glow trail**: 10px height, `rankColor`, opacity 0.4, same rotation
- Animation: `scaleX` from 0→1 (scales from centre outward) over 220ms with `Easing.out(Easing.cubic)`
- Fade in over 100ms, hold 60ms, fade out over 250ms
- Combined with a scale pulse (1→1.1→1) on the answer box
- Use `useNativeDriver: true` for all transform/opacity animations

### Shake Animation (Wrong Answer)

On wrong answer, shake the answer box horizontally:
- 6-step `Animated.sequence`: ±14, ±10, ±5, 0 (50ms per step = 300ms total)
- `useNativeDriver: true` with `translateX`
- Wrap answer box in `Animated.View` with `transform: [{ translateX: shakeAnim }]`

### Test Link (temporary)

Before testing, add a temporary button to `app/index.tsx` that navigates to
`/(dojo)/challenge?preset=ashigaru&rankId=1`. Style it with a red dashed border
so it's obviously temporary. Remove it after verification.

### Verification — full game loop on device
Add a temporary direct link on Home screen to: `/(dojo)/challenge?preset=ashigaru&rankId=1`
Test every step then remove the link:
- [ ] Challenge screen loads, `start()` triggers, first question appears
- [ ] Question format: `{a} × {b}` large and centred, `= ?` below
- [ ] NumberPad works, no system keyboard appears
- [ ] Submit disabled when input empty
- [ ] Submit enabled when digits entered
- [ ] Correct answer: answer box turns green, correct count in header increments
- [ ] Wrong answer: answer box turns red, correct answer appears below input
- [ ] After 800ms: next question loads, input clears, box returns to neutral
- [ ] Progress bar fills with each answered question
- [ ] Question 20 answered + ≥17 correct: navigates to rank-unlock placeholder
- [ ] Question 20 answered + <17 correct: fail state shows inline
- [ ] Fail state shows correct score and "You need 17 to advance"
- [ ] "TRY AGAIN" restarts from question 1, clears score
- [ ] Hardware back button does nothing during active challenge
- [ ] Back arrow is muted during active challenge
- [ ] `pnpm typecheck` — zero errors
- [ ] Question numbers are large (80px+) and dominate the screen
- [ ] × symbol is colored with rank color, not grey
- [ ] Score in header is large and readable at a glance
- [ ] Rank name is truly centred in header
- [ ] Correct answer triggers visible sword slash animation
- [ ] Wrong answer triggers horizontal shake on answer box
- [ ] Submit button uses rank-specific color (not base gold)
- [ ] All accents use rank color from theme, not hardcoded gold

### Commit
```
feat: challenge screen — full Dojo Mode game loop
```

---

## PROMPT 07 — Dojo Mode Screen

### Mission
Build the rank progression screen — the dojo wall where players see their
journey laid out before them. Five weapons, five milestones. This screen is
about pride in past achievements and hunger for the next one.

### Read First
Read `AGENTS.md` and `DESIGN.md` before starting.

### Prerequisites
- Prompt 06 complete and verified on device

### File to replace
`apps/multiplication-dojo/app/(dojo)/index.tsx` — replace the placeholder

### Navigation Contract
**From:** Home screen "ENTER THE DOJO" button → `/(dojo)`
**To:** Tapping a `'current'` rank card → `/(dojo)/challenge` with params:
```ts
{ preset: activePreset, rankId: String(rank.id) }
```
**Back:** Back arrow → `router.back()` to Home

### Imports Required
```ts
import { RANKS, PRESETS, getActiveDifficulty, getAllRankStatuses } from '@daruma/ui'
import type { PresetId, RankStatus } from '@daruma/ui'
import { useFocusEffect, useRouter } from 'expo-router'
```

### Data Loading Rules
- Read `getActiveDifficulty()` and `getAllRankStatuses(preset)` on mount
- Re-read BOTH via `useFocusEffect` every time screen gains focus — rank
  statuses change after a completed challenge and must refresh automatically
- `useState` stores both `preset` and `statuses` and updates together on focus

### Screen Sections
1. **Header**: back arrow, "DOJO MODE" title, active difficulty name in gold
2. **Rank list**: all 5 weapon ranks, each as a card with status-driven styling
3. **Footer note**: "Answer 17 of 20 to advance your rank"

### Rank Card Behaviour by Status
| Status | Tappable | Visual treatment |
|--------|----------|-----------------|
| `'complete'` | No | Muted, gold accent, completion mark |
| `'current'` | Yes | Full brightness, gold border, call-to-action feel |
| `'locked'` | No | Dimmed, no accent, locked indicator |

### Card Content (same for all statuses)
- Rank number: `01` through `05`
- Weapon name in English (uppercase)
- Japanese name
- Weapon description
- Status indicator (right side): ✓ for complete, › for current, — for locked

### Aesthetic Direction
A hall of weapons. Each card is a display case — the weapons you have earned
gleam with gold, the ones ahead are shrouded in shadow. The active weapon
should feel like it's calling to you. The progression should feel like a
physical journey from bottom of the screen to the top, or from humble to
legendary — order the hierarchy so progression feels upward and earned.

### Verification — on device
- [ ] All 5 ranks display with correct names, Japanese, descriptions
- [ ] Rank 1 (Bokken) is `'current'` by default: tappable, gold accent
- [ ] Ranks 2–5 are `'locked'`: dimmed, not tappable
- [ ] Tapping Bokken navigates to challenge screen with correct params
- [ ] After completing Bokken challenge (pass): return to this screen
- [ ] Bokken now shows as `'complete'`, Tanto shows as `'current'`
- [ ] Status updates happen automatically on focus (no manual refresh)
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: Dojo Mode rank progression screen
```

---

## PROMPT 08 — Rank Unlock Celebration Screen

### Mission
Build the moment. The player just proved themselves worthy of a new weapon.
This screen is their reward — it should feel legendary, earned, unforgettable.

### Read First
Read `AGENTS.md` and `DESIGN.md` before starting.

### Prerequisites
- Prompt 07 complete and verified on device

### File to replace
`apps/multiplication-dojo/app/(dojo)/rank-unlock.tsx` — replace the placeholder

### Navigation Contract
**Incoming params** (via `useLocalSearchParams`):
```ts
{ preset: string, completedRankId: string }
```
`completedRankId` is the rank the player just PASSED (e.g. `'1'` for Bokken).

**On mount:** call `advanceRank(safePreset, completedRankId)` exactly once.
This marks the completed rank as `'complete'` and unlocks the next.

**Outgoing:** "CONTINUE" button → `router.replace('/(dojo)')` (not push)

### Imports Required
```ts
import { RANKS, PRESETS, advanceRank } from '@daruma/ui'
import type { PresetId, RankId } from '@daruma/ui'
import { Animated } from 'react-native'
```

### Flavour Text (exact strings, indexed by completedRankId)
```ts
const FLAVOUR: Record<number, string> = {
  1: 'Your training begins.',
  2: 'You have drawn first blood.',
  3: 'The blade grows shorter. The mind grows sharper.',
  4: 'The way of the sword is the way of the mind.',
  5: 'You have mastered the great sword. The dojo bows.',
}
```

### All-Complete State
When `completedRankId === 5`: also display
`"MASTER OF {presetData.label.toUpperCase()}"` in gold above the continue button.

### Animation Sequence
Use React Native's built-in `Animated` API only. `useNativeDriver: true` for
all transform and opacity animations. `useNativeDriver: false` for any colour
or layout animations.

Staged entrance — each element fades in after the previous:
1. "RANK ACHIEVED" label — fade in
2. Weapon name (English + Japanese + description) — fade in + scale from 0.85
3. Large rank number stamp — fade in
4. Decorative divider — fade in
5. Flavour text — fade in
6. All-complete label (if applicable) — fade in with flavour text
7. "CONTINUE" button — fade in last

Timing is a creative decision — make it feel ceremonial, not rushed.

### Aesthetic Direction
Full screen. No header, no back button — there is no going back from an
achievement. The weapon name should feel monumental. The large rank number
should feel like a seal stamped in honour. The flavour text should land like
a sensei's quiet words after a hard-fought victory. Gold and darkness.
Nothing else.

### Verification — on device
Pass a challenge and verify:
- [ ] Rank unlock screen appears immediately after passing
- [ ] Elements animate in sequentially, not all at once
- [ ] Weapon name matches the rank just completed (not the newly unlocked one)
- [ ] Flavour text is correct for each rank (test all 5 through dev reset)
- [ ] `advanceRank` is called: after tapping Continue, Dojo Mode shows
      correct updated statuses
- [ ] "CONTINUE" navigates back to Dojo Mode (not Home)
- [ ] Rank 5 completion: "MASTER OF {PRESET}" displays
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: rank unlock celebration with staged entrance animations
```

---

## PROMPT 09 — Practice Mode Screen (NOT COMPLETE)

### Current state
`(practice)/index.tsx` is a **placeholder** (“Test Pad” + NumberPad only). The
`usePractice` hook in `@daruma/ui` **already exists** — wire it up; do not
rewrite the hook unless you find a bug.

### Mission
Build Practice Mode — infinite questions, no rank pressure, streak combo when
you’re on a roll. Arcade training-yard feel per `DESIGN.md` (bright, readable,
path-colour accents).

### Read first
1. `DESIGN.md` — arcade symbology (path medallion, no rank header)
2. `apps/multiplication-dojo/AGENTS.md` — no router/storage refactors
3. `app/(dojo)/challenge.tsx` — **copy layout/animation patterns**, not rank logic

### Prerequisites
- Prompt 08 complete (celebration overlay on challenge)

### Hard scope limits
- Touch **only** `(practice)/_layout.tsx` and `(practice)/index.tsx`
- **No** changes to `usePractice`, storage, challenge, dojo, or home
- **No** new routes or npm dependencies
- Reuse `NumberPad` from `@daruma/ui`; no system keyboard

### Files to update
- `apps/multiplication-dojo/app/(practice)/_layout.tsx` — `backgroundColor: '#0F0F18'`
- `apps/multiplication-dojo/app/(practice)/index.tsx` — full practice screen

### Navigation
- **From:** Home “Practice” → `router.push('/(practice)')` (already wired)
- **Back / exit:** “End Session” → native `Alert` → confirm → `router.replace('/')`

### Imports
```ts
import { usePractice, NumberPad, getActiveDifficulty, getDifficultyTheme } from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
```

### Behaviour (from `usePractice`)
| Feature | Practice |
|---------|----------|
| Questions | Infinite |
| Pass/fail | None |
| Progress bar | No |
| Rank in header | No — show **path name** + path icon medallion |
| Score | `{correctCount}/{totalCount}` |
| Streak | Show when `streak >= 3` — combo-counter energy |
| Preset | `getActiveDifficulty()` on mount only (chosen on Home / Change Path) |
| Auto-advance | 800ms after submit, same as challenge |
| End Session | Always visible; Alert with session stats |

**End Session Alert:**
- Title: `'End Session?'`
- Message: `'You answered {totalCount} questions with {correctCount} correct.'`
- Buttons: `Keep Going` (cancel) | `End Session` (destructive → `router.replace('/')`)

### UI requirements
1. **Header:** “PRACTICE”, active path name in `theme.primary`, path icon medallion
   (`PRESETS[].icon` from tokens — see DESIGN.md)
2. **Question area:** Same hierarchy as challenge (72px+ numbers, rank-colour not
   needed — use **path primary** for × operator and accents)
3. **Feedback:** Copy challenge’s inline slash (correct) + shake (wrong) animations
   — do not extract a shared hook in this prompt
4. **Streak:** Prominent when ≥ 3 (e.g. “{n} STREAK” in path colour)
5. **End Session:** Ghost/secondary button — always tappable (no back-lock)

### Verification — on device
- [ ] Practice loads with first question immediately
- [ ] Header: PRACTICE + path name + path icon
- [ ] Score updates after each answer
- [ ] Correct/wrong feedback matches challenge feel
- [ ] Streak appears at 3+; resets on wrong answer
- [ ] End Session → Alert with correct stats → Home on confirm
- [ ] Cancel Alert → session continues with same score
- [ ] `pnpm typecheck` passes

### Commit
```
feat: Practice Mode with infinite questions and streak counter
```

---

## PROMPT 10 — Answer Feedback Animations (optional after 09)

### Status
Challenge already has inline animations. **Run after Prompt 09** — practice
should include slash/shake when built. Skip this prompt if both screens feel good
on device.

### Mission (if anything remains)
Verify challenge feel on device. If **practice** lacks slash/shake, copy the
**same inline pattern** from challenge — do not create `packages/ui/hooks/useAnswerAnimation.ts`.

### Scope limits
- Touch **only** `app/(practice)/index.tsx` if practice animations are missing
- **No** changes to challenge logic, hooks, storage, or router
- **No** new dependencies

### Verification — on device
- [ ] Challenge: correct = slash + pulse; wrong = shake
- [ ] Practice: same feedback (or skip if already matched)
- [ ] Rapid answers: animations don’t stick or overlap badly
- [ ] `pnpm typecheck` passes

### Commit (only if practice was updated)
```
feat: match practice answer feedback to challenge animations
```

**If challenge + practice both feel good — skip Prompt 10 and go to 11.**

---

## PROMPT 11 — Design Pass (Tier 1, ship-safe)

### Prerequisites
- **Prompt 09 complete** (Practice Mode is real gameplay, not the test stub)
- Prompt 10 optional (animation verify)

### Mission
One focused visual pass: make the app feel **bright, anime-arcade, and exciting**
without rewriting game logic, navigation, or storage. Target **“decent and
shippable”**, not portfolio perfection.

**Replaces** the old “polish pass” (back lock, safe area, dev reset — already done).

### Read first
1. `DESIGN.md` (updated anime/arcade direction — follow exactly)
2. `apps/multiplication-dojo/AGENTS.md` (Pressable/View rule, no router hacks)
3. `docs/DEBUGGING.md` if anything crashes

### Hard scope limits — agent MUST obey

- **Touch at most 8 files** (listed below). No new routes, no hook rewrites.
- **No** changes to `packages/ui/storage`, `useChallenge`, `usePractice`, or Expo Router structure.
- **No** new npm dependencies (no Lottie, no Skia, no Reanimated upgrades).
- **No** fake router rules. Use existing `push` / `back` / `replace`.
- If a screen already works, **enhance styling only** — do not relocate logic.
- **`tokens.ts`**: may use existing `icon` / `japanese` fields only — **do not**
  change rank colour hex values.

### Files in scope (only these)

1. `packages/ui/theme/tokens.ts` — **read only** unless fields missing (already has path + rank icons)
2. `apps/multiplication-dojo/tailwind.config.js` — add `surface-bright` token if needed
3. `apps/multiplication-dojo/app/index.tsx` — home: glow, path medallion, rank badge
4. `apps/multiplication-dojo/app/difficulty.tsx` — path icon per row (from `preset.icon`)
5. `apps/multiplication-dojo/app/(dojo)/index.tsx` — rank medallions + kanji (keep View/Pressable rule)
6. `apps/multiplication-dojo/app/(dojo)/challenge.tsx` — ambient bg, rank icon in header (logic unchanged)
7. `apps/multiplication-dojo/components/RankCelebrationOverlay.tsx` — hero medallion + big kanji
8. `apps/multiplication-dojo/app/(practice)/index.tsx` — **optional** if time: same ambient + symbology as challenge

### Visual requirements (implement all)

1. **Backgrounds**: `#0F0F18` base + soft coloured glow orb per screen (path or rank colour, 10–15% opacity).
2. **Surfaces**: Cards use `surface` / `surface-bright` — visibly separated from background.
3. **Rank colour hero**: CTAs and accents use `getRankColor()` / `theme.primary` — not default gold.
4. **Path symbology**: Circular medallion with `PRESETS[].icon` on home, Change Path, Dojo header.
5. **Rank symbology**: Circular medallion with `RANKS[].icon` on Dojo rows, home weapon card, celebration hero. Kanji from `RANKS[].japanese` beside English name — visible, not tiny footnotes.
6. **Dojo list**: Current rank = glowing border + tinted fill. Complete = colourful check. Locked = dimmed but hue-visible. **Only current row is Pressable.**
7. **Celebration**: Large kanji + 64–80px rank medallion, strong colour flash, clear Continue.
8. **Typography**: Challenge keeps 72px+ question numbers.

### Explicitly out of scope

- Redesigning rank/path **colour hex** values in `tokens.ts`
- Custom SVG, mon crests, emoji, or new icon libraries
- New screens, rank-unlock route, Maestro, EAS
- Extracting shared hooks or refactoring challenge animations
- “Audit all router.replace calls” or NavigationContainer folklore

### Verification — device, one session

- [ ] Home: path + rank medallions visible; card pops on tinted background
- [ ] Change Path: each row shows its path icon medallion
- [ ] Dojo: rank medallion + kanji on every row; current rank obvious; **no crash** after dev unlock
- [ ] Challenge: rank icon in header + ambient glow; gameplay unchanged
- [ ] Pass challenge: big kanji + rank medallion on overlay; Continue → Dojo works
- [ ] `pnpm typecheck` passes

### If stuck

Stop. Do not refactor architecture. Report which screen and what broke.

### Commit
```
feat: tier-1 arcade visual pass with path and rank symbology
```

---

## PROMPT 12 — Public Play Store launch (Android only)

### Mission
Prepare **everything needed to go public** on Google Play — not just a build
config. Shane’s first app: no Play Console yet, Android only, goal is a **live
Production** listing people can find and install.

Deliver:
1. EAS build config + verified `app.json`
2. **Store listing copy optimized for ASO** (Play Store search — not web SEO)
3. **Human guides** in `docs/` for deployment, measuring success, and crash reporting

### Product decisions (locked — do not ask)
- **Platform:** Android only — never `eas build --platform ios`
- **Launch target:** **Production (public)** — Internal Testing is an optional
  sanity-check step *on the way*, not the finish line
- **Play Console:** User has no account — guides include full signup ($25)
- **Revenue / crashes for v1:** Multiplication Dojo is offline/local — **do not**
  integrate paid analytics or crash SDKs in this prompt; **document** choices for
  future Daruma Dojo apps instead

### Read first
- `AGENTS.md`, `DESIGN.md` (tone: anime arcade, fun, educational)
- `.agents/skills/expo-deployment/SKILL.md` if EAS build fails

### Prerequisites
- Prompt 09 complete; Prompt 11 recommended (screenshots should look good)

### Code / config files

**1. `apps/multiplication-dojo/eas.json`** — development, preview (APK), production (AAB).

**2. `apps/multiplication-dojo/app.json`** — verify, do not blindly overwrite:

| Field | Expected value |
|-------|----------------|
| `android.package` | `nz.daruma.dojo.multiplicationdojo` |
| `android.versionCode` | `1` |
| `backgroundColor` | `#0F0F18` |
| `userInterfaceStyle` | `dark` |
| Adaptive icon | Keep existing asset paths |
| `plugins` | Keep `expo-router`, `expo-font` — add only if build requires |

Commit `extra.eas.projectId` after `eas init`.

### Required docs (all in `docs/` — do not scatter)

#### A. `docs/play-store-deployment.md`
Technical checklist: Expo → EAS preview APK on device → production AAB → Play
Console app creation → upload → content rating → **Production release**.

Include:
- PowerShell commands from `apps/multiplication-dojo/`
- Screenshot specs (phone: min 2, recommend 4–8; 16:9 or 9:16)
- Feature graphic 1024×500 (what to put on it)
- **Privacy policy:** this app collects no user data locally — note that Play
  still wants a policy URL; suggest a simple static page on daruma.nz (human task)
- Internal Testing as optional 30-minute smoke test before Production
- Version bump checklist for updates (`version`, `versionCode`, rebuild, release notes)

Link to `play-store-listing.md`, `app-metrics.md`, `crash-reporting.md`.

#### B. `docs/play-store-listing.md` — **ASO copy (agent writes this)**
Google Play discovery = **ASO** (App Store Optimization): title + short
description + full description + screenshots drive search and installs.

Agent must draft **ready-to-paste** listing content:

| Field | Limit | Requirements |
|-------|-------|----------------|
| App title | 30 chars | Brand + primary keyword (e.g. times tables / multiplication) |
| Short description | 80 chars | Hook + top keyword — highest-visibility text |
| Full description | 4000 chars | Scannable: bullets, benefits, who it’s for (kids + adults), offline, gamified dojo theme, weapon ranks, practice mode, no ads (if true), no account required |

**ASO rules for the copy:**
- Front-load keywords naturally: multiplication, times tables, math practice, kids, mental math, educational game
- Lead with outcome (“Master times tables…”) not features jargon
- Distinct voice — arcade dojo, not generic homework app
- Include a “Why Daruma Dojo?” section
- Honest: don’t promise “thousands of downloads” — ASO improves discoverability; ratings and word-of-mouth matter too
- Suggest 5–10 screenshot captions (what to show on each screen for conversion)

Also draft: **release notes v1.0.0** (what’s new, first release).

#### C. `docs/app-metrics.md` — **How will I know if it’s successful?**
Teach Shane what to watch, free tools only for v1:

**Must include:**
1. **Play Console (free, built-in)** — installs, uninstalls, active devices,
   countries, store listing conversion (views → installs), ratings/reviews
2. **What “success” looks like for v1** — realistic solo-dev milestones, e.g.:
   - Week 1: first 10 installs (friends/family), zero crash reports in reviews
   - Month 1: steady install trend, 4+ star average, 50+ installs = validation
   - Month 3: organic search installs appearing in Play Console acquisition report
3. **Weekly 5-minute checklist** — where to click in Play Console
4. **Optional later (document, don’t install in v1):**
   - Firebase Analytics (free) — if in-app events needed
   - EAS Observe (Expo) — performance/startup, not download counts
5. **What this app cannot measure without SDK work** — session length, rank completion funnels (note for future)

#### D. `docs/crash-reporting.md` — **Cheap/free bug reports (future apps)**
Comparison for Daruma Dojo portfolio — **recommend one default** for paid/revenue apps:

| Tool | Free tier | RN/Expo | Notes |
|------|-----------|---------|-------|
| **Sentry** | Yes (generous dev tier) | Excellent | **Default recommendation** — errors, breadcrumbs, release tracking |
| Raygun | Limited trial | Good | Paid-first for most teams |
| Bugsnag | Limited free | Good | Similar to Sentry |

**Must include:**
- When to add crash reporting (before taking money / before marketing spend)
- Sentry + Expo setup outline (high level — link to docs; full integration is a *future prompt*, not v1)
- How crashes surface: email alerts, dashboard, linking to `versionCode`
- Play Console **Android vitals** and user reviews as free crash signal for v1
- Privacy: crash reports may contain device info — mention in privacy policy when enabled

### Commands (from `apps/multiplication-dojo/`)

```powershell
npx eas-cli login
npx eas-cli init
npx eas-cli build --platform android --profile preview
# Verify APK on physical device, then:
npx eas-cli build --platform android --profile production
```

Agent runs builds if credentials allow; otherwise commit config + complete docs.

### Verification
- [ ] `eas.json` + `app.json` production-ready
- [ ] `docs/play-store-deployment.md` — full path to **public Production**
- [ ] `docs/play-store-listing.md` — ASO title, short + full description, screenshot captions
- [ ] `docs/app-metrics.md` — Play Console metrics + realistic success milestones
- [ ] `docs/crash-reporting.md` — Sentry recommended, free-tier comparison, v1 uses Play vitals only
- [ ] Listing copy matches app (ranks, practice, offline, dojo theme)
- [ ] No iOS build steps anywhere
- [ ] `pnpm typecheck` passes

### Commit
```
feat: Play Store public launch prep — EAS config and deployment docs
```

### Human steps after commit
1. Follow `docs/play-store-deployment.md`
2. Paste listing from `docs/play-store-listing.md` into Play Console
3. After launch, use `docs/app-metrics.md` weekly
4. Before monetized apps, follow `docs/crash-reporting.md` to add Sentry
