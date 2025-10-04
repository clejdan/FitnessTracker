/**
 * Calorie Calculations and TDEE Estimation Utilities
 * 
 * This file contains functions for calculating BMR, TDEE, weight changes,
 * and unit conversions for the fitness tracker app.
 */

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,        // Little or no exercise
  light: 1.375,          // Light exercise 1-3 days/week
  moderate: 1.55,        // Moderate exercise 3-5 days/week
  active: 1.725,         // Hard exercise 6-7 days/week
  very_active: 1.9,      // Very hard exercise, physical job
};

// Calorie-to-weight conversion constants
const CALORIES_PER_LB = 3500;
const CALORIES_PER_KG = 7700;

// Unit conversion constants
const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;
const INCHES_TO_CM = 2.54;
const CM_TO_INCHES = 1 / 2.54;

/**
 * Validate numeric input
 * @param {number} value - Value to validate
 * @param {string} name - Name of the parameter for error messages
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @throws {Error} If value is invalid
 */
const validateNumber = (value, name, min = -Infinity, max = Infinity) => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} must be a valid number`);
  }
  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
};

// ==================== BMR CALCULATION ====================

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - Gender: "male" or "female"
 * @returns {number} BMR in calories per day
 * @throws {Error} If parameters are invalid
 */
export const calculateBMR = (weight, height, age, gender) => {
  try {
    // Validate inputs
    validateNumber(weight, 'Weight', 20, 500);
    validateNumber(height, 'Height', 100, 300);
    validateNumber(age, 'Age', 10, 120);
    
    if (typeof gender !== 'string') {
      throw new Error('Gender must be a string');
    }
    
    const normalizedGender = gender.toLowerCase();
    if (normalizedGender !== 'male' && normalizedGender !== 'female') {
      throw new Error('Gender must be "male" or "female"');
    }
    
    // Mifflin-St Jeor Equation
    // Male: BMR = (10 × weight) + (6.25 × height) - (5 × age) + 5
    // Female: BMR = (10 × weight) + (6.25 × height) - (5 × age) - 161
    
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    const bmr = normalizedGender === 'male' ? baseBMR + 5 : baseBMR - 161;
    
    const roundedBMR = Math.round(bmr);
    
    console.log(`BMR calculated: ${roundedBMR} calories/day for ${gender}, ${age} years, ${weight}kg, ${height}cm`);
    
    return roundedBMR;
  } catch (error) {
    console.error('Error calculating BMR:', error);
    throw error;
  }
};

// ==================== TDEE CALCULATION ====================

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level: sedentary, light, moderate, active, very_active
 * @returns {number} TDEE in calories per day
 * @throws {Error} If parameters are invalid
 */
export const calculateTDEE = (bmr, activityLevel) => {
  try {
    // Validate BMR
    validateNumber(bmr, 'BMR', 500, 5000);
    
    // Validate activity level
    if (typeof activityLevel !== 'string') {
      throw new Error('Activity level must be a string');
    }
    
    const normalizedActivityLevel = activityLevel.toLowerCase();
    const multiplier = ACTIVITY_MULTIPLIERS[normalizedActivityLevel];
    
    if (!multiplier) {
      throw new Error(
        `Invalid activity level. Must be one of: ${Object.keys(ACTIVITY_MULTIPLIERS).join(', ')}`
      );
    }
    
    const tdee = bmr * multiplier;
    const roundedTDEE = Math.round(tdee);
    
    console.log(`TDEE calculated: ${roundedTDEE} calories/day (BMR: ${bmr}, Activity: ${activityLevel})`);
    
    return roundedTDEE;
  } catch (error) {
    console.error('Error calculating TDEE:', error);
    throw error;
  }
};

// ==================== WEIGHT CHANGE ESTIMATION ====================

/**
 * Calculate weekly weight change based on daily calorie deficit or surplus
 * @param {number} calorieDeficitOrSurplus - Daily calorie deficit (negative) or surplus (positive)
 * @returns {Object} Weekly weight change in lbs and kg
 * @throws {Error} If parameter is invalid
 */
export const calculateWeeklyWeightChange = (calorieDeficitOrSurplus) => {
  try {
    // Validate input
    validateNumber(calorieDeficitOrSurplus, 'Calorie deficit/surplus', -2000, 2000);
    
    // Calculate weekly calorie difference
    const weeklyCalories = calorieDeficitOrSurplus * 7;
    
    // Calculate weight change
    // Positive surplus = weight gain, Negative deficit = weight loss
    const weightChangeLbs = weeklyCalories / CALORIES_PER_LB;
    const weightChangeKg = weeklyCalories / CALORIES_PER_KG;
    
    const result = {
      lbs: Math.round(weightChangeLbs * 100) / 100, // Round to 2 decimal places
      kg: Math.round(weightChangeKg * 100) / 100,   // Round to 2 decimal places
    };
    
    console.log(
      `Weekly weight change: ${result.lbs} lbs / ${result.kg} kg ` +
      `(${calorieDeficitOrSurplus > 0 ? '+' : ''}${calorieDeficitOrSurplus} cal/day)`
    );
    
    return result;
  } catch (error) {
    console.error('Error calculating weekly weight change:', error);
    throw error;
  }
};

// ==================== UNIT CONVERSIONS ====================

/**
 * Convert pounds to kilograms
 * @param {number} lbs - Weight in pounds
 * @returns {number} Weight in kilograms
 */
export const convertLbsToKg = (lbs) => {
  try {
    validateNumber(lbs, 'Weight in lbs', 0, 2000);
    const kg = lbs * LBS_TO_KG;
    return Math.round(kg * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting lbs to kg:', error);
    throw error;
  }
};

/**
 * Convert kilograms to pounds
 * @param {number} kg - Weight in kilograms
 * @returns {number} Weight in pounds
 */
export const convertKgToLbs = (kg) => {
  try {
    validateNumber(kg, 'Weight in kg', 0, 1000);
    const lbs = kg * KG_TO_LBS;
    return Math.round(lbs * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting kg to lbs:', error);
    throw error;
  }
};

/**
 * Convert inches to centimeters
 * @param {number} inches - Height in inches
 * @returns {number} Height in centimeters
 */
export const convertInchesToCm = (inches) => {
  try {
    validateNumber(inches, 'Height in inches', 0, 120);
    const cm = inches * INCHES_TO_CM;
    return Math.round(cm * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting inches to cm:', error);
    throw error;
  }
};

/**
 * Convert centimeters to inches
 * @param {number} cm - Height in centimeters
 * @returns {number} Height in inches
 */
export const convertCmToInches = (cm) => {
  try {
    validateNumber(cm, 'Height in cm', 0, 300);
    const inches = cm * CM_TO_INCHES;
    return Math.round(inches * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.error('Error converting cm to inches:', error);
    throw error;
  }
};

// ==================== CALORIE GOAL PRESETS ====================

/**
 * Get calorie goal preset options based on maintenance calories
 * @param {number} maintenance - Maintenance calories (TDEE)
 * @returns {Array} Array of calorie goal options
 * @throws {Error} If maintenance is invalid
 */
export const getCalorieGoalOptions = (maintenance) => {
  try {
    // Validate maintenance calories
    validateNumber(maintenance, 'Maintenance calories', 1000, 6000);
    
    const options = [
      {
        id: 'aggressive_deficit',
        label: 'Aggressive Deficit',
        description: 'Lose 2 lbs per week',
        offset: -1000,
        goalType: 'deficit',
        finalGoal: Math.round(maintenance - 1000),
        weeklyChange: calculateWeeklyWeightChange(-1000),
        recommended: false,
        warning: 'Very aggressive - may be difficult to sustain',
      },
      {
        id: 'moderate_deficit',
        label: 'Moderate Deficit',
        description: 'Lose 1 lb per week',
        offset: -500,
        goalType: 'deficit',
        finalGoal: Math.round(maintenance - 500),
        weeklyChange: calculateWeeklyWeightChange(-500),
        recommended: true,
        warning: null,
      },
      {
        id: 'mild_deficit',
        label: 'Mild Deficit',
        description: 'Lose 0.6 lbs per week',
        offset: -300,
        goalType: 'deficit',
        finalGoal: Math.round(maintenance - 300),
        weeklyChange: calculateWeeklyWeightChange(-300),
        recommended: true,
        warning: null,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        description: 'Maintain current weight',
        offset: 0,
        goalType: 'maintenance',
        finalGoal: Math.round(maintenance),
        weeklyChange: { lbs: 0, kg: 0 },
        recommended: true,
        warning: null,
      },
      {
        id: 'mild_surplus',
        label: 'Mild Surplus',
        description: 'Gain 0.6 lbs per week',
        offset: 300,
        goalType: 'surplus',
        finalGoal: Math.round(maintenance + 300),
        weeklyChange: calculateWeeklyWeightChange(300),
        recommended: true,
        warning: null,
      },
      {
        id: 'moderate_surplus',
        label: 'Moderate Surplus',
        description: 'Gain 1 lb per week',
        offset: 500,
        goalType: 'surplus',
        finalGoal: Math.round(maintenance + 500),
        weeklyChange: calculateWeeklyWeightChange(500),
        recommended: true,
        warning: null,
      },
      {
        id: 'aggressive_surplus',
        label: 'Aggressive Surplus',
        description: 'Gain 2 lbs per week',
        offset: 1000,
        goalType: 'surplus',
        finalGoal: Math.round(maintenance + 1000),
        weeklyChange: calculateWeeklyWeightChange(1000),
        recommended: false,
        warning: 'Very aggressive - may lead to excessive fat gain',
      },
    ];
    
    console.log(`Generated ${options.length} calorie goal options for maintenance: ${maintenance} cal/day`);
    
    return options;
  } catch (error) {
    console.error('Error getting calorie goal options:', error);
    throw error;
  }
};

// ==================== COMBINED CALCULATIONS ====================

/**
 * Calculate complete calorie data from profile information
 * @param {Object} profile - User profile object
 * @returns {Object} Complete calorie calculation results
 */
export const calculateCompleteCalorieData = (profile) => {
  try {
    // Validate profile object
    if (!profile || typeof profile !== 'object') {
      throw new Error('Profile must be a valid object');
    }
    
    const { weight, height, age, gender, activityLevel } = profile;
    
    // Extract values from unit objects
    const weightValue = weight?.value || 0;
    const heightValue = height?.value || 0;
    const weightUnit = weight?.unit || 'kg';
    const heightUnit = height?.unit || 'cm';
    
    // Convert to metric if needed
    const weightKg = weightUnit === 'kg' ? weightValue : convertLbsToKg(weightValue);
    const heightCm = heightUnit === 'cm' ? heightValue : convertInchesToCm(heightValue);
    
    // Calculate BMR and TDEE
    const bmr = calculateBMR(weightKg, heightCm, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    
    // Get calorie goal options
    const goalOptions = getCalorieGoalOptions(tdee);
    
    return {
      bmr,
      tdee,
      goalOptions,
      profile: {
        weightKg,
        heightCm,
        age,
        gender,
        activityLevel,
      },
    };
  } catch (error) {
    console.error('Error calculating complete calorie data:', error);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get activity level description
 * @param {string} activityLevel - Activity level key
 * @returns {string} Description of the activity level
 */
export const getActivityLevelDescription = (activityLevel) => {
  const descriptions = {
    sedentary: 'Little or no exercise',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Hard exercise 6-7 days/week',
    very_active: 'Very hard exercise, physical job',
  };
  
  return descriptions[activityLevel] || 'Unknown activity level';
};

/**
 * Get activity level multiplier
 * @param {string} activityLevel - Activity level key
 * @returns {number} Multiplier value
 */
export const getActivityMultiplier = (activityLevel) => {
  return ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
};

/**
 * Format calorie value with commas
 * @param {number} calories - Calorie value
 * @returns {string} Formatted string
 */
export const formatCalories = (calories) => {
  return Math.round(calories).toLocaleString();
};

/**
 * Format weight with unit
 * @param {number} value - Weight value
 * @param {string} unit - Unit (kg or lbs)
 * @returns {string} Formatted string
 */
export const formatWeight = (value, unit = 'kg') => {
  return `${Math.round(value * 10) / 10} ${unit}`;
};

/**
 * Format height with unit
 * @param {number} value - Height value
 * @param {string} unit - Unit (cm or inches)
 * @returns {string} Formatted string
 */
export const formatHeight = (value, unit = 'cm') => {
  if (unit === 'cm') {
    return `${Math.round(value)} cm`;
  } else {
    // Convert to feet and inches for display
    const totalInches = Math.round(value);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  }
};

// Export constants for use in other modules
export const CONSTANTS = {
  ACTIVITY_MULTIPLIERS,
  CALORIES_PER_LB,
  CALORIES_PER_KG,
  LBS_TO_KG,
  KG_TO_LBS,
  INCHES_TO_CM,
  CM_TO_INCHES,
};
