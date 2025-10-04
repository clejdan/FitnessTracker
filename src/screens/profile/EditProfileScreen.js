import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Card, Title, Button, TextInput, SegmentedButtons, HelperText, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { saveProfile } from '../../services/storageService';
import { 
  calculateBMR, 
  calculateTDEE,
  convertLbsToKg,
  convertKgToLbs,
  convertInchesToCm,
  convertCmToInches,
} from '../../utils/calorieCalculations';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Very Active', description: 'Very hard exercise & physical job' },
];

export default function EditProfileScreen({ navigation, route }) {
  const editMode = route?.params?.editMode || false;
  const profileData = route?.params?.profileData || null;

  // Form state
  const [heightValue, setHeightValue] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightValue, setWeightValue] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  // Validation state
  const [heightError, setHeightError] = useState('');
  const [weightError, setWeightError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [activityError, setActivityError] = useState('');

  // Calculated maintenance
  const [estimatedMaintenance, setEstimatedMaintenance] = useState(null);

  // Load existing profile data if editing
  useEffect(() => {
    if (editMode && profileData) {
      setHeightValue(profileData.height?.value?.toString() || '');
      setHeightUnit(profileData.height?.unit || 'cm');
      setWeightValue(profileData.weight?.value?.toString() || '');
      setWeightUnit(profileData.weight?.unit || 'kg');
      setAge(profileData.age?.toString() || '');
      setGender(profileData.gender || '');
      setActivityLevel(profileData.activityLevel || '');
    }
  }, [editMode, profileData]);

  // Calculate maintenance calories in real-time
  useEffect(() => {
    calculateMaintenance();
  }, [heightValue, heightUnit, weightValue, weightUnit, age, gender, activityLevel]);

  const calculateMaintenance = () => {
    try {
      if (!heightValue || !weightValue || !age || !gender || !activityLevel) {
        setEstimatedMaintenance(null);
        return;
      }

      // Convert to metric for calculation
      const weightKg = weightUnit === 'kg' ? parseFloat(weightValue) : convertLbsToKg(parseFloat(weightValue));
      const heightCm = heightUnit === 'cm' ? parseFloat(heightValue) : convertInchesToCm(parseFloat(heightValue));
      const ageNum = parseInt(age);

      if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageNum)) {
        setEstimatedMaintenance(null);
        return;
      }

      const bmr = calculateBMR(weightKg, heightCm, ageNum, gender);
      const tdee = calculateTDEE(bmr, activityLevel);
      setEstimatedMaintenance(tdee);
    } catch (error) {
      setEstimatedMaintenance(null);
    }
  };

  const toggleHeightUnit = () => {
    if (!heightValue) {
      setHeightUnit(prev => prev === 'cm' ? 'inches' : 'cm');
      return;
    }

    const currentValue = parseFloat(heightValue);
    if (isNaN(currentValue)) return;

    if (heightUnit === 'cm') {
      const inches = convertCmToInches(currentValue);
      setHeightValue(Math.round(inches).toString());
      setHeightUnit('inches');
    } else {
      const cm = convertInchesToCm(currentValue);
      setHeightValue(Math.round(cm).toString());
      setHeightUnit('cm');
    }
  };

  const toggleWeightUnit = () => {
    if (!weightValue) {
      setWeightUnit(prev => prev === 'kg' ? 'lbs' : 'kg');
      return;
    }

    const currentValue = parseFloat(weightValue);
    if (isNaN(currentValue)) return;

    if (weightUnit === 'kg') {
      const lbs = convertKgToLbs(currentValue);
      setWeightValue(lbs.toFixed(1));
      setWeightUnit('lbs');
    } else {
      const kg = convertLbsToKg(currentValue);
      setWeightValue(kg.toFixed(1));
      setWeightUnit('kg');
    }
  };

  const validateHeight = () => {
    if (!heightValue) {
      setHeightError('Height is required');
      return false;
    }

    const value = parseFloat(heightValue);
    if (isNaN(value)) {
      setHeightError('Please enter a valid number');
      return false;
    }

    if (heightUnit === 'cm') {
      if (value < 91 || value > 244) {
        setHeightError('Height must be between 91-244 cm');
        return false;
      }
    } else {
      if (value < 36 || value > 96) {
        setHeightError('Height must be between 36-96 inches');
        return false;
      }
    }

    setHeightError('');
    return true;
  };

  const validateWeight = () => {
    if (!weightValue) {
      setWeightError('Weight is required');
      return false;
    }

    const value = parseFloat(weightValue);
    if (isNaN(value)) {
      setWeightError('Please enter a valid number');
      return false;
    }

    if (weightUnit === 'kg') {
      if (value < 23 || value > 227) {
        setWeightError('Weight must be between 23-227 kg');
        return false;
      }
    } else {
      if (value < 50 || value > 500) {
        setWeightError('Weight must be between 50-500 lbs');
        return false;
      }
    }

    setWeightError('');
    return true;
  };

  const validateAge = () => {
    if (!age) {
      setAgeError('Age is required');
      return false;
    }

    const value = parseInt(age);
    if (isNaN(value)) {
      setAgeError('Please enter a valid number');
      return false;
    }

    if (value < 13 || value > 120) {
      setAgeError('Age must be between 13-120 years');
      return false;
    }

    setAgeError('');
    return true;
  };

  const validateGender = () => {
    if (!gender) {
      setGenderError('Please select a gender');
      return false;
    }
    setGenderError('');
    return true;
  };

  const validateActivityLevel = () => {
    if (!activityLevel) {
      setActivityError('Please select an activity level');
      return false;
    }
    setActivityError('');
    return true;
  };

  const validateAll = () => {
    const heightValid = validateHeight();
    const weightValid = validateWeight();
    const ageValid = validateAge();
    const genderValid = validateGender();
    const activityValid = validateActivityLevel();

    return heightValid && weightValid && ageValid && genderValid && activityValid;
  };

  const isFormValid = () => {
    return heightValue && weightValue && age && gender && activityLevel &&
           !heightError && !weightError && !ageError && !genderError && !activityError;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      Alert.alert('Validation Error', 'Please fix all errors before saving.');
      return;
    }

    try {
      const profile = {
        height: {
          value: parseFloat(heightValue),
          unit: heightUnit,
        },
        weight: {
          value: parseFloat(weightValue),
          unit: weightUnit,
        },
        age: parseInt(age),
        gender: gender,
        activityLevel: activityLevel,
      };

      await saveProfile(profile);
      
      Alert.alert(
        'Success',
        'Profile saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to CalorieGoalScreen with calculated maintenance
              navigation.navigate('CalorieGoal', {
                calculatedMaintenance: estimatedMaintenance,
                profileData: profile,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.headerText}>
          {editMode ? 'Update your profile information' : 'Enter your profile information to get started'}
        </Text>

        {/* Height Input */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <View style={styles.inputHeader}>
              <View style={styles.labelRow}>
                <Ionicons name="resize-outline" size={24} color="#2196F3" />
                <Text style={styles.inputLabel}>Height</Text>
              </View>
              <TouchableOpacity onPress={toggleHeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>{heightUnit}</Text>
                <Ionicons name="swap-horizontal" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
            <TextInput
              mode="outlined"
              value={heightValue}
              onChangeText={setHeightValue}
              onBlur={validateHeight}
              keyboardType="decimal-pad"
              placeholder={heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 70'}
              error={!!heightError}
              style={styles.textInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#2196F3"
            />
            <HelperText type="error" visible={!!heightError}>
              {heightError}
            </HelperText>
            {!heightError && (
              <HelperText type="info">
                {heightUnit === 'cm' ? 'Range: 91-244 cm' : 'Range: 36-96 inches (3-8 feet)'}
              </HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Weight Input */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <View style={styles.inputHeader}>
              <View style={styles.labelRow}>
                <Ionicons name="scale-outline" size={24} color="#2196F3" />
                <Text style={styles.inputLabel}>Weight</Text>
              </View>
              <TouchableOpacity onPress={toggleWeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>{weightUnit}</Text>
                <Ionicons name="swap-horizontal" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
            <TextInput
              mode="outlined"
              value={weightValue}
              onChangeText={setWeightValue}
              onBlur={validateWeight}
              keyboardType="decimal-pad"
              placeholder={weightUnit === 'kg' ? 'e.g., 75' : 'e.g., 165'}
              error={!!weightError}
              style={styles.textInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#2196F3"
            />
            <HelperText type="error" visible={!!weightError}>
              {weightError}
            </HelperText>
            {!weightError && (
              <HelperText type="info">
                {weightUnit === 'kg' ? 'Range: 23-227 kg' : 'Range: 50-500 lbs'}
              </HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Age Input */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <View style={styles.labelRow}>
              <Ionicons name="calendar-outline" size={24} color="#2196F3" />
              <Text style={styles.inputLabel}>Age</Text>
            </View>
            <TextInput
              mode="outlined"
              value={age}
              onChangeText={setAge}
              onBlur={validateAge}
              keyboardType="number-pad"
              placeholder="e.g., 30"
              error={!!ageError}
              style={styles.textInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#2196F3"
            />
            <HelperText type="error" visible={!!ageError}>
              {ageError}
            </HelperText>
            {!ageError && (
              <HelperText type="info">
                Range: 13-120 years
              </HelperText>
            )}
          </Card.Content>
        </Card>

        {/* Gender Selection */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={24} color="#2196F3" />
              <Text style={styles.inputLabel}>Gender</Text>
            </View>
            <SegmentedButtons
              value={gender}
              onValueChange={(value) => {
                setGender(value);
                setGenderError('');
              }}
              buttons={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
              style={styles.segmentedButtons}
            />
            <HelperText type="error" visible={!!genderError}>
              {genderError}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Activity Level Selection */}
        <Card style={styles.inputCard}>
          <Card.Content>
            <View style={styles.labelRow}>
              <Ionicons name="fitness-outline" size={24} color="#2196F3" />
              <Text style={styles.inputLabel}>Activity Level</Text>
            </View>
            {ACTIVITY_LEVELS.map((level, index) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.activityOption,
                  activityLevel === level.value && styles.activityOptionSelected,
                  index === ACTIVITY_LEVELS.length - 1 && { marginBottom: 0 },
                ]}
                onPress={() => {
                  setActivityLevel(level.value);
                  setActivityError('');
                }}
              >
                <View style={styles.activityOptionContent}>
                  <View style={styles.activityOptionLeft}>
                    <View
                      style={[
                        styles.radioButton,
                        activityLevel === level.value && styles.radioButtonSelected,
                      ]}
                    >
                      {activityLevel === level.value && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <View style={styles.activityTextContainer}>
                      <Text style={styles.activityLabel}>{level.label}</Text>
                      <Text style={styles.activityDescription}>{level.description}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <HelperText type="error" visible={!!activityError}>
              {activityError}
            </HelperText>
          </Card.Content>
        </Card>

        {/* Estimated Maintenance Display */}
        {estimatedMaintenance && (
          <Card style={styles.maintenanceCard}>
            <Card.Content>
              <View style={styles.maintenanceContent}>
                <Ionicons name="speedometer-outline" size={32} color="#4CAF50" />
                <View style={styles.maintenanceTextContainer}>
                  <Text style={styles.maintenanceLabel}>Your estimated maintenance:</Text>
                  <Text style={styles.maintenanceValue}>
                    {estimatedMaintenance.toLocaleString()} kcal/day
                  </Text>
                  <Text style={styles.maintenanceSubtext}>
                    Calories to maintain your current weight
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={!isFormValid()}
            style={[styles.saveButton, !isFormValid() && styles.saveButtonDisabled]}
            labelStyle={styles.saveButtonLabel}
          >
            Save & Continue
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  unitToggleText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
  textInput: {
    backgroundColor: '#ffffff',
  },
  segmentedButtons: {
    marginTop: 8,
  },
  activityOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  activityOptionSelected: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#E3F2FD',
  },
  activityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    borderColor: '#2196F3',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2196F3',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 13,
    color: '#666',
  },
  maintenanceCard: {
    marginBottom: 16,
    backgroundColor: '#E8F5E9',
    elevation: 3,
  },
  maintenanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maintenanceTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  maintenanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  maintenanceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  maintenanceSubtext: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#999',
  },
  cancelButtonLabel: {
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 32,
  },
});
