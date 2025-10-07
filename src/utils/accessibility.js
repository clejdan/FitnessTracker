// Accessibility utilities for better screen reader support and focus management

import { AccessibilityInfo, Platform } from 'react-native';

// Accessibility roles and states
export const AccessibilityRoles = {
  BUTTON: 'button',
  TEXT: 'text',
  HEADER: 'header',
  LINK: 'link',
  IMAGE: 'image',
  SEARCH: 'search',
  TAB: 'tab',
  TABLIST: 'tablist',
  LIST: 'list',
  LISTITEM: 'listitem',
  CARD: 'none', // Custom role for cards
  FORM: 'form',
  TEXTBOX: 'textbox',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  SWITCH: 'switch',
  SLIDER: 'slider',
  PROGRESSBAR: 'progressbar',
  ALERT: 'alert',
  MENU: 'menu',
  MENUITEM: 'menuitem',
};

export const AccessibilityStates = {
  SELECTED: 'selected',
  DISABLED: 'disabled',
  CHECKED: 'checked',
  UNCHECKED: 'unchecked',
  EXPANDED: 'expanded',
  COLLAPSED: 'collapsed',
  BUSY: 'busy',
};

// Accessibility hints for common actions
export const AccessibilityHints = {
  BUTTON_PRESS: 'Double tap to activate',
  NAVIGATE: 'Double tap to navigate',
  DELETE: 'Double tap to delete',
  EDIT: 'Double tap to edit',
  SAVE: 'Double tap to save',
  CANCEL: 'Double tap to cancel',
  CLOSE: 'Double tap to close',
  EXPAND: 'Double tap to expand',
  COLLAPSE: 'Double tap to collapse',
  SELECT: 'Double tap to select',
  TOGGLE: 'Double tap to toggle',
  SWIPE_LEFT: 'Swipe left to reveal actions',
  SWIPE_RIGHT: 'Swipe right to reveal actions',
  PULL_DOWN: 'Pull down to refresh',
  SCROLL: 'Scroll to see more content',
};

// Screen reader announcements
export const AccessibilityAnnouncements = {
  WORKOUT_SAVED: 'Workout saved successfully',
  MEAL_SAVED: 'Meal saved successfully',
  EXERCISE_DELETED: 'Exercise deleted',
  MEAL_DELETED: 'Meal deleted',
  DATA_EXPORTED: 'Data exported successfully',
  CACHE_CLEARED: 'Cache cleared',
  NETWORK_ONLINE: 'Connected to internet',
  NETWORK_OFFLINE: 'Working offline',
  FORM_ERROR: 'Please fix the errors before saving',
  LOADING_COMPLETE: 'Loading complete',
  DATE_CHANGED: 'Date changed',
  GOAL_UPDATED: 'Goal updated',
};

// Accessibility manager
export const AccessibilityManager = {
  // Announce to screen reader
  announce: (message, priority = 'polite') => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else if (Platform.OS === 'android') {
      // Android doesn't have direct announcement API, but we can use focus
      // The toast system will handle announcements
    }
  },

  // Set focus to element
  setFocus: (ref) => {
    if (ref && ref.current) {
      ref.current.focus();
    }
  },

  // Check if screen reader is enabled
  isScreenReaderEnabled: async () => {
    try {
      return await AccessibilityInfo.isScreenReaderEnabled();
    } catch (error) {
      console.error('Error checking screen reader status:', error);
      return false;
    }
  },

  // Check if reduce motion is enabled
  isReduceMotionEnabled: async () => {
    try {
      return await AccessibilityInfo.isReduceMotionEnabled();
    } catch (error) {
      console.error('Error checking reduce motion status:', error);
      return false;
    }
  },

  // Get accessibility props for common components
  getButtonProps: (label, hint = AccessibilityHints.BUTTON_PRESS, disabled = false) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.BUTTON,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: disabled ? { disabled: true } : undefined,
  }),

  getTextProps: (text, role = AccessibilityRoles.TEXT) => ({
    accessible: true,
    accessibilityRole: role,
    accessibilityLabel: text,
  }),

  getInputProps: (label, hint = '', required = false, error = '') => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.TEXTBOX,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRequired: required,
    accessibilityInvalid: !!error,
    accessibilityErrorMessage: error,
  }),

  getCardProps: (title, content = '', actions = []) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.CARD,
    accessibilityLabel: title,
    accessibilityHint: content,
    accessibilityActions: actions,
  }),

  getListProps: (label, itemCount) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.LIST,
    accessibilityLabel: label,
    accessibilityHint: `${itemCount} items`,
  }),

  getListItemProps: (label, position, total) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.LISTITEM,
    accessibilityLabel: label,
    accessibilityHint: `Item ${position} of ${total}`,
  }),

  getHeaderProps: (title, level = 1) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.HEADER,
    accessibilityLabel: title,
    accessibilityLevel: level,
  }),

  getTabProps: (label, selected = false) => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.TAB,
    accessibilityLabel: label,
    accessibilityState: { selected },
  }),

  getImageProps: (label, decorative = false) => ({
    accessible: !decorative,
    accessibilityRole: AccessibilityRoles.IMAGE,
    accessibilityLabel: decorative ? undefined : label,
  }),

  getProgressProps: (value, max = 100, label = '') => ({
    accessible: true,
    accessibilityRole: AccessibilityRoles.PROGRESSBAR,
    accessibilityLabel: label,
    accessibilityValue: { min: 0, max, now: value },
  }),
};

// Focus management utilities
export const FocusManager = {
  // Create focus order for forms
  createFocusOrder: (refs) => {
    return refs.map((ref, index) => ({
      ref,
      order: index,
    }));
  },

  // Move focus to next element
  focusNext: (currentRef, refs) => {
    const currentIndex = refs.findIndex(ref => ref === currentRef);
    if (currentIndex < refs.length - 1) {
      const nextRef = refs[currentIndex + 1];
      AccessibilityManager.setFocus(nextRef);
    }
  },

  // Move focus to previous element
  focusPrevious: (currentRef, refs) => {
    const currentIndex = refs.findIndex(ref => ref === currentRef);
    if (currentIndex > 0) {
      const prevRef = refs[currentIndex - 1];
      AccessibilityManager.setFocus(prevRef);
    }
  },

  // Focus first element
  focusFirst: (refs) => {
    if (refs.length > 0) {
      AccessibilityManager.setFocus(refs[0]);
    }
  },

  // Focus last element
  focusLast: (refs) => {
    if (refs.length > 0) {
      AccessibilityManager.setFocus(refs[refs.length - 1]);
    }
  },
};

// High contrast mode support
export const HighContrastManager = {
  // Check if high contrast is enabled
  isHighContrastEnabled: async () => {
    try {
      if (Platform.OS === 'android') {
        // Android doesn't have direct high contrast API
        return false;
      }
      // iOS doesn't have high contrast API either
      return false;
    } catch (error) {
      return false;
    }
  },

  // Get high contrast colors
  getHighContrastColors: () => ({
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#0000FF',
    error: '#FF0000',
    success: '#00FF00',
    warning: '#FFFF00',
    background: '#FFFFFF',
    surface: '#F0F0F0',
    text: '#000000',
    textSecondary: '#666666',
  }),
};

// Voice control support
export const VoiceControlManager = {
  // Get voice control labels
  getVoiceControlLabels: () => ({
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    today: 'Today',
    refresh: 'Refresh',
    export: 'Export',
    import: 'Import',
  }),

  // Add voice control to element
  addVoiceControl: (element, label) => ({
    ...element,
    accessibilityLabel: label,
    accessibilityRole: AccessibilityRoles.BUTTON,
  }),
};

// Accessibility testing utilities
export const AccessibilityTesting = {
  // Test if element is accessible
  isElementAccessible: (element) => {
    return element.accessible !== false && 
           element.accessibilityLabel && 
           element.accessibilityRole;
  },

  // Get accessibility score for screen
  getAccessibilityScore: (elements) => {
    const total = elements.length;
    const accessible = elements.filter(this.isElementAccessible).length;
    return Math.round((accessible / total) * 100);
  },

  // Generate accessibility report
  generateReport: (elements) => {
    const score = this.getAccessibilityScore(elements);
    const issues = elements.filter(el => !this.isElementAccessible(el));
    
    return {
      score,
      total: elements.length,
      accessible: elements.length - issues.length,
      issues: issues.map(el => ({
        type: el.accessibilityRole || 'unknown',
        missing: [
          !el.accessible && 'accessible',
          !el.accessibilityLabel && 'label',
          !el.accessibilityRole && 'role',
        ].filter(Boolean),
      })),
    };
  },
};

// Common accessibility patterns
export const AccessibilityPatterns = {
  // Form field pattern
  formField: (label, value, error, required) => ({
    ...AccessibilityManager.getInputProps(label, '', required, error),
    accessibilityValue: { text: value || 'Empty' },
  }),

  // Button pattern
  button: (label, disabled, loading) => ({
    ...AccessibilityManager.getButtonProps(label, AccessibilityHints.BUTTON_PRESS, disabled),
    accessibilityState: { 
      disabled: disabled || loading,
      busy: loading,
    },
  }),

  // Card pattern
  card: (title, content, actions) => ({
    ...AccessibilityManager.getCardProps(title, content, actions),
    accessibilityActions: actions.map(action => ({
      name: action.name,
      label: action.label,
    })),
  }),

  // List pattern
  list: (items, title) => ({
    ...AccessibilityManager.getListProps(title, items.length),
    children: items.map((item, index) => ({
      ...AccessibilityManager.getListItemProps(item.label, index + 1, items.length),
      key: item.id || index,
    })),
  }),

  // Navigation pattern
  navigation: (current, total, label) => ({
    ...AccessibilityManager.getButtonProps(label, AccessibilityHints.NAVIGATE),
    accessibilityValue: { 
      text: `Page ${current} of ${total}`,
    },
  }),
};

export default {
  AccessibilityManager,
  FocusManager,
  HighContrastManager,
  VoiceControlManager,
  AccessibilityTesting,
  AccessibilityPatterns,
  AccessibilityRoles,
  AccessibilityStates,
  AccessibilityHints,
  AccessibilityAnnouncements,
};
