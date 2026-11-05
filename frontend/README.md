# Rupiverse — Frontend

React Native app built with [Expo](https://expo.dev) and TypeScript.

## Versions

| Tool / Package           | Version |
|--------------------------|---------|
| Node.js                  | 22.23.4 |
| npm                      | 10.9.9  |
| Expo SDK                 | 58.0.23 |
| React Native             | 0.88.1  |
| React                    | 19.3.0  |
| React DOM (web)          | 19.3.0  |
| React Native Web         | 0.21.4  |
| TypeScript               | 6.0.3   |
| expo-status-bar          | 58.0.4  |
| @types/react             | 19.3.0  |
| ESLint                   | 9.39.5  |
| eslint-config-expo       | 58.0.4  |
| @stylistic/eslint-plugin | 5.10.0  |
| husky                    | 9.1.7   |
| lint-staged              | 17.6.0  |

## Getting started

```bash
npm install
npm start          # start the Expo dev server
npm run android    # open on Android
npm run ios        # open on iOS
npm run web        # open in the browser
```

## Code style

Code is formatted in the default JetBrains WebStorm style: 4-space indent, 120-column lines, double quotes,
semicolons, and no spaces inside object/import braces (`import {View} from "react-native"`).

- `eslint.config.mjs` enforces it (Expo's lint rules plus `@stylistic` formatting rules).
- `.editorconfig` carries the same settings for WebStorm (`ij_*` keys), so **Code → Reformat Code** produces lint-clean
  code.

```bash
npm run lint      # check
npm run lint:fix  # auto-fix formatting
```

**Editors:** open this `frontend` folder itself as the project root (not the repo root).

- **Cursor / VS Code:** `.vscode/settings.json` applies. Install the recommended extensions when prompted
  (ESLint, EditorConfig). Files are fixed on save (⌘S), and Format Document (⇧⌥F) uses ESLint.
- **WebStorm:** picks up `.editorconfig` for Reformat Code (⌥⌘L), and `.idea/jsLinters/eslint.xml` turns on
  "Run eslint --fix on save".

**Pre-commit hook:** `npm install` sets up a husky hook (`.husky/pre-commit`) that runs `eslint --fix` (via
lint-staged) on staged frontend files at every commit. Commits with lint errors or warnings are blocked.
