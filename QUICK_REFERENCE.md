# FitnessTracker - Quick Reference Guide

## 🚀 New Features & Improvements

### Error Handling & User Feedback

#### Toast Notifications
```javascript
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../utils/toast';

// Show success message
showSuccessToast('Operation successful!');

// Show success with navigation callback
showSuccessToast('Meal saved!', () => navigation.navigate('Home'));

// Show error message
showErrorToast('Something went wrong. Please try again.');

// Confirmation dialog
showConfirmDialog(
  'Delete Item',
  'Are you sure you want to delete this?',
  () => performDelete(),  // On confirm
  () => console.log('Cancelled'),  // On cancel (optional)
  'Yes, Delete',  // Confirm button text
  'Cancel'  // Cancel button text
);
```

#### Loading Spinner
```javascript
import LoadingSpinner from '../components/LoadingSpinner';

// Fullscreen loading (light theme)
<LoadingSpinner 
  message="Loading data..." 
  fullScreen={true}
  theme="light"
  color="#4CAF50"
/>

// Fullscreen loading (dark theme)
<LoadingSpinner 
  message="Loading workout..." 
  fullScreen={true}
  theme="dark"
  color="#00ff88"
/>

// Inline loading
<LoadingSpinner 
  message="Saving..." 
  fullScreen={false}
  size="small"
/>
```

#### Error Boundary
Already integrated in `App.js`. Catches all JavaScript errors and shows recovery UI.

### Data Validation

#### Common Validation Patterns
```javascript
// Required field
if (!value.trim()) {
  errors.field = 'Field is required';
}

// Numeric range
if (value < min || value > max) {
  errors.field = `Must be between ${min} and ${max}`;
}

// At least one value
if (!hasAnyValue) {
  errors.general = 'Please enter at least one value';
}

// Unusual value confirmation
if (calories > 5000) {
  showConfirmDialog(
    'High Value',
    'This seems unusually high. Continue?',
    () => save(),
    null,
    'Yes',
    'Cancel'
  );
}
```

### Screen Patterns

#### Standard Screen Setup
```javascript
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyScreen({ route, navigation }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
      showErrorToast('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveData(data);
      showSuccessToast('Saved successfully!', () => {
        navigation.goBack();
      });
    } catch (error) {
      console.error('Error saving:', error);
      showErrorToast('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner 
          message="Loading..." 
          fullScreen={true}
          theme="light"
        />
      </View>
    );
  }

  return (
    // Your screen UI
  );
}
```

### Best Practices

#### 1. Always Handle Errors
```javascript
// ✅ Good
try {
  await operation();
  showSuccessToast('Success!');
} catch (error) {
  console.error('Error:', error);
  showErrorToast('Operation failed');
}

// ❌ Bad
await operation(); // No error handling
```

#### 2. Provide User Feedback
```javascript
// ✅ Good
setSaving(true);
try {
  await save();
  showSuccessToast('Saved!');
} finally {
  setSaving(false);
}

// ❌ Bad
await save(); // No loading state or success message
```

#### 3. Use useFocusEffect for Data Refresh
```javascript
// ✅ Good
useFocusEffect(
  React.useCallback(() => {
    loadData();
  }, [])
);

// ❌ Bad
useEffect(() => {
  loadData();
}, []); // Won't refresh when navigating back
```

#### 4. Disable Buttons During Operations
```javascript
// ✅ Good
<Button
  onPress={handleSave}
  loading={saving}
  disabled={saving}
>
  Save
</Button>

// ❌ Bad
<Button onPress={handleSave}>
  Save
</Button> // Can be pressed multiple times
```

#### 5. Validate Before Saving
```javascript
// ✅ Good
const handleSave = async () => {
  if (!validateForm()) {
    showErrorToast('Please fix the errors');
    return;
  }
  await save();
};

// ❌ Bad
const handleSave = async () => {
  await save(); // No validation
};
```

### Validation Rules Reference

#### Profile
- Height: 36-96 inches (91-244 cm)
- Weight: 50-500 lbs (23-227 kg)
- Age: 13-120 years
- Gender: Required
- Activity Level: Required

#### Workout
- Exercise Name: Required
- Sets: At least 1
- Reps: 1-50
- RIR: 0-15
- Weight: Optional, positive number

#### Meal
- Meal Name: Required
- At least one macro > 0
- All macros: Non-negative numbers
- Calorie warning if > 5000 kcal

#### Calorie Goal
- Maintenance: 500-5000 kcal (reasonable range)
- Deficit/Surplus: -1000 to +1000 kcal/day

### Color Reference

#### Light Theme
- Background: `#f8f9fa`
- Card: `#ffffff`
- Text: `#333333`
- Secondary Text: `#999999`
- Primary Accent: `#4CAF50` (green)
- Error: `#FF5252` (red)
- Info: `#2196F3` (blue)

#### Dark Theme (Workout)
- Background: `#1a1a1a`
- Card: `#2a2a2a`
- Text: `#ffffff`
- Secondary Text: `#cccccc`
- Primary Accent: `#00ff88` (neon green)
- Error: `#ff5252` (red)

### Icon Reference

#### Common Icons (Ionicons)
- Back: `arrow-left`
- Add: `add` or `plus`
- Delete: `trash` or `delete`
- Edit: `pencil` or `create`
- Success: `checkmark-circle`
- Error: `alert-circle`
- Info: `information-circle`
- Calendar: `calendar`
- Food: `restaurant`
- Workout: `barbell` or `fitness`
- Profile: `person` or `person-circle`
- Settings: `settings`

## 📱 User Experience Guidelines

### Loading States
- Always show loading spinner for operations > 200ms
- Use descriptive loading messages
- Match theme to screen (light/dark)

### Error Messages
- Be specific but user-friendly
- Suggest solutions when possible
- Use toast notifications for non-critical errors
- Use Alert dialogs for critical errors

### Success Feedback
- Always confirm successful operations
- Use toast notifications for quick feedback
- Navigate automatically after save (with callback)

### Confirmations
- Ask before deleting data
- Warn about unusual values
- Provide clear "Yes/No" options

### Validation
- Show inline errors on blur
- Mark fields as "touched" on interaction
- Disable save button if form is invalid
- Show helpful error messages

## 🔧 Troubleshooting

### Common Issues

#### Toast not showing on Android
```javascript
// Make sure to import from React Native
import { ToastAndroid } from 'react-native';
// The utility handles this automatically
```

#### Loading spinner not appearing
```javascript
// Ensure fullScreen prop is set
<LoadingSpinner fullScreen={true} />
// Not just <LoadingSpinner />
```

#### useFocusEffect not refreshing
```javascript
// Include dependencies in callback
useFocusEffect(
  React.useCallback(() => {
    loadData();
  }, [/* add dependencies here */])
);
```

#### Error boundary not catching errors
```javascript
// Error boundaries only catch errors in:
// - Render methods
// - Lifecycle methods
// - Constructors

// They do NOT catch:
// - Event handlers (use try-catch)
// - Async code (use try-catch)
// - Server-side rendering
```

## 📚 Additional Resources

- Toast Utility: `/src/utils/toast.js`
- Error Boundary: `/src/components/ErrorBoundary.js`
- Loading Spinner: `/src/components/LoadingSpinner.js`
- Storage Service: `/src/services/storageService.js`
- Full Documentation: `/POLISH_AND_ERROR_HANDLING.md`





