# L3ED Repository – Comprehensive Repair & Refactor Plan

Below is an **opinionated, step‑by‑step _Cursor_ repair plan** for the **L3ED** repository (`github.com/OldMikeB80/L3ED`).  
Follow it top‑to‑bottom in a single Cursor session (each _Task n_ is an atomic commit) and you will arrive at a cleanly‑building project with far better type‑safety, tooling, and maintainability.

---

## 0  Project at a Glance

| Item                 | Current state                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | React‑Native app to prepare NDT professionals for the ASNT Level III exam                                             |
| **RN / TS versions** | React Native 0.80.1, Node 18, TypeScript (no strict settings)                                                         |
| **Data layer**       | Singleton **`DatabaseService`** wrapping `react‑native‑sqlite‑storage`                                                |
| **State**            | Redux Toolkit slices for questions, user, tests, etc.                                                                 |
| **UI**               | React Navigation (stack + tabs) + React‑Native‑Paper                                                                  |
| **Pain points**      | One‑line source files, broken types, unused/“TODO” database methods, build failures on Android, missing charts, no CI |

---

## 1  Root Causes & High‑Level Fixes

| Symptom                                                    | Root cause                                                   | High‑level fix                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Unreadable one‑line files**                              | Prettier disabled / mis‑configured                           | Re‑enable Prettier with project rules; run `npx prettier --write .`             |
| **Typing failures** (`ReturnType` without arg, many `any`) | Incomplete generics and slices dispatching raw `any`         | Strictify TS config; patch bad type aliases; adopt `ThunkAction` helpers        |
| **Android build stalls**                                   | Legacy NDK download + incompatible `react‑native-svg-charts` | Replace chart lib; upgrade NDK via AGP 8.5+; cache Gradle                       |
| **SQLite schema drift**                                    | No migration system                                          | Store DB version in `PRAGMA user_version`; add incremental migration runner     |
| **Large SQL in JavaScript**                                | Inline string literals                                       | Extract constants or use schema builder (e.g., drizzle‑orm/Expo‑SQLite wrapper) |
| **Missing test coverage**                                  | Jest config committed but no tests other than placeholder    | Add slice‑level and DB unit tests; configure Detox for e2e                      |

---

## 2  Detailed‑Task Checklist (copy straight into Cursor)

> **Tip** – in Cursor, create a branch `fix/refactor` first.  
> Apply each **Task** as an individual commit so you can easily bisect.

### Task 1  ▶ Set up Formatting & Linting

```bash
# root
npm i -D prettier eslint eslint-config-react-native eslint-plugin-react        eslint-plugin-react-hooks eslint-plugin-import typescript@5.x
```

**.prettierrc.js**

```js
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  endOfLine: 'auto',
};
```

**.eslintrc.js**

```js
module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:import/errors'],
  plugins: ['react', 'react-hooks'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};
```

Add scripts to **package.json**

```jsonc
{
  "scripts": {
    "lint": "eslint \"**/*.{ts,tsx}\" --max-warnings=0",
    "format": "prettier --write ."
  }
}
```

Run:

```bash
npm run format && npm run lint
```

---

### Task 2  ▶ Fix the Redux Store Typing Bug

Edit **`src/store/store.ts`**

```diff
-export type RootState = ReturnType;
+export type RootState = ReturnType<typeof store.getState>;
```

Add the proper generic to `ReturnType` to regain accurate `RootState` typing.

---

### Task 3  ▶ Replace `any` Dispatches in Slices

In every slice (e.g. **questionSlice.ts**, **settingsSlice.ts**) replace:

```ts
dispatch(loadCategories() as any);
```

with:

```ts
import type { AppDispatch } from '../store';
const appDispatch = useDispatch<AppDispatch>();
appDispatch(loadCategories());
```

Also expose a **`useAppDispatch`** hook from `store.ts` so components stay concise.

---

### Task 4  ▶ Break Long Single‑Line Sources into Readable Code

Run:

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

Most files, such as **App.tsx** and **DatabaseService.ts**, become hundreds of nicely wrapped lines instead of one unreadable blob.

---

### Task 5  ▶ Harden the Database Layer

1. **Versioning**

   ```ts
   const CURRENT_SCHEMA_VERSION = 1;

   private async checkAndUpdateDatabase() {
     const [res] = await this.database.executeSql('PRAGMA user_version;');
     const current = res.rows.item(0).user_version as number;
     if (current < CURRENT_SCHEMA_VERSION) {
       await this.runMigrations(current);
       await this.database.executeSql(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION};`);
     }
   }
   ```

2. **Transactions**

   Wrap `insertQuestion` and similar bulk operations in `BEGIN TRANSACTION … COMMIT` to cut write time ~90 %.

3. **Parameter Helpers**

   Build small helpers for generating `?, ?, …` placeholders so the huge SQL strings remain readable.

---

### Task 6  ▶ Implement the “TODO” Data‑Access Methods

Finish stubs in **DatabaseService.ts** (`toggleBookmark`, `updateUserProgress`, etc.).  
Use **parameterized queries** and return typed results (`Promise<void>` or specific model).

---

### Task 7  ▶ Replace `react‑native-svg-charts`

Switch to **`victory-native`**:

```bash
npm i victory-native react-native-svg
```

Update **ProgressScreen.tsx**:

```diff
-import { BarChart } from 'react-native-svg-charts';
+import { VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
```

---

### Task 8  ▶ Enable Hermes + New Android NDK

- **android/gradle.properties**

  ```properties
  ReactNativeArchitectures=arm64-v8a,armeabi-v7a,x86_64
  ```

- **build.gradle**

  ```gradle
  android {
      compileSdkVersion = 34
      ndkVersion = "27.0.11718014" // matches AGP 8.5+
  }
  ```

Re‑run:

```bash
./gradlew clean
npx react-native run-android
```

---

### Task 9  ▶ Strict TypeScript & Path Aliases

- **tsconfig.json**

  ```jsonc
  {
    "compilerOptions": {
      "strict": true,
      "baseUrl": "./src",
      "paths": {
        "@screens/*": ["screens/*"],
        "@store/*": ["store/*"],
        "@services/*": ["services/*"],
        "@models/*": ["models/*"],
        "@constants/*": ["constants/*"]
      }
    }
  }
  ```

Add missing `index.ts` barrels for each alias directory.

---

### Task 10  ▶ Continuous Integration (Optional but Recommended)

Create **.github/workflows/ci.yml**

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install
      - run: bun run lint
      - run: bun x tsc --noEmit
```

Swap `bun` for `npm` if you prefer.

---

## 3  Next Features & Polish

1. **Charts** – once Victory is in, extend to mock‑exam progress & streak visualisation.
2. **Offline sync** – schedule `redux‑persist` + periodic `DatabaseService` backup to cloud.
3. **Accessibility** – ensure RN Paper components have `accessibilityLabel`.
4. **E‑2‑E tests** – Detox scripts for login‑free flows (study mode, mock exam).
5. **App icons & splash** – follow `APP_ICON_INSTRUCTIONS.md` for production branding.

---

## 4  Done

After completing Tasks 1‑9 you should be able to:

```bash
npm run android   # < 10 min cold build
npm run ios       # if on macOS
npm test          # slice & DB unit tests green
```

Happy coding — and good luck on the ASNT Level III exam!
