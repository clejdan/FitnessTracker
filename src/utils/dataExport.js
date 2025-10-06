/**
 * Data Export Utility
 * 
 * Provides functionality to export user data as JSON for backup
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';
import { getAllWorkouts, getAllMeals, getProfile, getCalorieGoal } from '../services/storageService';

/**
 * Export all user data as JSON
 * @returns {Promise<boolean>} - Success status
 */
export async function exportAllData() {
  try {
    // Gather all data
    const [workouts, meals, profile, calorieGoal] = await Promise.all([
      getAllWorkouts(),
      getAllMeals(),
      getProfile(),
      getCalorieGoal(),
    ]);

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        workouts,
        meals,
        profile,
        calorieGoal,
      },
    };

    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `FitnessTracker_Backup_${timestamp}.json`;

    // Save to device
    if (Platform.OS === 'web') {
      // Web download
      downloadJSON(jsonString, filename);
      return true;
    } else {
      // Mobile share
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Export FitnessTracker Data',
          UTI: 'public.json',
        });
        return true;
      } else {
        Alert.alert(
          'Export Saved',
          `Data exported to: ${fileUri}`,
          [{ text: 'OK' }]
        );
        return true;
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data. Please try again.');
  }
}

/**
 * Download JSON file on web
 * @param {string} jsonString - JSON content
 * @param {string} filename - Filename for download
 */
function downloadJSON(jsonString, filename) {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get data statistics for display
 * @returns {Promise<Object>} - Statistics object
 */
export async function getDataStats() {
  try {
    const [workouts, meals] = await Promise.all([
      getAllWorkouts(),
      getAllMeals(),
    ]);

    const workoutDates = Object.keys(workouts);
    const totalWorkouts = workoutDates.reduce(
      (sum, date) => sum + (workouts[date]?.length || 0),
      0
    );

    const mealDates = Object.keys(meals);
    const totalMeals = mealDates.reduce(
      (sum, date) => sum + (meals[date]?.length || 0),
      0
    );

    return {
      totalWorkouts,
      workoutDays: workoutDates.length,
      totalMeals,
      mealDays: mealDates.length,
    };
  } catch (error) {
    console.error('Error getting data stats:', error);
    return {
      totalWorkouts: 0,
      workoutDays: 0,
      totalMeals: 0,
      mealDays: 0,
    };
  }
}

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Estimate export file size
 * @returns {Promise<string>} - Estimated size string
 */
export async function estimateExportSize() {
  try {
    const [workouts, meals] = await Promise.all([
      getAllWorkouts(),
      getAllMeals(),
    ]);

    const estimatedSize = JSON.stringify({ workouts, meals }).length;
    return formatFileSize(estimatedSize);
  } catch (error) {
    console.error('Error estimating size:', error);
    return 'Unknown';
  }
}

export default {
  exportAllData,
  getDataStats,
  formatFileSize,
  estimateExportSize,
};





