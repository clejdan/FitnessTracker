import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Calendar from '../../components/Calendar';
import { getWorkout, getWorkoutDates } from '../../services/storageService';
import { format } from 'date-fns';

export default function WorkoutCalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workoutDates, setWorkoutDates] = useState([]);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load workout dates and selected day's workout
  useFocusEffect(
    React.useCallback(() => {
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
      const workout = await getWorkout(selectedDate);
      setTodayWorkout(workout);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
  };

  const handleAddWorkout = () => {
    navigation.navigate('AddWorkout', { date: selectedDate });
  };

  const handleViewWorkout = () => {
    navigation.navigate('WorkoutDay', { date: selectedDate, workout: todayWorkout });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            theme="dark"
            markedDates={workoutDates}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </View>

        {/* Workout Summary Card */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Title style={styles.summaryTitle}>
              {format(new Date(selectedDate), 'EEEE, MMMM d')}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  calendarContainer: {
    marginBottom: 16,
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
  loadingText: {
    color: '#999999',
    fontSize: 14,
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

