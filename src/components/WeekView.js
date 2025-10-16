import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Title, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday, 
  isSameDay,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import { getWorkoutDates, getMeals, getCalorieGoal } from '../services/storageService';
import { calculateCalories } from '../utils/unitConversions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_WIDTH = (SCREEN_WIDTH - 32 - 24) / 7; // 7 days with padding and gaps

export default function WeekView({ 
  initialDate = new Date(), 
  type = 'workout', // 'workout', 'nutrition', or 'both'
  onDateSelect,
  showNavigation = true 
}) {
  const [currentWeek, setCurrentWeek] = useState(initialDate);
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(true);
  const [calorieGoal, setCalorieGoal] = useState(null);

  useEffect(() => {
    loadWeekData();
  }, [currentWeek, type]);

  const loadWeekData = async () => {
    try {
      setLoading(true);
      
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      const data = {};
      
      // Load calorie goal for nutrition calculations
      if (type === 'nutrition' || type === 'both') {
        const goal = await getCalorieGoal();
        setCalorieGoal(goal);
      }
      
      // Load workout data
      if (type === 'workout' || type === 'both') {
        const workoutDates = await getWorkoutDates();
        const workoutDatesSet = new Set(workoutDates);
        
        weekDays.forEach(day => {
          const dateString = format(day, 'yyyy-MM-dd');
          data[dateString] = {
            ...data[dateString],
            hasWorkout: workoutDatesSet.has(dateString),
            date: day
          };
        });
      }
      
      // Load nutrition data
      if (type === 'nutrition' || type === 'both') {
        for (const day of weekDays) {
          const dateString = format(day, 'yyyy-MM-dd');
          try {
            const meals = await getMeals(dateString);
            const totalCalories = meals.reduce((sum, meal) => {
              return sum + calculateCalories(meal.protein, meal.carbs, meal.fat);
            }, 0);
            
            const goalHit = calorieGoal ? Math.abs(totalCalories - calorieGoal.finalGoal) <= 100 : false;
            
            data[dateString] = {
              ...data[dateString],
              calories: totalCalories,
              mealCount: meals.length,
              goalHit,
              date: day
            };
          } catch (error) {
            console.error(`Error loading meals for ${dateString}:`, error);
            data[dateString] = {
              ...data[dateString],
              calories: 0,
              mealCount: 0,
              goalHit: false,
              date: day
            };
          }
        }
      }
      
      setWeekData(data);
    } catch (error) {
      console.error('Error loading week data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const getDayIntensity = (dateString) => {
    const dayData = weekData[dateString];
    if (!dayData) return 0;
    
    let intensity = 0;
    
    if (type === 'workout' || type === 'both') {
      if (dayData.hasWorkout) intensity += 1;
    }
    
    if (type === 'nutrition' || type === 'both') {
      if (dayData.goalHit) intensity += 1;
      if (dayData.mealCount > 0) intensity += 0.5;
    }
    
    return Math.min(intensity, 2); // Max intensity of 2
  };

  const getDayColor = (dateString) => {
    const intensity = getDayIntensity(dateString);
    const dayData = weekData[dateString];
    
    if (type === 'workout') {
      if (intensity >= 1) return '#00ff88'; // Green for workout
      return '#2a2a2a'; // Dark for no workout
    }
    
    if (type === 'nutrition') {
      if (dayData?.goalHit) return '#4CAF50'; // Green for goal hit
      if (dayData?.mealCount > 0) return '#FFA726'; // Orange for meals but no goal
      return '#e0e0e0'; // Light gray for no data
    }
    
    // Both types
    if (intensity >= 2) return '#4CAF50'; // Green for both workout and goal hit
    if (intensity >= 1.5) return '#00ff88'; // Light green for workout or goal hit
    if (intensity >= 0.5) return '#FFA726'; // Orange for some activity
    return '#e0e0e0'; // Light gray for no activity
  };

  const getWeekStats = () => {
    const weekDays = eachDayOfInterval({ 
      start: startOfWeek(currentWeek, { weekStartsOn: 1 }), 
      end: endOfWeek(currentWeek, { weekStartsOn: 1 }) 
    });
    
    let totalWorkouts = 0;
    let totalCalories = 0;
    let daysWithMeals = 0;
    let daysGoalHit = 0;
    
    weekDays.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      const dayData = weekData[dateString];
      
      if (dayData) {
        if (dayData.hasWorkout) totalWorkouts++;
        if (dayData.calories) totalCalories += dayData.calories;
        if (dayData.mealCount > 0) daysWithMeals++;
        if (dayData.goalHit) daysGoalHit++;
      }
    });
    
    return {
      totalWorkouts,
      totalCalories,
      daysWithMeals,
      daysGoalHit,
      averageCalories: daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0
    };
  };

  const weekDays = eachDayOfInterval({ 
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }), 
    end: endOfWeek(currentWeek, { weekStartsOn: 1 }) 
  });
  
  const stats = getWeekStats();

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContent}>
          <Text>Loading week data...</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Title style={styles.title}>Week View</Title>
            <Text style={styles.weekRange}>
              {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM dd')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM dd, yyyy')}
            </Text>
          </View>
          
          {showNavigation && (
            <View style={styles.navigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateWeek('prev')}
              >
                <Ionicons name="chevron-back" size={20} color="#2196F3" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.todayButton}
                onPress={goToToday}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateWeek('next')}
              >
                <Ionicons name="chevron-forward" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Week Grid */}
        <View style={styles.weekGrid}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <Text key={index} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>
          
          {/* Day Cells */}
          <View style={styles.dayCells}>
            {weekDays.map((day, index) => {
              const dateString = format(day, 'yyyy-MM-dd');
              const dayData = weekData[dateString];
              const isCurrentDay = isToday(day);
              const dayColor = getDayColor(dateString);
              
              return (
                <TouchableOpacity
                  key={dateString}
                  style={[
                    styles.dayCell,
                    { backgroundColor: dayColor },
                    isCurrentDay && styles.currentDay
                  ]}
                  onPress={() => onDateSelect && onDateSelect(day)}
                >
                  <Text style={[
                    styles.dayNumber,
                    isCurrentDay && styles.currentDayText
                  ]}>
                    {format(day, 'd')}
                  </Text>
                  
                  {/* Activity indicators */}
                  <View style={styles.activityIndicators}>
                    {dayData?.hasWorkout && (
                      <View style={styles.workoutIndicator} />
                    )}
                    {dayData?.goalHit && (
                      <View style={styles.goalIndicator} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Week Statistics */}
        <View style={styles.statsContainer}>
          {type === 'workout' || type === 'both' ? (
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={16} color="#00ff88" />
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          ) : null}
          
          {type === 'nutrition' || type === 'both' ? (
            <>
              <View style={styles.statItem}>
                <Ionicons name="restaurant" size={16} color="#4CAF50" />
                <Text style={styles.statValue}>{stats.daysWithMeals}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="flame" size={16} color="#FFA726" />
                <Text style={styles.statValue}>{stats.daysGoalHit}</Text>
                <Text style={styles.statLabel}>Goals Hit</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="trending-up" size={16} color="#2196F3" />
                <Text style={styles.statValue}>{stats.averageCalories}</Text>
                <Text style={styles.statLabel}>Avg Cal</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend:</Text>
          <View style={styles.legendItems}>
            {type === 'workout' || type === 'both' ? (
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#00ff88' }]} />
                <Text style={styles.legendText}>Workout</Text>
              </View>
            ) : null}
            
            {type === 'nutrition' || type === 'both' ? (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.legendText}>Goal Hit</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FFA726' }]} />
                  <Text style={styles.legendText}>Meals</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderRadius: 12,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  weekRange: {
    fontSize: 14,
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 16,
  },
  todayButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  weekGrid: {
    marginBottom: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    width: DAY_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  dayCells: {
    flexDirection: 'row',
    gap: 4,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  currentDay: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  currentDayText: {
    color: '#2196F3',
  },
  activityIndicators: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    gap: 2,
  },
  workoutIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  goalIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
