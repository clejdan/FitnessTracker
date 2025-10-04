# Profile Screens

This directory contains all profile-related screens for the FitnessTracker app.

## ProfileScreen.js

The main profile screen that displays user information and calorie goals.

### Features

#### 1. **Data Loading**
- Loads profile and calorie goal data on mount using `useFocusEffect`
- Automatically refreshes when screen comes into focus
- Shows loading spinner while fetching data

#### 2. **Empty State**
When no profile exists, shows:
- Welcome message
- App description
- "Set Up Profile" button
- Large icon illustration
- Navigates to EditProfileScreen

#### 3. **Profile Display Section**
Displays user information in organized cards:

**Height Card:**
- Shows height in selected unit (cm or inches)
- Unit toggle button (tap to switch between cm and feet/inches)
- Icon: resize-outline

**Weight Card:**
- Shows weight in selected unit (kg or lbs)
- Unit toggle button (tap to switch between kg and lbs)
- Icon: scale-outline

**Age Card:**
- Displays user age in years
- Icon: calendar-outline

**Gender Card:**
- Displays user gender (capitalized)
- Icon: person-outline

**Activity Level Card:**
- Displays activity level (formatted)
- Shows description (e.g., "Moderate exercise 3-5 days/week")
- Icon: fitness-outline

#### 4. **Calorie Goal Section**
Displays current calorie goal information:

**Main Goal Card (when goal exists):**
- Large "Daily Calorie Goal" heading
- Goal value in kcal (prominently displayed)
- Color-coded badge:
  - 🔴 Red: Deficit
  - 🔵 Blue: Maintenance
  - 🟢 Green: Surplus
- Estimated weekly weight change (±X.X lbs per week)

**Maintenance Info Card:**
- Shows calculated or custom maintenance calories
- Displays goal offset (e.g., "-500 kcal deficit")
- Icon: speedometer-outline

**No Goal State:**
- Alert icon
- "No Calorie Goal Set" message
- Explanation text
- "Set Calorie Goal" button

#### 5. **Navigation**
- **Edit Profile** button → EditProfileScreen
- **Edit Goal** button → CalorieGoalScreen
- **Set Up Profile** button (empty state) → EditProfileScreen
- **Set Calorie Goal** button (no goal) → CalorieGoalScreen

#### 6. **Unit Conversions**
- Automatically converts between metric and imperial units
- Uses utility functions from `calorieCalculations.js`
- Preserves original unit from profile data
- Formats height as feet/inches for imperial display

### Styling

**Colors:**
- Background: `#f8f9fa` (light gray)
- Cards: `#ffffff` (white) with elevation
- Primary: `#2196F3` (blue)
- Text: `#333` (dark gray)
- Secondary text: `#666`, `#999`
- Deficit badge: `#f44336` (red)
- Surplus badge: `#4CAF50` (green)
- Maintenance badge: `#2196F3` (blue)

**Layout:**
- Padding: 16px
- Card margins: 6-8px vertical
- Responsive ScrollView
- Clean, organized sections with dividers

### Dependencies

```javascript
import { getProfile, getCalorieGoal } from '../../services/storageService';
import { 
  convertKgToLbs, 
  convertCmToInches,
  getActivityLevelDescription 
} from '../../utils/calorieCalculations';
```

### State Management

```javascript
const [profile, setProfile] = useState(null);
const [calorieGoal, setCalorieGoal] = useState(null);
const [loading, setLoading] = useState(true);
const [weightUnit, setWeightUnit] = useState('kg');
const [heightUnit, setHeightUnit] = useState('cm');
```

### Usage Example

```javascript
// Profile data structure
{
  height: { value: 175, unit: 'cm' },
  weight: { value: 75, unit: 'kg' },
  age: 30,
  gender: 'male',
  activityLevel: 'moderate'
}

// Calorie goal data structure
{
  calculatedMaintenance: 2200,
  customMaintenance: null,
  goalType: 'deficit',
  goalOffset: -500,
  finalGoal: 1700,
  estimatedWeeklyChange: -1.0,
  useCustom: false
}
```

## EditProfileScreen.js

**Status:** Placeholder screen (coming soon)

This screen will allow users to:
- Edit height, weight, age
- Select gender
- Choose activity level
- Save profile to storage
- Calculate initial TDEE

## CalorieGoalScreen.js

**Status:** Placeholder screen (coming soon)

This screen will allow users to:
- View calculated maintenance calories (TDEE)
- Choose from preset goals (deficit/maintenance/surplus)
- Set custom maintenance calories
- Select goal offset (-1000 to +1000 cal)
- See estimated weekly weight change
- Save calorie goal to storage

## Navigation Structure

```
ProfileStack
├── ProfileMain (ProfileScreen)
├── EditProfile (EditProfileScreen)
└── CalorieGoal (CalorieGoalScreen)
```

## Future Enhancements

1. **Profile Editing:**
   - Form with input fields for all profile data
   - Validation for height, weight, age
   - Unit selection (metric vs imperial)
   - Activity level picker

2. **Calorie Goal Setup:**
   - Visual goal selector with cards
   - TDEE calculation display
   - Custom maintenance input
   - Goal offset slider
   - Weight change visualization

3. **Additional Features:**
   - Profile photo upload
   - Progress photos
   - Body measurements tracking
   - Export data functionality
   - Dark mode support
   - Haptic feedback on unit toggle
