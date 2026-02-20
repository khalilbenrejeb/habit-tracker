import { ThemedText } from '@/components/themed-text';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function StatsScreen() {
  // example static data, later replace with real user data
  const stats = {
    logins: 34,
    habits: 7,
    startDate: '2026-02-01',
    totalTasksCompleted: 120,
    dailyTasksCompleted: 3,
    luckynumber: Math.floor(Math.random() * 100) + 1,
  };

  return (
    <View style={styles.container}>
      <ThemedText type="title">Your Stats</ThemedText>

      <View style={styles.statItem}>
        <ThemedText>Times Logged In: {stats.logins}</ThemedText>
      </View>

      <View style={styles.statItem}>
        <ThemedText>Total Habits: {stats.habits}</ThemedText>
      </View>

      <View style={styles.statItem}>
        <ThemedText>App Started On: {stats.startDate}</ThemedText>
      </View>

      <View style={styles.statItem}>
        <ThemedText>Total Tasks Completed: {stats.totalTasksCompleted}</ThemedText>
      </View>

      <View style={styles.statItem}>
        <ThemedText>Daily Tasks Completed: {stats.dailyTasksCompleted}</ThemedText>
      </View>

      <View style={styles.statItem}>
        <ThemedText>Your Lucky Number: {stats.luckynumber}</ThemedText>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  statItem: { marginVertical: 4 },
});