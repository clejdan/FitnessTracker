import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, AppState } from 'react-native';
import { Text, Card, Title, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Calendar from '../../components/Calendar';
import { getWorkout, getWorkoutDates } from '../../services/storageService';
import { format, parseISO } from 'date-fns';
import { hapticDateSelect, hapticButtonPress, hapticFAB } from '../../utils/haptics';
import { showErrorToast } from '../../utils/toast';
import SearchFilter from '../../components/SearchFilter';
import WeekView from '../../components/WeekView';

// Helper to get today's date without timezone issues
const getTodayDateString = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return format(today, 'yyyy-MM-dd');
};

export default function WorkoutCalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [workoutDates, setWorkoutDates] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [filteredWorkouts, setFilteredWorkouts] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  // Load workout dates when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Only reset to today's date when screen comes into focus from another screen
      const today = getTodayDateString();
      if (!selectedDate) {
        setSelectedDate(today);
      }
      loadData();
    }, []) // No dependencies to prevent reset on arrow navigation
  );

  // Load workout data when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      loadData();
    }
  }, [selectedDate]);

  // Background refresh when app comes to foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active' && !initialLoad) {
        loadData(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [initialLoad]);

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh && !initialLoad) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load workout dates
      const dates = await getWorkoutDates();
      setWorkoutDates(dates || []);

      // Load all workouts for filtering
      const allWorkouts = {};
      for (const date of dates || []) {
        const workoutData = await getWorkout(date);
        if (workoutData && workoutData.length > 0) {
          const allExercises = workoutData.flatMap(w => w.exercises || []);
          allWorkouts[date] = {
            ...workoutData[0],
            exercises: allExercises,
          };
        }
      }
      setFilteredWorkouts(allWorkouts);

      // Load workout for selected date
      const workoutData = await getWorkout(selectedDate);
      
      if (workoutData && workoutData.length > 0) {
        const allExercises = workoutData.flatMap(w => w.exercises || []);
        const mergedWorkout = {
          ...workoutData[0],
          exercises: allExercises,
        };
        setTodayWorkout(mergedWorkout);
      } else {
        setTodayWorkout(null);
      }

    } catch (error) {
      console.error('Error loading workout data:', error);
      showErrorToast('Failed to load workout data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    // Only navigate to WorkoutDayScreen when a date is tapped (not when using arrows)
    // The Calendar component will call this for both arrow navigation and date tapping
    // We need to distinguish between the two - for now, just update the selected date
  };

  const handleDateTap = (dateString) => {
    // This will be called when user actually taps on a date
    hapticDateSelect();
    navigation.navigate('WorkoutDay', { date: dateString });
  };

  const handleAddWorkout = () => {
    hapticButtonPress();
    navigation.navigate('AddWorkout', { date: selectedDate });
  };

  const handleSearchApply = (filters) => {
    setSearchFilters(filters);
    // Apply search filters to workout data
    if (filters.searchText) {
      // Filter workouts by exercise name
      const filteredWorkouts = Object.entries(workouts).filter(([date, workout]) => {
        return workout.exercises.some(exercise => 
          exercise.name.toLowerCase().includes(filters.searchText.toLowerCase())
        );
      });
      setFilteredWorkouts(Object.fromEntries(filteredWorkouts));
    } else {
      setFilteredWorkouts(workouts);
    }
    
    // Apply date range filter
    if (filters.startDate && filters.endDate) {
      const filteredByDate = Object.entries(filteredWorkouts || workouts).filter(([date]) => {
        const workoutDate = new Date(date);
        return workoutDate >= filters.startDate && workoutDate <= filters.endDate;
      });
      setFilteredWorkouts(Object.fromEntries(filteredByDate));
    }
    
    console.log('Applied search filters:', filters);
  };

  const handleViewWorkout = () => {
    hapticButtonPress();
    navigation.navigate('WorkoutDay', { date: selectedDate, workout: todayWorkout });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    hapticButtonPress();
    await loadData(true);
    setRefreshing(false);
  };

  // Show loading state
  if (loading && initialLoad) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Title style={styles.headerTitle}>Workout Calendar</Title>
          <Text style={styles.headerSubtitle}>Loading...</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Loading workout data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Title style={styles.headerTitle}>Workout Calendar</Title>
          <Button
            mode="outlined"
            onPress={() => setShowSearchFilter(true)}
            style={styles.searchButton}
            labelStyle={styles.searchButtonLabel}
            icon="magnify"
            compact
          >
            Search
          </Button>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
            colors={['#00ff88']}
            title="Pull to refresh"
            titleColor="#00ff88"
          />
        }
      >
        {/* Week View */}
        <WeekView
          initialDate={parseISO(selectedDate)}
          type="workout"
          onDateSelect={(date) => handleDateSelect(format(date, 'yyyy-MM-dd'))}
          showNavigation={true}
        />

        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          {loading && workoutDates.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={styles.loadingText}>Loading workouts...</Text>
            </View>
          ) : (
            <Calendar
              theme="dark"
              markedDates={workoutDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onDateTap={handleDateTap}
            />
          )}
        </View>

        {/* Workout Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>
              {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const localDate = new Date(year, month - 1, day, 12, 0, 0);
                return format(localDate, 'EEEE, MMMM d');
              })()}
            </Title>
            
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : todayWorkout ? (
              <View>
                <Text style={styles.summaryLabel}>
                  Workout Completed
                </Text>
                <Text style={styles.exerciseCount}>
                  {todayWorkout.exercises?.length || 0} exercises
                </Text>
                <Button
                  mode="contained"
                  onPress={handleViewWorkout}
                  style={styles.viewButton}
                  labelStyle={styles.buttonLabel}
                >
                  View Workout
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.noWorkoutText}>
                  No workout recorded for this day
                </Text>
                <Button
                  mode="contained"
                  onPress={handleAddWorkout}
                  style={styles.addButton}
                  labelStyle={styles.buttonLabel}
                  icon="plus"
                >
                  Add Workout
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>This Week</Title>
            <Text style={styles.statsText}>
              {workoutDates.length} total workouts logged
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#1a1a1a"
        onPress={() => {
          hapticFAB();
          handleAddWorkout();
        }}
      />

      {/* Search Filter Modal */}
      <SearchFilter
        visible={showSearchFilter}
        onClose={() => setShowSearchFilter(false)}
        onApply={handleSearchApply}
        type="workout"
        initialFilters={searchFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
  },
  searchButton: {
    borderColor: '#00ff88',
  },
  searchButtonLabel: {
    color: '#00ff88',
    fontSize: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  calendarContainer: {
    marginBottom: 16,
    minHeight: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#999999',
    fontSize: 14,
    marginTop: 12,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 12,
  },
  summaryTitle: {
    color: '#00ff88',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  exerciseCount: {
    color: '#00ff88',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noWorkoutText: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 16,
  },
  viewButton: {
    backgroundColor: '#00ff88',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButton: {
    backgroundColor: '#00ff88',
    elevation: 4,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonLabel: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#2a2a2a',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderRadius: 12,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 8,
  },
  statsText: {
    color: '#999999',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#00ff88',
    elevation: 8,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

