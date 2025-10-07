import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  Card,
  Title,
  ActivityIndicator,
  HelperText,
  Chip,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import uuid from 'react-native-uuid';
import { saveWorkout, updateWorkout } from '../../services/storageService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { 
  hapticButtonPress, 
  hapticPickerChange, 
  hapticFormSubmit, 
  hapticButton,
  hapticInput,
  hapticValidation,
  hapticSuccess,
  hapticError
} from '../../utils/haptics';
import { useFormValidation, ValidationRules } from '../../utils/formValidation';
import { WorkoutDefaults, FormPersistence, ExerciseSuggestions } from '../../utils/smartDefaults';

export default function AddWorkoutScreen({ route, navigation }) {
  const { date, editMode = false, workoutData = null } = route?.params || {};

  // Validate required date parameter
  if (!date) {
    Alert.alert('Error', 'Date is required', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Missing date parameter</Text>
        </View>
      </View>
    );
  }

  // Form state
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([{ setNumber: 1, reps: 1, rep: 2, weight: '' }]);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [saving, setSaving] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (editMode && workoutData && workoutData.exercises && workoutData.exercises.length > 0) {
      // Pre-populate form with first exercise
      const exercise = workoutData.exercises[0];
      setExerciseName(exercise.name || '');
      setSets(exercise.sets?.map(set => ({
        setNumber: set.setNumber,
        reps: set.reps || 10,
        rir: set.rir || 2,
        weight: set.weight?.toString() || '',
      })) || [{ setNumber: 1, reps: 1, rir: 2, weight: '' }]);
    }
  }, [editMode, workoutData]);

  const addSet = () => {
    const newSetNumber = sets.length + 1;
    setSets([...sets, { 
      setNumber: newSetNumber, 
      reps: 10, 
      rir: 2, 
      weight: '' 
    }]);
  };

  const removeSet = (setIndex) => {
    if (sets.length > 1) {
      const newSets = sets.filter((_, i) => i !== setIndex);
      // Renumber sets
      newSets.forEach((set, i) => {
        set.setNumber = i + 1;
      });
      setSets(newSets);
    }
  };

  const updateSet = (setIndex, field, value) => {
    const newSets = [...sets];
    newSets[setIndex][field] = value;
    setSets(newSets);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate exercise name
    if (!exerciseName.trim()) {
      newErrors.exerciseName = 'Exercise name is required';
    }

    // Validate sets
    sets.forEach((set, setIndex) => {
      // Weight validation (optional, but if provided must be valid)
      if (set.weight && (isNaN(parseFloat(set.weight)) || parseFloat(set.weight) < 0)) {
        newErrors[`set${setIndex}_weight`] = 'Weight must be a valid number';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showErrorToast('Please fill in the exercise name');
      return;
    }

    setSaving(true);

    try {
      const exercise = {
        exerciseId: uuid.v4(),
        name: exerciseName.trim(),
        sets: sets.map(set => ({
          setNumber: set.setNumber,
          reps: set.reps,
          rir: set.rir,
          weight: set.weight ? parseFloat(set.weight) : undefined,
        })),
      };

      const workout = {
        id: editMode && workoutData?.id ? workoutData.id : uuid.v4(),
        date: date,
        exercises: [exercise],
        createdAt: editMode && workoutData?.createdAt 
          ? workoutData.createdAt 
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editMode && workoutData?.id) {
        await updateWorkout(date, workoutData.id, workout);
        console.log('Workout updated:', workout);
        showSuccessToast(`${exerciseName} updated successfully!`, () => {
          navigation.goBack();
        });
      } else {
        await saveWorkout(date, workout);
        console.log('Workout saved:', workout);
        showSuccessToast(`${exerciseName} saved successfully!`, () => {
          navigation.goBack();
        });
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      showErrorToast('Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    hapticButton();
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>
          {editMode ? 'Edit Workout' : 'Add Workout'}
        </Title>
        <Text style={styles.headerSubtitle}>{date}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise Name */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Exercise</Text>
            <TextInput
              mode="outlined"
              label="Exercise Name"
              value={exerciseName}
                        onChangeText={(text) => {
                          hapticInput();
                          setExerciseName(text);
                        }}
              placeholder="e.g., Bench Press, Squat, Deadlift"
              style={styles.input}
              outlineColor="#555555"
              activeOutlineColor="#00ff88"
              textColor="#ffffff"
              placeholderTextColor="#999999"
              error={errors.exerciseName}
            />
            {errors.exerciseName && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {errors.exerciseName}
              </HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Sets Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.setsHeader}>
              <Text style={styles.sectionTitle}>Sets</Text>
              <Button
                mode="contained"
                onPress={() => {
                  hapticButtonPress();
                  addSet();
                }}
                style={styles.addSetButton}
                labelStyle={styles.addSetButtonLabel}
                icon="plus"
                compact
              >
                Add Set
              </Button>
            </View>

            {/* Set Rows */}
            {sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <View style={styles.setRowHeader}>
                  <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                  {sets.length > 1 && (
                    <IconButton
                      icon="close"
                      iconColor="#ff5252"
                      size={20}
                      onPress={() => {
                  hapticButtonPress();
                  removeSet(index);
                }}
                      style={styles.removeSetButton}
                    />
                  )}
                </View>

                <View style={styles.setInputsRow}>
                  {/* Reps Picker */}
                  <View style={styles.pickerGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TouchableOpacity 
                      activeOpacity={1}
                      style={styles.pickerContainerEnhanced}
                    >
                      <Picker
                        selectedValue={set.reps}
                        onValueChange={(value) => {
                          hapticPickerChange();
                          updateSet(index, 'reps', value);
                        }}
                        style={styles.pickerEnhanced}
                        itemStyle={styles.pickerItemEnhanced}
                        dropdownIconColor="#00ff88"
                      >
                        {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                          <Picker.Item 
                            key={num} 
                            label={num.toString()} 
                            value={num}
                            color="#ffffff"
                          />
                        ))}
                      </Picker>
                    </TouchableOpacity>
                  </View>

                  {/* RIR Picker */}
                  <View style={styles.pickerGroup}>
                    <Text style={styles.inputLabel}>RIR</Text>
                    <TouchableOpacity 
                      activeOpacity={1}
                      style={styles.pickerContainerEnhanced}
                    >
                      <Picker
                        selectedValue={set.rir}
                        onValueChange={(value) => {
                          hapticPickerChange();
                          updateSet(index, 'rir', value);
                        }}
                        style={styles.pickerEnhanced}
                        itemStyle={styles.pickerItemEnhanced}
                        dropdownIconColor="#00ff88"
                      >
                        {Array.from({ length: 16 }, (_, i) => i).map(num => (
                          <Picker.Item 
                            key={num} 
                            label={num.toString()} 
                            value={num}
                            color="#ffffff"
                          />
                        ))}
                      </Picker>
                    </TouchableOpacity>
                  </View>

                  {/* Weight Input with Unit Toggle */}
                  <View style={styles.weightGroup}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <View style={styles.weightInputContainer}>
                      <RNTextInput
                        value={set.weight}
                        onChangeText={(value) => {
                          hapticInput();
                          updateSet(index, 'weight', value);
                        }}
                        keyboardType="decimal-pad"
                        placeholder={`Weight (${weightUnit})`}
                        style={styles.weightInput}
                        placeholderTextColor="#999999"
                      />
                      <View style={styles.unitToggle}>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            styles.unitButtonLeft,
                            weightUnit === 'lbs' && styles.unitButtonActive
                          ]}
                          onPress={() => {
                            hapticButtonPress();
                            setWeightUnit('lbs');
                          }}
                        >
                          <Text style={[
                            styles.unitButtonText,
                            weightUnit === 'lbs' && styles.unitButtonTextActive
                          ]}>
                            lbs
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.unitButton,
                            styles.unitButtonRight,
                            weightUnit === 'kg' && styles.unitButtonActive
                          ]}
                          onPress={() => {
                            hapticButtonPress();
                            setWeightUnit('kg');
                          }}
                        >
                          <Text style={[
                            styles.unitButtonText,
                            weightUnit === 'kg' && styles.unitButtonTextActive
                          ]}>
                            kg
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text style={styles.instructionsTitle}>💡 Tips</Text>
            <Text style={styles.instructionsText}>
              • RIR = Reps In Reserve (0-15 range)
            </Text>
            <Text style={styles.instructionsText}>
              • Weight is optional but useful for tracking progress
            </Text>
            <Text style={styles.instructionsText}>
              • Use wheel pickers to quickly select reps and RIR
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <Button
          mode="outlined"
          onPress={() => {
            hapticButton();
            handleCancel();
          }}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            hapticButtonPress();
            handleSave();
          }}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          loading={saving}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Workout'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#999999',
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  tabCloseButton: {
    margin: 0,
    marginLeft: 4,
  },
  tabInput: {
    backgroundColor: '#2a2a2a',
    fontSize: 14,
    padding: 0,
    margin: 0,
    height: 24,
  },
  addTabButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  addTabIcon: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addSetButton: {
    backgroundColor: '#00ff88',
    elevation: 4,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addSetButtonLabel: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setRow: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  setRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setNumber: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeSetButton: {
    margin: 0,
  },
  setInputsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  pickerGroup: {
    flex: 0,
    alignItems: 'center',
    width: 120,
  },
  inputLabel: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    overflow: 'hidden',
    width: '100%',
    height: 50,
  },
  picker: {
    color: '#ffffff',
    height: 60,
  },
  pickerItem: {
    color: '#ffffff',
    fontSize: 16,
    height: 110,
  },
  // Enhanced picker styles for better UX
  pickerContainerEnhanced: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ff88',
    overflow: 'visible',
    width: 120,
    height: 170,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    paddingHorizontal: 12,
  },
  pickerEnhanced: {
    color: '#ffffff',
    height: 150,
    width: '100%',
    backgroundColor: 'transparent',
  },
  pickerItemEnhanced: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    height: 150,
    textAlign: 'center',
    width: '100%',
  },
  unitSubtext: {
    color: '#999999',
    fontSize: 10,
    marginTop: 2,
  },
  weightGroup: {
    flex: 1,
    minWidth: 120,
  },
  weightInputContainer: {
    gap: 2,
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: '#2a2a2a',
    fontSize: 14,
    height: 24,
    textAlign: 'center',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555555',
    marginTop: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 2,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
  },
  unitButtonLeft: {
    borderRightWidth: 0.5,
    borderRightColor: '#555555',
  },
  unitButtonRight: {
    borderLeftWidth: 0.5,
    borderLeftColor: '#555555',
  },
  unitButtonActive: {
    backgroundColor: '#00ff88',
  },
  unitButtonText: {
    color: '#999999',
    fontSize: 12,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  instructionsCard: {
    backgroundColor: '#2a2a2a',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#00ff88',
  },
  instructionsTitle: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#999999',
  },
  cancelButtonLabel: {
    color: '#999999',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#00ff88',
    elevation: 6,
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  saveButtonLabel: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
});
