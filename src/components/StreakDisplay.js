import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { calculateStreakStats, getStreakMotivation, checkTodaysGoal } from '../utils/streakCalculator';
import { showSuccessToast } from '../utils/toast';

export default function StreakDisplay({ onRefresh }) {
  const [streakStats, setStreakStats] = useState(null);
  const [todaysGoal, setTodaysGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  
  // Animation values
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    loadStreakData();
  }, []);

  useEffect(() => {
    if (onRefresh) {
      loadStreakData();
    }
  }, [onRefresh]);

  const loadStreakData = async () => {
    try {
      setLoading(true);
      const [stats, todayGoal] = await Promise.all([
        calculateStreakStats(),
        checkTodaysGoal()
      ]);
      
      setStreakStats(stats);
      setTodaysGoal(todayGoal);
      
      // Trigger celebration animation if milestone achieved
      if (stats.milestone?.achieved) {
        triggerCelebration();
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    // Scale animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 3 }
    ).start();

    // Show celebration toast
    if (streakStats?.milestone?.achieved) {
      showSuccessToast(
        `${streakStats.milestone.achieved.emoji} ${streakStats.milestone.achieved.title}! ${streakStats.milestone.achieved.message}`
      );
    }
  };

  const handleRefresh = () => {
    loadStreakData();
  };

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContent}>
          <Text>Loading streak data...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (!streakStats) {
    return null;
  }

  const motivation = getStreakMotivation(streakStats.currentStreak, streakStats.isActive);
  const hasGoal = streakStats.goal > 0;

  if (!hasGoal) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.noGoalContent}>
          <View style={styles.noGoalHeader}>
            <Ionicons name="trophy-outline" size={24} color="#FFA726" />
            <Text style={styles.noGoalTitle}>Set Your Goal to Start Streaking!</Text>
          </View>
          <Text style={styles.noGoalText}>
            Set a calorie goal to begin tracking your consistency and building healthy habits.
          </Text>
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
            <Ionicons name="flame" size={24} color={motivation.color} />
            <Text style={styles.headerTitle}>Streak</Text>
          </View>
          <IconButton
            icon="refresh"
            size={20}
            onPress={handleRefresh}
            iconColor="#666"
          />
        </View>

        {/* Main Streak Display */}
        <Animated.View
          style={[
            styles.streakContainer,
            {
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <View style={styles.streakNumberContainer}>
            <Text style={[styles.streakNumber, { color: motivation.color }]}>
              {streakStats.currentStreak}
            </Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
          
          <View style={styles.motivationContainer}>
            <Text style={[styles.motivationTitle, { color: motivation.color }]}>
              {motivation.emoji} {motivation.title}
            </Text>
            <Text style={styles.motivationMessage}>
              {motivation.message}
            </Text>
          </View>
        </Animated.View>

        {/* Today's Progress */}
        {todaysGoal && (
          <View style={styles.todayProgress}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayLabel}>Today's Progress</Text>
              <Text style={styles.todayCalories}>
                {Math.round(todaysGoal.calories)} / {todaysGoal.goal} cal
              </Text>
            </View>
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${todaysGoal.progress}%`,
                    backgroundColor: todaysGoal.hit ? '#4CAF50' : '#2196F3'
                  }
                ]} 
              />
            </View>
            
            {todaysGoal.hit && (
              <View style={styles.goalHitContainer}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.goalHitText}>Goal hit!</Text>
              </View>
            )}
          </View>
        )}

        {/* Milestone Display */}
        {streakStats.milestone?.achieved && (
          <View style={styles.milestoneContainer}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneEmoji}>
                {streakStats.milestone.achieved.emoji}
              </Text>
              <Text style={styles.milestoneTitle}>
                {streakStats.milestone.achieved.title}
              </Text>
            </View>
            <Text style={styles.milestoneMessage}>
              {streakStats.milestone.achieved.message}
            </Text>
          </View>
        )}

        {/* Next Milestone */}
        {streakStats.milestone?.next && (
          <View style={styles.nextMilestoneContainer}>
            <Text style={styles.nextMilestoneText}>
              {streakStats.milestone.next.emoji} {streakStats.milestone.next.days} days: {streakStats.milestone.next.title}
            </Text>
            <Text style={styles.daysToNext}>
              {streakStats.milestone.daysToNext} more days to go!
            </Text>
          </View>
        )}

        {/* Details Toggle */}
        <TouchableOpacity
          style={styles.detailsToggle}
          onPress={() => setShowDetails(!showDetails)}
        >
          <Text style={styles.detailsToggleText}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Text>
          <Ionicons 
            name={showDetails ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#666" 
          />
        </TouchableOpacity>

        {/* Detailed Stats */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Longest Streak</Text>
              <Text style={styles.statValue}>{streakStats.longestStreak} days</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Success Rate</Text>
              <Text style={styles.statValue}>{streakStats.successRate}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Days Hit Goal</Text>
              <Text style={styles.statValue}>{streakStats.totalDaysHit} / {streakStats.totalDaysTracked}</Text>
            </View>
            {streakStats.streakStartDate && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Streak Started</Text>
                <Text style={styles.statValue}>
                  {new Date(streakStats.streakStartDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
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
  noGoalContent: {
    paddingVertical: 16,
  },
  noGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  noGoalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  streakNumberContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: -4,
  },
  motivationContainer: {
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  motivationMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  todayProgress: {
    marginBottom: 16,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  todayLabel: {
    fontSize: 14,
    color: '#666',
  },
  todayCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalHitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalHitText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  milestoneContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestoneEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  milestoneMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  nextMilestoneContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nextMilestoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 4,
  },
  daysToNext: {
    fontSize: 12,
    color: '#666',
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  detailsToggleText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
