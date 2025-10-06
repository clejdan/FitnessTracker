/**
 * Unit Conversions Utility
 * 
 * Provides conversion functions for weight, volume, and calorie calculations
 * Used throughout the nutrition tracking features
 */

// ==================== CONVERSION CONSTANTS ====================

// Weight Conversions (to grams)
export const WEIGHT_TO_GRAMS = {
  g: 1,
  grams: 1,
  oz: 28.3495,
  ounces: 28.3495,
  lbs: 453.592,
  pounds: 453.592,
  kg: 1000,
  kilograms: 1000,
};

// Volume Conversions (to milliliters)
export const VOLUME_TO_ML = {
  ml: 1,
  milliliters: 1,
  'fl oz': 29.5735,
  'fluid ounces': 29.5735,
  cups: 236.588,
  cup: 236.588,
  L: 1000,
  liters: 1000,
  liter: 1000,
};

// Calorie Constants
export const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fats: 9,
};

// Common unit aliases
const WEIGHT_UNIT_ALIASES = {
  gram: 'g',
  grams: 'g',
  ounce: 'oz',
  ounces: 'oz',
  pound: 'lbs',
  pounds: 'lbs',
  lb: 'lbs',
  kilogram: 'kg',
  kilograms: 'kg',
};

const VOLUME_UNIT_ALIASES = {
  milliliter: 'ml',
  milliliters: 'ml',
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  floz: 'fl oz',
  cup: 'cups',
  liter: 'L',
  liters: 'L',
};

// ==================== WEIGHT CONVERSIONS ====================

/**
 * Convert any weight unit to grams (base unit for storage)
 * @param {number} value - The value to convert
 * @param {string} fromUnit - The unit to convert from (g, oz, lbs, kg)
 * @returns {number} - Value in grams
 * @throws {Error} - If unit is invalid
 */
export function convertToGrams(value, fromUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  // Normalize unit string
  const normalizedUnit = WEIGHT_UNIT_ALIASES[fromUnit.toLowerCase()] || fromUnit.toLowerCase();

  const conversionFactor = WEIGHT_TO_GRAMS[normalizedUnit];
  
  if (conversionFactor === undefined) {
    throw new Error(`Invalid weight unit: ${fromUnit}. Supported units: g, oz, lbs, kg`);
  }

  const result = value * conversionFactor;
  console.log(`Weight conversion: ${value} ${fromUnit} = ${result.toFixed(2)} grams`);
  
  return result;
}

/**
 * Convert grams to any weight unit
 * @param {number} value - Value in grams
 * @param {string} toUnit - The unit to convert to (g, oz, lbs, kg)
 * @returns {number} - Value in target unit
 * @throws {Error} - If unit is invalid
 */
export function convertFromGrams(value, toUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  // Normalize unit string
  const normalizedUnit = WEIGHT_UNIT_ALIASES[toUnit.toLowerCase()] || toUnit.toLowerCase();

  const conversionFactor = WEIGHT_TO_GRAMS[normalizedUnit];
  
  if (conversionFactor === undefined) {
    throw new Error(`Invalid weight unit: ${toUnit}. Supported units: g, oz, lbs, kg`);
  }

  const result = value / conversionFactor;
  console.log(`Weight conversion: ${value} grams = ${result.toFixed(2)} ${toUnit}`);
  
  return result;
}

/**
 * Convert between any two weight units
 * @param {number} value - The value to convert
 * @param {string} fromUnit - The unit to convert from
 * @param {string} toUnit - The unit to convert to
 * @returns {number} - Value in target unit
 */
export function convertWeight(value, fromUnit, toUnit) {
  const grams = convertToGrams(value, fromUnit);
  return convertFromGrams(grams, toUnit);
}

// ==================== VOLUME CONVERSIONS ====================

/**
 * Convert any volume unit to milliliters (base unit for storage)
 * @param {number} value - The value to convert
 * @param {string} fromUnit - The unit to convert from (ml, fl oz, cups, L)
 * @returns {number} - Value in milliliters
 * @throws {Error} - If unit is invalid
 */
export function convertToMilliliters(value, fromUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  // Normalize unit string
  const normalizedUnit = VOLUME_UNIT_ALIASES[fromUnit.toLowerCase()] || fromUnit.toLowerCase();

  const conversionFactor = VOLUME_TO_ML[normalizedUnit];
  
  if (conversionFactor === undefined) {
    throw new Error(`Invalid volume unit: ${fromUnit}. Supported units: ml, fl oz, cups, L`);
  }

  const result = value * conversionFactor;
  console.log(`Volume conversion: ${value} ${fromUnit} = ${result.toFixed(2)} ml`);
  
  return result;
}

/**
 * Convert milliliters to any volume unit
 * @param {number} value - Value in milliliters
 * @param {string} toUnit - The unit to convert to (ml, fl oz, cups, L)
 * @returns {number} - Value in target unit
 * @throws {Error} - If unit is invalid
 */
export function convertFromMilliliters(value, toUnit) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  // Normalize unit string
  const normalizedUnit = VOLUME_UNIT_ALIASES[toUnit.toLowerCase()] || toUnit.toLowerCase();

  const conversionFactor = VOLUME_TO_ML[normalizedUnit];
  
  if (conversionFactor === undefined) {
    throw new Error(`Invalid volume unit: ${toUnit}. Supported units: ml, fl oz, cups, L`);
  }

  const result = value / conversionFactor;
  console.log(`Volume conversion: ${value} ml = ${result.toFixed(2)} ${toUnit}`);
  
  return result;
}

/**
 * Convert between any two volume units
 * @param {number} value - The value to convert
 * @param {string} fromUnit - The unit to convert from
 * @param {string} toUnit - The unit to convert to
 * @returns {number} - Value in target unit
 */
export function convertVolume(value, fromUnit, toUnit) {
  const ml = convertToMilliliters(value, fromUnit);
  return convertFromMilliliters(ml, toUnit);
}

// ==================== CALORIE CALCULATION ====================

/**
 * Calculate total calories from macronutrients
 * @param {number} protein - Protein in grams
 * @param {number} carbs - Carbohydrates in grams
 * @param {number} fats - Fats in grams
 * @returns {number} - Total calories (rounded to nearest integer)
 * @throws {Error} - If any value is invalid
 */
export function calculateCalories(protein, carbs, fats) {
  // Validate inputs
  if (typeof protein !== 'number' || isNaN(protein) || protein < 0) {
    throw new Error('Protein must be a non-negative number');
  }
  if (typeof carbs !== 'number' || isNaN(carbs) || carbs < 0) {
    throw new Error('Carbs must be a non-negative number');
  }
  if (typeof fats !== 'number' || isNaN(fats) || fats < 0) {
    throw new Error('Fats must be a non-negative number');
  }

  const proteinCalories = protein * CALORIES_PER_GRAM.protein;
  const carbCalories = carbs * CALORIES_PER_GRAM.carbs;
  const fatCalories = fats * CALORIES_PER_GRAM.fats;

  const totalCalories = proteinCalories + carbCalories + fatCalories;

  console.log(`Calorie calculation: P:${protein}g (${proteinCalories}cal) + C:${carbs}g (${carbCalories}cal) + F:${fats}g (${fatCalories}cal) = ${Math.round(totalCalories)}cal`);

  return Math.round(totalCalories);
}

/**
 * Calculate protein calories only
 * @param {number} protein - Protein in grams
 * @returns {number} - Protein calories
 */
export function calculateProteinCalories(protein) {
  return protein * CALORIES_PER_GRAM.protein;
}

/**
 * Calculate carb calories only
 * @param {number} carbs - Carbs in grams
 * @returns {number} - Carb calories
 */
export function calculateCarbCalories(carbs) {
  return carbs * CALORIES_PER_GRAM.carbs;
}

/**
 * Calculate fat calories only
 * @param {number} fats - Fats in grams
 * @returns {number} - Fat calories
 */
export function calculateFatCalories(fats) {
  return fats * CALORIES_PER_GRAM.fats;
}

// ==================== MACRO NORMALIZATION ====================

/**
 * Normalize any macro measurement to grams for storage
 * Handles both weight and volume measurements
 * @param {number} value - The value to normalize
 * @param {string} unit - The unit of measurement
 * @param {string} type - "weight" or "volume"
 * @returns {number} - Value in grams
 * @throws {Error} - If parameters are invalid
 */
export function normalizeToGrams(value, unit, type = 'weight') {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Value must be a valid number');
  }

  if (value < 0) {
    throw new Error('Value cannot be negative');
  }

  const normalizedType = type.toLowerCase();

  if (normalizedType === 'weight') {
    return convertToGrams(value, unit);
  } else if (normalizedType === 'volume') {
    // For volume measurements, we assume density of 1 (1ml = 1g)
    // This is a simplification but works reasonably for most food items
    const ml = convertToMilliliters(value, unit);
    console.log(`Volume to weight: assuming 1ml = 1g density`);
    return ml; // Simplified: 1ml = 1g
  } else {
    throw new Error(`Invalid type: ${type}. Must be "weight" or "volume"`);
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if a unit is a valid weight unit
 * @param {string} unit - Unit to check
 * @returns {boolean}
 */
export function isValidWeightUnit(unit) {
  const normalizedUnit = WEIGHT_UNIT_ALIASES[unit.toLowerCase()] || unit.toLowerCase();
  return WEIGHT_TO_GRAMS[normalizedUnit] !== undefined;
}

/**
 * Check if a unit is a valid volume unit
 * @param {string} unit - Unit to check
 * @returns {boolean}
 */
export function isValidVolumeUnit(unit) {
  const normalizedUnit = VOLUME_UNIT_ALIASES[unit.toLowerCase()] || unit.toLowerCase();
  return VOLUME_TO_ML[normalizedUnit] !== undefined;
}

/**
 * Get all supported weight units
 * @returns {Array<string>}
 */
export function getSupportedWeightUnits() {
  return ['g', 'oz', 'lbs', 'kg'];
}

/**
 * Get all supported volume units
 * @returns {Array<string>}
 */
export function getSupportedVolumeUnits() {
  return ['ml', 'fl oz', 'cups', 'L'];
}

/**
 * Format a number for display with appropriate decimal places
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string}
 */
export function formatValue(value, decimals = 1) {
  if (value === 0) return '0';
  if (value >= 100) return Math.round(value).toString();
  return value.toFixed(decimals);
}

/**
 * Round to specified decimal places
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number}
 */
export function roundTo(value, decimals = 2) {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// ==================== EXPORTS ====================

export default {
  // Weight conversions
  convertToGrams,
  convertFromGrams,
  convertWeight,
  
  // Volume conversions
  convertToMilliliters,
  convertFromMilliliters,
  convertVolume,
  
  // Calorie calculations
  calculateCalories,
  calculateProteinCalories,
  calculateCarbCalories,
  calculateFatCalories,
  
  // Macro normalization
  normalizeToGrams,
  
  // Utilities
  isValidWeightUnit,
  isValidVolumeUnit,
  getSupportedWeightUnits,
  getSupportedVolumeUnits,
  formatValue,
  roundTo,
  
  // Constants
  WEIGHT_TO_GRAMS,
  VOLUME_TO_ML,
  CALORIES_PER_GRAM,
};


