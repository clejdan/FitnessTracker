import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Calendar from '../../components/Calendar';
import { getWorkout, getWorkoutDates } from '../../services/storageService';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load workout dates and selected day's workout
  useFocusEffect(
    React.useCallback(() => {
      // Reset to today's date when screen comes into focus
      const today = getTodayDateString();
      if (selectedDate !== today) {
        setSelectedDate(today);
      }
      loadData();
    }, [selectedDate])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all dates that have workouts
      const dates = await getWorkoutDates();
      setWorkoutDates(dates);

      // Load workout for selected date
      const workoutData = await getWorkout(selectedDate);
      // getWorkout returns an array, merge all exercises into one workout object
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
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    // Immediately navigate to WorkoutDayScreen when a date is tapped
    navigation.navigate('WorkoutDay', { date: dateString });
  };

  const handleAddWorkout = () => {
    navigation.navigate('AddWorkout', { date: selectedDate });
  };

  const handleViewWorkout = () => {
    navigation.navigate('WorkoutDay', { date: selectedDate, workout: todayWorkout });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Workout Calendar</Title>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
            colors={['#00ff88']}
          />
        }
      >
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
        onPress={handleAddWorkout}
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
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
    elevation: 4,
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
  },
  addButton: {
    backgroundColor: '#00ff88',
  },
  buttonLabel: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#2a2a2a',
    elevation: 4,
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
  },
});

