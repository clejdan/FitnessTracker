// Simple test to check if the app can start without errors
import React from 'react';
import { View, Text } from 'react-native';

// Test if all imports work
try {
  console.log('Testing imports...');
  
  // Test React Native imports
  const { View, Text, StyleSheet } = require('react-native');
  console.log('✅ React Native imports work');
  
  // Test React Native Paper imports
  const { Card, Button, Title } = require('react-native-paper');
  console.log('✅ React Native Paper imports work');
  
  // Test Expo imports
  const { Ionicons } = require('@expo/vector-icons');
  console.log('✅ Expo Vector Icons imports work');
  
  // Test Navigation imports
  const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
  console.log('✅ React Navigation imports work');
  
  // Test Date-fns imports
  const { format, parseISO } = require('date-fns');
  console.log('✅ Date-fns imports work');
  
  // Test AsyncStorage imports
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  console.log('✅ AsyncStorage imports work');
  
  // Test Gesture Handler imports
  const { Swipeable } = require('react-native-gesture-handler');
  console.log('✅ Gesture Handler imports work');
  
  console.log('🎉 All imports successful! App should start without errors.');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack trace:', error.stack);
}
