/**
 * Calorie Calculations Usage Examples
 * 
 * This file demonstrates how to use the calorieCalculations.js utility functions
 */

import {
  calculateBMR,
  calculateTDEE,
  calculateWeeklyWeightChange,
  convertLbsToKg,
  convertKgToLbs,
  convertInchesToCm,
  convertCmToInches,
  getCalorieGoalOptions,
  calculateCompleteCalorieData,
  getActivityLevelDescription,
  getActivityMultiplier,
  formatCalories,
  formatWeight,
  formatHeight,
  CONSTANTS,
} from './calorieCalculations';

// ==================== BMR CALCULATION EXAMPLES ====================

/**
 * Example: Calculate BMR for a male user
 */
export const exampleCalculateBMRMale = () => {
  try {
    const weight = 80; // kg
    const height = 180; // cm
    const age = 30;
    const gender = 'male';
    
    const bmr = calculateBMR(weight, height, age, gender);
    console.log(`Male BMR: ${bmr} calories/day`);
    // Expected output: ~1822 calories/day
    
    return bmr;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Calculate BMR for a female user
 */
export const exampleCalculateBMRFemale = () => {
  try {
    const weight = 65; // kg
    const height = 165; // cm
    const age = 28;
    const gender = 'female';
    
    const bmr = calculateBMR(weight, height, age, gender);
    console.log(`Female BMR: ${bmr} calories/day`);
    // Expected output: ~1426 calories/day
    
    return bmr;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== TDEE CALCULATION EXAMPLES ====================

/**
 * Example: Calculate TDEE for different activity levels
 */
export const exampleCalculateTDEEAllLevels = () => {
  try {
    const bmr = 1800;
    const activityLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    
    console.log('\nTDEE Calculations:');
    const results = activityLevels.map(level => {
      const tdee = calculateTDEE(bmr, level);
      const description = getActivityLevelDescription(level);
      console.log(`${level}: ${tdee} cal/day (${description})`);
      return { level, tdee, description };
    });
    
    return results;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Calculate TDEE for a specific user
 */
export const exampleCalculateUserTDEE = () => {
  try {
    // User: 75kg, 175cm, 35 years old, male, moderately active
    const bmr = calculateBMR(75, 175, 35, 'male');
    const tdee = calculateTDEE(bmr, 'moderate');
    
    console.log(`\nUser BMR: ${bmr} cal/day`);
    console.log(`User TDEE: ${tdee} cal/day`);
    
    return { bmr, tdee };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== WEIGHT CHANGE EXAMPLES ====================

/**
 * Example: Calculate weight change for various calorie deficits
 */
export const exampleWeightChangeDeficit = () => {
  try {
    const deficits = [-1000, -500, -300];
    
    console.log('\nWeight Loss Estimates:');
    const results = deficits.map(deficit => {
      const change = calculateWeeklyWeightChange(deficit);
      console.log(`${deficit} cal/day deficit: ${change.lbs} lbs/week (${change.kg} kg/week)`);
      return { deficit, change };
    });
    
    return results;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Calculate weight change for various calorie surpluses
 */
export const exampleWeightChangeSurplus = () => {
  try {
    const surpluses = [300, 500, 1000];
    
    console.log('\nWeight Gain Estimates:');
    const results = surpluses.map(surplus => {
      const change = calculateWeeklyWeightChange(surplus);
      console.log(`+${surplus} cal/day surplus: +${change.lbs} lbs/week (+${change.kg} kg/week)`);
      return { surplus, change };
    });
    
    return results;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== UNIT CONVERSION EXAMPLES ====================

/**
 * Example: Convert between weight units
 */
export const exampleWeightConversions = () => {
  try {
    const weightLbs = 165;
    const weightKg = 75;
    
    console.log('\nWeight Conversions:');
    console.log(`${weightLbs} lbs = ${convertLbsToKg(weightLbs)} kg`);
    console.log(`${weightKg} kg = ${convertKgToLbs(weightKg)} lbs`);
    
    return {
      lbsToKg: convertLbsToKg(weightLbs),
      kgToLbs: convertKgToLbs(weightKg),
    };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Convert between height units
 */
export const exampleHeightConversions = () => {
  try {
    const heightInches = 70; // 5'10"
    const heightCm = 175;
    
    console.log('\nHeight Conversions:');
    console.log(`${heightInches} inches = ${convertInchesToCm(heightInches)} cm`);
    console.log(`${heightCm} cm = ${convertCmToInches(heightCm)} inches`);
    
    return {
      inchesToCm: convertInchesToCm(heightInches),
      cmToInches: convertCmToInches(heightCm),
    };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== CALORIE GOAL PRESETS EXAMPLES ====================

/**
 * Example: Get all calorie goal options
 */
export const exampleGetCalorieGoalOptions = () => {
  try {
    const maintenance = 2200;
    const options = getCalorieGoalOptions(maintenance);
    
    console.log(`\nCalorie Goal Options (Maintenance: ${maintenance} cal/day):`);
    options.forEach(option => {
      console.log(`\n${option.label}:`);
      console.log(`  - ${option.description}`);
      console.log(`  - Target: ${option.finalGoal} cal/day`);
      console.log(`  - Weekly change: ${option.weeklyChange.lbs} lbs (${option.weeklyChange.kg} kg)`);
      console.log(`  - Recommended: ${option.recommended ? 'Yes' : 'No'}`);
      if (option.warning) {
        console.log(`  - Warning: ${option.warning}`);
      }
    });
    
    return options;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Get recommended calorie goals only
 */
export const exampleGetRecommendedGoals = () => {
  try {
    const maintenance = 2200;
    const allOptions = getCalorieGoalOptions(maintenance);
    const recommended = allOptions.filter(option => option.recommended);
    
    console.log('\nRecommended Calorie Goals:');
    recommended.forEach(option => {
      console.log(`- ${option.label}: ${option.finalGoal} cal/day`);
    });
    
    return recommended;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== COMPLETE CALCULATION EXAMPLES ====================

/**
 * Example: Calculate complete calorie data from profile (metric units)
 */
export const exampleCompleteCalculationMetric = () => {
  try {
    const profile = {
      weight: { value: 75, unit: 'kg' },
      height: { value: 175, unit: 'cm' },
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
    };
    
    const data = calculateCompleteCalorieData(profile);
    
    console.log('\nComplete Calorie Data (Metric):');
    console.log(`BMR: ${data.bmr} cal/day`);
    console.log(`TDEE (Maintenance): ${data.tdee} cal/day`);
    console.log(`Profile: ${data.profile.weightKg}kg, ${data.profile.heightCm}cm, ${data.profile.age}y`);
    console.log(`Goal Options: ${data.goalOptions.length} available`);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Calculate complete calorie data from profile (imperial units)
 */
export const exampleCompleteCalculationImperial = () => {
  try {
    const profile = {
      weight: { value: 165, unit: 'lbs' },
      height: { value: 70, unit: 'inches' },
      age: 28,
      gender: 'female',
      activityLevel: 'active',
    };
    
    const data = calculateCompleteCalorieData(profile);
    
    console.log('\nComplete Calorie Data (Imperial):');
    console.log(`BMR: ${data.bmr} cal/day`);
    console.log(`TDEE (Maintenance): ${data.tdee} cal/day`);
    console.log(`Profile: ${data.profile.weightKg}kg, ${data.profile.heightCm}cm, ${data.profile.age}y`);
    console.log(`Goal Options: ${data.goalOptions.length} available`);
    
    return data;
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== FORMATTING EXAMPLES ====================

/**
 * Example: Format various values for display
 */
export const exampleFormatting = () => {
  try {
    console.log('\nFormatting Examples:');
    console.log(`Calories: ${formatCalories(2345.67)}`);
    console.log(`Weight (kg): ${formatWeight(75.5, 'kg')}`);
    console.log(`Weight (lbs): ${formatWeight(165.3, 'lbs')}`);
    console.log(`Height (cm): ${formatHeight(175, 'cm')}`);
    console.log(`Height (inches): ${formatHeight(70, 'inches')}`);
    
    return {
      calories: formatCalories(2345.67),
      weightKg: formatWeight(75.5, 'kg'),
      weightLbs: formatWeight(165.3, 'lbs'),
      heightCm: formatHeight(175, 'cm'),
      heightInches: formatHeight(70, 'inches'),
    };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== PRACTICAL USE CASE EXAMPLES ====================

/**
 * Example: Complete user setup workflow
 */
export const exampleUserSetupWorkflow = () => {
  try {
    console.log('\n=== User Setup Workflow ===');
    
    // Step 1: User enters their information
    const userProfile = {
      weight: { value: 80, unit: 'kg' },
      height: { value: 180, unit: 'cm' },
      age: 32,
      gender: 'male',
      activityLevel: 'moderate',
    };
    
    console.log('\nStep 1: User Profile');
    console.log(`Weight: ${formatWeight(userProfile.weight.value, userProfile.weight.unit)}`);
    console.log(`Height: ${formatHeight(userProfile.height.value, userProfile.height.unit)}`);
    console.log(`Age: ${userProfile.age} years`);
    console.log(`Gender: ${userProfile.gender}`);
    console.log(`Activity: ${getActivityLevelDescription(userProfile.activityLevel)}`);
    
    // Step 2: Calculate BMR and TDEE
    const calorieData = calculateCompleteCalorieData(userProfile);
    
    console.log('\nStep 2: Calorie Calculations');
    console.log(`BMR: ${formatCalories(calorieData.bmr)} cal/day`);
    console.log(`TDEE: ${formatCalories(calorieData.tdee)} cal/day`);
    
    // Step 3: Show goal options
    console.log('\nStep 3: Available Goals');
    const recommendedGoals = calorieData.goalOptions.filter(opt => opt.recommended);
    recommendedGoals.forEach(goal => {
      console.log(`\n${goal.label}:`);
      console.log(`  Target: ${formatCalories(goal.finalGoal)} cal/day`);
      console.log(`  Change: ${goal.weeklyChange.lbs} lbs/week`);
    });
    
    // Step 4: User selects a goal
    const selectedGoal = calorieData.goalOptions.find(opt => opt.id === 'moderate_deficit');
    
    console.log('\nStep 4: Selected Goal');
    console.log(`Goal: ${selectedGoal.label}`);
    console.log(`Daily Target: ${formatCalories(selectedGoal.finalGoal)} cal/day`);
    console.log(`Expected Change: ${selectedGoal.weeklyChange.lbs} lbs/week`);
    
    return {
      profile: userProfile,
      calculations: calorieData,
      selectedGoal,
    };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

/**
 * Example: Weight loss progress tracking
 */
export const exampleWeightLossTracking = () => {
  try {
    console.log('\n=== Weight Loss Progress Tracking ===');
    
    const startWeight = 90; // kg
    const currentWeight = 85; // kg
    const goalWeight = 75; // kg
    const weeksPassed = 8;
    
    const totalLoss = startWeight - currentWeight;
    const remainingLoss = currentWeight - goalWeight;
    const weeklyAverage = totalLoss / weeksPassed;
    
    console.log(`\nStarting Weight: ${formatWeight(startWeight, 'kg')}`);
    console.log(`Current Weight: ${formatWeight(currentWeight, 'kg')}`);
    console.log(`Goal Weight: ${formatWeight(goalWeight, 'kg')}`);
    console.log(`\nProgress: ${formatWeight(totalLoss, 'kg')} lost in ${weeksPassed} weeks`);
    console.log(`Average: ${formatWeight(weeklyAverage, 'kg')}/week`);
    console.log(`Remaining: ${formatWeight(remainingLoss, 'kg')}`);
    
    // Calculate weeks to goal
    if (weeklyAverage > 0) {
      const weeksToGoal = Math.ceil(remainingLoss / weeklyAverage);
      console.log(`Estimated time to goal: ${weeksToGoal} weeks`);
    }
    
    // Recalculate TDEE at current weight
    const bmrStart = calculateBMR(startWeight, 180, 32, 'male');
    const bmrCurrent = calculateBMR(currentWeight, 180, 32, 'male');
    const tdeeStart = calculateTDEE(bmrStart, 'moderate');
    const tdeeCurrent = calculateTDEE(bmrCurrent, 'moderate');
    
    console.log(`\nCalorie Adjustments:`);
    console.log(`Starting TDEE: ${formatCalories(tdeeStart)} cal/day`);
    console.log(`Current TDEE: ${formatCalories(tdeeCurrent)} cal/day`);
    console.log(`Difference: ${formatCalories(tdeeCurrent - tdeeStart)} cal/day`);
    
    return {
      progress: { totalLoss, weeklyAverage, remainingLoss },
      calories: { tdeeStart, tdeeCurrent },
    };
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// ==================== RUN ALL EXAMPLES ====================

/**
 * Run all examples
 */
export const runAllExamples = () => {
  console.log('========================================');
  console.log('CALORIE CALCULATIONS EXAMPLES');
  console.log('========================================');
  
  exampleCalculateBMRMale();
  exampleCalculateBMRFemale();
  exampleCalculateTDEEAllLevels();
  exampleCalculateUserTDEE();
  exampleWeightChangeDeficit();
  exampleWeightChangeSurplus();
  exampleWeightConversions();
  exampleHeightConversions();
  exampleGetCalorieGoalOptions();
  exampleGetRecommendedGoals();
  exampleCompleteCalculationMetric();
  exampleCompleteCalculationImperial();
  exampleFormatting();
  exampleUserSetupWorkflow();
  exampleWeightLossTracking();
  
  console.log('\n========================================');
  console.log('ALL EXAMPLES COMPLETED');
  console.log('========================================');
};
