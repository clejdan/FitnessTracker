import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { getMeals } from '../services/storageService';
import { calculateCalories } from '../utils/unitConversions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = Math.min(SCREEN_WIDTH - 80, 200);
const RADIUS = (CHART_SIZE - 40) / 2;
const CENTER = CHART_SIZE / 2;

const MACRO_COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4', 
  fat: '#45B7D1',
  empty: '#E0E0E0'
};

const MACRO_LABELS = {
  protein: 'Protein',
  carbs: 'Carbs',
  fat: 'Fat'
};

export default function MacroPieChart({ date, showTargets = true, compact = false }) {
  const [macroData, setMacroData] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    total: 0
  });
  const [targetMacros, setTargetMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMacroData();
  }, [date]);

  const loadMacroData = async () => {
    try {
      setLoading(true);
      const dateString = date || new Date().toISOString().split('T')[0];
      const meals = await getMeals(dateString);
      
      // Calculate totals
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      meals.forEach(meal => {
        totalProtein += parseFloat(meal.protein) || 0;
        totalCarbs += parseFloat(meal.carbs) || 0;
        totalFat += parseFloat(meal.fat) || 0;
      });
      
      const totalCalories = calculateCalories(totalProtein, totalCarbs, totalFat);
      
      setMacroData({
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        total: totalCalories
      });

      // Calculate target macros (assuming 2000 cal goal with 30% protein, 40% carbs, 30% fat)
      const targetCalories = 2000; // This could be dynamic based on user's goal
      const targetProtein = (targetCalories * 0.30) / 4; // 4 cal/g protein
      const targetCarbs = (targetCalories * 0.40) / 4;   // 4 cal/g carbs
      const targetFat = (targetCalories * 0.30) / 9;     // 9 cal/g fat
      
      setTargetMacros({
        protein: targetProtein,
        carbs: targetCarbs,
        fat: targetFat,
        total: targetCalories
      });
    } catch (error) {
      console.error('Error loading macro data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMacroPercentages = () => {
    const total = macroData.protein + macroData.carbs + macroData.fat;
    if (total === 0) {
      return {
        protein: 0,
        carbs: 0,
        fat: 0,
        empty: 100
      };
    }
    
    return {
      protein: (macroData.protein / total) * 100,
      carbs: (macroData.carbs / total) * 100,
      fat: (macroData.fat / total) * 100,
      empty: 0
    };
  };

  const generatePieSegments = () => {
    const percentages = calculateMacroPercentages();
    const segments = [];
    let currentAngle = 0;
    
    const macros = [
      { key: 'protein', percentage: percentages.protein },
      { key: 'carbs', percentage: percentages.carbs },
      { key: 'fat', percentage: percentages.fat }
    ];
    
    macros.forEach(macro => {
      if (macro.percentage > 0) {
        const angle = (macro.percentage / 100) * 360;
        
        segments.push({
          key: macro.key,
          percentage: macro.percentage,
          startAngle: currentAngle,
          endAngle: currentAngle + angle,
          color: MACRO_COLORS[macro.key]
        });
        
        currentAngle += angle;
      }
    });
    
    // Add empty segment if no data
    if (percentages.empty > 0) {
      segments.push({
        key: 'empty',
        percentage: percentages.empty,
        startAngle: currentAngle,
        endAngle: currentAngle + (percentages.empty / 100) * 360,
        color: MACRO_COLORS.empty
      });
    }
    
    return segments;
  };

  const getMacroProgress = (macro) => {
    const target = targetMacros[macro];
    const actual = macroData[macro];
    return target > 0 ? Math.min(100, (actual / target) * 100) : 0;
  };

  if (loading) {
    return (
      <Card style={[styles.card, compact && styles.compactCard]}>
        <Card.Content style={styles.loadingContent}>
          <Text>Loading macro data...</Text>
        </Card.Content>
      </Card>
    );
  }

  const percentages = calculateMacroPercentages();
  const hasData = macroData.total > 0;

  return (
    <Card style={[styles.card, compact && styles.compactCard]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Macros</Text>
          {date && (
            <Text style={styles.dateText}>
              {new Date(date).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View style={styles.chartContainer}>
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChart}>
              {/* Circular progress indicators for each macro */}
              {['protein', 'carbs', 'fat'].map((macro, index) => {
                const percentage = percentages[macro];
                const angle = (percentage / 100) * 360;
                const isVisible = percentage > 0;
                
                return (
                  <View
                    key={macro}
                    style={[
                      styles.macroCircle,
                      {
                        backgroundColor: isVisible ? MACRO_COLORS[macro] : 'transparent',
                        opacity: isVisible ? 0.8 : 0,
                        transform: [{ rotate: `${index * 120}deg` }],
                      }
                    ]}
                  />
                );
              })}
              
              {/* Center circle for calories display */}
              <View style={styles.centerCircle}>
                <Text style={styles.calorieValue}>{Math.round(macroData.total)}</Text>
                <Text style={styles.calorieLabel}>calories</Text>
              </View>
            </View>
          </View>
          
          {/* Macro breakdown below the chart */}
          <View style={styles.macroBreakdown}>
            {['protein', 'carbs', 'fat'].map(macro => (
              <View key={macro} style={styles.macroItem}>
                <View style={[styles.macroDot, { backgroundColor: MACRO_COLORS[macro] }]} />
                <Text style={styles.macroName}>{MACRO_LABELS[macro]}</Text>
                <Text style={styles.macroAmount}>{Math.round(macroData[macro])}g</Text>
                <Text style={styles.macroPercent}>({Math.round(percentages[macro])}%)</Text>
              </View>
            ))}
          </View>
        </View>

        {!compact && (
          <View style={styles.legendContainer}>
            {['protein', 'carbs', 'fat'].map(macro => {
              const actual = macroData[macro];
              const target = targetMacros[macro];
              const progress = getMacroProgress(macro);
              
              return (
                <View key={macro} style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View 
                      style={[
                        styles.legendColor, 
                        { backgroundColor: MACRO_COLORS[macro] }
                      ]} 
                    />
                    <Text style={styles.legendLabel}>
                      {MACRO_LABELS[macro]}
                    </Text>
                  </View>
                  
                  <View style={styles.legendRight}>
                    <Text style={styles.legendValue}>
                      {Math.round(actual)}g
                    </Text>
                    {showTargets && (
                      <Text style={styles.legendTarget}>
                        / {Math.round(target)}g
                      </Text>
                    )}
                    <Text style={styles.legendPercentage}>
                      ({Math.round(progress)}%)
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {compact && (
          <View style={styles.compactLegend}>
            {['protein', 'carbs', 'fat'].map(macro => (
              <Chip
                key={macro}
                style={[
                  styles.compactChip,
                  { backgroundColor: MACRO_COLORS[macro] + '20' }
                ]}
                textStyle={[
                  styles.compactChipText,
                  { color: MACRO_COLORS[macro] }
                ]}
              >
                {MACRO_LABELS[macro]}: {Math.round(macroData[macro])}g
              </Chip>
            ))}
          </View>
        )}

        {!hasData && (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              No meals logged for this day
            </Text>
            <Text style={styles.noDataSubtext}>
              Add meals to see your macro breakdown
            </Text>
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
  compactCard: {
    marginBottom: 8,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCircle: {
    position: 'absolute',
    width: CHART_SIZE * 0.8,
    height: CHART_SIZE * 0.8,
    borderRadius: (CHART_SIZE * 0.8) / 2,
    borderWidth: 8,
    borderColor: 'transparent',
  },
  centerCircle: {
    position: 'absolute',
    width: CHART_SIZE * 0.6,
    height: CHART_SIZE * 0.6,
    borderRadius: (CHART_SIZE * 0.6) / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  macroBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  macroAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  macroPercent: {
    fontSize: 10,
    color: '#666',
  },
  legendContainer: {
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  legendTarget: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  legendPercentage: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  compactLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  compactChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  compactChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
  },
});
