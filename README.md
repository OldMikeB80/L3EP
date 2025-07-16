# L3EP - Level 3 Exam Prep

A comprehensive React Native application designed to help NDT (Non-Destructive Testing) professionals prepare for their ASNT Level III certification exams.

## Features

- **Study Mode**: Review questions at your own pace with detailed explanations
- **Practice Tests**: Take 15-question practice tests to assess your knowledge
- **Mock Exams**: Simulate the full 150-question certification exam experience
- **Progress Tracking**: Monitor your performance across different categories
- **Category Focus**: Study specific topics like:
  - Certification Standards (SNT-TC-1A, CP-189, ISO 9712)
  - Materials & Processes
  - NDT Methods (PT, MT, RT, UT, ET, VT, etc.)
  - Safety & Quality

## Design

The app features a distinctive maize and blue color scheme:
- Primary: Michigan Blue (#00274C)
- Accent: Michigan Maize (#FFCB05)

## Tech Stack

- React Native 0.80.1
- TypeScript
- Redux Toolkit for state management
- SQLite for local data storage
- React Navigation for routing
- React Native Paper for UI components

## Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment set up
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd L3EP

# Install dependencies
npm install

# iOS only
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Development

The app includes development tools accessible when running in debug mode:
- Force seed database with sample questions
- View current data statistics
- Debug information overlay

## Build Issues

If you encounter build issues, refer to `BUILD_ISSUES.md` for common solutions.

## License

This project is proprietary software. All rights reserved.
