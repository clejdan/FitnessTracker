import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  IconButton,
  FAB,
  Portal,
  Dialog,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { getMeals, deleteMeal, getDailyTotals, getCalorieGoal } from '../../services/storageService';

export default function NutritionDayScreen({ route, navigation }) {
  const { date } = route.params;
  const [meals, setMeals] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadNutritionData();
  }, [date]);

  useEffect(() => {
    // Animate progress bar when totals change
    if (calorieGoal && calorieGoal.finalGoal) {
      const progress = Math.min((dailyTotals.calories / calorieGoal.finalGoal) * 100, 100);
      Animated.spring(progressAnim, {
        toValue: progress,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [dailyTotals.calories, calorieGoal]);

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const [mealsData, totals, goal] = await Promise.all([
        getMeals(date),
        getDailyTotals(date),
        getCalorieGoal(),
      ]);
      
      setMeals(mealsData || []);
      setDailyTotals(totals || { calories: 0, protein: 0, carbs: 0, fats: 0 });
      setCalorieGoal(goal);
      
      console.log('Loaded nutrition for', date, ':', { mealsData, totals, goal });
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    navigation.navigate('AddMeal', { date });
  };

  const handleEditMeal = (meal) => {
    navigation.navigate('AddMeal', {
      date,
      editMode: true,
      mealData: meal,
    });
  };

  const handleDeleteMeal = (meal) => {
    setMealToDelete(meal);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    try {
      if (mealToDelete) {
        await deleteMeal(date, mealToDelete.id);
        await loadNutritionData(); // Refresh data
        setDeleteDialogVisible(false);
        setMealToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal');
    }
  };

  const getFormattedDate = () => {
    try {
      return format(parseISO(date), 'EEEE, MMMM d, yyyy');
    } catch {
      return date;
    }
  };

  const getCalorieProgress = () => {
    if (!calorieGoal || !calorieGoal.finalGoal) return 0;
    return (dailyTotals.calories / calorieGoal.finalGoal) * 100;
  };

  const getRemainingCalories = () => {
    if (!calorieGoal || !calorieGoal.finalGoal) return 0;
    return calorieGoal.finalGoal - dailyTotals.calories;
  };

  const getProgressColor = () => {
    const remaining = getRemainingCalories();
    if (Math.abs(remaining) <= 50) return '#2196F3'; // Blue - at target
    if (remaining > 0) return '#4CAF50'; // Green - under goal
    return '#FF5252'; // Red - over goal
  };

  const getProgressMessage = () => {
    const remaining = getRemainingCalories();
    if (Math.abs(remaining) <= 50) return 'Right on target!';
    if (remaining > 0) return `You have ${Math.round(remaining)} calories remaining`;
    return `${Math.round(Math.abs(remaining))} calories over goal`;
  };

  const renderCalorieProgress = () => {
    if (!calorieGoal || !calorieGoal.finalGoal) {
      return (
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.noGoalContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
              <Text style={styles.noGoalText}>No calorie goal set</Text>
              <Text style={styles.noGoalSubtext}>
                Set your calorie goal in Profile to track progress
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Profile')}
                style={styles.setGoalButton}
                labelStyle={styles.setGoalButtonLabel}
              >
                Set Calorie Goal
              </Button>
            </View>
          </Card.Content>
        </Card>
      );
    }

    const progress = getCalorieProgress();
    const remaining = getRemainingCalories();
    const isOver = remaining < 0;
    const mainProgress = Math.min(progress, 100);
    const overProgress = Math.max(progress - 100, 0);

    return (
      <Card style={styles.progressCard}>
        <Card.Content>
          <Title style={styles.progressTitle}>Today's Progress</Title>

          <View style={styles.progressRow}>
            {/* Progress Bar Container */}
            <View style={styles.progressBarSection}>
              {/* Main Progress Bar (0-100%) */}
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: isOver ? '#2196F3' : getProgressColor(),
                    },
                  ]}
                />
              </View>

              {/* Overshoot Bar (only shows when over 100%) */}
              {isOver && (
                <View style={styles.overshootBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(overProgress, 100)}%`,
                        backgroundColor: '#FF5252',
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            {/* Numbers Display */}
            <View style={styles.numbersSection}>
              <Text style={styles.caloriesConsumed}>
                {dailyTotals.calories}
              </Text>
              <Text style={styles.caloriesSeparator}>/</Text>
              <Text style={styles.caloriesGoal}>
                {calorieGoal.finalGoal}
              </Text>
              <Text style={styles.caloriesUnit}>kcal</Text>
            </View>
          </View>

          {/* Status Message */}
          <View style={[styles.statusContainer, { backgroundColor: `${getProgressColor()}15` }]}>
            <Text style={[styles.statusMessage, { color: getProgressColor() }]}>
              {getProgressMessage()}
            </Text>
          </View>

          {/* Detailed Numbers */}
          {isOver && (
            <Text style={styles.overDetails}>
              Goal: {calorieGoal.finalGoal} | Consumed: {dailyTotals.calories} (
              <Text style={styles.overText}>+{Math.round(Math.abs(remaining))}</Text> over)
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderMacroSummary = () => (
    <View style={styles.macroContainer}>
      <Card style={styles.macroCard}>
        <Card.Content style={styles.macroCardContent}>
          <Ionicons name="fitness-outline" size={24} color="#FF6B6B" />
          <Text style={styles.macroValue}>{dailyTotals.protein}g</Text>
          <Text style={styles.macroLabel}>Protein</Text>
        </Card.Content>
      </Card>

      <Card style={styles.macroCard}>
        <Card.Content style={styles.macroCardContent}>
          <Ionicons name="nutrition-outline" size={24} color="#4ECDC4" />
          <Text style={styles.macroValue}>{dailyTotals.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbs</Text>
        </Card.Content>
      </Card>

      <Card style={styles.macroCard}>
        <Card.Content style={styles.macroCardContent}>
          <Ionicons name="water-outline" size={24} color="#FFE66D" />
          <Text style={styles.macroValue}>{dailyTotals.fats}g</Text>
          <Text style={styles.macroLabel}>Fats</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderMealCard = (meal) => (
    <Card key={meal.id} style={styles.mealCard}>
      <Card.Content>
        <View style={styles.mealHeader}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{meal.mealName}</Text>
            {meal.time && (
              <Text style={styles.mealTime}>
                <Ionicons name="time-outline" size={14} color="#999" /> {meal.time}
              </Text>
            )}
          </View>
          <View style={styles.mealActions}>
            <IconButton
              icon="pencil"
              iconColor="#4CAF50"
              size={20}
              onPress={() => handleEditMeal(meal)}
              style={styles.actionButton}
            />
            <IconButton
              icon="trash-can-outline"
              iconColor="#FF5252"
              size={20}
              onPress={() => handleDeleteMeal(meal)}
              style={styles.actionButton}
            />
          </View>
        </View>

        <View style={styles.mealDetails}>
          <View style={styles.macroRow}>
            <Text style={styles.macroText}>
              P: <Text style={styles.macroValueInline}>{meal.protein?.value || 0}g</Text>
            </Text>
            <Text style={styles.macroDivider}>|</Text>
            <Text style={styles.macroText}>
              C: <Text style={styles.macroValueInline}>{meal.carbs?.value || 0}g</Text>
            </Text>
            <Text style={styles.macroDivider}>|</Text>
            <Text style={styles.macroText}>
              F: <Text style={styles.macroValueInline}>{meal.fats?.value || 0}g</Text>
            </Text>
          </View>
          <View style={styles.caloriesBadge}>
            <Text style={styles.caloriesBadgeText}>{meal.calories} kcal</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={80} color="#cccccc" />
      <Text style={styles.emptyTitle}>No meals logged</Text>
      <Text style={styles.emptyText}>
        No meals recorded for this day
      </Text>
      <Button
        mode="contained"
        onPress={handleAddMeal}
        style={styles.emptyButton}
        labelStyle={styles.emptyButtonLabel}
        icon="plus"
      >
        Add Meal
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading nutrition data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-left"
            iconColor="#333333"
            size={28}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Title style={styles.dateTitle}>{getFormattedDate()}</Title>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calorie Progress Section */}
        {renderCalorieProgress()}

        {/* Macro Summary */}
        {meals.length > 0 && renderMacroSummary()}

        {/* Meals Section */}
        {meals.length > 0 ? (
          <View style={styles.mealsSection}>
            <Text style={styles.sectionTitle}>Meals ({meals.length})</Text>
            {meals.map(meal => renderMealCard(meal))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#ffffff"
        onPress={handleAddMeal}
        label={meals.length > 0 ? "Add Meal" : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Delete Meal</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this meal?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={confirmDelete} textColor="#FF5252">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    margin: 0,
    marginLeft: -8,
  },
  dateTitle: {
    color: '#333333',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#999999',
    fontSize: 14,
    marginTop: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    elevation: 8,
    borderRadius: 12,
  },
  progressTitle: {
    color: '#333333',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressRow: {
    marginBottom: 16,
  },
  progressBarSection: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 12,
  },
  overshootBarBackground: {
    height: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  numbersSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  caloriesConsumed: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333333',
  },
  caloriesSeparator: {
    fontSize: 32,
    color: '#999999',
    marginHorizontal: 8,
  },
  caloriesGoal: {
    fontSize: 32,
    color: '#999999',
  },
  caloriesUnit: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 8,
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  overDetails: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  overText: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  noGoalContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noGoalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  noGoalSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  setGoalButton: {
    marginTop: 16,
    backgroundColor: '#FF9800',
  },
  setGoalButtonLabel: {
    color: '#ffffff',
  },
  macroContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  macroCardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  macroLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  mealsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 12,
    color: '#999999',
  },
  mealActions: {
    flexDirection: 'row',
    marginTop: -8,
  },
  actionButton: {
    margin: 0,
  },
  mealDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroText: {
    fontSize: 14,
    color: '#666666',
  },
  macroValueInline: {
    fontWeight: 'bold',
    color: '#333333',
  },
  macroDivider: {
    marginHorizontal: 12,
    color: '#cccccc',
  },
  caloriesBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  caloriesBadgeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
  },
  emptyButtonLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  dialog: {
    backgroundColor: '#ffffff',
  },
});
