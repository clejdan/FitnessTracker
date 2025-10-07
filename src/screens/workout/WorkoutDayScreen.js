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
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { getWorkout, deleteWorkout, updateWorkout } from '../../services/storageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function WorkoutDayScreen({ route, navigation }) {
  const { date } = route.params;
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      loadWorkoutData();
    }, [date])
  );

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      const workoutData = await getWorkout(date);
      // getWorkout returns an array, but we need a single workout object with all exercises
      if (workoutData && workoutData.length > 0) {
        // Merge all exercises from multiple workouts into one
        const allExercises = workoutData.flatMap(w => w.exercises || []);
        const mergedWorkout = {
          ...workoutData[0],
          exercises: allExercises,
        };
        setWorkout(mergedWorkout);
        console.log('Loaded workout for', date, ':', mergedWorkout);
      } else {
        setWorkout(null);
        console.log('No workout found for', date);
      }
    } catch (error) {
      console.error('Error loading workout:', error);
      showErrorToast('Failed to load workout data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleAddWorkout = () => {
    navigation.navigate('AddWorkout', { date });
  };

  const navigateToPreviousDay = () => {
    // Parse date in local timezone to avoid UTC offset issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
    const previousDate = format(subDays(localDate, 1), 'yyyy-MM-dd');
    navigation.push('WorkoutDay', { date: previousDate });
  };

  const navigateToNextDay = () => {
    // Parse date in local timezone to avoid UTC offset issues
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day, 12, 0, 0);
    const nextDate = format(addDays(localDate, 1), 'yyyy-MM-dd');
    navigation.push('WorkoutDay', { date: nextDate });
  };

  const navigateToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (today !== date) {
      navigation.push('WorkoutDay', { date: today });
    }
  };

  const isToday = () => {
    return date === format(new Date(), 'yyyy-MM-dd');
  };

  const handleEditWorkout = () => {
    navigation.navigate('AddWorkout', { 
      date, 
      editMode: true, 
      workoutData: workout 
    });
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      if (workout) {
        // Filter out the exercise to delete
        const updatedExercises = workout.exercises.filter(
          ex => ex.exerciseId !== exerciseId
        );

        if (updatedExercises.length === 0) {
          // If no exercises left, delete the entire workout
          await deleteWorkout(date, workout.id);
          setWorkout(null);
          showSuccessToast('Workout deleted successfully');
        } else {
          // Otherwise update the workout with remaining exercises
          const updatedWorkout = {
            ...workout,
            exercises: updatedExercises,
            updatedAt: new Date().toISOString(),
          };
          
          await updateWorkout(date, workout.id, updatedWorkout);
          setWorkout(updatedWorkout);
          showSuccessToast('Exercise deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      showErrorToast('Failed to delete exercise. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      if (exerciseToDelete && workout) {
        await handleDeleteExercise(exerciseToDelete);
      }
    } finally {
      setDeleteDialogVisible(false);
      setExerciseToDelete(null);
    }
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this entire workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(date, workout.id);
              showSuccessToast('Workout deleted successfully', () => navigation.goBack());
            } catch (error) {
              console.error('Error deleting workout:', error);
              showErrorToast('Failed to delete workout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getFormattedDate = () => {
    try {
      // Parse date in local timezone to avoid UTC offset issues
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day, 12, 0, 0);
      return format(localDate, 'EEEE, MMMM d, yyyy');
    } catch {
      return date;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="barbell-outline" size={80} color="#555555" />
      <Text style={styles.emptyTitle}>No workouts logged</Text>
      <Text style={styles.emptyText}>
        No workouts recorded for this day
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

  const renderRightActions = (progress, dragX, exerciseId) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteExercise(exerciseId)}
      >
        <Animated.View
          style={[
            styles.deleteActionContent,
            {
              transform: [{ translateX: trans }],
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
          <TouchableOpacity onPress={() => toggleExercise(exercise.exerciseId)}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.setsCount}>{totalSets} sets</Text>
              </View>
              <View style={styles.exerciseActions}>
                <IconButton
                  icon="chevron-down"
                  iconColor="#00ff88"
                  size={24}
                  style={{
                    transform: [{ rotate: isExpanded ? '180deg' : '0deg' }]
                  }}
                  onPress={() => toggleExercise(exercise.exerciseId)}
                />
              </View>
            </View>
          </TouchableOpacity>

        {isExpanded && (
          <Card.Content style={styles.exerciseContent}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.setColumn}>
                  <Text style={styles.tableHeaderText}>Set</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.repsColumn}>
                  <Text style={styles.tableHeaderText}>Reps</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.rirColumn}>
                  <Text style={styles.tableHeaderText}>RIR</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.weightColumn}>
                  <Text style={styles.tableHeaderText}>Weight</Text>
                </DataTable.Title>
              </DataTable.Header>

              {exercise.sets?.map((set, index) => (
                <DataTable.Row key={index} style={styles.tableRow}>
                  <DataTable.Cell style={styles.setColumn}>
                    <Text style={styles.tableText}>{set.setNumber}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.repsColumn}>
                    <Text style={styles.tableText}>{set.reps}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.rirColumn}>
                    <Text style={styles.tableText}>{set.rir}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.weightColumn}>
                    <Text style={styles.tableText}>
                      {set.weight ? `${set.weight} lbs` : '-'}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        )}
        </Card>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner 
          message="Loading workout..." 
          fullScreen={true}
          theme="dark"
          color="#00ff88"
        />
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
            iconColor="#ffffff"
            size={28}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
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
                <TouchableOpacity onPress={navigateToToday} style={styles.todayButton}>
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
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
        {workout && (
          <View style={styles.headerActions}>
            <Button
              mode="outlined"
              onPress={handleEditWorkout}
              style={styles.editButton}
              labelStyle={styles.editButtonLabel}
              icon="pencil"
              compact
            >
              Edit
            </Button>
            <Button
              mode="outlined"
              onPress={handleDeleteWorkout}
              style={styles.deleteButton}
              labelStyle={styles.deleteButtonLabel}
              icon="trash-can-outline"
              compact
            >
              Delete
            </Button>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!workout || !workout.exercises || workout.exercises.length === 0 ? (
          renderEmptyState()
        ) : (
          <View>
            <Text style={styles.sectionTitle}>
              Exercises ({workout.exercises.length})
            </Text>
            {workout.exercises.map(exercise => renderExerciseCard(exercise))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        color="#1a1a1a"
        onPress={handleAddWorkout}
        label={workout ? "Add Exercise" : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Delete Exercise</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Are you sure you want to delete this exercise?
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
    </View>
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
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    margin: 0,
    marginLeft: -8,
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#00ff88',
    borderRadius: 12,
  },
  todayButtonText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    borderColor: '#00ff88',
    flex: 1,
  },
  editButtonLabel: {
    color: '#00ff88',
    fontSize: 12,
  },
  deleteButton: {
    borderColor: '#ff5252',
    flex: 1,
  },
  deleteButtonLabel: {
    color: '#ff5252',
    fontSize: 12,
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
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 12,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#999999',
    fontSize: 14,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseContent: {
    paddingTop: 0,
  },
  tableHeader: {
    backgroundColor: '#1a1a1a',
  },
  tableHeaderText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tableText: {
    color: '#ffffff',
    fontSize: 14,
  },
  setColumn: {
    flex: 1,
  },
  repsColumn: {
    flex: 1,
  },
  rirColumn: {
    flex: 1,
  },
  weightColumn: {
    flex: 1.5,
  },
  exerciseButtonsContainer: {
    marginTop: 16,
  },
  deleteExerciseButton: {
    borderColor: '#ff5252',
  },
  deleteExerciseButtonLabel: {
    color: '#ff5252',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#00ff88',
  },
  emptyButtonLabel: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#00ff88',
  },
  dialog: {
    backgroundColor: '#2a2a2a',
  },
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
    alignItems: 'flex-end',
    paddingRight: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  deleteActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
