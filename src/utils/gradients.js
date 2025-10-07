import { LinearGradient } from 'expo-linear-gradient';

// Common gradient configurations for the app
export const GradientTypes = {
  // Workout theme gradients (dark with green accents)
  WORKOUT_CARD: ['#2a2a2a', '#1f1f1f'],
  WORKOUT_BUTTON: ['#00ff88', '#00cc6a'],
  WORKOUT_FAB: ['#00ff88', '#00cc6a'],
  
  // Nutrition theme gradients (light with green accents)
  NUTRITION_CARD: ['#ffffff', '#f8f9fa'],
  NUTRITION_BUTTON: ['#4CAF50', '#45a049'],
  
  // Profile theme gradients (light with blue accents)
  PROFILE_CARD: ['#ffffff', '#f8f9fa'],
  PROFILE_BUTTON: ['#2196F3', '#1976D2'],
  
  // Common gradients
  SUCCESS: ['#4CAF50', '#45a049'],
  WARNING: ['#FF9800', '#F57C00'],
  ERROR: ['#FF5252', '#E53935'],
  INFO: ['#2196F3', '#1976D2'],
};

// Gradient component factory
export const createGradient = (type, style = {}) => {
  const colors = GradientTypes[type] || GradientTypes.INFO;
  
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    />
  );
};

// Pre-configured gradient components
export const WorkoutCardGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.WORKOUT_CARD}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const WorkoutButtonGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.WORKOUT_BUTTON}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const NutritionCardGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.NUTRITION_CARD}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const ProfileCardGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.PROFILE_CARD}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const SuccessGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.SUCCESS}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const WarningGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.WARNING}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);

export const ErrorGradient = ({ children, style }) => (
  <LinearGradient
    colors={GradientTypes.ERROR}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={style}
  >
    {children}
  </LinearGradient>
);
