import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Title, Switch } from 'react-native-paper';
import { useAccessibility } from '../hooks/useAccessibility';
import { AccessibilityTesting } from '../utils/accessibility';

// Component for testing accessibility features
export default function AccessibilityTest({ navigation }) {
  const { 
    isScreenReaderEnabled, 
    isReduceMotionEnabled, 
    announce,
    announceSuccess,
    announceError 
  } = useAccessibility();
  
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const runAccessibilityTest = async () => {
    setIsTesting(true);
    
    try {
      // Simulate testing various elements
      const testElements = [
        { accessible: true, accessibilityLabel: 'Test Button', accessibilityRole: 'button' },
        { accessible: true, accessibilityLabel: 'Test Text', accessibilityRole: 'text' },
        { accessible: false, accessibilityLabel: '', accessibilityRole: 'button' },
        { accessible: true, accessibilityLabel: 'Test Input', accessibilityRole: 'textbox' },
      ];

      const report = AccessibilityTesting.generateReport(testElements);
      setTestResults(report);
      
      if (isScreenReaderEnabled) {
        announce(`Accessibility test completed. Score: ${report.score}%`);
      }
    } catch (error) {
      console.error('Accessibility test failed:', error);
      if (isScreenReaderEnabled) {
        announceError('Accessibility test failed');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const testAnnouncements = () => {
    if (isScreenReaderEnabled) {
      announce('Testing screen reader announcements');
      setTimeout(() => announceSuccess('Success announcement test'), 1000);
      setTimeout(() => announceError('Error announcement test'), 2000);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.title}>Accessibility Test</Title>
      
      {/* Accessibility Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Accessibility Status</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Screen Reader:</Text>
            <Text style={[styles.statusValue, { color: isScreenReaderEnabled ? '#4CAF50' : '#FF5252' }]}>
              {isScreenReaderEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Reduce Motion:</Text>
            <Text style={[styles.statusValue, { color: isReduceMotionEnabled ? '#4CAF50' : '#FF5252' }]}>
              {isReduceMotionEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Test Controls */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Test Controls</Text>
          
          <Button
            mode="contained"
            onPress={runAccessibilityTest}
            loading={isTesting}
            disabled={isTesting}
            style={styles.testButton}
            {...AccessibilityManager.getButtonProps(
              'Run accessibility test',
              'Double tap to test accessibility features'
            )}
          >
            {isTesting ? 'Testing...' : 'Run Test'}
          </Button>
          
          <Button
            mode="outlined"
            onPress={testAnnouncements}
            style={styles.testButton}
            disabled={!isScreenReaderEnabled}
            {...AccessibilityManager.getButtonProps(
              'Test announcements',
              'Double tap to test screen reader announcements',
              !isScreenReaderEnabled
            )}
          >
            Test Announcements
          </Button>
        </Card.Content>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Test Results</Text>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Accessibility Score:</Text>
              <Text style={[styles.resultValue, { 
                color: testResults.score >= 80 ? '#4CAF50' : 
                       testResults.score >= 60 ? '#FF9800' : '#FF5252' 
              }]}>
                {testResults.score}%
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Elements:</Text>
              <Text style={styles.resultValue}>{testResults.total}</Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Accessible Elements:</Text>
              <Text style={styles.resultValue}>{testResults.accessible}</Text>
            </View>
            
            {testResults.issues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>Issues Found:</Text>
                {testResults.issues.map((issue, index) => (
                  <Text key={index} style={styles.issueText}>
                    • {issue.type}: Missing {issue.missing.join(', ')}
                  </Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Accessibility Guidelines */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Accessibility Guidelines</Text>
          
          <Text style={styles.guidelineText}>
            • All interactive elements should have accessibility labels
          </Text>
          <Text style={styles.guidelineText}>
            • Use proper accessibility roles (button, text, etc.)
          </Text>
          <Text style={styles.guidelineText}>
            • Provide helpful hints for complex interactions
          </Text>
          <Text style={styles.guidelineText}>
            • Announce important state changes to screen readers
          </Text>
          <Text style={styles.guidelineText}>
            • Ensure sufficient color contrast
          </Text>
          <Text style={styles.guidelineText}>
            • Support keyboard navigation
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    marginBottom: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 16,
    color: '#666666',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  issuesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
