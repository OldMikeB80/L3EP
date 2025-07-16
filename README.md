# NDT Exam Prep Mobile App

A comprehensive React Native application for Non-Destructive Testing (NDT) Level III exam preparation.

## Features

- 📚 **1000+ Practice Questions**: Extensive question bank covering all NDT methods
- 🎯 **Multiple Test Modes**: Practice tests, mock exams, and study mode
- 📊 **Progress Tracking**: Detailed analytics and performance metrics
- 🏷️ **Bookmarking**: Save questions for later review
- ⏱️ **Timer Functionality**: Simulate real exam conditions
- 📐 **Formula Support**: LaTeX rendering for mathematical formulas
- 🖼️ **Image Support**: Questions with diagrams and illustrations
- 📱 **Offline Mode**: Study anywhere without internet connection
- 🎨 **Modern UI**: Material Design with smooth animations

## Tech Stack

- React Native 0.80.1
- TypeScript
- Redux Toolkit for state management
- SQLite for local database
- React Navigation for routing
- React Native Paper for UI components
- React Native Katex for formula rendering

## Prerequisites

- Node.js 18+
- Java JDK 17+ (JDK 21 recommended)
- Android Studio with Android SDK
- USB Debugging enabled on your Android device

## Installation

1. Clone the repository and navigate to the project:
```bash
cd /Users/michael.belcher/Downloads/ndt-exam-prep/NDTExamPrep
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
```

4. Connect your Android device with USB debugging enabled

5. Build and run the app:
```bash
npx react-native run-android
```

## Project Structure

```
src/
├── models/          # TypeScript interfaces and types
├── screens/         # React Native screen components
├── services/        # Database and API services
├── store/           # Redux store and slices
└── data/           # Question bank and seed data
```

## Database Schema

The app uses SQLite with the following tables:
- users
- questions
- categories
- user_progress
- test_sessions
- test_responses
- bookmarks
- study_sessions
- achievements
- user_achievements
- user_settings

## Available Screens

1. **Home Screen**: Main navigation hub
2. **Test Screen**: Take practice tests
3. **Study Mode**: Browse questions by category
4. **Mock Exam Setup**: Configure full-length exams
5. **Progress Screen**: View statistics and achievements
6. **Results Screen**: Detailed test results
7. **Categories Screen**: Browse questions by NDT method

## Development

To start the Metro bundler:
```bash
npx react-native start
```

To run on Android:
```bash
npx react-native run-android
```

To run on iOS (macOS only):
```bash
cd ios && pod install
npx react-native run-ios
```

## Troubleshooting

### Java Version Issues
Ensure you're using JDK 17 or higher:
```bash
java -version
```

### ADB Not Found
Add Android SDK tools to your PATH:
```bash
export PATH=$PATH:~/Library/Android/sdk/platform-tools
```

### Device Not Authorized
Check your device for the "Allow USB debugging?" prompt and accept it.

## License

This project is proprietary software for NDT exam preparation.
