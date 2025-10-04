# FitnessTracker Navigation Structure

## Overview
The app uses a bottom tab navigator with three main sections, each containing its own stack navigator.

## Navigation Hierarchy

```
App
└── Bottom Tab Navigator
    ├── Workout Tab (Dark Theme)
    │   └── Workout Stack Navigator
    │       ├── WorkoutCalendarScreen (Initial)
    │       ├── WorkoutDayScreen
    │       └── AddWorkoutScreen
    │
    ├── Nutrition Tab (Light Theme)
    │   └── Nutrition Stack Navigator
    │       ├── NutritionCalendarScreen (Initial)
    │       ├── NutritionDayScreen
    │       └── AddMealScreen
    │
    └── Profile Tab (Light Theme)
        └── Profile Stack Navigator
            ├── ProfileScreen (Initial)
            └── CalorieGoalScreen
```

## Tab Styling

### Workout Tab
- **Theme**: Dark
- **Background**: `#1a1a1a`
- **Active Tint**: `#00ff88` (neon green)
- **Icon**: Fitness/Dumbbell
- **Header Background**: `#1a1a1a`
- **Header Text**: `#00ff88`

### Nutrition Tab
- **Theme**: Light
- **Background**: `#ffffff`
- **Active Tint**: `#4CAF50` (green)
- **Icon**: Nutrition/Apple
- **Header Background**: `#ffffff`
- **Header Text**: `#4CAF50`

### Profile Tab
- **Theme**: Light
- **Background**: `#ffffff`
- **Active Tint**: `#2196F3` (blue)
- **Icon**: Person/User
- **Header Background**: `#ffffff`
- **Header Text**: `#2196F3`

## Screen Files

### Workout Screens
- `/src/screens/workout/WorkoutCalendarScreen.js` - Main workout calendar view
- `/src/screens/workout/WorkoutDayScreen.js` - Details for a specific workout day
- `/src/screens/workout/AddWorkoutScreen.js` - Form to add new workouts

### Nutrition Screens
- `/src/screens/nutrition/NutritionCalendarScreen.js` - Main nutrition calendar view
- `/src/screens/nutrition/NutritionDayScreen.js` - Details for a specific nutrition day
- `/src/screens/nutrition/AddMealScreen.js` - Form to log meals

### Profile Screens
- `/src/screens/profile/ProfileScreen.js` - Main profile view
- `/src/screens/profile/CalorieGoalScreen.js` - Set calorie goals

## Navigation Usage Examples

### Navigate within a stack:
```javascript
// From WorkoutCalendarScreen to WorkoutDayScreen
navigation.navigate('WorkoutDay', { date: '2025-10-04' });

// From NutritionCalendarScreen to AddMealScreen
navigation.navigate('AddMeal');

// From ProfileScreen to CalorieGoalScreen
navigation.navigate('CalorieGoal');
```

### Navigate between tabs:
```javascript
// Navigate to Nutrition tab
navigation.navigate('Nutrition');

// Navigate to specific screen in another tab
navigation.navigate('Workout', { 
  screen: 'AddWorkout' 
});
```

### Go back:
```javascript
navigation.goBack();
```

## Next Steps

1. Implement actual functionality in each screen
2. Add form inputs and validation
3. Integrate with AsyncStorage for data persistence
4. Add calendar components using date-fns
5. Implement context providers for global state management

