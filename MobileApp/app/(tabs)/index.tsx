import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import { FlatList, LayoutAnimation, Platform, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  const initialTasks = [
    { id: '1', name: 'Drink water' },
    { id: '2', name: 'Meditate 10 min' },
    { id: '3', name: 'No sugar today' },
    { id: '4', name: 'Read 20 pages' },
  ];

  const [dailyTasks, setDailyTasks] = useState(initialTasks);
  const [completedTasks, setCompletedTasks] = useState([]);

  const completeTask = (task) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDailyTasks((prev) => prev.filter((t) => t.id !== task.id));
    setCompletedTasks((prev) => [task, ...prev]);
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.welcome}>
        Welcome back!
      </ThemedText>

      <ThemedText type="subtitle" style={{ marginTop: 20 }}>
        Daily Tasks
      </ThemedText>
      <FlatList
        data={dailyTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.taskItem, styles.daily]} onPress={() => completeTask(item)}>
            <ThemedText style={{ color: '#000' }}>{item.name}</ThemedText>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ gap: 12, marginTop: 10 }}
      />

      <ThemedText type="subtitle" style={{ marginTop: 30 }}>
        Completed Tasks
      </ThemedText>
      <FlatList
        data={completedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.taskItem, styles.completed]}>
            <ThemedText style={{ color: '#155724', textDecorationLine: 'line-through' }}>
              {item.name} ✅
            </ThemedText>
          </View>
        )}
        contentContainerStyle={{ gap: 12, marginTop: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  welcome: { fontSize: 28, fontWeight: 'bold' },
  taskItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  daily: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
  },
  completed: {
    backgroundColor: '#d4edda',
    borderColor: '#a3d9a5',
  },
});