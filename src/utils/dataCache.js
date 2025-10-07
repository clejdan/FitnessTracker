import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  WORKOUTS: 'cache_workouts',
  MEALS: 'cache_meals',
  PROFILE: 'cache_profile',
  CALORIE_GOAL: 'cache_calorie_goal',
  WORKOUT_DATES: 'cache_workout_dates',
  MEAL_DATES: 'cache_meal_dates',
};

const CACHE_EXPIRY = {
  WORKOUTS: 5 * 60 * 1000, // 5 minutes
  MEALS: 5 * 60 * 1000, // 5 minutes
  PROFILE: 30 * 60 * 1000, // 30 minutes
  CALORIE_GOAL: 30 * 60 * 1000, // 30 minutes
  WORKOUT_DATES: 2 * 60 * 1000, // 2 minutes
  MEAL_DATES: 2 * 60 * 1000, // 2 minutes
};

// Cache entry structure
const createCacheEntry = (data, expiry = 5 * 60 * 1000) => ({
  data,
  timestamp: Date.now(),
  expiry: Date.now() + expiry,
});

// Check if cache entry is valid
const isCacheValid = (cacheEntry) => {
  if (!cacheEntry) return false;
  return Date.now() < cacheEntry.expiry;
};

// Data cache manager
export const DataCache = {
  // Get cached data
  async get(key) {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const cacheEntry = JSON.parse(cached);
        if (isCacheValid(cacheEntry)) {
          return cacheEntry.data;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  },

  // Set cached data
  async set(key, data, expiry) {
    try {
      const cacheEntry = createCacheEntry(data, expiry);
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  // Clear specific cache
  async clear(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Clear all cache
  async clearAll() {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  },

  // Get cache info
  async getCacheInfo() {
    try {
      const info = {};
      for (const [name, key] of Object.entries(CACHE_KEYS)) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          const cacheEntry = JSON.parse(cached);
          info[name] = {
            size: cached.length,
            age: Date.now() - cacheEntry.timestamp,
            valid: isCacheValid(cacheEntry),
          };
        }
      }
      return info;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {};
    }
  },
};

// Network status manager
export const NetworkManager = {
  isOnline: true,
  listeners: [],

  async init() {
    // Simplified network manager without NetInfo dependency
    // Assume connected by default
    this.isOnline = true;
    this.listeners.forEach(listener => listener(true));
  },

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },

  async isConnected() {
    // Return true by default - in a real app you'd implement proper network detection
    return this.isOnline;
  },

  // Manual network state management
  setConnected(connected) {
    this.isOnline = connected;
    this.listeners.forEach(listener => listener(connected));
  },
};

// Optimistic updates manager
export const OptimisticUpdates = {
  // Apply optimistic update
  applyUpdate(data, update) {
    return { ...data, ...update, _optimistic: true };
  },

  // Revert optimistic update
  revertUpdate(data) {
    const { _optimistic, ...reverted } = data;
    return reverted;
  },

  // Check if data has optimistic updates
  hasOptimisticUpdates(data) {
    return data && data._optimistic === true;
  },
};

// Data synchronization manager
export const DataSync = {
  // Sync data with cache
  async syncWithCache(key, fetchFunction, expiry) {
    try {
      // Try to get from cache first
      const cached = await DataCache.get(key);
      if (cached) {
        // Return cached data immediately
        return { data: cached, fromCache: true };
      }

      // If not in cache or expired, fetch fresh data
      const freshData = await fetchFunction();
      if (freshData) {
        // Cache the fresh data
        await DataCache.set(key, freshData, expiry);
        return { data: freshData, fromCache: false };
      }

      return { data: null, fromCache: false };
    } catch (error) {
      console.error('Error syncing with cache:', error);
      // Try to return cached data even if expired
      const cached = await DataCache.get(key);
      return { data: cached, fromCache: true, error };
    }
  },

  // Background sync
  async backgroundSync() {
    try {
      const isOnline = await NetworkManager.isConnected();
      if (!isOnline) return;

      // Sync critical data in background
      const syncPromises = [
        this.syncWorkoutDates(),
        this.syncMealDates(),
        this.syncProfile(),
      ];

      await Promise.allSettled(syncPromises);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  },

  // Sync workout dates
  async syncWorkoutDates() {
    // This would typically fetch from a server
    // For now, we'll just refresh the cache
    const key = CACHE_KEYS.WORKOUT_DATES;
    await DataCache.clear(key);
  },

  // Sync meal dates
  async syncMealDates() {
    const key = CACHE_KEYS.MEAL_DATES;
    await DataCache.clear(key);
  },

  // Sync profile
  async syncProfile() {
    const key = CACHE_KEYS.PROFILE;
    await DataCache.clear(key);
  },
};

// Enhanced data fetching with caching
export const CachedDataFetcher = {
  // Fetch workouts with caching
  async getWorkouts(date) {
    const key = `${CACHE_KEYS.WORKOUTS}_${date}`;
    return DataSync.syncWithCache(
      key,
      async () => {
        // This would be your actual data fetching function
        const { getWorkout } = await import('../services/storageService');
        return await getWorkout(date);
      },
      CACHE_EXPIRY.WORKOUTS
    );
  },

  // Fetch meals with caching
  async getMeals(date) {
    const key = `${CACHE_KEYS.MEALS}_${date}`;
    return DataSync.syncWithCache(
      key,
      async () => {
        const { getMeal } = await import('../services/storageService');
        return await getMeal(date);
      },
      CACHE_EXPIRY.MEALS
    );
  },

  // Fetch profile with caching
  async getProfile() {
    return DataSync.syncWithCache(
      CACHE_KEYS.PROFILE,
      async () => {
        const { getProfile } = await import('../services/storageService');
        return await getProfile();
      },
      CACHE_EXPIRY.PROFILE
    );
  },

  // Fetch workout dates with caching
  async getWorkoutDates() {
    return DataSync.syncWithCache(
      CACHE_KEYS.WORKOUT_DATES,
      async () => {
        const { getWorkoutDates } = await import('../services/storageService');
        return await getWorkoutDates();
      },
      CACHE_EXPIRY.WORKOUT_DATES
    );
  },

  // Fetch meal dates with caching
  async getMealDates() {
    return DataSync.syncWithCache(
      CACHE_KEYS.MEAL_DATES,
      async () => {
        const { getMealDates } = await import('../services/storageService');
        return await getMealDates();
      },
      CACHE_EXPIRY.MEAL_DATES
    );
  },
};

// Bulk operations manager
export const BulkOperations = {
  // Delete multiple workouts
  async deleteWorkouts(workoutIds) {
    try {
      const { deleteWorkout } = await import('../services/storageService');
      const results = await Promise.allSettled(
        workoutIds.map(id => deleteWorkout(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, results };
    } catch (error) {
      console.error('Bulk delete workouts failed:', error);
      throw error;
    }
  },

  // Delete multiple meals
  async deleteMeals(mealIds) {
    try {
      const { deleteMeal } = await import('../services/storageService');
      const results = await Promise.allSettled(
        mealIds.map(id => deleteMeal(id))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return { successful, failed, results };
    } catch (error) {
      console.error('Bulk delete meals failed:', error);
      throw error;
    }
  },

  // Export multiple data types
  async exportBulkData(types = ['workouts', 'meals', 'profile']) {
    try {
      const { exportAllData } = await import('./dataExport');
      return await exportAllData(types);
    } catch (error) {
      console.error('Bulk export failed:', error);
      throw error;
    }
  },
};

// Performance monitoring
export const PerformanceMonitor = {
  // Measure function execution time
  async measureAsync(fn, name) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      console.log(`[Performance] ${name}: ${duration}ms`);
      return { result, duration };
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`[Performance] ${name} (error): ${duration}ms`);
      throw error;
    }
  },

  // Measure render time
  measureRender(componentName, renderFn) {
    const start = Date.now();
    const result = renderFn();
    const duration = Date.now() - start;
    console.log(`[Performance] ${componentName} render: ${duration}ms`);
    return result;
  },
};
