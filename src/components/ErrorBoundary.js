import React from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // You could also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning-outline" size={80} color="#FF5252" />
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>

            {__DEV__ && this.state.error && (
              <Card style={styles.errorCard}>
                <Card.Content>
                  <Text style={styles.errorTitle}>Error Details (Development Mode)</Text>
                  <Text style={styles.errorText}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </Card.Content>
              </Card>
            )}

            <View style={styles.actionsContainer}>
              <Button
                mode="contained"
                onPress={this.handleReset}
                style={styles.resetButton}
                labelStyle={styles.resetButtonLabel}
                icon="refresh"
              >
                Try Again
              </Button>

              <Button
                mode="outlined"
                onPress={() => {
                  // Navigate to home or safe screen
                  this.handleReset();
                  // You could navigate to a safe screen here if needed
                }}
                style={styles.homeButton}
                labelStyle={styles.homeButtonLabel}
                icon="home"
              >
                Go to Home
              </Button>
            </View>

            <Text style={styles.helpText}>
              If this problem persists, please try restarting the app.
            </Text>
          </ScrollView>
        </View>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5252',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#999999',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
  },
  resetButtonLabel: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  homeButton: {
    borderColor: '#4CAF50',
  },
  homeButtonLabel: {
    color: '#4CAF50',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 24,
    fontStyle: 'italic',
  },
});

export default ErrorBoundary;

