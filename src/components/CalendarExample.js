/**
 * Calendar Component Usage Examples
 * 
 * Demonstrates the MyFitnessPal-style compact date picker
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text, Title, Paragraph, Card } from 'react-native-paper';
import Calendar from './Calendar';
import { getWorkoutDates, getMealDates } from '../services/storageService';
import { format } from 'date-fns';

// ==================== WORKOUT CALENDAR EXAMPLE ====================

export function WorkoutCalendarExample() {
  const [workoutDates, setWorkoutDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadWorkoutDates();
  }, []);

  const loadWorkoutDates = async () => {
    try {
      const dates = await getWorkoutDates();
      setWorkoutDates(dates); // Array of 'yyyy-MM-dd' strings
    } catch (error) {
      console.error('Error loading workout dates:', error);
    }
  };

  const handleDateSelect = (dateString) => {
    console.log('Selected workout date:', dateString);
    setSelectedDate(dateString);
    // Navigate to WorkoutDayScreen or load workouts for this date
  };

  return (
    <View style={styles.darkContainer}>
      <Title style={styles.darkTitle}>Workout Calendar</Title>
      <Calendar
        theme="dark"
        markedDates={workoutDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
}

// ==================== NUTRITION CALENDAR EXAMPLE ====================

export function NutritionCalendarExample() {
  const [mealDates, setMealDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadMealDates();
  }, []);

  const loadMealDates = async () => {
    try {
      const dates = await getMealDates();
      setMealDates(dates); // Array of 'yyyy-MM-dd' strings
    } catch (error) {
      console.error('Error loading meal dates:', error);
    }
  };

  const handleDateSelect = (dateString) => {
    console.log('Selected nutrition date:', dateString);
    setSelectedDate(dateString);
    // Navigate to NutritionDayScreen or load meals for this date
  };

  return (
    <View style={styles.lightContainer}>
      <Title style={styles.lightTitle}>Nutrition Calendar</Title>
      <Calendar
        theme="light"
        markedDates={mealDates}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
}

// ==================== DEMO SCREEN WITH BOTH THEMES ====================

export default function CalendarDemo() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Example: dates that have workouts or meals
  const markedDates = [
    '2025-10-01',
    '2025-10-03',
    '2025-10-04',
    '2025-10-07',
    '2025-10-10',
    '2025-10-15',
    '2025-10-20',
    '2025-10-25',
  ];

  const handleDateSelect = (date) => {
    console.log('Selected date:', date);
    setSelectedDate(date);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Title style={styles.mainHeading}>Calendar Component Demo</Title>
        <Paragraph style={styles.description}>
          MyFitnessPal-style compact date picker with modal selector
        </Paragraph>

        {/* Dark Theme Example */}
        <Card style={styles.darkCard}>
          <Card.Content>
            <Title style={styles.darkCardTitle}>Dark Theme (Workout)</Title>
            <Calendar
              markedDates={markedDates}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              theme="dark"
            />
            <Paragraph style={styles.darkNote}>
              ⬅️➡️ Use arrows for quick day navigation{'\n'}
              📅 Tap center to open date picker modal{'\n'}
              🟢 Green dots indicate days with data
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Light Theme Example */}
        <Card style={styles.lightCard}>
          <Card.Content>
            <Title style={styles.lightCardTitle}>Light Theme (Nutrition)</Title>
            <Calendar
              markedDates={markedDates}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
              theme="light"
            />
            <Paragraph style={styles.lightNote}>
              Same functionality with light theme colors
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Selected Date Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Paragraph style={styles.infoLabel}>Currently Selected:</Paragraph>
            <Title style={styles.infoText}>
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </Title>
            <Paragraph style={styles.infoSubtext}>
              {markedDates.includes(format(new Date(selectedDate), 'yyyy-MM-dd'))
                ? '✅ This date has data'
                : '⚪ No data for this date'}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Features List */}
        <Card style={styles.featuresCard}>
          <Card.Content>
            <Title style={styles.featuresTitle}>Features:</Title>
            <Paragraph style={styles.featuresList}>
              • Compact always-visible header{'\n'}
              • Left/right arrows for quick navigation{'\n'}
              • Tap center to open modal picker{'\n'}
              • Scrollable month/day/year selection{'\n'}
              • "Jump to Today" quick button{'\n'}
              • Shows dots on dates with data{'\n'}
              • Dark and light theme support{'\n'}
              • Smooth slide-up modal animation
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== PROPS DOCUMENTATION ====================

/**
 * Calendar Component Props:
 * 
 * @param {Array<string>} markedDates - Array of date strings in 'yyyy-MM-dd' format
 *                                      that should show a dot indicator
 *   Example: ['2025-10-01', '2025-10-05', '2025-10-10']
 * 
 * @param {function} onDateSelect - Callback function called when a date is selected
 *   Signature: (dateString: string) => void
 *   The dateString parameter will be in 'yyyy-MM-dd' format
 * 
 * @param {string|Date} selectedDate - Currently selected date to highlight
 *   Can be either:
 *   - String in 'yyyy-MM-dd' format: '2025-10-05'
 *   - Date object: new Date()
 * 
 * @param {string} theme - Visual theme: 'dark' or 'light'
 *   - 'dark': For workout section (#1a1a1a bg, #00ff88 accent)
 *   - 'light': For nutrition section (#ffffff bg, #4CAF50 accent)
 */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  darkCard: {
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  darkCardTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  darkNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    lineHeight: 20,
  },
  lightCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  lightCardTitle: {
    color: '#333333',
    marginBottom: 16,
  },
  lightNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
  },
  infoCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
  },
  featuresCard: {
    backgroundColor: '#e8f5e9',
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  featuresList: {
    fontSize: 14,
    color: '#333',
    lineHeight: 24,
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
  },
  darkTitle: {
    color: '#ffffff',
    marginBottom: 16,
  },
  lightContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
  },
  lightTitle: {
    color: '#333333',
    marginBottom: 16,
  },
});
