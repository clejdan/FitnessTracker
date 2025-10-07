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
  DataTable,
  ActivityIndicator,
} from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { getWorkout, deleteWorkout, updateWorkout, deduplicateWorkouts } from '../../services/storageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  hapticButtonPress, 
  hapticSwipeSuccess, 
  hapticDelete,
  hapticDeleteConfirm,
  hapticCardPress,
  hapticCardExpand,
  hapticDateNavigate,
  hapticFAB,
  hapticError,
  hapticSuccess
} from '../../utils/haptics';
import { useAccessibility, useAccessibilityAnnouncements, useAccessibleList } from '../../hooks/useAccessibility';
import { AccessibilityManager } from '../../utils/accessibility';
import { MicroInteractions, AnimationUtils } from '../../utils/animations';
import ScreenTransition from '../../components/ScreenTransition';

export default function WorkoutDayScreen({ route, navigation }) {
  const { date } = route.params;
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  // Accessibility hooks
  const { isScreenReaderEnabled, announce } = useAccessibility();
  const { announceExerciseDeleted, announceDateChanged } = useAccessibilityAnnouncements();
  const { 
    getListAccessibilityProps, 
    getItemAccessibilityProps,
    announceItemRemoved 
  } = useAccessibleList(workout?.exercises || [], 'Workout exercises');

  useFocusEffect(
    React.useCallback(() => {
      loadWorkoutData();
      // Reset animations when screen comes into focus
      slideAnim.setValue(0);
      fadeAnim.setValue(1);
    }, [date])
  );

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      await deduplicateWorkouts(); // Added deduplication
      const workoutData = await getWorkout(date);
      if (workoutData && workoutData.length > 0) {
        const allExercises = workoutData.flatMap(w => w.exercises || []);
        const mergedWorkout = {
          ...workoutData[0],
          exercises: allExercises,
        };
        setWorkout(mergedWorkout);
      } else {
        setWorkout(null);
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      showErrorToast('Failed to load workout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFormattedDate = () => {
    try {
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0);
      return format(localDate, 'EEEE, MMMM d, yyyy');
    } catch {
      return date;
    }
  };

  const isToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return date === today;
  };

  const handleAddWorkout = () => {
    navigation.navigate('AddWorkout', { date });
  };

  const navigateToPreviousDay = () => {
    hapticDateNavigate();
    // Parse date in local timezone to avoid UTC offset issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
    const previousDate = format(subDays(localDate, 1), 'yyyy-MM-dd');
    
    if (isScreenReaderEnabled) {
      announceDateChanged(previousDate);
    }
    
    // Animate transition
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.push('WorkoutDay', { date: previousDate });
    });
  };

  const navigateToNextDay = () => {
    hapticDateNavigate();
    // Parse date in local timezone to avoid UTC offset issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
    const nextDate = format(addDays(localDate, 1), 'yyyy-MM-dd');
    
    if (isScreenReaderEnabled) {
      announceDateChanged(nextDate);
    }
    
    // Animate transition
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.push('WorkoutDay', { date: nextDate });
    });
  };

  const navigateToToday = () => {
    hapticDateNavigate();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (isScreenReaderEnabled) {
      announceDateChanged('today');
    }
    
    // Animate transition
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.push('WorkoutDay', { date: today });
    });
  };

  const toggleExercise = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      hapticDeleteConfirm(); // Added haptic feedback
      if (workout) {
        const updatedExercises = workout.exercises.filter(ex => ex.exerciseId !== exerciseId);
        if (updatedExercises.length === 0) {
          await deleteWorkout(date, workout.id);
          setWorkout(null);
          hapticSuccess(); // Added haptic feedback
          // No toast - swipe action is self-explanatory
        } else {
          const updatedWorkout = { ...workout, exercises: updatedExercises, updatedAt: new Date().toISOString() };
          await updateWorkout(date, workout.id, updatedWorkout);
          setWorkout(updatedWorkout);
          hapticSuccess(); // Added haptic feedback
          // No toast - swipe action is self-explanatory
        }
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      hapticError(); // Added haptic feedback
      showErrorToast('Failed to delete exercise. Please try again.');
    }
  };

  const renderRightActions = (progress, dragX, exerciseId) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    const scale = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1.1, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.8, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteExercise(exerciseId)}
        {...AccessibilityManager.getButtonProps(
          'Delete exercise',
          'Double tap to delete this exercise'
        )}
      >
        <Animated.View
          style={[
            styles.deleteActionContent,
            {
              transform: [{ translateX: trans }, { scale }],
              opacity,
            },
          ]}
        >
          <Ionicons name="trash" size={28} color="#ffffff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderExerciseCard = (exercise) => {
    const isExpanded = expandedExercises[exercise.exerciseId];
    const totalSets = exercise.sets?.length || 0;

    return (
      <Swipeable
        key={exercise.exerciseId}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, exercise.exerciseId)
        }
        overshootRight={false}
        friction={2}
      >
        <Card style={styles.exerciseCard}>
          <TouchableOpacity onPress={() => {
            hapticCardPress();
            toggleExercise(exercise.exerciseId);
          }}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.setsCount}>{totalSets} sets</Text>
              </View>
              <View style={styles.exerciseActions}>
                <IconButton
                  icon={isExpanded ? "chevron-up" : "chevron-down"}
                  iconColor="#00ff88"
                  size={24}
                  onPress={() => {
                    hapticCardExpand();
                    toggleExercise(exercise.exerciseId);
                  }}
                />
              </View>
            </View>
            
            {isExpanded && (
              <View style={styles.setsContainer}>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Set</DataTable.Title>
                    <DataTable.Title>Reps</DataTable.Title>
                    <DataTable.Title>RIR</DataTable.Title>
                    <DataTable.Title>Weight</DataTable.Title>
                  </DataTable.Header>
                  {exercise.sets.map((set, setIndex) => (
                    <DataTable.Row key={setIndex}>
                      <DataTable.Cell>{set.setNumber}</DataTable.Cell>
                      <DataTable.Cell>{set.reps}</DataTable.Cell>
                      <DataTable.Cell>{set.rir}</DataTable.Cell>
                      <DataTable.Cell>
                        {set.weight ? `${set.weight} ${set.weightUnit || 'lbs'}` : '-'}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </View>
            )}
          </TouchableOpacity>
        </Card>
      </Swipeable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Workout Logged</Text>
      <Text style={styles.emptySubtitle}>
        Start your fitness journey by adding your first exercise!
      </Text>
      <Button
        mode="contained"
        onPress={handleAddWorkout}
        style={styles.emptyButton}
        labelStyle={styles.emptyButtonLabel}
        icon="plus"
      >
        Add Workout
      </Button>
    </View>
  );

  if (loading) {
    return (
      <ScreenTransition isVisible={true} transitionType="slideFromRight">
        <LoadingSpinner 
          message="Loading workout..." 
          fullScreen={true}
          theme="dark"
          color="#00ff88"
        />
      </ScreenTransition>
    );
  }

  return (
    <ScreenTransition isVisible={true} transitionType="slideFromRight">
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.dateNavigationContainer}>
              <IconButton
                icon="chevron-left"
                iconColor="#00ff88"
                size={24}
                onPress={navigateToPreviousDay}
                style={styles.dateNavButton}
              />
              <View style={styles.dateTitleContainer}>
                <Title style={styles.dateTitle}>{getFormattedDate()}</Title>
                {!isToday() && (
                  <Button
                    mode="text"
                    onPress={navigateToToday}
                    style={styles.todayButton}
                    labelStyle={styles.todayButtonLabel}
                    compact
                  >
                    Today
                  </Button>
                )}
              </View>
              <IconButton
                icon="chevron-right"
                iconColor="#00ff88"
                size={24}
                onPress={navigateToNextDay}
                style={styles.dateNavButton}
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          {...getListAccessibilityProps()}
        >
          {!workout || !workout.exercises || workout.exercises.length === 0 ? (
            renderEmptyState()
          ) : (
            <View>
              <Text 
                style={styles.sectionTitle}
                {...AccessibilityManager.getHeaderProps(
                  `Exercises (${workout.exercises.length})`,
                  2
                )}
              >
                Exercises ({workout.exercises.length})
              </Text>
              {workout.exercises.map((exercise, index) => renderExerciseCard(exercise, index))}
            </View>
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            hapticFAB();
            handleAddWorkout();
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
            <Dialog.Title style={styles.dialogTitle}>Delete Exercise</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Are you sure you want to delete this exercise? This action cannot be undone.
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialogVisible(false)}>
                Cancel
              </Button>
              <Button onPress={confirmDelete} textColor="#ff5252">
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Animated.View>
    </ScreenTransition>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#1a1a1a',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateNavButton: {
    margin: 0,
  },
  dateTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  todayButton: {
    marginTop: 4,
  },
  todayButtonLabel: {
    color: '#00ff88',
    fontSize: 12,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exerciseCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 12,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  setsCount: {
    color: '#00ff88',
    fontSize: 14,
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#00ff88',
    elevation: 6,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  emptyButtonLabel: {
    color: '#000000',
    fontWeight: 'bold',
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
  // Delete dialog styles
  dialogTitle: {
    color: '#ffffff',
  },
  dialogText: {
    color: '#cccccc',
  },
  // Swipe delete styles
  deleteAction: {
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    marginVertical: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
