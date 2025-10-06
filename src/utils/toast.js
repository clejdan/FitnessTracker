/**
 * Toast Notification Utility
 * 
 * Provides user-friendly notifications for success/error messages
 * Uses React Native's Alert with improved styling and defaults
 */

import { Alert, ToastAndroid, Platform } from 'react-native';

/**
 * Show a success toast message
 * @param {string} message - The success message to display
 * @param {function} onDismiss - Optional callback when dismissed
 */
export function showSuccessToast(message, onDismiss) {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    if (onDismiss) onDismiss();
  } else {
    Alert.alert('Success', message, [
      { text: 'OK', onPress: onDismiss }
    ]);
  }
}

/**
 * Show an error toast message
 * @param {string} message - The error message to display
 * @param {function} onDismiss - Optional callback when dismissed
 */
export function showErrorToast(message, onDismiss) {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM
    );
    if (onDismiss) onDismiss();
  } else {
    Alert.alert('Error', message, [
      { text: 'OK', onPress: onDismiss, style: 'cancel' }
    ]);
  }
}

/**
 * Show an info toast message
 * @param {string} message - The info message to display
 * @param {function} onDismiss - Optional callback when dismissed
 */
export function showInfoToast(message, onDismiss) {
  if (Platform.OS === 'android') {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    if (onDismiss) onDismiss();
  } else {
    Alert.alert('Info', message, [
      { text: 'OK', onPress: onDismiss }
    ]);
  }
}

/**
 * Show a confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} onConfirm - Callback when confirmed
 * @param {function} onCancel - Optional callback when cancelled
 * @param {string} confirmText - Text for confirm button (default: "Confirm")
 * @param {string} cancelText - Text for cancel button (default: "Cancel")
 */
export function showConfirmDialog(
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        onPress: onCancel,
        style: 'cancel'
      },
      {
        text: confirmText,
        onPress: onConfirm,
        style: 'destructive'
      }
    ],
    { cancelable: true }
  );
}

/**
 * Show a custom alert with multiple options
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Array of button objects
 */
export function showAlert(title, message, buttons = [{ text: 'OK' }]) {
  Alert.alert(title, message, buttons);
}

/**
 * Format error message for user display
 * @param {Error} error - The error object
 * @returns {string} - User-friendly error message
 */
export function formatErrorMessage(error) {
  if (!error) return 'An unknown error occurred';
  
  // Handle common error types
  if (error.message) {
    // Storage quota errors
    if (error.message.includes('quota') || error.message.includes('storage')) {
      return 'Storage is full. Please free up some space or delete old data.';
    }
    
    // Network errors
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Validation errors
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return error.message; // Show validation errors as-is
    }
    
    // Generic error with message
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle async operation with automatic error handling
 * @param {function} asyncFn - Async function to execute
 * @param {string} errorTitle - Title for error alert (optional)
 * @returns {Promise} - Result or throws error
 */
export async function handleAsyncOperation(asyncFn, errorTitle = 'Error') {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(`${errorTitle}:`, error);
    const message = formatErrorMessage(error);
    showErrorToast(message);
    throw error;
  }
}

export default {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showConfirmDialog,
  showAlert,
  formatErrorMessage,
  handleAsyncOperation,
};


