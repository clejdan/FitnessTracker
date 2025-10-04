import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function CalorieGoalScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Ionicons name="speedometer-outline" size={64} color="#2196F3" />
          <Title style={styles.title}>Calorie Goal</Title>
          <Text style={styles.text}>
            This screen will allow you to set your calorie goals, choose between deficit, maintenance, or surplus, and customize your targets.
          </Text>
          <Text style={styles.subtext}>
            Coming soon...
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            Go Back
          </Button>
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
  contentContainer: {
    padding: 16,
    paddingTop: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  subtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2196F3',
  },
});