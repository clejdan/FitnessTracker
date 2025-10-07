import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

const STORAGE_KEYS = {
  WORKOUTS: 'fitness_tracker_workouts',
  MEALS: 'fitness_tracker_meals',
  PROFILE: 'fitness_tracker_profile',
  CALORIE_GOAL: 'fitness_tracker_calorie_goal',
};

// Export all data to JSON
export async function exportAllData(types = ['workouts', 'meals', 'profile', 'calorieGoal']) {
  try {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
        dataTypes: types,
      },
      data: {},
    };

    // Export workouts
    if (types.includes('workouts')) {
      const workouts = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      exportData.data.workouts = workouts ? JSON.parse(workouts) : {};
    }

    // Export meals
    if (types.includes('meals')) {
      const meals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      exportData.data.meals = meals ? JSON.parse(meals) : {};
    }

    // Export profile
    if (types.includes('profile')) {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      exportData.data.profile = profile ? JSON.parse(profile) : null;
    }

    // Export calorie goal
    if (types.includes('calorieGoal')) {
      const calorieGoal = await AsyncStorage.getItem(STORAGE_KEYS.CALORIE_GOAL);
      exportData.data.calorieGoal = calorieGoal ? JSON.parse(calorieGoal) : null;
    }

    return exportData;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// Export data to file
export async function exportToFile(types = ['workouts', 'meals', 'profile', 'calorieGoal']) {
  try {
    const data = await exportAllData(types);
    const fileName = `voltra-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Voltra Data',
      });
    }
    
    return fileUri;
  } catch (error) {
    console.error('Error exporting to file:', error);
    throw new Error('Failed to export data to file');
  }
}

// Import data from JSON
export async function importData(jsonData, options = { merge: false, backup: true }) {
  try {
    // Validate data structure
    if (!jsonData || !jsonData.data) {
      throw new Error('Invalid data format');
    }

    // Create backup if requested
    if (options.backup) {
      await createBackup();
    }

    const { data } = jsonData;
    const results = {};

    // Import workouts
    if (data.workouts) {
      if (options.merge) {
        const existingWorkouts = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
        const existing = existingWorkouts ? JSON.parse(existingWorkouts) : {};
        const merged = { ...existing, ...data.workouts };
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(merged));
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(data.workouts));
      }
      results.workouts = Object.keys(data.workouts).length;
    }

    // Import meals
    if (data.meals) {
      if (options.merge) {
        const existingMeals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
        const existing = existingMeals ? JSON.parse(existingMeals) : {};
        const merged = { ...existing, ...data.meals };
        await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(merged));
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(data.meals));
      }
      results.meals = Object.keys(data.meals).length;
    }

    // Import profile
    if (data.profile) {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(data.profile));
      results.profile = 1;
    }

    // Import calorie goal
    if (data.calorieGoal) {
      await AsyncStorage.setItem(STORAGE_KEYS.CALORIE_GOAL, JSON.stringify(data.calorieGoal));
      results.calorieGoal = 1;
    }

    return results;
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
}

// Import data from file
export async function importFromFile(fileUri, options = { merge: false, backup: true }) {
  try {
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    const jsonData = JSON.parse(fileContent);
    return await importData(jsonData, options);
  } catch (error) {
    console.error('Error importing from file:', error);
    throw new Error('Failed to import data from file');
  }
}

// Create backup
export async function createBackup() {
  try {
    const backupData = await exportAllData();
    const fileName = `voltra-backup-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backupData, null, 2));
    return fileUri;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new Error('Failed to create backup');
  }
}

// Get data statistics
export async function getDataStats() {
  try {
    const stats = {
      workouts: 0,
      meals: 0,
      profile: false,
      calorieGoal: false,
      totalSize: 0,
      lastUpdated: null,
    };

    // Count workouts
    const workouts = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (workouts) {
      const workoutData = JSON.parse(workouts);
      stats.workouts = Object.keys(workoutData).length;
      stats.totalSize += workouts.length;
    }

    // Count meals
    const meals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    if (meals) {
      const mealData = JSON.parse(meals);
      stats.meals = Object.keys(mealData).length;
      stats.totalSize += meals.length;
    }

    // Check profile
    const profile = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (profile) {
      stats.profile = true;
      stats.totalSize += profile.length;
    }

    // Check calorie goal
    const calorieGoal = await AsyncStorage.getItem(STORAGE_KEYS.CALORIE_GOAL);
    if (calorieGoal) {
      stats.calorieGoal = true;
      stats.totalSize += calorieGoal.length;
    }

    // Get last updated date
    if (stats.workouts > 0 || stats.meals > 0) {
      const allData = await exportAllData();
      stats.lastUpdated = allData.metadata.exportDate;
    }

    return stats;
  } catch (error) {
    console.error('Error getting data stats:', error);
    return null;
  }
}

// Clear all data
export async function clearAllData() {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error('Failed to clear all data');
  }
}

// Validate data integrity
export async function validateDataIntegrity() {
  try {
    const issues = [];
    
    // Check workouts
    const workouts = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
    if (workouts) {
      try {
        const workoutData = JSON.parse(workouts);
        Object.entries(workoutData).forEach(([date, workout]) => {
          if (!workout.exercises || !Array.isArray(workout.exercises)) {
            issues.push(`Invalid workout structure for date: ${date}`);
          }
        });
      } catch (error) {
        issues.push('Invalid workout data format');
      }
    }

    // Check meals
    const meals = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
    if (meals) {
      try {
        const mealData = JSON.parse(meals);
        Object.entries(mealData).forEach(([date, meal]) => {
          if (!meal.mealName || !meal.time) {
            issues.push(`Invalid meal structure for date: ${date}`);
          }
        });
      } catch (error) {
        issues.push('Invalid meal data format');
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  } catch (error) {
    console.error('Error validating data integrity:', error);
    return {
      valid: false,
      issues: ['Failed to validate data integrity'],
    };
  }
}

// Data migration utilities
export const DataMigration = {
  // Migrate data from old format to new format
  async migrateToNewFormat() {
    try {
      // This would contain migration logic for future app updates
      console.log('Data migration completed');
      return true;
    } catch (error) {
      console.error('Data migration failed:', error);
      return false;
    }
  },

  // Check if migration is needed
  async needsMigration() {
    try {
      // Check for old data formats that need migration
      return false; // No migration needed for now
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  },
};