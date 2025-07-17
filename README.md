# L3EP - Level 3 Exam Prep

ASNT Level III certification exam preparation app for Android devices, optimized for Samsung Galaxy.

## Features

- **Study Mode**: Browse questions by category with immediate feedback
- **Practice Tests**: Take 15-question tests to assess your knowledge
- **Mock Exams**: Full 150-question exams simulating the real certification test
- **Progress Tracking**: Monitor your performance across categories
- **Offline Support**: All questions stored locally for offline access
- **Michigan Theme**: Maize (#FFCB05) and Blue (#00274C) color scheme

## Technical Stack

- React Native 0.80.1 (New Architecture enabled)
- TypeScript with strict mode
- Redux Toolkit for state management
- SQLite for local data storage
- React Navigation for routing
- React Native Paper for UI components
- Optimized for Samsung Galaxy devices

## Setup Instructions

### Prerequisites

- Node.js 18+
- Java JDK 17
- Android Studio with Android SDK
- Android device or emulator (API 24+)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GeckoRobotics/L3EP.git
cd L3EP
```

2. Install dependencies:
```bash
npm install
```

3. Start Metro bundler:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

### Building for Release

1. Generate signed APK:
```bash
cd android && ./gradlew assembleRelease
```

2. Generate AAB for Play Store:
```bash
cd android && ./gradlew bundleRelease
```

## Project Structure

```
L3EP/
├── src/
│   ├── screens/          # App screens
│   ├── store/           # Redux store and slices
│   ├── services/        # Database and other services
│   ├── models/          # TypeScript interfaces
│   ├── data/            # Seed questions data
│   ├── constants/       # App constants (colors, etc.)
│   └── utils/           # Utility functions
├── android/             # Android-specific code
└── __tests__/          # Test files
```

## Development

- Run linter: `npm run lint`
- Format code: `npm run format`
- Run tests: `npm test`
- Clean build: `npm run clean:android`

## Samsung Galaxy Optimizations

- Hardware acceleration enabled
- RenderScript support for graphics
- Optimized for ARM architectures (armeabi-v7a, arm64-v8a)
- R8 full mode for better code optimization
- Resource shrinking for smaller APK size

## License

Proprietary - Gecko Robotics, Inc.
