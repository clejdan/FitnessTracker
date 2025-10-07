// Enhanced form validation utilities with real-time feedback

export const ValidationTypes = {
  REQUIRED: 'required',
  EMAIL: 'email',
  NUMBER: 'number',
  POSITIVE_NUMBER: 'positive_number',
  RANGE: 'range',
  MIN_LENGTH: 'min_length',
  MAX_LENGTH: 'max_length',
  CUSTOM: 'custom',
};

export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  number: 'Please enter a valid number',
  positive_number: 'Please enter a positive number',
  min_length: (min) => `Must be at least ${min} characters`,
  max_length: (max) => `Must be no more than ${max} characters`,
  range: (min, max) => `Must be between ${min} and ${max}`,
  custom: (message) => message,
};

// Real-time validation rules
export const ValidationRules = {
  // Workout validation
  exerciseName: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.MIN_LENGTH, value: 2 },
    { type: ValidationTypes.MAX_LENGTH, value: 50 },
  ],
  reps: [
    { type: ValidationTypes.NUMBER },
    { type: ValidationTypes.RANGE, min: 1, max: 50 },
  ],
  rir: [
    { type: ValidationTypes.NUMBER },
    { type: ValidationTypes.RANGE, min: 0, max: 15 },
  ],
  weight: [
    { type: ValidationTypes.POSITIVE_NUMBER },
    { type: ValidationTypes.RANGE, min: 0, max: 1000 },
  ],
  
  // Nutrition validation
  mealName: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.MIN_LENGTH, value: 2 },
    { type: ValidationTypes.MAX_LENGTH, value: 50 },
  ],
  protein: [
    { type: ValidationTypes.POSITIVE_NUMBER },
    { type: ValidationTypes.RANGE, min: 0, max: 500 },
  ],
  carbs: [
    { type: ValidationTypes.POSITIVE_NUMBER },
    { type: ValidationTypes.RANGE, min: 0, max: 1000 },
  ],
  fats: [
    { type: ValidationTypes.POSITIVE_NUMBER },
    { type: ValidationTypes.RANGE, min: 0, max: 500 },
  ],
  
  // Profile validation
  height: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.POSITIVE_NUMBER },
  ],
  weight: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.POSITIVE_NUMBER },
  ],
  age: [
    { type: ValidationTypes.REQUIRED },
    { type: ValidationTypes.NUMBER },
    { type: ValidationTypes.RANGE, min: 13, max: 120 },
  ],
  gender: [
    { type: ValidationTypes.REQUIRED },
  ],
  activityLevel: [
    { type: ValidationTypes.REQUIRED },
  ],
};

// Validate a single field
export const validateField = (fieldName, value, rules = null) => {
  const fieldRules = rules || ValidationRules[fieldName] || [];
  const errors = [];

  for (const rule of fieldRules) {
    const error = validateRule(value, rule);
    if (error) {
      errors.push(error);
      break; // Return first error
    }
  }

  return errors[0] || null;
};

// Validate a single rule
export const validateRule = (value, rule) => {
  switch (rule.type) {
    case ValidationTypes.REQUIRED:
      if (!value || (typeof value === 'string' && !value.trim())) {
        return ValidationMessages.required;
      }
      break;

    case ValidationTypes.EMAIL:
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return ValidationMessages.email;
      }
      break;

    case ValidationTypes.NUMBER:
      if (value && isNaN(parseFloat(value))) {
        return ValidationMessages.number;
      }
      break;

    case ValidationTypes.POSITIVE_NUMBER:
      const num = parseFloat(value);
      if (value && (isNaN(num) || num < 0)) {
        return ValidationMessages.positive_number;
      }
      break;

    case ValidationTypes.RANGE:
      const rangeNum = parseFloat(value);
      if (value && !isNaN(rangeNum)) {
        if (rangeNum < rule.min || rangeNum > rule.max) {
          return ValidationMessages.range(rule.min, rule.max);
        }
      }
      break;

    case ValidationTypes.MIN_LENGTH:
      if (value && value.length < rule.value) {
        return ValidationMessages.min_length(rule.value);
      }
      break;

    case ValidationTypes.MAX_LENGTH:
      if (value && value.length > rule.value) {
        return ValidationMessages.max_length(rule.value);
      }
      break;

    case ValidationTypes.CUSTOM:
      if (rule.validator && !rule.validator(value)) {
        return rule.message || 'Invalid value';
      }
      break;

    default:
      break;
  }

  return null;
};

// Validate entire form
export const validateForm = (formData, rules = ValidationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(formData).forEach(fieldName => {
    const fieldRules = rules[fieldName];
    if (fieldRules) {
      const error = validateField(fieldName, formData[fieldName], fieldRules);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    }
  });

  return { errors, isValid };
};

// Real-time validation hook
export const useFormValidation = (initialData = {}, rules = ValidationRules) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Validate form whenever data changes
  useEffect(() => {
    const { errors: newErrors, isValid: newIsValid } = validateForm(formData, rules);
    setErrors(newErrors);
    setIsValid(newIsValid);
  }, [formData, rules]);

  const updateField = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Real-time validation for touched fields
    if (touched[fieldName]) {
      const error = validateField(fieldName, value, rules[fieldName]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const markFieldTouched = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate field when touched
    const error = validateField(fieldName, formData[fieldName], rules[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const markAllTouched = () => {
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const { errors: newErrors } = validateForm(formData, rules);
    setErrors(newErrors);
  };

  const resetForm = (newData = {}) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    isValid,
    updateField,
    markFieldTouched,
    markAllTouched,
    resetForm,
    setFormData,
  };
};

// Smart defaults for forms
export const SmartDefaults = {
  workout: {
    exerciseName: '',
    reps: 10,
    rir: 2,
    weight: '',
    weightUnit: 'lbs',
  },
  meal: {
    mealName: '',
    protein: '',
    carbs: '',
    fats: '',
    proteinUnit: 'g',
    carbsUnit: 'g',
    fatsUnit: 'g',
  },
  profile: {
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: '',
    heightUnit: 'in',
    weightUnit: 'lbs',
  },
};

// Auto-save functionality
export const useAutoSave = (formData, saveFunction, delay = 2000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (hasUnsavedChanges && formData) {
        setIsSaving(true);
        try {
          await saveFunction(formData);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [formData, saveFunction, delay, hasUnsavedChanges]);

  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    markAsChanged,
  };
};
