# Multiplication Dojo — Agent Build Prompts

## How to use these prompts
Paste one complete prompt section into Antigravity at a time. Complete every
verification item before moving to the next prompt. The prompts reference
AGENTS.md and DESIGN.md which live in the repo root — read those files first
in every session.

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

## PROMPT 09 — Practice Mode Screen

### Mission
Build Practice Mode — infinite questions, no pressure, no rank at stake.
Just a player and their multiplication tables. This screen serves both the
nervous beginner warming up and the adult grinding mental math before bed.

### Read First & Deep Research
Read `AGENTS.md` and `DESIGN.md` before starting.
**CRITICAL AI INSTRUCTION:** Do not write code blindly. Deeply research the `usePractice` hook and `challenge.tsx` to ensure you understand how auto-advancing works. 
**ROUTER SAFETY:** Never use `router.replace()` or `<Link replace>` to navigate back to the root of the current stack. The `replace` action unmounts the `NavigationContainer` and causes severe crashes. ALWAYS use `router.navigate('/(path)')` which safely pops the screens off the stack.

### Prerequisites
- Prompt 08 complete and verified on device

### Files to create
- `apps/multiplication-dojo/app/(practice)/_layout.tsx`
- `apps/multiplication-dojo/app/(practice)/index.tsx`

### Navigation Contract
**From:** Home screen "PRACTICE" button
**Back:** Back arrow or "END SESSION" confirmation → `router.replace('/')`

### Imports Required
```ts
import { usePractice, NumberPad, PRESETS, getActiveDifficulty } from '@daruma/ui'
import type { PresetId } from '@daruma/ui'
```

### Key Differences from Challenge Screen
| Feature | Challenge | Practice |
|---------|-----------|---------|
| Questions | 20 total | Infinite |
| Pass/fail | Yes (17/20) | No |
| Progress bar | Yes | No |
| Rank context | Shown in header | Not shown |
| Score display | correctCount / totalQuestions | correctCount / totalCount |
| Streak | No | Yes (show when ≥ 3) |
| Exit | Back button blocked during active | "End Session" always visible |

### Business Rules
- `preset` read from `getActiveDifficulty()` on mount — player chose it on
  Home screen, do not let them change it here
- Input resets after each auto-advance (same 800ms pattern as challenge)
- "End Session" button always visible, not just on fail
- Tapping "End Session" shows a native `Alert` with:
  - Title: `'End Session?'`
  - Message: `'You answered {totalCount} questions with {correctCount} correct.'`
  - Buttons: `[{ text: 'Keep Going', style: 'cancel' }, { text: 'End Session', style: 'destructive', onPress: () => router.replace('/') }]`
- Streak display: only visible when `streak >= 3`. Show streak count
  prominently — this is the fun metagame of Practice Mode.

### Aesthetic Direction
Looser than the challenge screen — this is the training yard, not the arena.
But still dark, still deliberate. The streak counter, when it appears, should
feel exciting — like a combo counter in a game. The "End Session" button should
be unobtrusive but always findable.

### Verification — on device
- [ ] Practice screen loads with first question immediately
- [ ] Header shows "PRACTICE" title and active difficulty in gold
- [ ] Header shows score `{correct}/{total}`, updating after each answer
- [ ] Correct + wrong feedback works identically to challenge screen
- [ ] After 3 consecutive correct: streak counter appears
- [ ] Wrong answer: streak counter resets to 0 (and hides if below 3)
- [ ] "End Session" button always visible
- [ ] Tapping "End Session": Alert appears with correct session stats
- [ ] Confirming End Session: navigates to Home
- [ ] Cancelling: resumes session with same score
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: Practice Mode with infinite questions and streak counter
```

---

## PROMPT 10 — Answer Feedback Animations

### Mission
Add kinetic feedback to the challenge and practice screens. Right now the colour
change is instantaneous — make it feel alive. A correct answer should sing.
A wrong answer should sting.

### Read First & Deep Research
Read `AGENTS.md` and `DESIGN.md` before starting.
**CRITICAL AI INSTRUCTION:** Thoroughly research the existing `challenge.tsx` and `index.tsx` files. Understand the exact mounting and state lifecycle before injecting animations. Do NOT guess the timing.
**ROUTER SAFETY:** Never use `router.replace()` to navigate back to the root of the current stack. The `replace` action unmounts the `NavigationContainer` and causes severe crashes. ALWAYS use `router.navigate('/(path)')` which safely pops the screens off the stack.

### Prerequisites
- Prompt 09 complete and verified on device

### Files to create
`packages/ui/hooks/useAnswerAnimation.ts`

Add to `packages/ui/index.ts`:
```ts
export * from './hooks/useAnswerAnimation'
```

### TypeScript Contract
```ts
export interface UseAnswerAnimationReturn {
  playCorrect: () => void   // call when lastAnswerCorrect becomes true
  playWrong: () => void     // call when lastAnswerCorrect becomes false
  // Apply both to the answer box Animated.View:
  animatedStyle: {
    transform: object[]
    backgroundColor: Animated.AnimatedInterpolation<string>
  }
}

export function useAnswerAnimation(): UseAnswerAnimationReturn
```

### Animation Specs
**Correct answer** (`playCorrect`):
- Answer box background flashes from neutral → `success` colour → neutral
- Smooth transition, total duration your creative call (~400–600ms feels right)
- Use `useNativeDriver: false` (background colour cannot use native driver)

**Wrong answer** (`playWrong`):
- Answer box shakes horizontally (translate X oscillation)
- Answer box background flashes from neutral → `accent` colour → neutral
- Shake and colour flash run simultaneously
- Use `useNativeDriver: true` for transform, `useNativeDriver: false` for colour
- This means you need two separate Animated.Values

**Important:** `playCorrect` and `playWrong` must both reset all animation
values before playing, so calling them rapidly never leaves the UI in a broken
state.

### Integration Instructions
In BOTH `app/(dojo)/challenge.tsx` AND `app/(practice)/index.tsx`:

1. Import and call `useAnswerAnimation()`
2. Add a `useEffect` watching `lastAnswerCorrect`:
   - When it becomes `true`: call `playCorrect()`
   - When it becomes `false`: call `playWrong()`
   - When it becomes `null`: do nothing (auto-advance, handled elsewhere)
3. Replace the answer box `<View>` with `<Animated.View>` applying `animatedStyle`
4. Remove any static background colour from the answer box — the animation
   handles colour entirely

### Pitfalls to Avoid
- Do not apply `useNativeDriver: true` to background colour — it will silently
  fail or crash
- Do not use a single `Animated.Value` for both colour and transform — they
  need separate drivers
- Ensure `playCorrect` and `playWrong` both stop any in-progress animation
  before starting (`animation.stop()` or reset values first)

### Verification — on device
- [ ] Correct answer: smooth green flash on answer box
- [ ] Wrong answer: red flash AND horizontal shake simultaneously
- [ ] Answering rapidly (back to back): animations don't break or get stuck
- [ ] Animation completes within the 800ms auto-advance window (doesn't overlap
      with next question loading)
- [ ] Practice screen: same animations, same feel
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: correct/wrong answer animations on challenge and practice screens
```

---

## PROMPT 11 — Polish Pass

### Mission
Close the gap between "it works" and "it's ready to ship." These are the
details that separate a professional product from a prototype.

### Read First & Deep Research
Read `AGENTS.md` before starting.
**CRITICAL AI INSTRUCTION:** This is the final polish. Before writing a line of code, execute a deep audit of the codebase to identify any fragile `router.replace()` calls navigating back to stack roots, and replace them with `router.navigate()`. We must not ship with `NavigationContainer` crash risks.

### Prerequisites
- Prompt 10 complete and verified on device

### Polish Items — implement all of them

#### 1. Disable back navigation during active challenge
In `app/(dojo)/challenge.tsx`:
- Android hardware back: `BackHandler.addEventListener('hardwareBackPress', () => true)` while `status === 'active'`. Remove listener when status changes.
- Header back arrow: visually muted (grey/dark) and non-functional while `status === 'active'`
- This ensures a player cannot accidentally exit a challenge they are
  passing

#### 2. Prevent double-submit
In `app/(dojo)/challenge.tsx` and `app/(practice)/index.tsx`:
- After calling `submitAnswer(input)`, immediately disable the submit
  button in local state until `lastAnswerCorrect` returns to `null`
- This must be tracked in local `useState` — the hook's `lastAnswerCorrect`
  alone is not sufficient because it has an 800ms delay

#### 3. Progress bar reflects answered count — not question index
In `app/(dojo)/challenge.tsx`:
- Progress = `answeredCount / totalQuestions`
- `answeredCount` = `questionIndex + 1` when `lastAnswerCorrect !== null`,
  else `questionIndex`
- The bar should only advance AFTER an answer is submitted, not when the
  next question appears

#### 4. StatusBar styling
On every screen (import from `expo-status-bar`):
- `<StatusBar style="light" backgroundColor="#0A0A0A" />`
- This prevents the white status bar flash on Android

#### 5. Safe area on all screens
Verify every screen wraps content in `<SafeAreaView>` from
`react-native-safe-area-context`. Fix any screen that uses `<View>` as the
root instead.

#### 6. Dev reset on Home screen
Add to `apps/multiplication-dojo/app/index.tsx` (only visible in dev builds):
```tsx
{__DEV__ && (
  <Pressable onPress={resetAllProgress} style={{ marginTop: 20, alignItems: 'center' }}>
    <Text style={{ color: '#1A1A1A', fontSize: 10, letterSpacing: 2 }}>
      DEV · RESET ALL PROGRESS
    </Text>
  </Pressable>
)}
```
Import `resetAllProgress` from `@daruma/ui`. This button is intentionally near-invisible in dark mode.

### Verification — on device
- [ ] Hardware back button does nothing during an active challenge
- [ ] Back arrow is visually muted and non-functional during active challenge
- [ ] Rapid double-tap on Submit: only one answer registered
- [ ] Progress bar advances only after answer submission (not on question load)
- [ ] Status bar is dark text on all screens (light-content)
- [ ] No content hidden behind notch or home indicator on any screen
- [ ] DEV reset button barely visible at bottom of Home screen in dark mode
- [ ] Tapping DEV reset: all rank progress clears, difficulty resets to Ashigaru
- [ ] `pnpm typecheck` — zero errors

### Commit
```
feat: polish pass — back lock, double-submit prevention, safe areas, dev reset
```

---

## PROMPT 12 — EAS Build + Play Store

### Mission
Configure EAS Build and produce a production-ready Android App Bundle for
Play Store submission.

### Read First
Read `AGENTS.md` before starting.

### Prerequisites
- All prompts 01–11 complete and verified on device
- Expo account created at expo.dev
- `eas-cli` installed globally

### Files to create/update

**`apps/multiplication-dojo/eas.json`** — create exactly:
```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

**`apps/multiplication-dojo/app.json`** — update/verify these exact fields:
```json
{
  "expo": {
    "name": "Multiplication Dojo",
    "slug": "multiplication-dojo",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#0A0A0A",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0A0A0A"
      },
      "package": "nz.daruma.dojo.multiplicationdojo",
      "versionCode": 1
    },
    "plugins": ["expo-router", "react-native-mmkv"],
    "experiments": { "typedRoutes": true }
  }
}
```

### Commands — run in order from `apps/multiplication-dojo/`

```bash
# 1. Link to Expo account and generate projectId in app.json
npx eas-cli login
npx eas-cli init

# 2. Preview build (APK) — install on device to verify production behaviour
npx eas-cli build --platform android --profile preview

# 3. Only after preview APK verified on device:
npx eas-cli build --platform android --profile production
```

Monitor builds at expo.dev. Preview build takes ~10–15 minutes.

### Verification
- [ ] `eas.json` created with all three profiles
- [ ] `app.json` has `"package": "nz.daruma.dojo.multiplicationdojo"`
- [ ] `app.json` has `"versionCode": 1`
- [ ] EAS init succeeds and adds `projectId` to `app.json`
- [ ] Preview build completes without errors
- [ ] Preview APK downloads and installs on physical Android device
- [ ] ALL screens work in preview build (no Metro server, fully standalone)
- [ ] No white flash, no status bar issues, all animations play
- [ ] Production AAB build completes without errors

### Commit
```
feat: EAS build config — preview and production Android profiles
```

### Play Store submission (human steps — not agent tasks)
1. Google Play Console: play.google.com/console ($25 one-time developer fee)
2. Create app with package `nz.daruma.dojo.multiplicationdojo`
3. Upload production `.aab` to Internal Testing track
4. Complete store listing:
   - App icon: 512×512px PNG
   - Feature graphic: 1024×500px
   - Screenshots: minimum 2, maximum 8
   - Short description: max 80 characters
   - Full description: max 4000 characters
5. Complete content rating questionnaire (select "Educational")
6. Submit for review — first submission typically takes 1–3 days

