import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Title, Button, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getProfile, getCalorieGoal } from '../../services/storageService';
import { 
  convertKgToLbs, 
  convertCmToInches,
  getActivityLevelDescription 
} from '../../utils/calorieCalculations';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' or 'lbs'
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' or 'inches'

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, goalData] = await Promise.all([
        getProfile(),
        getCalorieGoal(),
      ]);
      
      setProfile(profileData);
      setCalorieGoal(goalData);
      
      // Set initial unit preferences from profile
      if (profileData) {
        setWeightUnit(profileData.weight?.unit || 'kg');
        setHeightUnit(profileData.height?.unit || 'cm');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeightUnit = () => {
    setWeightUnit(prev => prev === 'kg' ? 'lbs' : 'kg');
  };

  const toggleHeightUnit = () => {
    setHeightUnit(prev => prev === 'cm' ? 'inches' : 'cm');
  };

  const formatWeight = () => {
    if (!profile?.weight) return 'N/A';
    const baseValue = profile.weight.value;
    const baseUnit = profile.weight.unit;
    
    if (weightUnit === baseUnit) {
      return `${baseValue} ${weightUnit}`;
    } else {
      const converted = baseUnit === 'kg' 
        ? convertKgToLbs(baseValue) 
        : baseValue / 2.20462;
      return `${converted.toFixed(1)} ${weightUnit}`;
    }
  };

  const formatHeight = () => {
    if (!profile?.height) return 'N/A';
    const baseValue = profile.height.value;
    const baseUnit = profile.height.unit;
    
    if (heightUnit === baseUnit) {
      if (heightUnit === 'cm') {
        return `${baseValue} cm`;
      } else {
        const feet = Math.floor(baseValue / 12);
        const inches = Math.round(baseValue % 12);
        return `${feet}'${inches}"`;
      }
    } else {
      const converted = baseUnit === 'cm' 
        ? convertCmToInches(baseValue) 
        : baseValue * 2.54;
      
      if (heightUnit === 'inches') {
        const feet = Math.floor(converted / 12);
        const inches = Math.round(converted % 12);
        return `${feet}'${inches}"`;
      } else {
        return `${Math.round(converted)} cm`;
      }
    }
  };

  const getGoalTypeBadge = () => {
    if (!calorieGoal) return null;
    
    const { goalType } = calorieGoal;
    let color, label;
    
    if (goalType === 'deficit') {
      color = '#f44336';
      label = 'Deficit';
    } else if (goalType === 'surplus') {
      color = '#4CAF50';
      label = 'Surplus';
    } else {
      color = '#2196F3';
      label = 'Maintenance';
    }
    
    return { color, label };
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Empty state - No profile
  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-circle-outline" size={120} color="#2196F3" />
        <Title style={styles.emptyTitle}>Welcome to FitnessTracker!</Title>
        <Text style={styles.emptyText}>
          Track your workouts, nutrition, and reach your fitness goals.
        </Text>
        <Text style={styles.emptySubtext}>
          Let's start by setting up your profile to calculate your personalized calorie goals.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('EditProfile', { 
            editMode: false, 
            profileData: null 
          })}
          style={styles.setupButton}
          contentStyle={styles.setupButtonContent}
          labelStyle={styles.setupButtonLabel}
        >
          Set Up Profile
        </Button>
      </View>
    );
  }

  const badge = getGoalTypeBadge();

  // Main profile display
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Profile Information</Title>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile', { 
              editMode: true, 
              profileData: profile 
            })}
            compact
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </View>

        {/* Height Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="resize-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{formatHeight()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={toggleHeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>{heightUnit}</Text>
                <Ionicons name="swap-horizontal" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Weight Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="scale-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{formatWeight()}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={toggleWeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>{weightUnit}</Text>
                <Ionicons name="swap-horizontal" size={16} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Age Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="calendar-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{profile.age || 'N/A'} years</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Gender Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="person-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>
                    {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Activity Level Card */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Ionicons name="fitness-outline" size={24} color="#2196F3" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Activity Level</Text>
                  <Text style={styles.infoValue}>
                    {profile.activityLevel ? profile.activityLevel.charAt(0).toUpperCase() + profile.activityLevel.slice(1).replace('_', ' ') : 'N/A'}
                  </Text>
                  <Text style={styles.infoSubtext}>
                    {profile.activityLevel ? getActivityLevelDescription(profile.activityLevel) : ''}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>

      <Divider style={styles.divider} />

      {/* Calorie Goal Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Calorie Goal</Title>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('CalorieGoal')}
            compact
            style={styles.editButton}
          >
            Edit Goal
          </Button>
        </View>

        {calorieGoal ? (
          <>
            {/* Main Goal Card */}
            <Card style={styles.goalCard}>
              <Card.Content>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalTitle}>Daily Calorie Goal</Text>
                  {badge && (
                    <Chip
                      style={[styles.goalBadge, { backgroundColor: badge.color }]}
                      textStyle={styles.goalBadgeText}
                    >
                      {badge.label}
                    </Chip>
                  )}
                </View>
                <Text style={styles.goalValue}>{calorieGoal.finalGoal.toLocaleString()} kcal</Text>
                <Text style={styles.goalSubtext}>
                  Estimated: {calorieGoal.estimatedWeeklyChange > 0 ? '+' : ''}
                  {calorieGoal.estimatedWeeklyChange.toFixed(1)} lbs per week
                </Text>
              </Card.Content>
            </Card>

            {/* Maintenance Info Card */}
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.maintenanceInfo}>
                  <Ionicons name="speedometer-outline" size={20} color="#666" />
                  <View style={styles.maintenanceTextContainer}>
                    <Text style={styles.maintenanceLabel}>
                      {calorieGoal.useCustom ? 'Custom Maintenance' : 'Calculated Maintenance'}
                    </Text>
                    <Text style={styles.maintenanceValue}>
                      {(calorieGoal.useCustom ? calorieGoal.customMaintenance : calorieGoal.calculatedMaintenance).toLocaleString()} kcal/day
                    </Text>
                    {calorieGoal.goalOffset !== 0 && (
                      <Text style={styles.offsetText}>
                        {calorieGoal.goalOffset > 0 ? '+' : ''}{calorieGoal.goalOffset} kcal {calorieGoal.goalType}
                      </Text>
                    )}
                  </View>
                </View>
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.noGoalCard}>
            <Card.Content style={styles.noGoalContent}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
              <Text style={styles.noGoalTitle}>No Calorie Goal Set</Text>
              <Text style={styles.noGoalText}>
                Set up your calorie goal to start tracking your nutrition effectively.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CalorieGoal')}
                style={styles.setGoalButton}
              >
                Set Calorie Goal
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 24,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  setupButton: {
    marginTop: 16,
    backgroundColor: '#2196F3',
  },
  setupButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  setupButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    borderColor: '#2196F3',
  },
  infoCard: {
    marginVertical: 6,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  infoCardContent: {
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  divider: {
    marginVertical: 16,
  },
  goalCard: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  goalBadge: {
    height: 28,
  },
  goalBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginVertical: 8,
  },
  goalSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  maintenanceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  maintenanceTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  maintenanceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  maintenanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  offsetText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noGoalCard: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  noGoalContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noGoalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  noGoalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  setGoalButton: {
    marginTop: 8,
    backgroundColor: '#2196F3',
  },
});

