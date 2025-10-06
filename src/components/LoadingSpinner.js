import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * LoadingSpinner Component
 * 
 * Reusable loading indicator with optional message
 */
export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'large', 
  color = '#4CAF50',
  fullScreen = false,
  theme = 'light' // 'light' or 'dark'
}) {
  const containerStyle = fullScreen 
    ? [styles.fullScreenContainer, theme === 'dark' ? styles.darkBackground : styles.lightBackground]
    : styles.inlineContainer;

  const textColor = theme === 'dark' ? '#ffffff' : '#333333';

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.message, { color: textColor }]}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightBackground: {
    backgroundColor: '#f8f9fa',
  },
  darkBackground: {
    backgroundColor: '#1a1a1a',
  },
  inlineContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
});


