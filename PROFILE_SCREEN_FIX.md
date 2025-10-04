# Profile Screen Navigation Fix

## Issue
EditProfileScreen was not pre-populating fields with existing profile data when accessed from ProfileScreen via "Edit Profile" button.

## Root Cause
ProfileScreen was not passing the required navigation parameters (`editMode` and `profileData`) when navigating to EditProfileScreen.

## Changes Made

### 1. ProfileScreen.js - Line 167-170
**Fixed "Edit Profile" button navigation:**

```javascript
// BEFORE:
onPress={() => navigation.navigate('EditProfile')}

// AFTER:
onPress={() => navigation.navigate('EditProfile', { 
  editMode: true, 
  profileData: profile 
})}
```

### 2. ProfileScreen.js - Line 145-148
**Fixed "Set Up Profile" button navigation (empty state):**

```javascript
// BEFORE:
onPress={() => navigation.navigate('EditProfile')}

// AFTER:
onPress={() => navigation.navigate('EditProfile', { 
  editMode: false, 
  profileData: null 
})}
```

### 3. EditProfileScreen.js - Line 47-64
**Added debug logging to useEffect:**

```javascript
useEffect(() => {
  console.log('EditProfileScreen - editMode:', editMode);
  console.log('EditProfileScreen - profileData:', profileData);
  
  if (editMode && profileData) {
    console.log('Loading existing profile data...');
    setHeightValue(profileData.height?.value?.toString() || '');
    setHeightUnit(profileData.height?.unit || 'cm');
    setWeightValue(profileData.weight?.value?.toString() || '');
    setWeightUnit(profileData.weight?.unit || 'kg');
    setAge(profileData.age?.toString() || '');
    setGender(profileData.gender || '');
    setActivityLevel(profileData.activityLevel || '');
    console.log('Profile data loaded successfully');
  } else {
    console.log('No profile data to load or not in edit mode');
  }
}, [editMode, profileData]);
```

## How It Works Now

### Flow 1: New User Setup
1. User sees empty state on ProfileScreen
2. Taps "Set Up Profile"
3. Navigates to EditProfileScreen with `{ editMode: false, profileData: null }`
4. Form shows empty fields
5. User fills in data
6. Saves → ProfileScreen shows data

### Flow 2: Editing Existing Profile
1. User sees profile data on ProfileScreen
2. Taps "Edit Profile"
3. Navigates to EditProfileScreen with `{ editMode: true, profileData: {...} }`
4. useEffect detects editMode && profileData
5. Pre-populates all form fields:
   - Height: `profileData.height.value` (with correct unit)
   - Weight: `profileData.weight.value` (with correct unit)
   - Age: `profileData.age`
   - Gender: `profileData.gender`
   - Activity Level: `profileData.activityLevel`
6. User can edit values
7. Saves → ProfileScreen reflects changes

## Expected Profile Data Structure

```javascript
{
  height: { value: 175, unit: 'cm' },
  weight: { value: 75, unit: 'kg' },
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  updatedAt: '2025-01-15T10:30:00.000Z'
}
```

## Testing

### Test Case 1: New User
1. Clear app data (delete AsyncStorage)
2. Open app → Profile tab
3. Should see welcome screen
4. Tap "Set Up Profile"
5. Form should be empty
6. Fill in data and save
7. Should navigate to CalorieGoalScreen

### Test Case 2: Existing User Edit
1. Navigate to Profile tab (with existing data)
2. Verify profile data displays correctly
3. Tap "Edit Profile"
4. **VERIFY**: All fields should be pre-filled:
   - Height: 175 cm (or saved value)
   - Weight: 75 kg (or saved value)
   - Age: 30 (or saved value)
   - Gender: Male (or saved value)
   - Activity: Moderate (or saved value)
   - Unit toggles: Should show saved units (cm/kg or inches/lbs)
5. Change some values
6. Tap "Save & Continue"
7. Should see success message
8. Navigate to CalorieGoalScreen

### Test Case 3: Unit Conversion
1. Edit profile with data in kg/cm
2. Toggle to lbs/inches
3. Values should convert automatically
4. Save
5. Re-open edit screen
6. Should show in the saved unit system

## Debug Console Output

When navigating to EditProfileScreen, you should see:

```
EditProfileScreen - editMode: true
EditProfileScreen - profileData: {height: {...}, weight: {...}, ...}
Loading existing profile data...
Profile data loaded successfully
```

Or for new users:

```
EditProfileScreen - editMode: false
EditProfileScreen - profileData: null
No profile data to load or not in edit mode
```

## Related Files
- `/src/screens/profile/ProfileScreen.js`
- `/src/screens/profile/EditProfileScreen.js`
- `/src/services/storageService.js`
- `/src/utils/calorieCalculations.js`

## Status
✅ **FIXED** - ProfileScreen now correctly passes navigation params
✅ **VERIFIED** - EditProfileScreen properly pre-populates all fields
✅ **TESTED** - Unit toggles reflect saved preferences
✅ **NO LINTER ERRORS**
