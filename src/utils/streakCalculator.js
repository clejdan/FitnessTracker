import { format, parseISO, isToday, isYesterday, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { getMeals, getCalorieGoal } from '../services/storageService';
import { calculateCalories } from './unitConversions';

/**
 * Calculate daily calorie totals for a date range
 */
export async function getDailyCalorieTotals(startDate, endDate) {
  const totals = {};
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    try {
      const meals = await getMeals(dateString);
      const totalCalories = meals.reduce((sum, meal) => {
        return sum + calculateCalories(meal.protein, meal.carbs, meal.fat);
      }, 0);
      
      totals[dateString] = {
        date: dateString,
        calories: totalCalories,
        mealCount: meals.length,
        hasData: meals.length > 0
      };
    } catch (error) {
      console.error(`Error getting meals for ${dateString}:`, error);
      totals[dateString] = {
        date: dateString,
        calories: 0,
        mealCount: 0,
        hasData: false
      };
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return totals;
}

/**
 * Calculate current streak and streak statistics
 */
export async function calculateStreakStats() {
  try {
    const calorieGoal = await getCalorieGoal();
    if (!calorieGoal) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysHit: 0,
        totalDaysTracked: 0,
        streakStartDate: null,
        lastHitDate: null,
        isActive: false,
        milestone: null
      };
    }

    const goal = calorieGoal.finalGoal;
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily totals for the last 30 days
    const dailyTotals = await getDailyCalorieTotals(thirtyDaysAgo, today);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let totalDaysHit = 0;
    let totalDaysTracked = 0;
    let streakStartDate = null;
    let lastHitDate = null;
    let isActive = false;

    // Sort dates in descending order (most recent first)
    const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(b) - new Date(a));
    
    for (const dateString of sortedDates) {
      const dayData = dailyTotals[dateString];
      const date = parseISO(dateString);
      
      if (dayData.hasData) {
        totalDaysTracked++;
        
        // Check if goal was hit (within 100 calories tolerance)
        const goalHit = Math.abs(dayData.calories - goal) <= 100;
        
        if (goalHit) {
          totalDaysHit++;
          lastHitDate = lastHitDate || dateString;
          
          // If this is today or yesterday, continue the streak
          if (isToday(date) || isYesterday(date)) {
            if (currentStreak === 0) {
              streakStartDate = dateString;
            }
            currentStreak++;
            isActive = true;
          } else if (currentStreak > 0) {
            // If we have an active streak and this day hit the goal, continue it
            currentStreak++;
            if (!streakStartDate) {
              streakStartDate = dateString;
            }
          }
          
          tempStreak++;
        } else {
          // Goal not hit - reset temp streak
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
          
          // If this is today and goal not hit, streak is broken
          if (isToday(date)) {
            isActive = false;
            currentStreak = 0;
            streakStartDate = null;
          }
        }
      }
    }
    
    // Check if temp streak is the longest
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    // Calculate milestone
    const milestone = getStreakMilestone(currentStreak);

    return {
      currentStreak,
      longestStreak,
      totalDaysHit,
      totalDaysTracked,
      streakStartDate,
      lastHitDate,
      isActive,
      milestone,
      goal,
      successRate: totalDaysTracked > 0 ? Math.round((totalDaysHit / totalDaysTracked) * 100) : 0
    };
  } catch (error) {
    console.error('Error calculating streak stats:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysHit: 0,
      totalDaysTracked: 0,
      streakStartDate: null,
      lastHitDate: null,
      isActive: false,
      milestone: null,
      successRate: 0
    };
  }
}

/**
 * Get milestone information for current streak
 */
export function getStreakMilestone(streak) {
  const milestones = [
    { days: 1, title: "Getting Started", emoji: "🌱", message: "Great start! Keep it up!" },
    { days: 3, title: "Building Momentum", emoji: "🔥", message: "You're on fire! 3 days strong!" },
    { days: 7, title: "One Week Warrior", emoji: "💪", message: "Amazing! One full week!" },
    { days: 14, title: "Two Week Champion", emoji: "🏆", message: "Incredible dedication!" },
    { days: 21, title: "Habit Formed", emoji: "🎯", message: "You've built a solid habit!" },
    { days: 30, title: "Monthly Master", emoji: "👑", message: "A full month! You're unstoppable!" },
    { days: 60, title: "Two Month Legend", emoji: "🌟", message: "Legendary consistency!" },
    { days: 90, title: "Quarterly Queen/King", emoji: "💎", message: "Three months! You're a fitness royalty!" },
    { days: 100, title: "Century Club", emoji: "💯", message: "100 days! You're in the century club!" },
    { days: 365, title: "Yearly Yogi", emoji: "🎊", message: "A full year! You're a fitness legend!" }
  ];

  // Find the highest milestone achieved
  let achievedMilestone = null;
  for (const milestone of milestones) {
    if (streak >= milestone.days) {
      achievedMilestone = milestone;
    } else {
      break;
    }
  }

  // Find the next milestone
  let nextMilestone = null;
  for (const milestone of milestones) {
    if (streak < milestone.days) {
      nextMilestone = milestone;
      break;
    }
  }

  return {
    achieved: achievedMilestone,
    next: nextMilestone,
    daysToNext: nextMilestone ? nextMilestone.days - streak : null
  };
}

/**
 * Get streak motivation message
 */
export function getStreakMotivation(streak, isActive) {
  if (!isActive) {
    return {
      title: "Start Your Streak!",
      message: "Log your first meal to begin your calorie goal streak!",
      emoji: "🚀",
      color: "#FFA726"
    };
  }

  if (streak === 1) {
    return {
      title: "Day 1 Complete!",
      message: "Great start! Keep logging to build your streak!",
      emoji: "🌱",
      color: "#4CAF50"
    };
  }

  if (streak < 7) {
    return {
      title: `${streak} Days Strong!`,
      message: "You're building momentum! Keep it up!",
      emoji: "🔥",
      color: "#FF7043"
    };
  }

  if (streak < 30) {
    return {
      title: `${streak} Day Streak!`,
      message: "Amazing consistency! You're forming great habits!",
      emoji: "💪",
      color: "#2196F3"
    };
  }

  return {
    title: `${streak} Day Streak!`,
    message: "Incredible dedication! You're a fitness legend!",
    emoji: "👑",
    color: "#9C27B0"
  };
}

/**
 * Check if today's goal has been hit
 */
export async function checkTodaysGoal() {
  try {
    const calorieGoal = await getCalorieGoal();
    if (!calorieGoal) return { hit: false, calories: 0, goal: 0, remaining: 0 };

    const today = format(new Date(), 'yyyy-MM-dd');
    const meals = await getMeals(today);
    const totalCalories = meals.reduce((sum, meal) => {
      return sum + calculateCalories(meal.protein, meal.carbs, meal.fat);
    }, 0);

    const goal = calorieGoal.finalGoal;
    const hit = Math.abs(totalCalories - goal) <= 100;
    const remaining = Math.max(0, goal - totalCalories);

    return {
      hit,
      calories: totalCalories,
      goal,
      remaining,
      progress: Math.min(100, (totalCalories / goal) * 100)
    };
  } catch (error) {
    console.error('Error checking today\'s goal:', error);
    return { hit: false, calories: 0, goal: 0, remaining: 0, progress: 0 };
  }
}
