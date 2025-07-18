# L3EP Android-Only Migration Fix Guide

## Project Overview
- **Repository**: github.com/OldMikeB80/L3EP
- **Goal**: Migrate the React Native project to Android-only, removing iOS/cross-platform code, dependencies, and configurations. Fix compilation, build, and runtime errors to ensure the app (exam prep with study mode, practice tests, progress tracking, offline support) runs on Android, optimized for Samsung Galaxy devices.
- **Tech Stack**: React Native 0.80.1, TypeScript, Redux Toolkit, React Native SQLite Storage, React Navigation, React Native Paper.
- **Common Issues**:
  - iOS remnants (e.g., `Platform.OS === 'ios'` checks) causing lint errors or dead code.
  - Build failures from iOS scripts/dependencies in `package.json` or Metro config.
  - Gradle errors in `android/` due to misconfigured build files.
  - Runtime crashes from platform-specific logic (e.g., file paths, permissions).
  - TypeScript errors from removed iOS imports.
  - Samsung-specific optimizations (e.g., RenderScript, hardware acceleration) misconfigured.

## Fix Instructions

### 1. Clean Up Project Structure
- **Remove iOS Files**:
  - Delete `/ios` directory, `Podfile`, `Podfile.lock`, `/Pods`, `.xcodeproj`, `.xcworkspace`.
  - Run `ls -a` to check for hidden iOS files and remove them.
- **Update package.json**:
  - Remove iOS scripts (e.g., `"ios": "react-native run-ios"`, `"pod-install": "cd ios && pod install"`).
  - Remove iOS-specific dependencies (e.g., `@react-native-community/push-notification-ios`).
  - Example fixed `package.json`:
    ```json
    {
      "scripts": {
        "android": "react-native run-android",
        "start": "react-native start",
        "test": "jest",
        "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
      },
      "dependencies": {
        "react": "18.2.0",
        "react-native": "0.80.1",
        "@reduxjs/toolkit": "^2.2.7",
        "react-native-paper": "^5.12.5",
        "react-native-sqlite-storage": "^6.0.1",
        "@react-navigation/native": "^7.0.0"
      },
      "devDependencies": {
        "@babel/core": "^7.20.0",
        "@typescript-eslint/parser": "^7.0.0",
        "eslint": "^8.0.0",
        "jest": "^29.7.0"
      }
    }
    ```
  - Run `npm install` or `yarn install` to update.
- **Update Metro Config**:
  - In `metro.config.js`, remove iOS-specific settings (e.g., `watchFolders` for iOS assets).
  - Example fixed `metro.config.js`:
    ```javascript
    module.exports = {
      transformer: {
        getTransformOptions: async () => ({
          transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
          },
        }),
      },
      resolver: {
        sourceExts: ['tsx', 'ts', 'jsx', 'js'],
        platforms: ['android'],
      },
    };
    ```
- **Verify**:
  - Run `npx react-native doctor` to detect iOS-related issues.
  - If errors persist, delete `node_modules` and `package-lock.json`, then reinstall.

### 2. Fix Android Build Configurations
- **Update Root build.gradle** (`android/build.gradle`):
  - Remove unnecessary plugins or iOS-related repositories.
  - Example fixed file:
    ```groovy
    buildscript {
      ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24
        compileSdkVersion = 34
        targetSdkVersion = 34
        kotlinVersion = "1.9.24"
      }
      repositories {
        google()
        mavenCentral()
      }
      dependencies {
        classpath("com.android.tools.build:gradle:8.5.1")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
      }
    }

    allprojects {
      repositories {
        mavenCentral()
        maven { url 'https://www.jitpack.io' }
      }
    }
    ```
- **Update App build.gradle** (`android/app/build.gradle`):
  - Enable Samsung optimizations (e.g., RenderScript, hardware acceleration).
  - Example fixed file:
    ```groovy
    android {
      compileSdkVersion rootProject.ext.compileSdkVersion
      defaultConfig {
        applicationId "com.oldmikeb80.l3ep"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
      }
      buildTypes {
        release {
          minifyEnabled true
          shrinkResources true
          proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
      }
      renderscriptTargetApi 24
      renderscriptSupportModeEnabled true
    }

    dependencies {
      implementation fileTree(dir: "libs", include: ["*.jar"])
      implementation "androidx.appcompat:appcompat:1.6.1"
      implementation "com.facebook.react:react-native:+"
    }
    ```
- **Update AndroidManifest.xml** (`android/app/src/main/AndroidManifest.xml`):
  - Ensure Android permissions (e.g., storage for offline support) and hardware acceleration.
  - Example snippet:
    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android">
      <uses-permission android:name="android.permission.INTERNET" />
      <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
      <application
        android:hardwareAccelerated="true"
        android:label="@string/app_name">
        <activity android:name=".MainActivity" />
      </application>
    </manifest>
    ```
- **Build**:
  - Run `./gradlew clean` then `./gradlew assembleDebug` to test.
  - Check logs if errors occur.

### 3. Refactor Source Code
- **Remove iOS Code**:
  - Search for `Platform.OS` in `src/` and remove iOS paths.
  - Example problematic code (e.g., in `src/utils/fileUtils.ts`):
    ```tsx
    import { Platform } from 'react-native';

    const getStoragePath = () => {
      if (Platform.OS === 'ios') {
        return 'ios/path';
      }
      return 'android/path';
    };
    ```
    Fixed:
    ```tsx
    const getStoragePath = () => 'android/path';
    ```
- **Fix Imports**:
  - Remove iOS-specific imports (e.g., `import { LinkingIOS } from 'react-native';`).
  - Run `tsc --noEmit` to catch TypeScript errors.
- **Update UI Components**:
  - In `src/screens/` (e.g., `StudyScreen.tsx`, `PracticeTestScreen.tsx`), replace iOS-specific components (e.g., iOS date pickers) with React Native Paper equivalents.
  - Example:
    ```tsx
    // Original with potential iOS picker
    import { DatePickerIOS } from 'react-native';
    // Replace with:
    import { DatePicker } from 'react-native-paper';
    ```
- **Database (SQLite)**:
  - Ensure `react-native-sqlite-storage` is Android-only; remove iOS fallbacks.
- **Redux**:
  - In `src/store/`, ensure actions/reducers are platform-agnostic or Android-specific.
- **Lint and Format**:
  - Run `npm run lint` and `npm run format` to fix code style.

### 4. Handle Common Errors
- **Build Errors**:
  - Metro bundler issues: Update `metro.config.js` or clear cache (`npx react-native start --reset-cache`).
  - Gradle sync failures: Check `android/build.gradle` logs; ensure correct SDK versions.
- **Runtime Crashes**:
  - Debug with `adb logcat`.
  - Fix permissions (e.g., storage for offline mode) in `AndroidManifest.xml`.
- **TypeScript Errors**:
  - Resolve missing imports or types post-iOS removal.
  - Use `@ts-ignore` for temporary suppression if needed.
- **Samsung Optimizations**:
  - Verify `renderscriptSupportModeEnabled` and `android:hardwareAccelerated="true"`.

### 5. Build and Test
- **Commands**:
  - Start Metro: `npx react-native start`.
  - Build and run: `npx react-native run-android`.
- **Test Features**:
  - Study mode, practice tests, mock exams, progress tracking, offline support.
  - Use Samsung emulator/device to verify optimizations.
- **Debug**:
  - Use Android Studio or `adb logcat` for crash logs.
  - Run `npm test` for unit tests; remove iOS-specific mocks.

### 6. Checklist
- [ ] All iOS files, scripts, and dependencies removed.
- [ ] Builds successfully (`./gradlew build`).
- [ ] No runtime crashes on Android.
- [ ] All features functional on Samsung devices.
- [ ] Code linted and formatted (`npm run lint`, `npm run format`).

## Next Steps
- Save this file as `android-migration-fix-guide.md`.
- Commit to repo: `git add android-migration-fix-guide.md`, `git commit -m "Add Android migration fix guide"`, `git push`.
- Feed to Cursor for processing.
- If errors persist, collect logs (e.g., from `npx react-native run-android`) and feed back to Cursor with this file.