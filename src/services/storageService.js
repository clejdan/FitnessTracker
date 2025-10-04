import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import uuid from 'react-native-uuid';

// Storage keys
const STORAGE_KEYS = {
  WORKOUTS: 'fitness_tracker_workouts',
  MEALS: 'fitness_tracker_meals',
  PROFILE: 'fitness_tracker_profile',
  CALORIE_GOAL: 'fitness_tracker_calorie_goal',
};

// Helper function to handle AsyncStorage operations
const storageOperation = async (operation, key, data = null) => {
  try {
    if (operation === 'get') {
      const result = await AsyncStorage.getItem(key);
      return result ? JSON.parse(result) : null;
    } else if (operation === 'set') {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } else if (operation === 'remove') {
      await AsyncStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.error(`Storage operation failed for key ${key}:`, error);
    throw error;
  }
};

// Helper function to format date consistently
const formatDate = (date) => {
  try {
    return format(new Date(date), 'yyyy-MM-dd');
  } catch (error) {
    console.error('Date formatting error:', error);
    throw new Error('Invalid date format');
  }
};

// ==================== WORKOUT FUNCTIONS ====================

/**
 * Save a workout for a specific date
 * @param {string|Date} date - Date in any valid format
 * @param {Object} workoutData - Workout data object
 * @returns {Promise<boolean>}
 */
export const saveWorkout = async (date, workoutData) => {
  try {
    const formattedDate = formatDate(date);
    const workoutId = uuid.v4();
    
    const workout = {
      id: workoutId,
      date: formattedDate,
      exercises: workoutData.exercises || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing workouts
    const existingWorkouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    
    // Add or update workout for the date
    existingWorkouts[formattedDate] = existingWorkouts[formattedDate] || [];
    existingWorkouts[formattedDate].push(workout);
    
    await storageOperation('set', STORAGE_KEYS.WORKOUTS, existingWorkouts);
    console.log(`Workout saved for ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
};

/**
 * Retrieve workout data for a specific date
 * @param {string|Date} date - Date in any valid format
 * @returns {Promise<Array>} Array of workouts for the date
 */
export const getWorkout = async (date) => {
  try {
    const formattedDate = formatDate(date);
    const workouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    return workouts[formattedDate] || [];
  } catch (error) {
    console.error('Error getting workout:', error);
    throw error;
  }
};

/**
 * Get all workouts stored
 * @returns {Promise<Object>} Object with dates as keys and workout arrays as values
 */
export const getAllWorkouts = async () => {
  try {
    const workouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    return workouts;
  } catch (error) {
    console.error('Error getting all workouts:', error);
    throw error;
  }
};

/**
 * Update a specific workout
 * @param {string|Date} date - Date in any valid format
 * @param {string} workoutId - ID of the workout to update
 * @param {Object} updatedData - Updated workout data
 * @returns {Promise<boolean>}
 */
export const updateWorkout = async (date, workoutId, updatedData) => {
  try {
    const formattedDate = formatDate(date);
    const workouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    
    if (!workouts[formattedDate]) {
      throw new Error('No workouts found for this date');
    }
    
    const workoutIndex = workouts[formattedDate].findIndex(w => w.id === workoutId);
    if (workoutIndex === -1) {
      throw new Error('Workout not found');
    }
    
    // Update the workout
    workouts[formattedDate][workoutIndex] = {
      ...workouts[formattedDate][workoutIndex],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.WORKOUTS, workouts);
    console.log(`Workout ${workoutId} updated for ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
};

/**
 * Delete a specific workout
 * @param {string|Date} date - Date in any valid format
 * @param {string} workoutId - ID of the workout to delete
 * @returns {Promise<boolean>}
 */
export const deleteWorkout = async (date, workoutId) => {
  try {
    const formattedDate = formatDate(date);
    const workouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    
    if (!workouts[formattedDate]) {
      throw new Error('No workouts found for this date');
    }
    
    const initialLength = workouts[formattedDate].length;
    workouts[formattedDate] = workouts[formattedDate].filter(w => w.id !== workoutId);
    
    if (workouts[formattedDate].length === initialLength) {
      throw new Error('Workout not found');
    }
    
    // Remove date key if no workouts left
    if (workouts[formattedDate].length === 0) {
      delete workouts[formattedDate];
    }
    
    await storageOperation('set', STORAGE_KEYS.WORKOUTS, workouts);
    console.log(`Workout ${workoutId} deleted from ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

/**
 * Get array of all dates that have workouts
 * @returns {Promise<Array>} Array of date strings
 */
export const getWorkoutDates = async () => {
  try {
    const workouts = await storageOperation('get', STORAGE_KEYS.WORKOUTS) || {};
    return Object.keys(workouts).sort();
  } catch (error) {
    console.error('Error getting workout dates:', error);
    throw error;
  }
};

// ==================== NUTRITION FUNCTIONS ====================

/**
 * Save a meal for a specific date
 * @param {string|Date} date - Date in any valid format
 * @param {Object} mealData - Meal data object
 * @returns {Promise<boolean>}
 */
export const saveMeal = async (date, mealData) => {
  try {
    const formattedDate = formatDate(date);
    const mealId = uuid.v4();
    
    const meal = {
      id: mealId,
      date: formattedDate,
      mealName: mealData.mealName || '',
      time: mealData.time || '',
      protein: mealData.protein || { value: 0, unit: 'g' },
      carbs: mealData.carbs || { value: 0, unit: 'g' },
      fats: mealData.fats || { value: 0, unit: 'g' },
      calories: mealData.calories || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Get existing meals
    const existingMeals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    
    // Add meal for the date
    existingMeals[formattedDate] = existingMeals[formattedDate] || [];
    existingMeals[formattedDate].push(meal);
    
    await storageOperation('set', STORAGE_KEYS.MEALS, existingMeals);
    console.log(`Meal saved for ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error saving meal:', error);
    throw error;
  }
};

/**
 * Retrieve all meals for a specific date
 * @param {string|Date} date - Date in any valid format
 * @returns {Promise<Array>} Array of meals for the date
 */
export const getMeals = async (date) => {
  try {
    const formattedDate = formatDate(date);
    const meals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    return meals[formattedDate] || [];
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

/**
 * Get all meals stored
 * @returns {Promise<Object>} Object with dates as keys and meal arrays as values
 */
export const getAllMeals = async () => {
  try {
    const meals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    return meals;
  } catch (error) {
    console.error('Error getting all meals:', error);
    throw error;
  }
};

/**
 * Update a specific meal
 * @param {string|Date} date - Date in any valid format
 * @param {string} mealId - ID of the meal to update
 * @param {Object} updatedData - Updated meal data
 * @returns {Promise<boolean>}
 */
export const updateMeal = async (date, mealId, updatedData) => {
  try {
    const formattedDate = formatDate(date);
    const meals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    
    if (!meals[formattedDate]) {
      throw new Error('No meals found for this date');
    }
    
    const mealIndex = meals[formattedDate].findIndex(m => m.id === mealId);
    if (mealIndex === -1) {
      throw new Error('Meal not found');
    }
    
    // Update the meal
    meals[formattedDate][mealIndex] = {
      ...meals[formattedDate][mealIndex],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.MEALS, meals);
    console.log(`Meal ${mealId} updated for ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

/**
 * Delete a specific meal
 * @param {string|Date} date - Date in any valid format
 * @param {string} mealId - ID of the meal to delete
 * @returns {Promise<boolean>}
 */
export const deleteMeal = async (date, mealId) => {
  try {
    const formattedDate = formatDate(date);
    const meals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    
    if (!meals[formattedDate]) {
      throw new Error('No meals found for this date');
    }
    
    const initialLength = meals[formattedDate].length;
    meals[formattedDate] = meals[formattedDate].filter(m => m.id !== mealId);
    
    if (meals[formattedDate].length === initialLength) {
      throw new Error('Meal not found');
    }
    
    // Remove date key if no meals left
    if (meals[formattedDate].length === 0) {
      delete meals[formattedDate];
    }
    
    await storageOperation('set', STORAGE_KEYS.MEALS, meals);
    console.log(`Meal ${mealId} deleted from ${formattedDate}`);
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

/**
 * Get array of all dates that have meals
 * @returns {Promise<Array>} Array of date strings
 */
export const getMealDates = async () => {
  try {
    const meals = await storageOperation('get', STORAGE_KEYS.MEALS) || {};
    return Object.keys(meals).sort();
  } catch (error) {
    console.error('Error getting meal dates:', error);
    throw error;
  }
};

/**
 * Calculate and return total calories, protein, carbs, fats for a date
 * @param {string|Date} date - Date in any valid format
 * @returns {Promise<Object>} Object with daily totals
 */
export const getDailyTotals = async (date) => {
  try {
    const formattedDate = formatDate(date);
    const meals = await getMeals(formattedDate);
    
    const totals = {
      calories: 0,
      protein: { value: 0, unit: 'g' },
      carbs: { value: 0, unit: 'g' },
      fats: { value: 0, unit: 'g' },
    };
    
    meals.forEach(meal => {
      totals.calories += meal.calories || 0;
      totals.protein.value += meal.protein?.value || 0;
      totals.carbs.value += meal.carbs?.value || 0;
      totals.fats.value += meal.fats?.value || 0;
    });
    
    return totals;
  } catch (error) {
    console.error('Error calculating daily totals:', error);
    throw error;
  }
};

// ==================== PROFILE FUNCTIONS ====================

/**
 * Save user profile
 * @param {Object} profileData - Profile data object
 * @returns {Promise<boolean>}
 */
export const saveProfile = async (profileData) => {
  try {
    const profile = {
      height: profileData.height || { value: 0, unit: 'cm' },
      weight: profileData.weight || { value: 0, unit: 'kg' },
      age: profileData.age || 0,
      gender: profileData.gender || 'other',
      activityLevel: profileData.activityLevel || 'moderate',
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.PROFILE, profile);
    console.log('Profile saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

/**
 * Retrieve user profile
 * @returns {Promise<Object|null>} Profile object or null if not found
 */
export const getProfile = async () => {
  try {
    const profile = await storageOperation('get', STORAGE_KEYS.PROFILE);
    return profile;
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
};

/**
 * Save calorie goal settings
 * @param {Object} goalData - Calorie goal data object
 * @returns {Promise<boolean>}
 */
export const saveCalorieGoal = async (goalData) => {
  try {
    const calorieGoal = {
      calculatedMaintenance: goalData.calculatedMaintenance || 0,
      customMaintenance: goalData.customMaintenance || null,
      goalType: goalData.goalType || 'maintenance',
      goalOffset: goalData.goalOffset || 0,
      finalGoal: goalData.finalGoal || 0,
      estimatedWeeklyChange: goalData.estimatedWeeklyChange || 0,
      useCustom: goalData.useCustom || false,
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.CALORIE_GOAL, calorieGoal);
    console.log('Calorie goal saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving calorie goal:', error);
    throw error;
  }
};

/**
 * Retrieve calorie goal settings
 * @returns {Promise<Object|null>} Calorie goal object or null if not found
 */
export const getCalorieGoal = async () => {
  try {
    const calorieGoal = await storageOperation('get', STORAGE_KEYS.CALORIE_GOAL);
    return calorieGoal;
  } catch (error) {
    console.error('Error getting calorie goal:', error);
    throw error;
  }
};

/**
 * Update specific profile fields
 * @param {Object} updatedData - Fields to update
 * @returns {Promise<boolean>}
 */
export const updateProfile = async (updatedData) => {
  try {
    const existingProfile = await getProfile() || {};
    const updatedProfile = {
      ...existingProfile,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.PROFILE, updatedProfile);
    console.log('Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

/**
 * Update specific calorie goal fields
 * @param {Object} updatedData - Fields to update
 * @returns {Promise<boolean>}
 */
export const updateCalorieGoal = async (updatedData) => {
  try {
    const existingGoal = await getCalorieGoal() || {};
    const updatedGoal = {
      ...existingGoal,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    await storageOperation('set', STORAGE_KEYS.CALORIE_GOAL, updatedGoal);
    console.log('Calorie goal updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating calorie goal:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Clear all stored data (useful for testing or reset)
 * @returns {Promise<boolean>}
 */
export const clearAllData = async () => {
  try {
    await Promise.all([
      storageOperation('remove', STORAGE_KEYS.WORKOUTS),
      storageOperation('remove', STORAGE_KEYS.MEALS),
      storageOperation('remove', STORAGE_KEYS.PROFILE),
      storageOperation('remove', STORAGE_KEYS.CALORIE_GOAL),
    ]);
    console.log('All data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Get storage statistics
 * @returns {Promise<Object>} Object with data counts
 */
export const getStorageStats = async () => {
  try {
    const [workouts, meals, profile, calorieGoal] = await Promise.all([
      getAllWorkouts(),
      getAllMeals(),
      getProfile(),
      getCalorieGoal(),
    ]);
    
    const workoutDates = Object.keys(workouts);
    const mealDates = Object.keys(meals);
    
    const totalWorkouts = workoutDates.reduce((sum, date) => sum + workouts[date].length, 0);
    const totalMeals = mealDates.reduce((sum, date) => sum + meals[date].length, 0);
    
    return {
      totalWorkouts,
      totalMeals,
      workoutDates: workoutDates.length,
      mealDates: mealDates.length,
      hasProfile: !!profile,
      hasCalorieGoal: !!calorieGoal,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    throw error;
  }
};

