import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  format, 
  addDays, 
  subDays, 
  isToday,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getYear,
  getMonth,
  setYear,
  setMonth,
  setDate,
} from 'date-fns';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Calendar({ 
  markedDates = [], 
  onDateSelect, 
  selectedDate, 
  theme = 'light' 
}) {
  const [selectedDateObj, setSelectedDateObj] = useState(
    selectedDate ? (typeof selectedDate === 'string' ? parseISO(selectedDate) : selectedDate) : new Date()
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDateObj);

  // Update selected date when prop changes
  useEffect(() => {
    if (selectedDate) {
      const dateObj = typeof selectedDate === 'string' ? parseISO(selectedDate) : selectedDate;
      setSelectedDateObj(dateObj);
      setTempDate(dateObj);
    }
  }, [selectedDate]);

  // Theme colors
  const colors = theme === 'dark' ? {
    headerBg: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#999999',
    arrow: '#00ff88',
    modalBg: '#2a2a2a',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    buttonBg: '#00ff88',
    buttonText: '#1a1a1a',
    markedDot: '#00ff88',
    selectedBg: 'rgba(0, 255, 136, 0.1)',
    borderColor: '#3a3a3a',
  } : {
    headerBg: '#ffffff',
    text: '#333333',
    textSecondary: '#999999',
    arrow: '#4CAF50',
    modalBg: '#ffffff',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    buttonBg: '#4CAF50',
    buttonText: '#ffffff',
    markedDot: '#4CAF50',
    selectedBg: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#e0e0e0',
  };

  const handlePreviousDay = () => {
    const newDate = subDays(selectedDateObj, 1);
    setSelectedDateObj(newDate);
    setTempDate(newDate);
    if (onDateSelect) {
      onDateSelect(format(newDate, 'yyyy-MM-dd'));
    }
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDateObj, 1);
    setSelectedDateObj(newDate);
    setTempDate(newDate);
    if (onDateSelect) {
      onDateSelect(format(newDate, 'yyyy-MM-dd'));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setTempDate(today);
  };

  const handleConfirmDate = () => {
    setSelectedDateObj(tempDate);
    if (onDateSelect) {
      onDateSelect(format(tempDate, 'yyyy-MM-dd'));
    }
    setModalVisible(false);
  };

  const handleCancelModal = () => {
    setTempDate(selectedDateObj);
    setModalVisible(false);
  };

  const getDateDisplayText = () => {
    if (isToday(selectedDateObj)) {
      return 'Today';
    }
    return format(selectedDateObj, 'EEE, MMM d');
  };

  const isDateMarked = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return markedDates.includes(dateString);
  };

  // Get days in current selected month for modal
  const getDaysInMonth = () => {
    const start = startOfMonth(tempDate);
    const end = endOfMonth(tempDate);
    return eachDayOfInterval({ start, end });
  };

  const years = Array.from({ length: 10 }, (_, i) => getYear(new Date()) - 5 + i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
      {/* Compact Header Date Selector */}
      <View style={[styles.headerContainer, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity 
          onPress={handlePreviousDay}
          style={styles.arrowButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.arrow} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          style={styles.dateTextContainer}
        >
          <Text style={[styles.dateText, { color: colors.text }]}>
            {getDateDisplayText()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.calendarIcon} />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleNextDay}
          style={styles.arrowButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={28} color={colors.arrow} />
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={handleCancelModal}
          />
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderColor }]}>
              <TouchableOpacity onPress={handleCancelModal} style={styles.modalButton}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Date</Text>
              
              <TouchableOpacity 
                onPress={handleConfirmDate} 
                style={[styles.confirmButton, { backgroundColor: colors.buttonBg }]}
              >
                <Ionicons name="checkmark" size={24} color={colors.buttonText} />
              </TouchableOpacity>
            </View>

            {/* Today Quick Button */}
            <TouchableOpacity
              style={[styles.todayButton, { backgroundColor: colors.selectedBg, borderColor: colors.borderColor }]}
              onPress={handleToday}
            >
              <Ionicons name="today-outline" size={20} color={colors.arrow} />
              <Text style={[styles.todayButtonText, { color: colors.arrow }]}>
                Jump to Today
              </Text>
            </TouchableOpacity>

            {/* Date Selection */}
            <View style={styles.dateSelectionContainer}>
              {/* Month Selector */}
              <View style={styles.pickerSection}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Month</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerItem,
                        getMonth(tempDate) === index && { backgroundColor: colors.selectedBg },
                      ]}
                      onPress={() => setTempDate(setMonth(tempDate, index))}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          getMonth(tempDate) === index && { 
                            fontWeight: 'bold',
                            color: colors.arrow 
                          },
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Day Selector */}
              <View style={styles.pickerSection}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Day</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {getDaysInMonth().map((day) => {
                    const dayNum = parseInt(format(day, 'd'));
                    const isSelected = format(day, 'yyyy-MM-dd') === format(tempDate, 'yyyy-MM-dd');
                    const isMarked = isDateMarked(day);
                    
                    return (
                      <TouchableOpacity
                        key={day.toString()}
                        style={[
                          styles.pickerItem,
                          isSelected && { backgroundColor: colors.selectedBg },
                        ]}
                        onPress={() => setTempDate(setDate(tempDate, dayNum))}
                      >
                        <View style={styles.dayPickerItem}>
                          <Text
                            style={[
                              styles.pickerItemText,
                              { color: colors.text },
                              isSelected && { 
                                fontWeight: 'bold',
                                color: colors.arrow 
                              },
                            ]}
                          >
                            {dayNum}
                          </Text>
                          {isMarked && (
                            <View style={[styles.markedIndicator, { backgroundColor: colors.markedDot }]} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Year Selector */}
              <View style={styles.pickerSection}>
                <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Year</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        getYear(tempDate) === year && { backgroundColor: colors.selectedBg },
                      ]}
                      onPress={() => setTempDate(setYear(tempDate, year))}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          { color: colors.text },
                          getYear(tempDate) === year && { 
                            fontWeight: 'bold',
                            color: colors.arrow 
                          },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  arrowButton: {
    padding: 4,
  },
  dateTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalButton: {
    padding: 4,
    width: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateSelectionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dayPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
});
