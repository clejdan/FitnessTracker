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
import { useAccessibility, useAccessibilityAnnouncements, useAccessibleForm } from '../../hooks/useAccessibility';
import { AccessibilityManager, AccessibilityPatterns } from '../../utils/accessibility';

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

  // Form state with smart defaults
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([{ setNumber: 1, reps: 1, rir: 2, weight: '' }]);
  const [weightUnit, setWeightUnit] = useState('lbs');
  const [exerciseSuggestions, setExerciseSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);

  // Enhanced validation with real-time feedback
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldValidations, setFieldValidations] = useState({});

  // Accessibility hooks
  const { isScreenReaderEnabled, announce } = useAccessibility();
  const { announceWorkoutSaved, announceFormError } = useAccessibilityAnnouncements();
  const { 
    getFieldAccessibilityProps, 
    setFieldError, 
    clearFieldError,
    focusNext,
    focusPrevious 
  } = useAccessibleForm([
    { name: 'exerciseName', label: 'Exercise Name', required: true },
    { name: 'reps', label: 'Reps', required: true },
    { name: 'rir', label: 'RIR', required: true },
    { name: 'weight', label: 'Weight', required: false },
  ]);

  // Load smart defaults and suggestions
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await WorkoutDefaults.getDefaults();
        const suggestions = await ExerciseSuggestions.getSuggestions();
        
        setWeightUnit(defaults.weightUnit || 'lbs');
        setExerciseSuggestions(suggestions);
        
        // Load saved form state if not in edit mode
        if (!editMode) {
          const savedState = await FormPersistence.loadFormState('workout');
          if (savedState) {
            setExerciseName(savedState.exerciseName || '');
            setSets(savedState.sets || [{ setNumber: 1, reps: defaults.reps || 10, rir: defaults.rir || 2, weight: '' }]);
            setWeightUnit(savedState.weightUnit || defaults.weightUnit || 'lbs');
          } else {
            // Use smart defaults
            setSets([{ setNumber: 1, reps: defaults.reps || 10, rir: defaults.rir || 2, weight: '' }]);
            if (defaults.lastUsedExercise) {
              setExerciseName(defaults.lastUsedExercise);
            }
          }
        }
      } catch (error) {
        console.error('Error loading defaults:', error);
      }
    };

    loadDefaults();
  }, [editMode]);

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

  // Auto-save form state
  useEffect(() => {
    const autoSave = async () => {
      if (exerciseName || sets.some(set => set.weight)) {
        setAutoSaving(true);
        try {
          await FormPersistence.saveFormState('workout', {
            exerciseName,
            sets,
            weightUnit,
          });
          setLastAutoSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setAutoSaving(false);
        }
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [exerciseName, sets, weightUnit]);

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
    
    // Real-time validation for weight field
    if (field === 'weight' && value) {
      const weight = parseFloat(value);
      if (isNaN(weight) || weight < 0) {
        setFieldValidations(prev => ({
          ...prev,
          [`set${setIndex}_weight`]: 'Weight must be a positive number'
        }));
      } else {
        setFieldValidations(prev => {
          const newValidations = { ...prev };
          delete newValidations[`set${setIndex}_weight`];
          return newValidations;
        });
      }
    }
  };

  // Real-time validation for exercise name
  const validateExerciseName = (name) => {
    if (!name.trim()) {
      return 'Exercise name is required';
    }
    if (name.length < 2) {
      return 'Exercise name must be at least 2 characters';
    }
    if (name.length > 50) {
      return 'Exercise name must be less than 50 characters';
    }
    return null;
  };

  const handleExerciseNameChange = (name) => {
    setExerciseName(name);
    
    // Real-time validation
    if (touched.exerciseName) {
      const error = validateExerciseName(name);
      setErrors(prev => ({
        ...prev,
        exerciseName: error
      }));
    }
    
    // Show suggestions if name is being typed
    if (name.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleExerciseNameBlur = () => {
    setTouched(prev => ({ ...prev, exerciseName: true }));
    const error = validateExerciseName(exerciseName);
    setErrors(prev => ({
      ...prev,
      exerciseName: error
    }));
  };

  const selectSuggestion = (suggestion) => {
    setExerciseName(suggestion);
    setShowSuggestions(false);
    setTouched(prev => ({ ...prev, exerciseName: true }));
    
    // Clear any existing error
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.exerciseName;
      return newErrors;
    });
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
    // Mark all fields as touched for validation
    setTouched({
      exerciseName: true,
      ...Object.keys(sets).reduce((acc, _, index) => {
        acc[`set${index}_weight`] = true;
        return acc;
      }, {})
    });

    if (!validateForm()) {
      hapticValidation();
      announceFormError();
      showErrorToast('Please fix the validation errors before saving');
      return;
    }

    setSaving(true);

    try {
      hapticFormSubmit();
      
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
        showSuccessToast(`${exerciseName} updated successfully!`, () => {
          hapticSuccess();
          announceWorkoutSaved();
          navigation.goBack();
        });
      } else {
        await saveWorkout(date, workout);
        showSuccessToast(`${exerciseName} saved successfully!`, () => {
          hapticSuccess();
          announceWorkoutSaved();
          navigation.goBack();
        });
      }

      // Save smart defaults and suggestions
      await WorkoutDefaults.updateFromWorkout({
        exerciseName: exerciseName.trim(),
        sets: sets,
        weightUnit: weightUnit,
      });
      await ExerciseSuggestions.addExercise(exerciseName.trim());
      
      // Clear form state after successful save
      await FormPersistence.clearFormState('workout');
      
    } catch (error) {
      console.error('Error saving workout:', error);
      hapticError();
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
        
        {/* Auto-save indicator */}
        {(autoSaving || lastAutoSaved) && (
          <View style={styles.autoSaveIndicator}>
            <ActivityIndicator 
              size="small" 
              color={autoSaving ? "#00ff88" : "#999999"} 
            />
            <Text style={styles.autoSaveText}>
              {autoSaving ? 'Saving...' : 'Saved'}
            </Text>
          </View>
        )}
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
                handleExerciseNameChange(text);
                if (isScreenReaderEnabled) {
                  announce(`Exercise name: ${text || 'empty'}`);
                }
              }}
              onBlur={handleExerciseNameBlur}
              onFocus={() => {
                if (isScreenReaderEnabled) {
                  announce('Exercise name field focused. Enter the name of your exercise.');
                }
              }}
              placeholder="e.g., Bench Press, Squat, Deadlift"
              style={styles.input}
              outlineColor="#555555"
              activeOutlineColor="#00ff88"
              textColor="#ffffff"
              placeholderTextColor="#999999"
              error={errors.exerciseName && touched.exerciseName}
              {...AccessibilityManager.getInputProps(
                'Exercise Name',
                'Enter the name of your exercise',
                true,
                errors.exerciseName && touched.exerciseName ? errors.exerciseName : ''
              )}
            />
            {errors.exerciseName && touched.exerciseName && (
              <HelperText type="error" visible={true} style={styles.errorText}>
                {errors.exerciseName}
              </HelperText>
            )}
            
            {/* Exercise Suggestions */}
            {showSuggestions && exerciseSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {exerciseSuggestions
                  .filter(suggestion => 
                    suggestion.toLowerCase().includes(exerciseName.toLowerCase()) &&
                    suggestion.toLowerCase() !== exerciseName.toLowerCase()
                  )
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
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
          onFocus={() => {
            if (isScreenReaderEnabled) {
              announce('Save workout button. Double tap to save your exercise.');
            }
          }}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          loading={saving}
          disabled={saving}
          {...AccessibilityManager.getButtonProps(
            saving ? 'Saving workout' : 'Save workout',
            'Double tap to save your exercise',
            saving
          )}
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
  // Enhanced form UX styles
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  suggestionText: {
    color: '#ffffff',
    fontSize: 14,
  },
  inputError: {
    borderColor: '#ff5252',
  },
  autoSaveIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555555',
  },
  autoSaveText: {
    color: '#999999',
    fontSize: 12,
    marginLeft: 4,
  },
});
