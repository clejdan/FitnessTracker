import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Workout Screens
import WorkoutCalendarScreen from '../screens/workout/WorkoutCalendarScreen';
import WorkoutDayScreen from '../screens/workout/WorkoutDayScreen';
import AddWorkoutScreen from '../screens/workout/AddWorkoutScreen';

// Nutrition Screens
import NutritionCalendarScreen from '../screens/nutrition/NutritionCalendarScreen';
import NutritionDayScreen from '../screens/nutrition/NutritionDayScreen';
import AddMealScreen from '../screens/nutrition/AddMealScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import CalorieGoalScreen from '../screens/profile/CalorieGoalScreen';

const Tab = createBottomTabNavigator();
const WorkoutStack = createStackNavigator();
const NutritionStack = createStackNavigator();
const ProfileStack = createStackNavigator();

// Workout Stack Navigator
function WorkoutStackNavigator() {
  return (
    <WorkoutStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#00ff88',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <WorkoutStack.Screen 
        name="WorkoutCalendar" 
        component={WorkoutCalendarScreen}
        options={{ title: 'Workout Calendar' }}
      />
      <WorkoutStack.Screen 
        name="WorkoutDay" 
        component={WorkoutDayScreen}
        options={{ title: 'Workout Day' }}
      />
      <WorkoutStack.Screen 
        name="AddWorkout" 
        component={AddWorkoutScreen}
        options={{ title: 'Add Workout' }}
      />
    </WorkoutStack.Navigator>
  );
}

// Nutrition Stack Navigator
function NutritionStackNavigator() {
  return (
    <NutritionStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#4CAF50',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <NutritionStack.Screen 
        name="NutritionCalendar" 
        component={NutritionCalendarScreen}
        options={{ title: 'Nutrition Calendar' }}
      />
      <NutritionStack.Screen 
        name="NutritionDay" 
        component={NutritionDayScreen}
        options={{ title: 'Nutrition Day' }}
      />
      <NutritionStack.Screen 
        name="AddMeal" 
        component={AddMealScreen}
        options={{ title: 'Add Meal' }}
      />
    </NutritionStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#2196F3',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen 
        name="CalorieGoal" 
        component={CalorieGoalScreen}
        options={{ title: 'Calorie Goal' }}
      />
    </ProfileStack.Navigator>
  );
}

// Main Bottom Tab Navigator
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'nutrition' : 'nutrition-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: route.name === 'Workout' ? '#00ff88' : 
                              route.name === 'Nutrition' ? '#4CAF50' : '#2196F3',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: route.name === 'Workout' ? '#1a1a1a' : '#ffffff',
          borderTopColor: route.name === 'Workout' ? '#2a2a2a' : '#e0e0e0',
        },
      })}
    >
      <Tab.Screen 
        name="Workout" 
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: 'Workout',
        }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionStackNavigator}
        options={{
          tabBarLabel: 'Nutrition',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

