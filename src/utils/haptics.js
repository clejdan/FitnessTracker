import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app with platform detection
 */

// Haptic feedback types with descriptions
export const HapticTypes = {
  // Light feedback for subtle interactions
  LIGHT: 'light',
  MEDIUM: 'medium', 
  HEAVY: 'heavy',
  
  // Success feedback for positive actions
  SUCCESS: 'success',
  
  // Warning feedback for caution
  WARNING: 'warning',
  
  // Error feedback for negative actions
  ERROR: 'error',
  
  // Selection feedback for pickers and toggles
  SELECTION: 'selection',
  
  // Impact feedback for button presses
  IMPACT: 'impact',
};

/**
 * Trigger haptic feedback with platform detection
 * @param {string} type - Type of haptic feedback
 * @param {object} options - Additional options
 */
export const triggerHaptic = async (type = HapticTypes.LIGHT, options = {}) => {
  try {
    // Only trigger haptics on physical devices
    if (Platform.OS === 'web') {
      return;
    }

    // Check if haptics are available (only on iOS/Android)
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        const isAvailable = await Haptics.isAvailableAsync();
        if (!isAvailable) {
          console.log('Haptics not available on this device');
          return;
        }
      } catch (error) {
        console.log('Haptics check failed:', error.message);
        return;
      }
    }

    // Trigger appropriate haptic based on type
    switch (type) {
      case HapticTypes.LIGHT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
        
      case HapticTypes.MEDIUM:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
        
      case HapticTypes.HEAVY:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
        
      case HapticTypes.SUCCESS:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
        
      case HapticTypes.WARNING:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
        
      case HapticTypes.ERROR:
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
        
      case HapticTypes.SELECTION:
        await Haptics.selectionAsync();
        break;
        
      case HapticTypes.IMPACT:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
        
      default:
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch (error) {
    // Silently fail - haptics are not critical functionality
    console.log('Haptic feedback error:', error.message);
  }
};

/**
 * Convenience functions for common interactions
 */

// Button interactions
export const hapticButton = () => triggerHaptic(HapticTypes.LIGHT);
export const hapticButtonPress = () => triggerHaptic(HapticTypes.MEDIUM);
export const hapticButtonSuccess = () => triggerHaptic(HapticTypes.SUCCESS);

// Picker interactions
export const hapticPicker = () => triggerHaptic(HapticTypes.SELECTION);
export const hapticPickerChange = () => triggerHaptic(HapticTypes.LIGHT);

// Navigation interactions
export const hapticNavigation = () => triggerHaptic(HapticTypes.LIGHT);
export const hapticTabSwitch = () => triggerHaptic(HapticTypes.SELECTION);

// Gesture interactions
export const hapticSwipe = () => triggerHaptic(HapticTypes.LIGHT);
export const hapticSwipeSuccess = () => triggerHaptic(HapticTypes.SUCCESS);
export const hapticLongPress = () => triggerHaptic(HapticTypes.MEDIUM);

// Form interactions
export const hapticInput = () => triggerHaptic(HapticTypes.LIGHT);
export const hapticValidation = () => triggerHaptic(HapticTypes.WARNING);
export const hapticFormSubmit = () => triggerHaptic(HapticTypes.SUCCESS);

// Delete interactions
export const hapticDelete = () => triggerHaptic(HapticTypes.WARNING);
export const hapticDeleteConfirm = () => triggerHaptic(HapticTypes.HEAVY);

// Toggle interactions
export const hapticToggle = () => triggerHaptic(HapticTypes.SELECTION);
export const hapticToggleOn = () => triggerHaptic(HapticTypes.SUCCESS);
export const hapticToggleOff = () => triggerHaptic(HapticTypes.LIGHT);

// Card interactions
export const hapticCardPress = () => triggerHaptic(HapticTypes.LIGHT);
export const hapticCardExpand = () => triggerHaptic(HapticTypes.MEDIUM);

// Calendar interactions
export const hapticDateSelect = () => triggerHaptic(HapticTypes.SELECTION);
export const hapticDateNavigate = () => triggerHaptic(HapticTypes.LIGHT);

// FAB interactions
export const hapticFAB = () => triggerHaptic(HapticTypes.MEDIUM);

// Error feedback
export const hapticError = () => triggerHaptic(HapticTypes.ERROR);

// Success feedback
export const hapticSuccess = () => triggerHaptic(HapticTypes.SUCCESS);

/**
 * Higher-order function to add haptic feedback to any function
 * @param {Function} fn - Function to wrap with haptic feedback
 * @param {string} hapticType - Type of haptic feedback
 * @returns {Function} - Wrapped function with haptic feedback
 */
export const withHaptic = (fn, hapticType = HapticTypes.LIGHT) => {
  return async (...args) => {
    await triggerHaptic(hapticType);
    return fn(...args);
  };
};

/**
 * Check if haptics are available on the current device
 * @returns {Promise<boolean>} - Whether haptics are available
 */
export const isHapticAvailable = async () => {
  try {
    if (Platform.OS === 'web') {
      return false;
    }
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await Haptics.isAvailableAsync();
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default {
  triggerHaptic,
  HapticTypes,
  hapticButton,
  hapticButtonPress,
  hapticButtonSuccess,
  hapticPicker,
  hapticPickerChange,
  hapticNavigation,
  hapticTabSwitch,
  hapticSwipe,
  hapticSwipeSuccess,
  hapticLongPress,
  hapticInput,
  hapticValidation,
  hapticFormSubmit,
  hapticDelete,
  hapticDeleteConfirm,
  hapticToggle,
  hapticToggleOn,
  hapticToggleOff,
  hapticCardPress,
  hapticCardExpand,
  hapticDateSelect,
  hapticDateNavigate,
  hapticFAB,
  hapticError,
  hapticSuccess,
  withHaptic,
  isHapticAvailable,
};