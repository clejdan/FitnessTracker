import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Title } from 'react-native-paper';

export default function AddMealScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Add Meal</Title>
          <Text style={styles.text}>
            Log a new meal or snack
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

