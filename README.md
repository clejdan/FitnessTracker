# FitnessTracker

A React Native fitness tracking application built with Expo.

## Features

- Workout tracking
- Nutrition monitoring
- Profile management
- Cross-platform support (iOS, Android, Web)

## Tech Stack

- React Native with Expo
- React Navigation (Bottom Tabs & Stack)
- React Native Paper (UI Components)
- AsyncStorage for data persistence
- Date-fns for date manipulation
- UUID for unique identifiers
- React Native Gesture Handler
- React Native Reanimated

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
│   ├── workout/    # Workout-related screens
│   ├── nutrition/  # Nutrition-related screens
│   └── profile/    # Profile-related screens
├── navigation/     # Navigation configuration
├── services/       # API and data services
├── utils/          # Utility functions
└── context/        # React Context providers
```

## Dependencies

- @react-navigation/native
- @react-navigation/bottom-tabs
- @react-navigation/stack
- react-native-screens
- react-native-safe-area-context
- @react-native-async-storage/async-storage
- date-fns
- react-native-paper
- uuid
- react-native-gesture-handler
- react-native-reanimated

