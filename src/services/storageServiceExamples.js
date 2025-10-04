/**
 * Storage Service Usage Examples
 * 
 * This file demonstrates how to use the storageService.js functions
 * for managing workout, nutrition, and profile data.
 */

import {
  // Workout functions
  saveWorkout,
  getWorkout,
  getAllWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutDates,
  
  // Nutrition functions
  saveMeal,
  getMeals,
  getAllMeals,
  updateMeal,
  deleteMeal,
  getMealDates,
  getDailyTotals,
  
  // Profile functions
  saveProfile,
  getProfile,
  saveCalorieGoal,
  getCalorieGoal,
  updateProfile,
  updateCalorieGoal,
  
  // Utility functions
  clearAllData,
  getStorageStats,
} from './storageService';

// ==================== WORKOUT EXAMPLES ====================

/**
 * Example: Save a workout
 */
export const exampleSaveWorkout = async () => {
  try {
    const workoutData = {
      exercises: [
        {
          exerciseId: 'uuid-here',
          name: 'Bench Press',
          sets: [
            { setNumber: 1, reps: 10, rir: 2, weight: 135 },
            { setNumber: 2, reps: 8, rir: 1, weight: 145 },
            { setNumber: 3, reps: 6, rir: 0, weight: 155 },
          ],
        },
        {
          exerciseId: 'uuid-here-2',
          name: 'Squats',
          sets: [
            { setNumber: 1, reps: 12, rir: 3, weight: 185 },
            { setNumber: 2, reps: 10, rir: 2, weight: 195 },
          ],
        },
      ],
    };
    
    await saveWorkout('2025-01-15', workoutData);
    console.log('Workout saved successfully!');
  } catch (error) {
    console.error('Failed to save workout:', error);
  }
};

/**
 * Example: Get workouts for a specific date
 */
export const exampleGetWorkout = async () => {
  try {
    const workouts = await getWorkout('2025-01-15');
    console.log('Workouts for 2025-01-15:', workouts);
  } catch (error) {
    console.error('Failed to get workouts:', error);
  }
};

/**
 * Example: Update a workout
 */
export const exampleUpdateWorkout = async () => {
  try {
    const workoutId = 'workout-uuid-here';
    const updatedData = {
      exercises: [
        {
          exerciseId: 'uuid-here',
          name: 'Bench Press (Updated)',
          sets: [
            { setNumber: 1, reps: 12, rir: 2, weight: 140 },
            { setNumber: 2, reps: 10, rir: 1, weight: 150 },
          ],
        },
      ],
    };
    
    await updateWorkout('2025-01-15', workoutId, updatedData);
    console.log('Workout updated successfully!');
  } catch (error) {
    console.error('Failed to update workout:', error);
  }
};

// ==================== NUTRITION EXAMPLES ====================

/**
 * Example: Save a meal
 */
export const exampleSaveMeal = async () => {
  try {
    const mealData = {
      mealName: 'Chicken Breast with Rice',
      time: '12:30',
      protein: { value: 45, unit: 'g' },
      carbs: { value: 60, unit: 'g' },
      fats: { value: 8, unit: 'g' },
      calories: 480,
    };
    
    await saveMeal('2025-01-15', mealData);
    console.log('Meal saved successfully!');
  } catch (error) {
    console.error('Failed to save meal:', error);
  }
};

/**
 * Example: Get daily nutrition totals
 */
export const exampleGetDailyTotals = async () => {
  try {
    const totals = await getDailyTotals('2025-01-15');
    console.log('Daily totals for 2025-01-15:', totals);
    // Output: { calories: 1200, protein: { value: 120, unit: 'g' }, ... }
  } catch (error) {
    console.error('Failed to get daily totals:', error);
  }
};

/**
 * Example: Save multiple meals for a day
 */
export const exampleSaveMultipleMeals = async () => {
  try {
    const meals = [
      {
        mealName: 'Breakfast - Oatmeal',
        time: '08:00',
        protein: { value: 12, unit: 'g' },
        carbs: { value: 45, unit: 'g' },
        fats: { value: 6, unit: 'g' },
        calories: 280,
      },
      {
        mealName: 'Lunch - Salad',
        time: '13:00',
        protein: { value: 25, unit: 'g' },
        carbs: { value: 20, unit: 'g' },
        fats: { value: 15, unit: 'g' },
        calories: 320,
      },
      {
        mealName: 'Dinner - Salmon',
        time: '19:00',
        protein: { value: 35, unit: 'g' },
        carbs: { value: 30, unit: 'g' },
        fats: { value: 20, unit: 'g' },
        calories: 450,
      },
    ];
    
    for (const meal of meals) {
      await saveMeal('2025-01-15', meal);
    }
    
    console.log('All meals saved successfully!');
  } catch (error) {
    console.error('Failed to save meals:', error);
  }
};

// ==================== PROFILE EXAMPLES ====================

/**
 * Example: Save user profile
 */
export const exampleSaveProfile = async () => {
  try {
    const profileData = {
      height: { value: 175, unit: 'cm' },
      weight: { value: 70, unit: 'kg' },
      age: 28,
      gender: 'male',
      activityLevel: 'moderate',
    };
    
    await saveProfile(profileData);
    console.log('Profile saved successfully!');
  } catch (error) {
    console.error('Failed to save profile:', error);
  }
};

/**
 * Example: Save calorie goal
 */
export const exampleSaveCalorieGoal = async () => {
  try {
    const goalData = {
      calculatedMaintenance: 2200,
      customMaintenance: null,
      goalType: 'deficit',
      goalOffset: -500,
      finalGoal: 1700,
      estimatedWeeklyChange: -1.0,
      useCustom: false,
    };
    
    await saveCalorieGoal(goalData);
    console.log('Calorie goal saved successfully!');
  } catch (error) {
    console.error('Failed to save calorie goal:', error);
  }
};

/**
 * Example: Update specific profile fields
 */
export const exampleUpdateProfile = async () => {
  try {
    const updatedData = {
      weight: { value: 68, unit: 'kg' }, // Weight loss
      activityLevel: 'active', // Increased activity
    };
    
    await updateProfile(updatedData);
    console.log('Profile updated successfully!');
  } catch (error) {
    console.error('Failed to update profile:', error);
  }
};

// ==================== UTILITY EXAMPLES ====================

/**
 * Example: Get storage statistics
 */
export const exampleGetStorageStats = async () => {
  try {
    const stats = await getStorageStats();
    console.log('Storage Statistics:', stats);
    // Output: { totalWorkouts: 15, totalMeals: 45, workoutDates: 5, mealDates: 8, hasProfile: true, hasCalorieGoal: true }
  } catch (error) {
    console.error('Failed to get storage stats:', error);
  }
};

/**
 * Example: Get all dates with data
 */
export const exampleGetAllDates = async () => {
  try {
    const [workoutDates, mealDates] = await Promise.all([
      getWorkoutDates(),
      getMealDates(),
    ]);
    
    console.log('Workout dates:', workoutDates);
    console.log('Meal dates:', mealDates);
  } catch (error) {
    console.error('Failed to get dates:', error);
  }
};

/**
 * Example: Complete workflow - Track a full day
 */
export const exampleCompleteDayTracking = async () => {
  try {
    const date = '2025-01-15';
    
    // 1. Save profile if not exists
    const existingProfile = await getProfile();
    if (!existingProfile) {
      await saveProfile({
        height: { value: 175, unit: 'cm' },
        weight: { value: 70, unit: 'kg' },
        age: 28,
        gender: 'male',
        activityLevel: 'moderate',
      });
    }
    
    // 2. Save calorie goal
    await saveCalorieGoal({
      calculatedMaintenance: 2200,
      goalType: 'deficit',
      goalOffset: -500,
      finalGoal: 1700,
      estimatedWeeklyChange: -1.0,
      useCustom: false,
    });
    
    // 3. Save workout
    await saveWorkout(date, {
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Bench Press',
          sets: [
            { setNumber: 1, reps: 10, rir: 2, weight: 135 },
            { setNumber: 2, reps: 8, rir: 1, weight: 145 },
          ],
        },
      ],
    });
    
    // 4. Save meals
    await saveMeal(date, {
      mealName: 'Breakfast',
      time: '08:00',
      protein: { value: 20, unit: 'g' },
      carbs: { value: 40, unit: 'g' },
      fats: { value: 10, unit: 'g' },
      calories: 320,
    });
    
    await saveMeal(date, {
      mealName: 'Lunch',
      time: '13:00',
      protein: { value: 30, unit: 'g' },
      carbs: { value: 50, unit: 'g' },
      fats: { value: 15, unit: 'g' },
      calories: 450,
    });
    
    // 5. Get daily totals
    const dailyTotals = await getDailyTotals(date);
    console.log('Daily nutrition totals:', dailyTotals);
    
    // 6. Get all data for the day
    const [workouts, meals] = await Promise.all([
      getWorkout(date),
      getMeals(date),
    ]);
    
    console.log('Complete day data:', {
      date,
      workouts,
      meals,
      dailyTotals,
    });
    
  } catch (error) {
    console.error('Failed to complete day tracking:', error);
  }
};

// ==================== ERROR HANDLING EXAMPLES ====================

/**
 * Example: Proper error handling
 */
export const exampleErrorHandling = async () => {
  try {
    // This will fail if the workout doesn't exist
    await updateWorkout('2025-01-15', 'non-existent-id', {});
  } catch (error) {
    if (error.message === 'Workout not found') {
      console.log('Workout not found - this is expected');
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

/**
 * Example: Safe data retrieval with fallbacks
 */
export const exampleSafeDataRetrieval = async () => {
  try {
    const profile = await getProfile();
    if (profile) {
      console.log('User profile:', profile);
    } else {
      console.log('No profile found - user needs to set up profile');
    }
    
    const calorieGoal = await getCalorieGoal();
    if (calorieGoal) {
      console.log('Calorie goal:', calorieGoal);
    } else {
      console.log('No calorie goal set - user needs to set goals');
    }
  } catch (error) {
    console.error('Error retrieving data:', error);
  }
};

