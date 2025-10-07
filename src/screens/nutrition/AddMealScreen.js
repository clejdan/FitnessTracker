import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Chip,
  HelperText,
  Menu,
  Divider,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import uuid from 'react-native-uuid';
import { format } from 'date-fns';
import { saveMeal, updateMeal } from '../../services/storageService';
import { calculateCalories, convertToGrams } from '../../utils/unitConversions';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../../utils/toast';
import { MealDefaults, FormPersistence, MealSuggestions } from '../../utils/smartDefaults';

const MEAL_SUGGESTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'];

export default function AddMealScreen({ route, navigation }) {
  const { date, editMode = false, mealData = null } = route?.params || {};

  // Validate required date parameter
  if (!date) {
    Alert.alert('Error', 'Date is required', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Missing date parameter</Text>
        </View>
      </View>
    );
  }

  // Form state
  const [mealName, setMealName] = useState('');
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Macro values and units
  const [proteinValue, setProteinValue] = useState('');
  const [proteinUnit, setProteinUnit] = useState('g');
  const [carbsValue, setCarbsValue] = useState('');
  const [carbsUnit, setCarbsUnit] = useState('g');
  const [fatsValue, setFatsValue] = useState('');
  const [fatsUnit, setFatsUnit] = useState('g');

  // UI state
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load smart defaults and suggestions
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await MealDefaults.getDefaults();
        const suggestions = await MealSuggestions.getSuggestions();
        
        setMealSuggestions(suggestions);
        
        // Load saved form state if not in edit mode
        if (!editMode) {
          const savedState = await FormPersistence.loadFormState('meal');
          if (savedState) {
            setMealName(savedState.mealName || '');
            setProteinValue(savedState.proteinValue || '');
            setCarbsValue(savedState.carbsValue || '');
            setFatsValue(savedState.fatsValue || '');
            setProteinUnit(savedState.proteinUnit || defaults.proteinUnit || 'g');
            setCarbsUnit(savedState.carbsUnit || defaults.carbsUnit || 'g');
            setFatsUnit(savedState.fatsUnit || defaults.fatsUnit || 'g');
          } else {
            // Use smart defaults
            setProteinUnit(defaults.proteinUnit || 'g');
            setCarbsUnit(defaults.carbsUnit || 'g');
            setFatsUnit(defaults.fatsUnit || 'g');
            if (defaults.lastUsedMeal) {
              setMealName(defaults.lastUsedMeal);
            }
          }
        }
      } catch (error) {
        console.error('Error loading meal defaults:', error);
      }
    };

    loadDefaults();
  }, [editMode]);

  useEffect(() => {
    if (editMode && mealData) {
      // Pre-populate form with existing data
      setMealName(mealData.mealName || '');
      if (mealData.time) {
        const [hours, minutes] = mealData.time.split(':');
        const mealTime = new Date();
        mealTime.setHours(parseInt(hours), parseInt(minutes));
        setTime(mealTime);
      }
      
      setProteinValue(mealData.protein?.value?.toString() || '');
      setProteinUnit(mealData.protein?.unit || 'g');
      setCarbsValue(mealData.carbs?.value?.toString() || '');
      setCarbsUnit(mealData.carbs?.unit || 'g');
      setFatsValue(mealData.fats?.value?.toString() || '');
      setFatsUnit(mealData.fats?.unit || 'g');
    }
  }, [editMode, mealData]);

  // Auto-save form state
  useEffect(() => {
    const autoSave = async () => {
      if (mealName || proteinValue || carbsValue || fatsValue) {
        setAutoSaving(true);
        try {
          await FormPersistence.saveFormState('meal', {
            mealName,
            proteinValue,
            carbsValue,
            fatsValue,
            proteinUnit,
            carbsUnit,
            fatsUnit,
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
  }, [mealName, proteinValue, carbsValue, fatsValue, proteinUnit, carbsUnit, fatsUnit]);

  // Calculate calories in real-time
  useEffect(() => {
    calculateTotalCalories();
  }, [proteinValue, proteinUnit, carbsValue, carbsUnit, fatsValue, fatsUnit]);

  const calculateTotalCalories = () => {
    try {
      // Convert all values to grams first
      const proteinGrams = proteinValue ? convertToGrams(parseFloat(proteinValue), proteinUnit) : 0;
      const carbsGrams = carbsValue ? convertToGrams(parseFloat(carbsValue), carbsUnit) : 0;
      const fatsGrams = fatsValue ? convertToGrams(parseFloat(fatsValue), fatsUnit) : 0;

      const calories = calculateCalories(proteinGrams, carbsGrams, fatsGrams);
      setCalculatedCalories(calories);
    } catch (error) {
      console.error('Error calculating calories:', error);
      setCalculatedCalories(0);
    }
  };

  const handleMealSuggestion = (suggestion) => {
    setMealName(suggestion);
    setTouched({ ...touched, mealName: true });
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const setAllUnits = (unit) => {
    setProteinUnit(unit);
    setCarbsUnit(unit);
    setFatsUnit(unit);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate meal name
    if (!mealName.trim()) {
      newErrors.mealName = 'Meal name is required';
    }

    // Validate at least one macro has value
    const hasProtein = proteinValue && parseFloat(proteinValue) > 0;
    const hasCarbs = carbsValue && parseFloat(carbsValue) > 0;
    const hasFats = fatsValue && parseFloat(fatsValue) > 0;

    if (!hasProtein && !hasCarbs && !hasFats) {
      newErrors.macros = 'Please enter at least one macro value';
    }

    // Validate individual macros
    if (proteinValue && (isNaN(parseFloat(proteinValue)) || parseFloat(proteinValue) < 0)) {
      newErrors.protein = 'Must be a positive number';
    }
    if (carbsValue && (isNaN(parseFloat(carbsValue)) || parseFloat(carbsValue) < 0)) {
      newErrors.carbs = 'Must be a positive number';
    }
    if (fatsValue && (isNaN(parseFloat(fatsValue)) || parseFloat(fatsValue) < 0)) {
      newErrors.fats = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Mark all fields as touched
    setTouched({
      mealName: true,
      protein: true,
      carbs: true,
      fats: true,
    });

    if (!validateForm()) {
      showErrorToast('Please fix the validation errors before saving');
      return;
    }

    // Validate calorie range (reasonable limits)
    if (calculatedCalories > 5000) {
      showConfirmDialog(
        'High Calorie Count',
        `This meal has ${calculatedCalories} calories, which seems unusually high. Are you sure?`,
        () => performSave(),
        null,
        'Yes, Save',
        'Cancel'
      );
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setSaving(true);

    try {
      // Convert all values to grams for storage
      const proteinGrams = proteinValue ? convertToGrams(parseFloat(proteinValue), proteinUnit) : 0;
      const carbsGrams = carbsValue ? convertToGrams(parseFloat(carbsValue), carbsUnit) : 0;
      const fatsGrams = fatsValue ? convertToGrams(parseFloat(fatsValue), fatsUnit) : 0;

      const meal = {
        id: editMode && mealData?.id ? mealData.id : uuid.v4(),
        date: date,
        mealName: mealName.trim(),
        time: format(time, 'HH:mm'),
        protein: {
          value: proteinGrams,
          unit: 'g',
          originalValue: parseFloat(proteinValue) || 0,
          originalUnit: proteinUnit,
        },
        carbs: {
          value: carbsGrams,
          unit: 'g',
          originalValue: parseFloat(carbsValue) || 0,
          originalUnit: carbsUnit,
        },
        fats: {
          value: fatsGrams,
          unit: 'g',
          originalValue: parseFloat(fatsValue) || 0,
          originalUnit: fatsUnit,
        },
        calories: calculatedCalories,
        createdAt: editMode && mealData?.createdAt 
          ? mealData.createdAt 
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editMode && mealData?.id) {
        await updateMeal(date, mealData.id, meal);
        showSuccessToast(`${mealName} updated successfully!`, () => {
          navigation.goBack();
        });
      } else {
        await saveMeal(date, meal);
        showSuccessToast(`${mealName} saved successfully!`, () => {
          navigation.goBack();
        });
      }

      // Save smart defaults and suggestions
      await MealDefaults.updateFromMeal({
        mealName: mealName.trim(),
        proteinUnit,
        carbsUnit,
        fatsUnit,
      });
      await MealSuggestions.addMeal(mealName.trim());
      
      // Clear form state after successful save
      await FormPersistence.clearFormState('meal');
    } catch (error) {
      console.error('Error saving meal:', error);
      showErrorToast('Failed to save meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const renderMacroInput = (label, value, setValue, unit, setUnit, error) => (
    <View style={styles.macroInputContainer}>
      <Text style={styles.macroLabel}>{label}</Text>
      <View style={styles.macroInputRow}>
        <TextInput
          mode="outlined"
          value={value}
          onChangeText={setValue}
          onBlur={() => setTouched({ ...touched, [label.toLowerCase()]: true })}
          keyboardType="decimal-pad"
          placeholder="0"
          style={styles.macroValueInput}
          outlineColor="#e0e0e0"
          activeOutlineColor="#4CAF50"
          textColor="#333333"
          error={touched[label.toLowerCase()] && error}
          dense
        />
        <View style={styles.unitPickerContainer}>
          <Picker
            selectedValue={unit}
            onValueChange={setUnit}
            style={styles.unitPicker}
            dropdownIconColor="#4CAF50"
          >
            <Picker.Item label="g" value="g" />
            <Picker.Item label="oz" value="oz" />
            <Picker.Item label="lbs" value="lbs" />
          </Picker>
        </View>
      </View>
      {touched[label.toLowerCase()] && error && (
        <HelperText type="error" visible={true} style={styles.errorHelperText}>
          {error}
        </HelperText>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>
          {editMode ? 'Edit Meal' : 'Add Meal'}
        </Title>
        <Text style={styles.headerSubtitle}>{date}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Meal Name */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Meal Details</Text>
            
            {/* Meal name suggestions */}
            <View style={styles.suggestionsContainer}>
              {MEAL_SUGGESTIONS.map(suggestion => (
                <Chip
                  key={suggestion}
                  selected={mealName === suggestion}
                  onPress={() => handleMealSuggestion(suggestion)}
                  style={styles.suggestionChip}
                  textStyle={styles.suggestionChipText}
                  selectedColor="#4CAF50"
                >
                  {suggestion}
                </Chip>
              ))}
            </View>

            <TextInput
              mode="outlined"
              label="Meal Name"
              value={mealName}
              onChangeText={setMealName}
              onBlur={() => setTouched({ ...touched, mealName: true })}
              placeholder="e.g., Breakfast, Protein Shake"
              style={styles.input}
              outlineColor="#e0e0e0"
              activeOutlineColor="#4CAF50"
              textColor="#333333"
              error={touched.mealName && errors.mealName}
            />
            {touched.mealName && errors.mealName && (
              <HelperText type="error" visible={true}>
                {errors.mealName}
              </HelperText>
            )}

            {/* Time picker */}
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timePickerLabel}>Time</Text>
              <Text style={styles.timePickerValue}>{format(time, 'h:mm a')}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                onChange={handleTimeChange}
              />
            )}
          </Card.Content>
        </Card>

        {/* Macros Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.macrosHeader}>
              <Text style={styles.sectionTitle}>Macronutrients</Text>
              <View style={styles.unitButtonsContainer}>
                <Button
                  mode={proteinUnit === 'g' && carbsUnit === 'g' && fatsUnit === 'g' ? 'contained' : 'outlined'}
                  onPress={() => setAllUnits('g')}
                  compact
                  style={styles.unitQuickButton}
                  labelStyle={styles.unitQuickButtonLabel}
                >
                  All g
                </Button>
                <Button
                  mode={proteinUnit === 'oz' && carbsUnit === 'oz' && fatsUnit === 'oz' ? 'contained' : 'outlined'}
                  onPress={() => setAllUnits('oz')}
                  compact
                  style={styles.unitQuickButton}
                  labelStyle={styles.unitQuickButtonLabel}
                >
                  All oz
                </Button>
              </View>
            </View>

            {errors.macros && (
              <HelperText type="error" visible={true} style={styles.macrosError}>
                {errors.macros}
              </HelperText>
            )}

            {renderMacroInput('Protein', proteinValue, setProteinValue, proteinUnit, setProteinUnit, errors.protein)}
            {renderMacroInput('Carbs', carbsValue, setCarbsValue, carbsUnit, setCarbsUnit, errors.carbs)}
            {renderMacroInput('Fats', fatsValue, setFatsValue, fatsUnit, setFatsUnit, errors.fats)}
          </Card.Content>
        </Card>

        {/* Calculated Calories */}
        <Card style={styles.caloriesCard}>
          <Card.Content>
            <View style={styles.caloriesContainer}>
              <Text style={styles.caloriesLabel}>Total Calories</Text>
              <Text style={styles.caloriesValue}>{calculatedCalories}</Text>
              <Text style={styles.caloriesUnit}>kcal</Text>
            </View>
            <Text style={styles.caloriesSubtext}>
              Calculated from macros: P:{Math.round(proteinValue ? convertToGrams(parseFloat(proteinValue), proteinUnit) : 0)}g, 
              C:{Math.round(carbsValue ? convertToGrams(parseFloat(carbsValue), carbsUnit) : 0)}g, 
              F:{Math.round(fatsValue ? convertToGrams(parseFloat(fatsValue), fatsUnit) : 0)}g
            </Text>
          </Card.Content>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.tipsTitle}>💡 Tips</Text>
            <Text style={styles.tipsText}>
              • All values are converted to grams for accurate tracking
            </Text>
            <Text style={styles.tipsText}>
              • Calories are calculated automatically: Protein & Carbs = 4 cal/g, Fats = 9 cal/g
            </Text>
            <Text style={styles.tipsText}>
              • Use quick buttons to set all units at once
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
          loading={saving}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Meal'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#999999',
    fontSize: 14,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  suggestionChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionChipText: {
    fontSize: 12,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 12,
  },
  timePickerLabel: {
    fontSize: 16,
    color: '#666666',
  },
  timePickerValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  macrosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unitQuickButton: {
    borderColor: '#4CAF50',
  },
  unitQuickButtonLabel: {
    fontSize: 11,
  },
  macrosError: {
    color: '#FF5252',
    marginBottom: 8,
  },
  macroInputContainer: {
    marginBottom: 16,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroValueInput: {
    flex: 2,
    backgroundColor: '#ffffff',
  },
  unitPickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  unitPicker: {
    height: 40,
  },
  errorHelperText: {
    fontSize: 11,
  },
  caloriesCard: {
    backgroundColor: '#4CAF50',
    marginBottom: 16,
    elevation: 4,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  caloriesLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 12,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  caloriesUnit: {
    fontSize: 18,
    color: '#ffffff',
    marginLeft: 8,
  },
  caloriesSubtext: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  tipsCard: {
    backgroundColor: '#e8f5e9',
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
    backgroundColor: '#4CAF50',
  },
  saveButtonLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
