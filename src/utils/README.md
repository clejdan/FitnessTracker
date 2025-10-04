# Utility Functions

This directory contains utility functions for the FitnessTracker app.

## calorieCalculations.js

Comprehensive utility functions for calculating BMR, TDEE, weight changes, and unit conversions.

### Core Functions

#### BMR Calculation
```javascript
import { calculateBMR } from './calorieCalculations';

const bmr = calculateBMR(75, 180, 30, 'male');
// Returns: 1822 calories/day
```

**Formula (Mifflin-St Jeor):**
- Male: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
- Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161

#### TDEE Calculation
```javascript
import { calculateTDEE } from './calorieCalculations';

const tdee = calculateTDEE(1822, 'moderate');
// Returns: 2824 calories/day
```

**Activity Multipliers:**
- Sedentary: 1.2 (little or no exercise)
- Light: 1.375 (light exercise 1-3 days/week)
- Moderate: 1.55 (moderate exercise 3-5 days/week)
- Active: 1.725 (hard exercise 6-7 days/week)
- Very Active: 1.9 (very hard exercise, physical job)

#### Weight Change Estimation
```javascript
import { calculateWeeklyWeightChange } from './calorieCalculations';

const change = calculateWeeklyWeightChange(-500);
// Returns: { lbs: -1.0, kg: -0.45 }
```

**Conversion Factors:**
- 3,500 calories ≈ 1 lb of fat
- 7,700 calories ≈ 1 kg of fat

#### Unit Conversions
```javascript
import { 
  convertLbsToKg, 
  convertKgToLbs,
  convertInchesToCm,
  convertCmToInches 
} from './calorieCalculations';

const kg = convertLbsToKg(165);    // 74.84 kg
const lbs = convertKgToLbs(75);     // 165.35 lbs
const cm = convertInchesToCm(70);   // 177.8 cm
const inches = convertCmToInches(180); // 70.87 inches
```

#### Calorie Goal Presets
```javascript
import { getCalorieGoalOptions } from './calorieCalculations';

const options = getCalorieGoalOptions(2200);
// Returns array of 7 preset options:
// - Aggressive Deficit: -1000 cal/day (-2 lbs/week)
// - Moderate Deficit: -500 cal/day (-1 lb/week)
// - Mild Deficit: -300 cal/day (-0.6 lbs/week)
// - Maintenance: 0 cal/day (0 lbs/week)
// - Mild Surplus: +300 cal/day (+0.6 lbs/week)
// - Moderate Surplus: +500 cal/day (+1 lb/week)
// - Aggressive Surplus: +1000 cal/day (+2 lbs/week)
```

#### Complete Calculation
```javascript
import { calculateCompleteCalorieData } from './calorieCalculations';

const profile = {
  weight: { value: 75, unit: 'kg' },
  height: { value: 180, unit: 'cm' },
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
};

const data = calculateCompleteCalorieData(profile);
// Returns: { bmr, tdee, goalOptions, profile }
```

### Helper Functions

#### Activity Level Helpers
```javascript
import { 
  getActivityLevelDescription,
  getActivityMultiplier 
} from './calorieCalculations';

const desc = getActivityLevelDescription('moderate');
// Returns: "Moderate exercise 3-5 days/week"

const multiplier = getActivityMultiplier('moderate');
// Returns: 1.55
```

#### Formatting Functions
```javascript
import { 
  formatCalories,
  formatWeight,
  formatHeight 
} from './calorieCalculations';

formatCalories(2345.67);        // "2,346"
formatWeight(75.5, 'kg');       // "75.5 kg"
formatWeight(165.3, 'lbs');     // "165.3 lbs"
formatHeight(175, 'cm');        // "175 cm"
formatHeight(70, 'inches');     // "5'10""
```

### Constants
```javascript
import { CONSTANTS } from './calorieCalculations';

console.log(CONSTANTS.ACTIVITY_MULTIPLIERS);
console.log(CONSTANTS.CALORIES_PER_LB);
console.log(CONSTANTS.CALORIES_PER_KG);
// etc.
```

## Examples

See `calorieCalculationsExamples.js` for comprehensive usage examples including:
- BMR calculations for different users
- TDEE calculations for all activity levels
- Weight change estimations
- Unit conversions
- Complete user setup workflows
- Weight loss progress tracking

## Error Handling

All functions include proper error handling and input validation:

```javascript
try {
  const bmr = calculateBMR(weight, height, age, gender);
} catch (error) {
  console.error('Error calculating BMR:', error.message);
  // Handle error appropriately
}
```

**Validation Rules:**
- Weight: 20-500 kg
- Height: 100-300 cm
- Age: 10-120 years
- Gender: "male" or "female" (case-insensitive)
- Activity Level: One of the defined levels
- BMR: 500-5000 calories
- Calorie deficit/surplus: -2000 to +2000 calories

## Integration with Storage Service

The calorie calculations can be integrated with the storage service:

```javascript
import { getProfile, saveCalorieGoal } from '../services/storageService';
import { calculateCompleteCalorieData } from './calorieCalculations';

// Get user profile and calculate goals
const profile = await getProfile();
const calorieData = calculateCompleteCalorieData(profile);

// Save selected goal
const selectedGoal = calorieData.goalOptions.find(opt => opt.id === 'moderate_deficit');
await saveCalorieGoal({
  calculatedMaintenance: calorieData.tdee,
  customMaintenance: null,
  goalType: selectedGoal.goalType,
  goalOffset: selectedGoal.offset,
  finalGoal: selectedGoal.finalGoal,
  estimatedWeeklyChange: selectedGoal.weeklyChange.lbs,
  useCustom: false,
});
```

## Testing

To test the calculations, you can run the examples:

```javascript
import { runAllExamples } from './calorieCalculationsExamples';

runAllExamples();
// This will run all example calculations and log results to console
```
