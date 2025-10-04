import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';

export default function NutritionCalendarScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Nutrition Calendar</Title>
          <Text style={styles.text}>
            Track your daily nutrition and meals
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
    backgroundColor: '#ffffff',
  },
  card: {
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    elevation: 4,
  },
  title: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  text: {
    color: '#333333',
    marginTop: 8,
  },
});

