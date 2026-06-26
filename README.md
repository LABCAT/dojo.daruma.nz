# Daruma Dojo

Monorepo for [Daruma NZ](https://daruma.nz) micro-learning apps — gamified drills with a Japanese martial-arts aesthetic.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 24 LTS | Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm). Expo SDK 56 requires ≥ 22.13. |
| **pnpm** | ≥ 9 | `npm install -g pnpm` |
| **Expo Go** | latest | Easiest way to run on a physical device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) |

Optional (for simulators / native builds):

- **Android Studio** — Android emulator
- **Xcode** — iOS simulator (macOS only)

## Getting started

```bash
# 1. Use the correct Node version
nvm use          # reads .nvmrc (Node 24 LTS)
# fnm users: fnm use

# 2. Install dependencies (from repo root)
pnpm install

# 3. Start Multiplication Dojo
pnpm dojo
```

The Expo dev server opens in your terminal. Scan the QR code with **Expo Go** on your phone (same Wi‑Fi network), or press:

- `a` — open Android emulator
- `i` — open iOS simulator (macOS + Xcode only)
- `w` — web (requires extra deps; see below)

## Scripts

Run from the **repo root**:

| Command | Description |
|---------|-------------|
| `pnpm dojo` | Start Multiplication Dojo dev server |
| `pnpm dojo:android` | Start and open Android |
| `pnpm dojo:ios` | Start and open iOS |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |
| `pnpm build` | Build all packages (Turbo) |

App-specific scripts live in `apps/multiplication-dojo/package.json` and can be run with:

```bash
pnpm --filter multiplication-dojo <script>
```

## Project structure

```
dojo.daruma.nz/
├── apps/
│   └── multiplication-dojo/   # Expo app (Expo Router + NativeWind)
├── packages/
│   └── ui/                    # Shared @daruma/ui components & theme
├── AGENTS.md                  # AI / contributor conventions
├── .nvmrc                     # Node version for nvm / fnm
└── pnpm-workspace.yaml
```

## Web (optional)

Mobile is the primary target. To run in a browser:

```bash
pnpm --filter multiplication-dojo exec npx expo install react-dom react-native-web
pnpm --filter multiplication-dojo web
```

## Troubleshooting

**`UnexpectedServerData: No returned query result`** — Expo CLI found **stale login credentials** on your machine and failed to fetch your user from expo.dev. This is not a project config issue. Clear them:

```bash
pnpm --filter multiplication-dojo exec expo logout
pnpm dojo
```

Log back in only if you need EAS/cloud features: `pnpm --filter multiplication-dojo exec expo login`. Local Expo Go dev works fine without an account.

If logout doesn't help, try `expo start --offline` as a temporary fallback (skips all expo.dev API calls).

**Port already in use** — Kill the old Metro process (Ctrl+C) or run on another port:

```bash
pnpm --filter multiplication-dojo exec expo start --port 8083
```

**Wrong Node version** — Use Node 24 LTS (`nvm use`). Minimum for Expo SDK 56 is 22.13.

**Metro can't resolve `@daruma/ui`** — Reinstall from root: `pnpm install`.

**Stale cache** — From `apps/multiplication-dojo`:

```bash
npx expo start --clear
```

**Peer dependency warnings** — Align native modules with Expo:

```bash
cd apps/multiplication-dojo
npx expo install --fix
```

## Adding a new app

See [AGENTS.md](./AGENTS.md) for monorepo conventions, design tokens, and the new-app checklist.
