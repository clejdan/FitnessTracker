import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Title, Button, FAB, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Calendar from '../../components/Calendar';
import { getMeals, getMealDates, getDailyTotals, getCalorieGoal } from '../../services/storageService';
import { format } from 'date-fns';

// Helper to get today's date without timezone issues
const getTodayDateString = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  return format(today, 'yyyy-MM-dd');
};

export default function NutritionCalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [mealDates, setMealDates] = useState([]);
  const [dailyTotals, setDailyTotals] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load meal dates and selected day's totals
  useFocusEffect(
    React.useCallback(() => {
      // Only reset to today's date if no date is selected
      if (!selectedDate) {
        const today = getTodayDateString();
        setSelectedDate(today);
      }
      loadData();
    }, []) // Remove selectedDate dependency to prevent reset when navigating back
  );

  // Load data when selected date changes
  useEffect(() => {
    if (selectedDate) {
      loadDataForDate(selectedDate);
    }
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all dates that have meals
      const dates = await getMealDates();
      setMealDates(dates);

      // Load calorie goal
      const goal = await getCalorieGoal();
      setCalorieGoal(goal);

      // Load daily totals for selected date (if we have one)
      if (selectedDate) {
        const totals = await getDailyTotals(selectedDate);
        setDailyTotals(totals);
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
    // Load data for the new selected date
    loadDataForDate(dateString);
  };

  const loadDataForDate = async (dateString) => {
    try {
      // Load daily totals for the selected date
      const totals = await getDailyTotals(dateString);
      setDailyTotals(totals);
      
      // Also refresh meal dates to show updated marked dates
      const dates = await getMealDates();
      setMealDates(dates);
    } catch (error) {
      console.error('Error loading nutrition data for date:', error);
    }
  };

  const handleAddMeal = () => {
    navigation.navigate('AddMeal', { 
      date: selectedDate,
      onMealAdded: () => {
        // Refresh data when meal is added
        loadDataForDate(selectedDate);
      }
    });
  };

  const handleViewDay = () => {
    navigation.navigate('NutritionDay', { date: selectedDate });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    // Also refresh the current selected date's data
    if (selectedDate) {
      await loadDataForDate(selectedDate);
    }
    setRefreshing(false);
  };

  const getCalorieProgress = () => {
    if (!dailyTotals || !calorieGoal) return 0;
    return Math.round((dailyTotals.calories / calorieGoal.finalGoal) * 100);
  };

  const getRemainingCalories = () => {
    if (!dailyTotals || !calorieGoal) return calorieGoal?.finalGoal || 2000;
    return calorieGoal.finalGoal - dailyTotals.calories;
  };

  return (
    <View style={styles.container}>
      {/* Title Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Nutrition Calendar</Title>
        {calorieGoal && (
          <View style={styles.goalContainer}>
            <Text style={styles.goalValue}>{calorieGoal.finalGoal} calories</Text>
          </View>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
      >
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          {loading && mealDates.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading meals...</Text>
            </View>
          ) : (
            <Calendar
              theme="light"
              markedDates={mealDates}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          )}
        </View>

        {/* Calorie Summary Card */}
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
            ) : dailyTotals && dailyTotals.calories > 0 ? (
              <View>
                <View style={styles.calorieRow}>
                  <View style={styles.calorieBlock}>
                    <Text style={styles.calorieNumber}>
                      {dailyTotals.calories}
                    </Text>
                    <Text style={styles.calorieLabel}>Calories Consumed</Text>
                  </View>
                </View>

                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: `${Math.min(getCalorieProgress(), 100)}%`,
                        backgroundColor: getCalorieProgress() > 100 ? '#f44336' : '#4CAF50'
                      }
                    ]} 
                  />
                </View>

                <Text style={styles.remainingText}>
                  {getRemainingCalories() > 0 
                    ? `${getRemainingCalories()} calories remaining`
                    : `${Math.abs(getRemainingCalories())} calories over goal`}
                </Text>

                {/* Macros */}
                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{dailyTotals.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{dailyTotals.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{dailyTotals.fats}g</Text>
                    <Text style={styles.macroLabel}>Fats</Text>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  onPress={handleViewDay}
                  style={styles.viewButton}
                  labelStyle={styles.viewButtonLabel}
                >
                  View All Meals
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.noMealsText}>
                  No meals logged for this day
                </Text>
                {!calorieGoal && (
                  <View style={styles.noGoalContainer}>
                    <Text style={styles.noGoalText}>
                      No calorie goal set
                    </Text>
                    <Text style={styles.noGoalSubtext}>
                      Set your calorie goal in Profile to track progress
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('Profile')}
                      style={styles.setGoalButton}
                      labelStyle={styles.setGoalButtonLabel}
                    >
                      Set Goal
                    </Button>
                  </View>
                )}
                <Button
                  mode="contained"
                  onPress={handleAddMeal}
                  style={styles.addButton}
                  labelStyle={styles.buttonLabel}
                  icon="plus"
                >
                  Add Meal
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Overview</Title>
            <Text style={styles.statsText}>
              {mealDates.length} days logged
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#ffffff"
        onPress={handleAddMeal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    color: '#333333',
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
  summaryCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  summaryTitle: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingText: {
    color: '#999999',
    fontSize: 14,
  },
  calorieRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  calorieBlock: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  calorieSeparator: {
    fontSize: 16,
    color: '#999999',
    marginHorizontal: 16,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  macroLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  noMealsText: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 16,
  },
  viewButton: {
    borderColor: '#4CAF50',
  },
  viewButtonLabel: {
    color: '#4CAF50',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  buttonLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  statsTitle: {
    color: '#333333',
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
    backgroundColor: '#4CAF50',
  },
  // Goal display styles
  goalContainer: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    alignSelf: 'center',
  },
  goalValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  noGoalContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noGoalText: {
    fontSize: 16,
    color: '#856404',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noGoalSubtext: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 12,
  },
  setGoalButton: {
    borderColor: '#856404',
  },
  setGoalButtonLabel: {
    color: '#856404',
    fontSize: 12,
  },
});

