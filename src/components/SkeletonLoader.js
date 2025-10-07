import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

// Skeleton loader component for better perceived performance
export default function SkeletonLoader({ 
  type = 'card', 
  width = '100%', 
  height = 100, 
  style = {},
  theme = 'light' 
}) {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  const getSkeletonStyle = () => {
    const baseStyle = {
      backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 8,
      width,
      height,
    };

    switch (type) {
      case 'card':
        return {
          ...baseStyle,
          padding: 16,
          marginBottom: 12,
        };
      case 'text':
        return {
          ...baseStyle,
          height: 16,
          marginBottom: 8,
        };
      case 'title':
        return {
          ...baseStyle,
          height: 24,
          marginBottom: 12,
          width: '70%',
        };
      case 'button':
        return {
          ...baseStyle,
          height: 48,
          borderRadius: 24,
        };
      case 'avatar':
        return {
          ...baseStyle,
          width: 60,
          height: 60,
          borderRadius: 30,
        };
      case 'list':
        return {
          ...baseStyle,
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Animated.View style={[getSkeletonStyle(), shimmerStyle, style]} />
  );
}

// Pre-built skeleton layouts for common screens
export const WorkoutCardSkeleton = ({ theme = 'dark' }) => (
  <View style={styles.skeletonCard}>
    <SkeletonLoader type="title" width="60%" theme={theme} />
    <SkeletonLoader type="text" width="100%" theme={theme} />
    <SkeletonLoader type="text" width="80%" theme={theme} />
    <View style={styles.skeletonRow}>
      <SkeletonLoader type="text" width="40%" theme={theme} />
      <SkeletonLoader type="text" width="40%" theme={theme} />
    </View>
  </View>
);

export const MealCardSkeleton = ({ theme = 'light' }) => (
  <View style={styles.skeletonCard}>
    <SkeletonLoader type="title" width="50%" theme={theme} />
    <SkeletonLoader type="text" width="100%" theme={theme} />
    <View style={styles.skeletonRow}>
      <SkeletonLoader type="text" width="30%" theme={theme} />
      <SkeletonLoader type="text" width="30%" theme={theme} />
      <SkeletonLoader type="text" width="30%" theme={theme} />
    </View>
  </View>
);

export const ProfileCardSkeleton = ({ theme = 'light' }) => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonRow}>
      <SkeletonLoader type="avatar" theme={theme} />
      <View style={styles.skeletonContent}>
        <SkeletonLoader type="title" width="60%" theme={theme} />
        <SkeletonLoader type="text" width="80%" theme={theme} />
      </View>
    </View>
  </View>
);

export const CalendarSkeleton = ({ theme = 'dark' }) => (
  <View style={styles.skeletonCard}>
    <SkeletonLoader type="title" width="40%" theme={theme} />
    <View style={styles.skeletonGrid}>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonLoader key={i} type="text" width="100%" height={30} theme={theme} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonCard: {
    padding: 16,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
