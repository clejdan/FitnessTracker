import { Animated, Easing, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Animation configurations
export const AnimationConfigs = {
  // Timing configurations
  FAST: { duration: 200, easing: Easing.out(Easing.quad) },
  NORMAL: { duration: 300, easing: Easing.out(Easing.quad) },
  SLOW: { duration: 500, easing: Easing.out(Easing.quad) },
  
  // Spring configurations
  SPRING_LIGHT: { tension: 300, friction: 30 },
  SPRING_MEDIUM: { tension: 200, friction: 25 },
  SPRING_HEAVY: { tension: 100, friction: 20 },
  
  // Bounce configurations
  BOUNCE_LIGHT: { duration: 400, easing: Easing.bounce },
  BOUNCE_MEDIUM: { duration: 600, easing: Easing.bounce },
};

// Common animation values
export const createAnimationValue = (initialValue = 0) => new Animated.Value(initialValue);

// Page transition animations
export const PageTransitions = {
  // Slide from right (default navigation)
  slideFromRight: (animatedValue) => ({
    transform: [{
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0],
      }),
    }],
    opacity: animatedValue,
  }),

  // Slide from left (back navigation)
  slideFromLeft: (animatedValue) => ({
    transform: [{
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, 0],
      }),
    }],
    opacity: animatedValue,
  }),

  // Fade in/out
  fade: (animatedValue) => ({
    opacity: animatedValue,
  }),

  // Scale in/out
  scale: (animatedValue) => ({
    transform: [{
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
      }),
    }],
    opacity: animatedValue,
  }),

  // Slide up from bottom
  slideFromBottom: (animatedValue) => ({
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight, 0],
      }),
    }],
    opacity: animatedValue,
  }),

  // Slide down from top
  slideFromTop: (animatedValue) => ({
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenHeight, 0],
      }),
    }],
    opacity: animatedValue,
  }),
};

// Micro-interaction animations
export const MicroInteractions = {
  // Button press animation
  buttonPress: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);
  },

  // Card hover/press animation
  cardPress: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]);
  },

  // Success checkmark animation
  successCheckmark: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
  },

  // Error shake animation
  errorShake: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]);
  },

  // Loading pulse animation
  loadingPulse: (animatedValue) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
  },

  // Heartbeat animation
  heartbeat: (animatedValue) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
  },
};

// List animations
export const ListAnimations = {
  // Staggered list item entrance
  staggeredEntrance: (index, animatedValue) => ({
    transform: [{
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50 * (index + 1), 0],
      }),
    }],
    opacity: animatedValue,
  }),

  // Slide in from right
  slideInFromRight: (index, animatedValue) => ({
    transform: [{
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0],
      }),
    }],
    opacity: animatedValue,
  }),

  // Scale in
  scaleIn: (animatedValue) => ({
    transform: [{
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    }],
    opacity: animatedValue,
  }),
};

// Form animations
export const FormAnimations = {
  // Input focus animation
  inputFocus: (animatedValue) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false, // For border color changes
    });
  },

  // Input blur animation
  inputBlur: (animatedValue) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    });
  },

  // Validation error animation
  validationError: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]);
  },

  // Success validation animation
  validationSuccess: (animatedValue) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    });
  },
};

// Tab navigation animations
export const TabAnimations = {
  // Tab icon bounce
  tabIconBounce: (animatedValue) => {
    return Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]);
  },

  // Tab indicator slide
  tabIndicatorSlide: (animatedValue, targetPosition) => {
    return Animated.timing(animatedValue, {
      toValue: targetPosition,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
  },
};

// Utility functions
export const AnimationUtils = {
  // Create a sequence of animations
  createSequence: (animations) => {
    return Animated.sequence(animations);
  },

  // Create parallel animations
  createParallel: (animations, options = {}) => {
    return Animated.parallel(animations, options);
  },

  // Create a loop animation
  createLoop: (animation, options = {}) => {
    return Animated.loop(animation, options);
  },

  // Stagger animations
  stagger: (animations, delay = 100) => {
    return animations.map((animation, index) => 
      Animated.delay(index * delay, animation)
    );
  },

  // Create spring animation
  createSpring: (animatedValue, toValue, config = AnimationConfigs.SPRING_MEDIUM) => {
    return Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      ...config,
    });
  },

  // Create timing animation
  createTiming: (animatedValue, toValue, config = AnimationConfigs.NORMAL) => {
    return Animated.timing(animatedValue, {
      toValue,
      useNativeDriver: true,
      ...config,
    });
  },

  // Reset animation value
  reset: (animatedValue, toValue = 0) => {
    animatedValue.setValue(toValue);
  },

  // Stop all animations
  stop: (animatedValue) => {
    animatedValue.stopAnimation();
  },
};

// Pre-configured animation hooks
export const usePageTransition = (initialValue = 0) => {
  const animatedValue = createAnimationValue(initialValue);
  
  const enter = () => {
    AnimationUtils.reset(animatedValue, 0);
    return AnimationUtils.createTiming(animatedValue, 1);
  };

  const exit = () => {
    return AnimationUtils.createTiming(animatedValue, 0);
  };

  return {
    animatedValue,
    enter,
    exit,
    style: PageTransitions.slideFromRight(animatedValue),
  };
};

export const useMicroInteraction = () => {
  const scaleValue = createAnimationValue(1);
  
  const press = () => {
    return MicroInteractions.buttonPress(scaleValue);
  };

  const pressStyle = {
    transform: [{ scale: scaleValue }],
  };

  return {
    press,
    pressStyle,
  };
};

export const useListAnimation = (itemCount) => {
  const animatedValues = Array.from({ length: itemCount }, () => createAnimationValue(0));
  
  const animateIn = () => {
    const animations = animatedValues.map((value, index) => 
      Animated.delay(index * 100, AnimationUtils.createTiming(value, 1))
    );
    return AnimationUtils.createParallel(animations);
  };

  const getItemStyle = (index) => {
    return ListAnimations.staggeredEntrance(index, animatedValues[index]);
  };

  return {
    animateIn,
    getItemStyle,
  };
};

export default {
  AnimationConfigs,
  PageTransitions,
  MicroInteractions,
  ListAnimations,
  FormAnimations,
  TabAnimations,
  AnimationUtils,
  usePageTransition,
  useMicroInteraction,
  useListAnimation,
  createAnimationValue,
};
