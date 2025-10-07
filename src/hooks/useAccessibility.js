import { useState, useEffect, useRef, useCallback } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { AccessibilityManager, AccessibilityAnnouncements } from '../utils/accessibility';

// Hook for managing accessibility state and features
export const useAccessibility = () => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const [screenReader, reduceMotion] = await Promise.all([
          AccessibilityManager.isScreenReaderEnabled(),
          AccessibilityManager.isReduceMotionEnabled(),
        ]);
        
        setIsScreenReaderEnabled(screenReader);
        setIsReduceMotionEnabled(reduceMotion);
      } catch (error) {
        console.error('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for accessibility changes
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setIsReduceMotionEnabled
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    if (isScreenReaderEnabled) {
      AccessibilityManager.announce(message, priority);
    }
  }, [isScreenReaderEnabled]);

  const announceSuccess = useCallback((message) => {
    announce(message || AccessibilityAnnouncements.WORKOUT_SAVED);
  }, [announce]);

  const announceError = useCallback((message) => {
    announce(message || AccessibilityAnnouncements.FORM_ERROR, 'assertive');
  }, [announce]);

  const announceLoading = useCallback((message) => {
    announce(message || 'Loading...');
  }, [announce]);

  return {
    isScreenReaderEnabled,
    isReduceMotionEnabled,
    isHighContrastEnabled,
    announce,
    announceSuccess,
    announceError,
    announceLoading,
  };
};

// Hook for managing focus in forms
export const useFocusManagement = (fieldRefs = []) => {
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0);
  const focusRefs = useRef(fieldRefs);

  const focusNext = useCallback(() => {
    if (currentFocusIndex < focusRefs.current.length - 1) {
      const nextIndex = currentFocusIndex + 1;
      setCurrentFocusIndex(nextIndex);
      AccessibilityManager.setFocus(focusRefs.current[nextIndex]);
    }
  }, [currentFocusIndex]);

  const focusPrevious = useCallback(() => {
    if (currentFocusIndex > 0) {
      const prevIndex = currentFocusIndex - 1;
      setCurrentFocusIndex(prevIndex);
      AccessibilityManager.setFocus(focusRefs.current[prevIndex]);
    }
  }, [currentFocusIndex]);

  const focusFirst = useCallback(() => {
    setCurrentFocusIndex(0);
    AccessibilityManager.setFocus(focusRefs.current[0]);
  }, []);

  const focusLast = useCallback(() => {
    const lastIndex = focusRefs.current.length - 1;
    setCurrentFocusIndex(lastIndex);
    AccessibilityManager.setFocus(focusRefs.current[lastIndex]);
  }, []);

  const focusField = useCallback((index) => {
    if (index >= 0 && index < focusRefs.current.length) {
      setCurrentFocusIndex(index);
      AccessibilityManager.setFocus(focusRefs.current[index]);
    }
  }, []);

  const addRef = useCallback((ref) => {
    if (ref && !focusRefs.current.includes(ref)) {
      focusRefs.current.push(ref);
    }
  }, []);

  const removeRef = useCallback((ref) => {
    focusRefs.current = focusRefs.current.filter(r => r !== ref);
  }, []);

  return {
    currentFocusIndex,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    focusField,
    addRef,
    removeRef,
    focusRefs: focusRefs.current,
  };
};

// Hook for managing accessibility announcements
export const useAccessibilityAnnouncements = () => {
  const { announce, announceSuccess, announceError, announceLoading } = useAccessibility();

  const announceWorkoutSaved = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.WORKOUT_SAVED);
  }, [announceSuccess]);

  const announceMealSaved = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.MEAL_SAVED);
  }, [announceSuccess]);

  const announceExerciseDeleted = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.EXERCISE_DELETED);
  }, [announceSuccess]);

  const announceMealDeleted = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.MEAL_DELETED);
  }, [announceSuccess]);

  const announceDataExported = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.DATA_EXPORTED);
  }, [announceSuccess]);

  const announceCacheCleared = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.CACHE_CLEARED);
  }, [announceSuccess]);

  const announceNetworkStatus = useCallback((isOnline) => {
    const message = isOnline 
      ? AccessibilityAnnouncements.NETWORK_ONLINE 
      : AccessibilityAnnouncements.NETWORK_OFFLINE;
    announce(message);
  }, [announce]);

  const announceFormError = useCallback(() => {
    announceError(AccessibilityAnnouncements.FORM_ERROR);
  }, [announceError]);

  const announceLoadingComplete = useCallback(() => {
    announce(AccessibilityAnnouncements.LOADING_COMPLETE);
  }, [announce]);

  const announceDateChanged = useCallback((date) => {
    announce(`${AccessibilityAnnouncements.DATE_CHANGED} to ${date}`);
  }, [announce]);

  const announceGoalUpdated = useCallback(() => {
    announceSuccess(AccessibilityAnnouncements.GOAL_UPDATED);
  }, [announceSuccess]);

  return {
    announce,
    announceSuccess,
    announceError,
    announceLoading,
    announceWorkoutSaved,
    announceMealSaved,
    announceExerciseDeleted,
    announceMealDeleted,
    announceDataExported,
    announceCacheCleared,
    announceNetworkStatus,
    announceFormError,
    announceLoadingComplete,
    announceDateChanged,
    announceGoalUpdated,
  };
};

// Hook for managing accessibility in lists
export const useAccessibleList = (items, listTitle) => {
  const { isScreenReaderEnabled } = useAccessibility();
  const [announcements, setAnnouncements] = useState([]);

  const announceListUpdate = useCallback((action, itemName, position) => {
    if (isScreenReaderEnabled) {
      const message = `${action} ${itemName} at position ${position} of ${items.length}`;
      setAnnouncements(prev => [...prev, message]);
    }
  }, [isScreenReaderEnabled, items.length]);

  const announceItemAdded = useCallback((itemName, position) => {
    announceListUpdate('Added', itemName, position);
  }, [announceListUpdate]);

  const announceItemRemoved = useCallback((itemName, position) => {
    announceListUpdate('Removed', itemName, position);
  }, [announceListUpdate]);

  const announceItemMoved = useCallback((itemName, fromPosition, toPosition) => {
    if (isScreenReaderEnabled) {
      const message = `Moved ${itemName} from position ${fromPosition} to position ${toPosition}`;
      setAnnouncements(prev => [...prev, message]);
    }
  }, [isScreenReaderEnabled]);

  const getListAccessibilityProps = useCallback(() => ({
    accessible: true,
    accessibilityRole: 'list',
    accessibilityLabel: listTitle,
    accessibilityHint: `${items.length} items`,
  }), [listTitle, items.length]);

  const getItemAccessibilityProps = useCallback((item, index) => ({
    accessible: true,
    accessibilityRole: 'listitem',
    accessibilityLabel: item.label || item.name || `Item ${index + 1}`,
    accessibilityHint: `Item ${index + 1} of ${items.length}`,
    accessibilityActions: item.actions || [],
  }), [items.length]);

  return {
    announceItemAdded,
    announceItemRemoved,
    announceItemMoved,
    getListAccessibilityProps,
    getItemAccessibilityProps,
    announcements,
  };
};

// Hook for managing accessibility in forms
export const useAccessibleForm = (formFields) => {
  const { isScreenReaderEnabled } = useAccessibility();
  const { focusNext, focusPrevious, focusFirst, focusLast, addRef } = useFocusManagement();
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValues, setFieldValues] = useState({});

  const announceFieldError = useCallback((fieldName, error) => {
    if (isScreenReaderEnabled && error) {
      AccessibilityManager.announce(`Error in ${fieldName}: ${error}`, 'assertive');
    }
  }, [isScreenReaderEnabled]);

  const announceFieldSuccess = useCallback((fieldName) => {
    if (isScreenReaderEnabled) {
      AccessibilityManager.announce(`${fieldName} is valid`);
    }
  }, [isScreenReaderEnabled]);

  const setFieldError = useCallback((fieldName, error) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    announceFieldError(fieldName, error);
  }, [announceFieldError]);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    announceFieldSuccess(fieldName);
  }, [announceFieldSuccess]);

  const setFieldValue = useCallback((fieldName, value) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const getFieldAccessibilityProps = useCallback((fieldName, label, hint = '') => {
    const error = fieldErrors[fieldName];
    const value = fieldValues[fieldName];
    
    return {
      ...AccessibilityManager.getInputProps(label, hint, true, error),
      accessibilityValue: { text: value || 'Empty' },
      ref: (ref) => addRef(ref),
    };
  }, [fieldErrors, fieldValues, addRef]);

  const validateForm = useCallback(() => {
    const errors = {};
    formFields.forEach(field => {
      if (field.required && !fieldValues[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formFields, fieldValues]);

  return {
    fieldErrors,
    fieldValues,
    setFieldError,
    clearFieldError,
    setFieldValue,
    getFieldAccessibilityProps,
    validateForm,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
  };
};

export default {
  useAccessibility,
  useFocusManagement,
  useAccessibilityAnnouncements,
  useAccessibleList,
  useAccessibleForm,
};
