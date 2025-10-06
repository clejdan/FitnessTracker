/**
 * Haptic Feedback Utility
 * 
 * Provides haptic feedback for user interactions
 * Uses Expo Haptics for consistent cross-platform experience
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Light impact feedback
 * Use for: Button taps, toggle switches, checkboxes
 */
export const lightImpact = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not supported
      console.log('Haptics not supported');
    }
  }
};

/**
 * Medium impact feedback
 * Use for: Navigation, card selection, date changes
 */
export const mediumImpact = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

/**
 * Heavy impact feedback
 * Use for: Confirmation actions, delete operations
 */
export const heavyImpact = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

/**
 * Success notification feedback
 * Use for: Successful saves, completions
 */
export const notificationSuccess = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

/**
 * Error notification feedback
 * Use for: Errors, validation failures
 */
export const notificationError = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

/**
 * Warning notification feedback
 * Use for: Warnings, confirmations needed
 */
export const notificationWarning = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

/**
 * Selection changed feedback
 * Use for: Picker value changes, option selections
 */
export const selectionAsync = () => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not supported');
    }
  }
};

export default {
  lightImpact,
  mediumImpact,
  heavyImpact,
  notificationSuccess,
  notificationError,
  notificationWarning,
  selectionAsync,
};





