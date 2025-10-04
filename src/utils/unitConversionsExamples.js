/**
 * Unit Conversions - Usage Examples
 * 
 * Demonstrates how to use the unit conversion utilities
 */

import {
  convertToGrams,
  convertFromGrams,
  convertWeight,
  convertToMilliliters,
  convertFromMilliliters,
  convertVolume,
  calculateCalories,
  normalizeToGrams,
  isValidWeightUnit,
  isValidVolumeUnit,
  getSupportedWeightUnits,
  getSupportedVolumeUnits,
  formatValue,
  roundTo,
} from './unitConversions';

// ==================== WEIGHT CONVERSION EXAMPLES ====================

export function weightConversionExamples() {
  console.log('=== Weight Conversion Examples ===\n');

  // Convert to grams (base unit for storage)
  console.log('Converting TO grams:');
  console.log(`100 lbs -> ${convertToGrams(100, 'lbs')} g`); // 45359.2 g
  console.log(`5 oz -> ${convertToGrams(5, 'oz')} g`); // 141.748 g
  console.log(`2 kg -> ${convertToGrams(2, 'kg')} g`); // 2000 g
  console.log(`50 g -> ${convertToGrams(50, 'g')} g`); // 50 g
  console.log('');

  // Convert from grams to other units
  console.log('Converting FROM grams:');
  console.log(`1000 g -> ${convertFromGrams(1000, 'kg')} kg`); // 1 kg
  console.log(`453.592 g -> ${convertFromGrams(453.592, 'lbs')} lbs`); // 1 lbs
  console.log(`28.35 g -> ${convertFromGrams(28.35, 'oz')} oz`); // 1 oz
  console.log('');

  // Direct conversion between units
  console.log('Direct conversions:');
  console.log(`10 lbs -> ${convertWeight(10, 'lbs', 'kg')} kg`); // 4.536 kg
  console.log(`500 g -> ${convertWeight(500, 'g', 'oz')} oz`); // 17.64 oz
  console.log('');
}

// ==================== VOLUME CONVERSION EXAMPLES ====================

export function volumeConversionExamples() {
  console.log('=== Volume Conversion Examples ===\n');

  // Convert to milliliters (base unit for storage)
  console.log('Converting TO milliliters:');
  console.log(`1 cup -> ${convertToMilliliters(1, 'cups')} ml`); // 236.588 ml
  console.log(`8 fl oz -> ${convertToMilliliters(8, 'fl oz')} ml`); // 236.588 ml
  console.log(`1 L -> ${convertToMilliliters(1, 'L')} ml`); // 1000 ml
  console.log(`100 ml -> ${convertToMilliliters(100, 'ml')} ml`); // 100 ml
  console.log('');

  // Convert from milliliters to other units
  console.log('Converting FROM milliliters:');
  console.log(`1000 ml -> ${convertFromMilliliters(1000, 'L')} L`); // 1 L
  console.log(`236.588 ml -> ${convertFromMilliliters(236.588, 'cups')} cups`); // 1 cup
  console.log(`29.5735 ml -> ${convertFromMilliliters(29.5735, 'fl oz')} fl oz`); // 1 fl oz
  console.log('');

  // Direct conversion between units
  console.log('Direct conversions:');
  console.log(`2 cups -> ${convertVolume(2, 'cups', 'ml')} ml`); // 473.176 ml
  console.log(`500 ml -> ${convertVolume(500, 'ml', 'cups')} cups`); // 2.11 cups
  console.log('');
}

// ==================== CALORIE CALCULATION EXAMPLES ====================

export function calorieCalculationExamples() {
  console.log('=== Calorie Calculation Examples ===\n');

  // Example 1: Chicken breast
  const chicken = {
    protein: 31, // grams
    carbs: 0,
    fats: 3.6,
  };
  const chickenCalories = calculateCalories(chicken.protein, chicken.carbs, chicken.fats);
  console.log(`Chicken breast (100g):`);
  console.log(`  Protein: ${chicken.protein}g * 4 = ${chicken.protein * 4} cal`);
  console.log(`  Carbs: ${chicken.carbs}g * 4 = ${chicken.carbs * 4} cal`);
  console.log(`  Fats: ${chicken.fats}g * 9 = ${chicken.fats * 9} cal`);
  console.log(`  Total: ${chickenCalories} calories\n`);

  // Example 2: Oatmeal
  const oatmeal = {
    protein: 5,
    carbs: 27,
    fats: 2.5,
  };
  const oatmealCalories = calculateCalories(oatmeal.protein, oatmeal.carbs, oatmeal.fats);
  console.log(`Oatmeal (1/2 cup dry):`);
  console.log(`  Total: ${oatmealCalories} calories\n`);

  // Example 3: Almonds
  const almonds = {
    protein: 6,
    carbs: 6,
    fats: 14,
  };
  const almondsCalories = calculateCalories(almonds.protein, almonds.carbs, almonds.fats);
  console.log(`Almonds (1 oz):`);
  console.log(`  Total: ${almondsCalories} calories\n`);
}

// ==================== MACRO NORMALIZATION EXAMPLES ====================

export function macroNormalizationExamples() {
  console.log('=== Macro Normalization Examples ===\n');

  // Weight-based measurements (most common)
  console.log('Weight-based normalization:');
  console.log(`30g protein powder -> ${normalizeToGrams(30, 'g', 'weight')} g stored`);
  console.log(`1oz cheese -> ${normalizeToGrams(1, 'oz', 'weight')} g stored`);
  console.log(`0.5 lbs ground beef -> ${normalizeToGrams(0.5, 'lbs', 'weight')} g stored`);
  console.log('');

  // Volume-based measurements (liquids, some powders)
  console.log('Volume-based normalization (assuming 1ml = 1g):');
  console.log(`1 cup milk -> ${normalizeToGrams(1, 'cups', 'volume')} g stored`);
  console.log(`250ml yogurt -> ${normalizeToGrams(250, 'ml', 'volume')} g stored`);
  console.log(`8 fl oz juice -> ${normalizeToGrams(8, 'fl oz', 'volume')} g stored`);
  console.log('');
}

// ==================== VALIDATION EXAMPLES ====================

export function validationExamples() {
  console.log('=== Validation Examples ===\n');

  // Check if units are valid
  console.log('Weight unit validation:');
  console.log(`"kg" is valid weight unit: ${isValidWeightUnit('kg')}`); // true
  console.log(`"pounds" is valid weight unit: ${isValidWeightUnit('pounds')}`); // true
  console.log(`"liters" is valid weight unit: ${isValidWeightUnit('liters')}`); // false
  console.log('');

  console.log('Volume unit validation:');
  console.log(`"ml" is valid volume unit: ${isValidVolumeUnit('ml')}`); // true
  console.log(`"cups" is valid volume unit: ${isValidVolumeUnit('cups')}`); // true
  console.log(`"grams" is valid volume unit: ${isValidVolumeUnit('grams')}`); // false
  console.log('');

  // Get supported units
  console.log('Supported units:');
  console.log(`Weight units: ${getSupportedWeightUnits().join(', ')}`);
  console.log(`Volume units: ${getSupportedVolumeUnits().join(', ')}`);
  console.log('');
}

// ==================== FORMATTING EXAMPLES ====================

export function formattingExamples() {
  console.log('=== Formatting Examples ===\n');

  const values = [0, 0.5, 1.234, 10.567, 100.89, 1234.5];

  console.log('Formatted values (auto decimal places):');
  values.forEach(val => {
    console.log(`${val} -> "${formatValue(val)}"`);
  });
  console.log('');

  console.log('Rounded values (2 decimal places):');
  values.forEach(val => {
    console.log(`${val} -> ${roundTo(val, 2)}`);
  });
  console.log('');
}

// ==================== REAL-WORLD USE CASE ====================

export function realWorldExample() {
  console.log('=== Real-World Example: Meal Entry ===\n');

  // User enters a meal with mixed units
  const mealEntry = {
    name: 'Breakfast Bowl',
    ingredients: [
      { name: 'Oatmeal', amount: 0.5, unit: 'cups', protein: 5, carbs: 27, fats: 2.5 },
      { name: 'Milk', amount: 1, unit: 'cups', protein: 8, carbs: 12, fats: 2.4 },
      { name: 'Banana', amount: 1, unit: 'item', protein: 1.3, carbs: 27, fats: 0.4 },
      { name: 'Almonds', amount: 1, unit: 'oz', protein: 6, carbs: 6, fats: 14 },
    ]
  };

  console.log(`Meal: ${mealEntry.name}\n`);

  // Calculate totals
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;

  mealEntry.ingredients.forEach(ingredient => {
    console.log(`${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`);
    totalProtein += ingredient.protein;
    totalCarbs += ingredient.carbs;
    totalFats += ingredient.fats;
  });

  const totalCalories = calculateCalories(totalProtein, totalCarbs, totalFats);

  console.log('\nMeal Totals:');
  console.log(`Protein: ${roundTo(totalProtein, 1)}g`);
  console.log(`Carbs: ${roundTo(totalCarbs, 1)}g`);
  console.log(`Fats: ${roundTo(totalFats, 1)}g`);
  console.log(`Calories: ${totalCalories} kcal`);
  console.log('');
}

// ==================== ERROR HANDLING EXAMPLES ====================

export function errorHandlingExamples() {
  console.log('=== Error Handling Examples ===\n');

  try {
    convertToGrams(100, 'invalid_unit');
  } catch (error) {
    console.log(`❌ Error caught: ${error.message}`);
  }

  try {
    convertToGrams(-50, 'g');
  } catch (error) {
    console.log(`❌ Error caught: ${error.message}`);
  }

  try {
    convertToGrams('not a number', 'kg');
  } catch (error) {
    console.log(`❌ Error caught: ${error.message}`);
  }

  try {
    calculateCalories(30, -10, 5);
  } catch (error) {
    console.log(`❌ Error caught: ${error.message}`);
  }

  console.log('');
}

// ==================== RUN ALL EXAMPLES ====================

export function runAllExamples() {
  weightConversionExamples();
  volumeConversionExamples();
  calorieCalculationExamples();
  macroNormalizationExamples();
  validationExamples();
  formattingExamples();
  realWorldExample();
  errorHandlingExamples();
}

// Uncomment to run examples:
// runAllExamples();

