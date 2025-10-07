import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { hapticButtonPress } from '../utils/haptics';

const { width: screenWidth } = Dimensions.get('window');

export default function AnimatedTabBar({ state, descriptors, navigation }) {
  const tabWidth = screenWidth / state.routes.length;
  const indicatorPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: state.index * tabWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth]);

  const getTabColor = (routeName, isFocused) => {
    switch (routeName) {
      case 'Workout':
        return isFocused ? '#00ff88' : '#888888';
      case 'Nutrition':
        return isFocused ? '#4CAF50' : '#888888';
      case 'Profile':
        return isFocused ? '#2196F3' : '#888888';
      default:
        return isFocused ? '#00ff88' : '#888888';
    }
  };

  const getTabIcon = (routeName, isFocused) => {
    switch (routeName) {
      case 'Workout':
        return isFocused ? 'fitness' : 'fitness-outline';
      case 'Nutrition':
        return isFocused ? 'nutrition' : 'nutrition-outline';
      case 'Profile':
        return isFocused ? 'person' : 'person-outline';
      default:
        return isFocused ? 'fitness' : 'fitness-outline';
    }
  };

  const getBackgroundColor = (routeName) => {
    switch (routeName) {
      case 'Workout':
        return '#1a1a1a';
      case 'Nutrition':
        return '#ffffff';
      case 'Profile':
        return '#ffffff';
      default:
        return '#1a1a1a';
    }
  };

  return (
    <View style={[styles.tabBar, { backgroundColor: getBackgroundColor(state.routes[state.index].name) }]}>
      {/* Animated Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            transform: [{ translateX: indicatorPosition }],
            backgroundColor: getTabColor(state.routes[state.index].name, true),
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          hapticButtonPress();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={styles.tabContent}>
              <Ionicons
                name={getTabIcon(route.name, isFocused)}
                size={24}
                color={getTabColor(route.name, isFocused)}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: getTabColor(route.name, isFocused),
                    fontWeight: isFocused ? 'bold' : 'normal',
                  },
                ]}
              >
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: '33.33%',
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
