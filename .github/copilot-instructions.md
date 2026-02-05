# Copilot instructions — citipark_offline_reg

Quick, actionable guidance for an AI coding agent to be productive in this repository.

## Project overview ✅
- Expo + TypeScript app (mobile + web via `expo-router`). Main app entry: `app/App.tsx`.
- Purpose: offline registration input that stores registration strings locally and attempts to sync on reconnect.
- Local persistence: `expo-sqlite` handled in `components/LocalData.tsx`.

## How to run (dev) ▶️
- Start Metro/Expo: `npm start` (alias `expo start`).
- Run on iOS: `npm run ios` (uses `expo run:ios`). Android: `npm run android`.
- Reset project skeleton: `npm run reset-project` (see `scripts/reset-project.js`).

## Key files & responsibilities 🔧
- `app/App.tsx` — app UI, network monitoring (`@react-native-community/netinfo`), sync logic entry points (`sendLocalRegistrations`, `clearLocalRegistrations`), and a bulk test helper `runBulkTest` (visible in `__DEV__`).
- `components/LocalData.tsx` — opens/initializes SQLite DB, exposes `addRegistration`, `getAllRegistrations`, and `clearRegistrations`.
- `app/_layout.tsx` — routing and theming (`expo-router`, `@react-navigation`).
- `tsconfig.json` — path alias `@/*` maps to repository root; imports commonly use `@/...`.

## Important implementation details & patterns ⚠️
- Database initialization: `getDB()` runs `PRAGMA journal_mode = WAL;` (performance/concurrency) and creates the `Registration` table.
  - NOTE: `getDB()` currently includes `DROP TABLE IF EXISTS Registration;` — this will remove persisted registrations on a fresh JS runtime/database open. Check intent before modifying DB schema.
- Schema & constraints: `Registration(Reg TEXT NOT NULL UNIQUE, created_at DEFAULT CURRENT_TIMESTAMP)` — registrations are unique.
- Normalization: `addRegistration` strips whitespace and uppercases (`reg.replace(/\s+/g,'').toUpperCase()`), which is the canonical form used throughout.
- Chunking strategy:
  - `sendLocalRegistrations` batches sends with `chunkSize = 1000` and pauses with `setTimeout(..., 0)` to yield to the UI.
  - `clearRegistrations()` deletes up to 100 rows using `LIMIT 100` — note this is a single-pass delete; to fully clear a large DB you must repeat deletion until empty.
- SQL alias gotcha: `getAllRegistrations()` uses `SELECT Reg AS reg ...` but maps `row.Reg` in code — validate column names (`row.reg` vs `row.Reg`) when reading results.

## Where to add work (common tasks) 💡
- Implement server sync: `sendLocalRegistrations` in `app/App.tsx` is the intended place for network calls. Ensure batch/ack semantics and idempotency.
- Robust clearing: update `clearLocalRegistrations` to loop deletions until DB empty (or delete only IDs acknowledged by the server) — don't rely on a single `LIMIT 100` deletion.
- Persistence behavior: remove `DROP TABLE IF EXISTS` in `getDB()` if you need durable local storage across app restarts.

## Testing & debugging tips 🧪
- Developer stress test: use the in-app `Run Bulk Test` button (visible only in `__DEV__`) to populate many registration rows via `runBulkTest()`.
- Emulate network changes using the device/emulator network toggles to trigger `NetInfo` listeners.
- Use `console.log` (already used throughout) and call `getAllRegistrations()` in the debugger to inspect DB state.

## Style & repo conventions 🧭
- TypeScript with `strict: true` — prefer typed exports and explicit `Promise<...>` return types.
- Use path alias `@/...` for imports from repo root.
- Keep UI-blocking operations batched and off the UI thread (existing pattern: Promise batching + short yields).

## Safety checklist for PRs that touch sync or DB
- Ensure normalization and uniqueness rules are preserved.
- Avoid accidental data loss (remove `DROP TABLE` only with migration strategy in place).
- Add/verify end-to-end behavior: insert offline → reconnect → send batches → remove only successfully synced rows.
- Add small manual steps in PR description to reproduce (e.g., bulk test, toggle network, run `getAllRegistrations()`).

---
If anything here is unclear or you'd like more detail on any part (DB, sync, or where to add tests), tell me which section and I'll expand or make it actionable. ✅
