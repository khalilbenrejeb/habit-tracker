import { DarkTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, SegmentedButtons, Text, TextInput } from 'react-native-paper';

const PRESET_TASKS = [
  { name: 'Drink Water', type: 'active' },
  { name: 'Workout', type: 'active' },
  { name: 'Read Quran', type: 'active' },
  { name: 'No Sugar', type: 'passive' },
  { name: 'No Smoke', type: 'passive' },
];

export default function Add() {
  const router = useRouter();

  const [taskName, setTaskName] = useState('');
  const [type, setType] = useState<'active' | 'passive'>('passive');
  const [amount, setAmount] = useState('');

  const selectPreset = (task: any) => {
    setTaskName(task.name);
    setType(task.type);
    setAmount('');
  };

  const handleSave = () => {
    if (!taskName.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      type,
      amount: type === 'active' ? Number(amount) || 1 : null,
      completed: false,
    };

    // 👉 Send this to global state / context / storage later
    console.log('NEW TASK:', newTask);

    router.replace('/'); // go back Home (trigger animation there)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Task</Text>

      {/* Preset Tasks */}
      <FlatList
        horizontal
        data={PRESET_TASKS}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <Card style={[styles.preset, { height: 80 }]} onPress={() => selectPreset(item)}>
            <Card.Content>
              <Text>{item.name}</Text>
            </Card.Content>
          </Card>
        )}
      />

      {/* Custom Name */}
      <TextInput
        label="Task Name"
        value={taskName}
        onChangeText={setTaskName}
        mode="outlined"
        style={styles.input}
      />

      {/* Type Selector */}
      <SegmentedButtons
        value={type}
        onValueChange={(v) => setType(v as any)}
        buttons={[
          { value: 'passive', label: 'Passive' },
          { value: 'active', label: 'Active' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* Active Extra Field */}
      {type === 'active' && (
        <TextInput
          label="How many times per day?"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
      )}

      <Button mode="contained" onPress={handleSave}>
        Add Task
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 ,alignItems: 'center'},
  title: { fontSize: 26, marginBottom: 20, fontWeight: 'bold' ,color: DarkTheme.colors.primary},
  input: { marginBottom: 16 },
  preset: { marginRight: 10, padding: 4 },
});