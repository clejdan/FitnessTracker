import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, FlatList, Animated, Alert } from 'react-native';
import { Text, Card, Title, Button, Switch, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getProfile, getCalorieGoal, saveCalorieGoal } from '../../services/storageService';
import { 
  calculateBMR, 
  calculateTDEE,
  calculateWeeklyWeightChange,
  getActivityLevelDescription,
  convertLbsToKg,
  convertInchesToCm,
} from '../../utils/calorieCalculations';

// Create Animated FlatList component
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = 180;
const ITEM_SPACING = 20;
const SIDE_PADDING = (SCREEN_WIDTH - ITEM_WIDTH) / 2;

const GOAL_OPTIONS = [
  { 
    id: 'aggressive_deficit', 
    offset: -1000, 
    label: 'Aggressive Deficit',
    shortLabel: '-1000',
    color: '#FF5252',
    goalType: 'deficit',
  },
  { 
    id: 'moderate_deficit', 
    offset: -500, 
    label: 'Moderate Deficit',
    shortLabel: '-500',
    color: '#FF7043',
    goalType: 'deficit',
  },
  { 
    id: 'mild_deficit', 
    offset: -300, 
    label: 'Mild Deficit',
    shortLabel: '-300',
    color: '#FFA726',
    goalType: 'deficit',
  },
  { 
    id: 'maintenance', 
    offset: 0, 
    label: 'Maintenance',
    shortLabel: '0',
    color: '#2196F3',
    goalType: 'maintenance',
  },
  { 
    id: 'mild_surplus', 
    offset: 300, 
    label: 'Mild Surplus',
    shortLabel: '+300',
    color: '#66BB6A',
    goalType: 'surplus',
  },
  { 
    id: 'moderate_surplus', 
    offset: 500, 
    label: 'Moderate Surplus',
    shortLabel: '+500',
    color: '#4CAF50',
    goalType: 'surplus',
  },
  { 
    id: 'aggressive_surplus', 
    offset: 1000, 
    label: 'Aggressive Surplus',
    shortLabel: '+1000',
    color: '#2E7D32',
    goalType: 'surplus',
  },
];

export default function CalorieGoalScreen({ navigation, route }) {
  const calculatedMaintenanceParam = route?.params?.calculatedMaintenance || null;
  const profileDataParam = route?.params?.profileData || null;

  // State
  const [profile, setProfile] = useState(profileDataParam);
  const [existingGoal, setExistingGoal] = useState(null);
  const [calculatedMaintenance, setCalculatedMaintenance] = useState(calculatedMaintenanceParam);
  const [useCustom, setUseCustom] = useState(false);
  const [customMaintenance, setCustomMaintenance] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(3); // Default to maintenance
  const [loading, setLoading] = useState(false);

  // Animation
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Load data on mount
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load profile if not passed via params
      let profileData = profile;
      if (!profileData) {
        profileData = await getProfile();
        setProfile(profileData);
      }

      // Calculate maintenance if not passed via params
      if (!calculatedMaintenance && profileData) {
        const maintenance = calculateMaintenanceCalories(profileData);
        setCalculatedMaintenance(maintenance);
      }

      // Load existing goal
      const goal = await getCalorieGoal();
      if (goal) {
        setExistingGoal(goal);
        setUseCustom(goal.useCustom || false);
        if (goal.customMaintenance) {
          setCustomMaintenance(goal.customMaintenance.toString());
        }
        
        // Find and select the matching goal option
        const index = GOAL_OPTIONS.findIndex(opt => opt.offset === goal.goalOffset);
        if (index !== -1) {
          setSelectedIndex(index);
          // Scroll to the selected index after a brief delay
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ 
              index, 
              animated: false,
              viewPosition: 0.5 
            });
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error loading calorie goal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMaintenanceCalories = (profileData) => {
    try {
      const weightKg = profileData.weight.unit === 'kg' 
        ? profileData.weight.value 
        : convertLbsToKg(profileData.weight.value);
      
      const heightCm = profileData.height.unit === 'cm' 
        ? profileData.height.value 
        : convertInchesToCm(profileData.height.value);

      const bmr = calculateBMR(weightKg, heightCm, profileData.age, profileData.gender);
      const tdee = calculateTDEE(bmr, profileData.activityLevel);
      return tdee;
    } catch (error) {
      console.error('Error calculating maintenance:', error);
      return 2000; // Fallback
    }
  };

  const getActiveMaintenance = () => {
    if (useCustom && customMaintenance) {
      return parseInt(customMaintenance);
    }
    return calculatedMaintenance || 2000;
  };

  const getCurrentGoalOption = () => {
    return GOAL_OPTIONS[selectedIndex];
  };

  const getFinalGoal = () => {
    return getActiveMaintenance() + getCurrentGoalOption().offset;
  };

  const getWeeklyChange = () => {
    return calculateWeeklyWeightChange(getCurrentGoalOption().offset);
  };

  const handleSave = async () => {
    try {
      const maintenance = getActiveMaintenance();
      const goalOption = getCurrentGoalOption();
      const weeklyChange = getWeeklyChange();

      const goalData = {
        calculatedMaintenance: calculatedMaintenance || 2000,
        customMaintenance: useCustom ? maintenance : null,
        goalType: goalOption.goalType,
        goalOffset: goalOption.offset,
        finalGoal: getFinalGoal(),
        estimatedWeeklyChange: weeklyChange.lbs,
        useCustom: useCustom,
      };

      await saveCalorieGoal(goalData);
      
      Alert.alert(
        'Success!',
        'Your calorie goal has been saved.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ProfileMain'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving calorie goal:', error);
      Alert.alert('Error', 'Failed to save calorie goal. Please try again.');
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round((offsetX + SIDE_PADDING) / (ITEM_WIDTH + ITEM_SPACING));
        setSelectedIndex(Math.max(0, Math.min(index, GOAL_OPTIONS.length - 1)));
      }
    }
  );

  const renderGoalOption = ({ item, index }) => {
    const inputRange = [
      (index - 2) * (ITEM_WIDTH + ITEM_SPACING),
      (index - 1) * (ITEM_WIDTH + ITEM_SPACING),
      index * (ITEM_WIDTH + ITEM_SPACING),
      (index + 1) * (ITEM_WIDTH + ITEM_SPACING),
      (index + 2) * (ITEM_WIDTH + ITEM_SPACING),
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 0.85, 1, 0.85, 0.7],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 0.6, 1, 0.6, 0.3],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.goalOption,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <View style={[styles.goalOptionCard, { backgroundColor: item.color }]}>
          <Text style={styles.goalOptionCalories}>{item.shortLabel}</Text>
          <Text style={styles.goalOptionUnit}>cal/day</Text>
        </View>
        <Text style={styles.goalOptionLabel}>{item.label}</Text>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const weeklyChange = getWeeklyChange();
  const finalGoal = getFinalGoal();
  const currentGoal = getCurrentGoalOption();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <Text style={styles.headerText}>
        Set your daily calorie goal based on your fitness objectives
      </Text>

      {/* Maintenance Section */}
      <Card style={styles.maintenanceCard}>
        <Card.Content>
          <View style={styles.maintenanceHeader}>
            <Ionicons name="speedometer-outline" size={24} color="#2196F3" />
            <Text style={styles.maintenanceTitle}>Maintenance Calories</Text>
          </View>
          
          <Text style={styles.maintenanceValue}>
            {calculatedMaintenance?.toLocaleString() || '---'} kcal/day
          </Text>
          
          {profile?.activityLevel && (
            <Text style={styles.maintenanceSubtext}>
              Based on your {profile.activityLevel.replace('_', ' ')} activity level
            </Text>
          )}

          <View style={styles.customToggleRow}>
            <Text style={styles.customToggleLabel}>Use Custom Maintenance</Text>
            <Switch
              value={useCustom}
              onValueChange={setUseCustom}
              color="#2196F3"
            />
          </View>

          {useCustom && (
            <TextInput
              mode="outlined"
              label="Custom Maintenance (kcal/day)"
              value={customMaintenance}
              onChangeText={setCustomMaintenance}
              keyboardType="number-pad"
              placeholder="e.g., 2200"
              style={styles.customInput}
              outlineColor="#e0e0e0"
              activeOutlineColor="#2196F3"
            />
          )}
        </Card.Content>
      </Card>

      {/* Goal Selector Section */}
      <View style={styles.selectorSection}>
        <Title style={styles.sectionTitle}>Choose Your Goal</Title>
        <Text style={styles.selectorHint}>Scroll to select</Text>

        <AnimatedFlatList
          ref={flatListRef}
          data={GOAL_OPTIONS}
          renderItem={renderGoalOption}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SIDE_PADDING,
          }}
          snapToInterval={ITEM_WIDTH + ITEM_SPACING}
          decelerationRate="fast"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH + ITEM_SPACING,
            offset: (ITEM_WIDTH + ITEM_SPACING) * index,
            index,
          })}
          initialScrollIndex={selectedIndex}
          style={styles.goalList}
        />
      </View>

      {/* Result Display */}
      <Card style={[styles.resultCard, { borderColor: currentGoal.color }]}>
        <Card.Content>
          <Text style={styles.resultLabel}>Your Daily Goal</Text>
          <Text style={[styles.resultValue, { color: currentGoal.color }]}>
            {finalGoal.toLocaleString()} kcal
          </Text>
          <View style={styles.resultChangeRow}>
            <Ionicons 
              name={weeklyChange.lbs >= 0 ? 'trending-up' : 'trending-down'} 
              size={20} 
              color={currentGoal.color} 
            />
            <Text style={[styles.resultChange, { color: currentGoal.color }]}>
              {weeklyChange.lbs > 0 ? '+' : ''}{weeklyChange.lbs.toFixed(1)} lbs 
              ({weeklyChange.kg > 0 ? '+' : ''}{weeklyChange.kg.toFixed(2)} kg) per week
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          💡 Based on 3,500 calories = 1 lb of body fat
        </Text>
        <Text style={styles.disclaimerText}>
          * Estimates are general guidelines. Individual results may vary.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          labelStyle={styles.cancelButtonLabel}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          labelStyle={styles.saveButtonLabel}
        >
          Save Goal
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  maintenanceCard: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    elevation: 3,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  maintenanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  maintenanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 8,
  },
  maintenanceSubtext: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  customToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  customToggleLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  customInput: {
    marginTop: 12,
    backgroundColor: '#ffffff',
  },
  selectorSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectorHint: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  goalList: {
    height: 180,
  },
  goalOption: {
    width: ITEM_WIDTH,
    marginHorizontal: ITEM_SPACING / 2,
    alignItems: 'center',
  },
  goalOptionCard: {
    width: ITEM_WIDTH,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goalOptionCalories: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  goalOptionUnit: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
  },
  goalOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  resultCard: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    elevation: 4,
    borderLeftWidth: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultChange: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 32,
  },
});