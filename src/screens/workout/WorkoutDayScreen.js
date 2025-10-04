import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';

export default function WorkoutDayScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Workout Day</Title>
          <Text style={styles.text}>
            View details for a specific workout day
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  card: {
    marginVertical: 8,
    backgroundColor: '#2a2a2a',
    elevation: 4,
  },
  title: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  text: {
    color: '#ffffff',
    marginTop: 8,
  },
});
