import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Button, Card, Chip, IconButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO, startOfWeek, endOfWeek, addDays, subDays } from 'date-fns';

const QUICK_DATE_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Last Week', value: 'last_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
];

const SORT_OPTIONS = [
  { label: 'Date (Newest)', value: 'date_desc' },
  { label: 'Date (Oldest)', value: 'date_asc' },
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Calories (High)', value: 'calories_desc' },
  { label: 'Calories (Low)', value: 'calories_asc' },
];

export default function SearchFilter({ 
  visible, 
  onClose, 
  onApply, 
  type = 'workout', // 'workout' or 'meal'
  initialFilters = {}
}) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || {});
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || 'date_desc');
  const [quickDate, setQuickDate] = useState(initialFilters.quickDate || '');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleQuickDateSelect = (option) => {
    const today = new Date();
    let startDate, endDate;
    
    switch (option.value) {
      case 'today':
        startDate = endDate = today;
        break;
      case 'yesterday':
        startDate = endDate = subDays(today, 1);
        break;
      case 'this_week':
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        endDate = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'last_week':
        const lastWeek = subDays(today, 7);
        startDate = startOfWeek(lastWeek, { weekStartsOn: 1 });
        endDate = endOfWeek(lastWeek, { weekStartsOn: 1 });
        break;
      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    
    setDateRange({ startDate, endDate });
    setQuickDate(option.value);
  };

  const handleApply = () => {
    const filters = {
      search: searchQuery.trim(),
      dateRange,
      sortBy,
      quickDate
    };
    
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setSearchQuery('');
    setDateRange({});
    setSortBy('date_desc');
    setQuickDate('');
  };

  const getDateRangeText = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return 'All dates';
    }
    
    const start = format(dateRange.startDate, 'MMM dd');
    const end = format(dateRange.endDate, 'MMM dd, yyyy');
    
    if (start === end) {
      return start;
    }
    
    return `${start} - ${end}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Search & Filter {type === 'workout' ? 'Workouts' : 'Meals'}
          </Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            iconColor="#666"
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Search</Text>
              <TextInput
                mode="outlined"
                placeholder={`Search ${type === 'workout' ? 'exercises' : 'meals'}...`}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                left={<TextInput.Icon icon="magnify" />}
                outlineColor="#e0e0e0"
                activeOutlineColor="#2196F3"
              />
            </Card.Content>
          </Card>

          {/* Date Range Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Date Range</Text>
              
              {/* Quick Date Options */}
              <View style={styles.quickDateContainer}>
                <Text style={styles.subsectionTitle}>Quick Select</Text>
                <View style={styles.chipContainer}>
                  {QUICK_DATE_OPTIONS.map(option => (
                    <Chip
                      key={option.value}
                      selected={quickDate === option.value}
                      onPress={() => handleQuickDateSelect(option)}
                      style={[
                        styles.chip,
                        quickDate === option.value && styles.selectedChip
                      ]}
                      textStyle={[
                        styles.chipText,
                        quickDate === option.value && styles.selectedChipText
                      ]}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Custom Date Range */}
              <View style={styles.customDateContainer}>
                <Text style={styles.subsectionTitle}>Custom Range</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                  <Text style={styles.dateButtonText}>
                    {getDateRangeText()}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Sort Section */}
          <Card style={styles.section}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortContainer}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      sortBy === option.value && styles.selectedSortOption
                    ]}
                    onPress={() => setSortBy(option.value)}
                  >
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === option.value && styles.selectedSortOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {sortBy === option.value && (
                      <Ionicons name="checkmark" size={16} color="#2196F3" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Type-specific filters */}
          {type === 'meal' && (
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Meal Type</Text>
                <View style={styles.chipContainer}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(mealType => (
                    <Chip
                      key={mealType}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      {mealType}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {type === 'workout' && (
            <Card style={styles.section}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Exercise Type</Text>
                <View style={styles.chipContainer}>
                  {['Strength', 'Cardio', 'Flexibility', 'Sports'].map(exerciseType => (
                    <Chip
                      key={exerciseType}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    >
                      {exerciseType}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleClear}
            style={styles.clearButton}
            labelStyle={styles.clearButtonLabel}
          >
            Clear All
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
            labelStyle={styles.applyButtonLabel}
          >
            Apply Filters
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#ffffff',
  },
  quickDateContainer: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedChip: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  selectedChipText: {
    color: '#ffffff',
  },
  divider: {
    marginVertical: 16,
  },
  customDateContainer: {
    marginTop: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  sortContainer: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSortOption: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSortOptionText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderColor: '#999',
  },
  clearButtonLabel: {
    color: '#666',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  applyButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
