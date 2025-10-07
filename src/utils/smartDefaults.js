import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WORKOUT_DEFAULTS: 'workout_defaults',
  MEAL_DEFAULTS: 'meal_defaults',
  USER_PREFERENCES: 'user_preferences',
};

// Smart defaults for workout forms
export const WorkoutDefaults = {
  // Get saved defaults
  async getDefaults() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_DEFAULTS);
      return saved ? JSON.parse(saved) : this.getInitialDefaults();
    } catch (error) {
      console.error('Error loading workout defaults:', error);
      return this.getInitialDefaults();
    }
  },

  // Save new defaults
  async saveDefaults(defaults) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_DEFAULTS, JSON.stringify(defaults));
    } catch (error) {
      console.error('Error saving workout defaults:', error);
    }
  },

  // Get initial defaults
  getInitialDefaults() {
    return {
      reps: 10,
      rir: 2,
      weightUnit: 'lbs',
      lastUsedExercise: '',
      commonExercises: [
        'Bench Press',
        'Squat',
        'Deadlift',
        'Overhead Press',
        'Pull-ups',
        'Rows',
        'Dips',
        'Lunges',
      ],
    };
  },

  // Update defaults based on user input
  async updateFromWorkout(workoutData) {
    const currentDefaults = await this.getDefaults();
    const newDefaults = { ...currentDefaults };

    if (workoutData.exerciseName) {
      newDefaults.lastUsedExercise = workoutData.exerciseName;
      
      // Add to common exercises if not already there
      if (!newDefaults.commonExercises.includes(workoutData.exerciseName)) {
        newDefaults.commonExercises.unshift(workoutData.exerciseName);
        // Keep only top 10
        newDefaults.commonExercises = newDefaults.commonExercises.slice(0, 10);
      }
    }

    if (workoutData.sets && workoutData.sets.length > 0) {
      const lastSet = workoutData.sets[workoutData.sets.length - 1];
      if (lastSet.reps) newDefaults.reps = lastSet.reps;
      if (lastSet.rir) newDefaults.rir = lastSet.rir;
    }

    if (workoutData.weightUnit) {
      newDefaults.weightUnit = workoutData.weightUnit;
    }

    await this.saveDefaults(newDefaults);
  },
};

// Smart defaults for meal forms
export const MealDefaults = {
  async getDefaults() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_DEFAULTS);
      return saved ? JSON.parse(saved) : this.getInitialDefaults();
    } catch (error) {
      console.error('Error loading meal defaults:', error);
      return this.getInitialDefaults();
    }
  },

  async saveDefaults(defaults) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEAL_DEFAULTS, JSON.stringify(defaults));
    } catch (error) {
      console.error('Error saving meal defaults:', error);
    }
  },

  getInitialDefaults() {
    return {
      proteinUnit: 'g',
      carbsUnit: 'g',
      fatsUnit: 'g',
      lastUsedMeal: '',
      commonMeals: [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snack',
        'Pre-Workout',
        'Post-Workout',
      ],
      mealTimes: {
        breakfast: '08:00',
        lunch: '12:00',
        dinner: '18:00',
        snack: '15:00',
      },
    };
  },

  async updateFromMeal(mealData) {
    const currentDefaults = await this.getDefaults();
    const newDefaults = { ...currentDefaults };

    if (mealData.mealName) {
      newDefaults.lastUsedMeal = mealData.mealName;
      
      if (!newDefaults.commonMeals.includes(mealData.mealName)) {
        newDefaults.commonMeals.unshift(mealData.mealName);
        newDefaults.commonMeals = newDefaults.commonMeals.slice(0, 10);
      }
    }

    if (mealData.proteinUnit) newDefaults.proteinUnit = mealData.proteinUnit;
    if (mealData.carbsUnit) newDefaults.carbsUnit = mealData.carbsUnit;
    if (mealData.fatsUnit) newDefaults.fatsUnit = mealData.fatsUnit;

    await this.saveDefaults(newDefaults);
  },
};

// User preferences
export const UserPreferences = {
  async getPreferences() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return saved ? JSON.parse(saved) : this.getInitialPreferences();
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return this.getInitialPreferences();
    }
  },

  async savePreferences(preferences) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  },

  getInitialPreferences() {
    return {
      autoSave: true,
      autoSaveDelay: 2000,
      showValidationHints: true,
      hapticFeedback: true,
      defaultWeightUnit: 'lbs',
      defaultHeightUnit: 'in',
      theme: 'system',
    };
  },

  async updatePreference(key, value) {
    const current = await this.getPreferences();
    const updated = { ...current, [key]: value };
    await this.savePreferences(updated);
  },
};

// Form state persistence
export const FormPersistence = {
  async saveFormState(formType, formData) {
    try {
      const key = `form_state_${formType}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        data: formData,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error saving form state:', error);
    }
  },

  async loadFormState(formType, maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const key = `form_state_${formType}`;
      const saved = await AsyncStorage.getItem(key);
      
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        const age = Date.now() - timestamp;
        
        if (age < maxAge) {
          return data;
        } else {
          // Remove expired form state
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error loading form state:', error);
    }
    
    return null;
  },

  async clearFormState(formType) {
    try {
      const key = `form_state_${formType}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing form state:', error);
    }
  },
};

// Exercise suggestions based on user history
export const ExerciseSuggestions = {
  async getSuggestions() {
    try {
      const workoutDefaults = await WorkoutDefaults.getDefaults();
      return workoutDefaults.commonExercises || [];
    } catch (error) {
      console.error('Error getting exercise suggestions:', error);
      return [];
    }
  },

  async addExercise(exerciseName) {
    try {
      const currentDefaults = await WorkoutDefaults.getDefaults();
      const commonExercises = currentDefaults.commonExercises || [];
      
      // Remove if already exists and add to front
      const filtered = commonExercises.filter(name => name !== exerciseName);
      const updated = [exerciseName, ...filtered].slice(0, 10);
      
      await WorkoutDefaults.saveDefaults({
        ...currentDefaults,
        commonExercises: updated,
      });
    } catch (error) {
      console.error('Error adding exercise suggestion:', error);
    }
  },
};

// Meal suggestions based on user history
export const MealSuggestions = {
  async getSuggestions() {
    try {
      const mealDefaults = await MealDefaults.getDefaults();
      return mealDefaults.commonMeals || [];
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      return [];
    }
  },

  async addMeal(mealName) {
    try {
      const currentDefaults = await MealDefaults.getDefaults();
      const commonMeals = currentDefaults.commonMeals || [];
      
      const filtered = commonMeals.filter(name => name !== mealName);
      const updated = [mealName, ...filtered].slice(0, 10);
      
      await MealDefaults.saveDefaults({
        ...currentDefaults,
        commonMeals: updated,
      });
    } catch (error) {
      console.error('Error adding meal suggestion:', error);
    }
  },
};
