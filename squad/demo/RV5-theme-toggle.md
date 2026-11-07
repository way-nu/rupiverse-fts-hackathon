# RV5 - Theme toggle

Add an in-app light/dark theme switch to RupiVerse, so users can pick Calm (light) or Midnight (dark) instead of always following their device. Today the theme comes only from the device setting (`useScheme()` in `frontend/src/hooks/use-theme.ts`). This is frontend-only work. It needs no database, no backend and no Supabase, so anyone can build and test it on a fresh clone.

**Scope in brief**
- **Frontend:** a theme toggle on the Login, Create account (Signup) and Home screens. The choice applies across the whole app at once.
- **Frontend:** the choice is saved on the device and survives a page reload or app restart.
- **Backend / data:** none. The preference stays on the device, so there are no API changes and no migration.

**Spec:** `RV5 · Theme toggle — Spec` (your PM agent writes this from this ticket)
**Done when:** every acceptance criterion in the Spec passes and the owner has merged.

---

## Try it without a backend

You don't need Postgres, Supabase, SMTP or a running API for this ticket. Leave every backend value blank.

```bash
cd frontend
npm install
cp .env.example .env
# in .env set: EXPO_PUBLIC_API_MODE=mock
EXPO_PUBLIC_API_MODE=mock npx expo start --web
```

- **Mock mode:** `EXPO_PUBLIC_API_MODE=mock` runs the whole app on in-app mocks, so no request leaves the browser.
- **Login and Create account:** the toggle can be checked on these screens straight away.
- **Home:** log in with the mock demo account `demo@rupiverse.app` / `Demo@1234`. Any email code in mock mode is `123456`.
- **Resetting:** `window.__mock.reset()` in the browser console resets the mock data.

---

## Notes for the PM agent writing the Spec

These are decisions for the owner. The design export (`frontend/design/`) has the two themes (`THEMES.calm` and `THEMES.midnight` in `rupiverse-theme.jsx`) but **no in-app toggle**. Its "Dark mode" switch is in `tweaks-panel.jsx`, which is the design tool's own panel, not app UI. Ask before writing the Spec rather than inventing UI. Suggested defaults are in brackets.

1. **Options:** Light / Dark only, or Light / Dark / System? [Light / Dark / System, defaulting to System so today's behaviour is unchanged]
2. **Look and placement:** what does the toggle look like, and where does it sit on Login, Signup (desktop split and mobile) and Home? [a small icon button at the top right]
3. **Saved where:** on the device only (localStorage on web, the native equivalent on iOS and Android), or on the user's account? [device only, which keeps the backend out of scope]
4. **Other screens:** the rest of the app (Verify, Forgot password, Profile) follows the chosen theme. Should the toggle itself also appear there? [follow the theme, toggle only on the three screens above]

## Out of scope (future tickets)

- Saving the theme on the user's account or syncing it across devices
- New themes beyond Calm and Midnight
- A Settings screen

## What must be followed

`frontend/CLAUDE.md` and `frontend/AGENTS.md`:
- The toggle goes in `src/components/<name>/` with its logic in `hooks.ts`.
- Colours come from `src/constants/theme.ts` only.
- Every interactive element and state gets a `testID`.
- Playwright specs run in the `mock` project at the six standard sizes, in both themes.
