import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HomeScreen() {
  // 1. Solid Data Structure (Ensuring IDs are always strings)
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Hydrate: 2L Water', completed: false, category: 'Health' },
    { id: '2', name: '10 Min Meditation', completed: false, category: 'Mind' },
    { id: '3', name: 'Read 20 Pages', completed: false, category: 'Growth' },
    { id: '4', name: 'Work on Project', completed: false, category: 'Code' },
  ]);

  // 2. Dynamic Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 3. Derived State (Progress Calculation)
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // 4. Robust Toggle Function
  const toggleTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // 5. Separate data for the two lists to avoid "ID" confusion
  const pendingTasks = tasks.filter(t => !t.completed);
  const finishedTasks = tasks.filter(t => t.completed);

  const RenderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => toggleTask(item.id)}
      style={[styles.card, item.completed && styles.cardCompleted]}
    >
      <View style={styles.cardContent}>
        <View style={[styles.statusDot, item.completed ? styles.dotDone : styles.dotPending]} />
        <View>
          <Text style={[styles.taskName, item.completed && styles.textDone]}>{item.name}</Text>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
        {item.completed && <Text style={styles.checkIcon}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{getGreeting()}, Guest</Text>
          <Text style={styles.titleText}>Daily Grind</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      <FlatList
        data={[...pendingTasks, ...finishedTasks]} // Merged data, but styled differently
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={() => (
          <Text style={styles.sectionHeader}>
            {pendingTasks.length > 0 ? "Current Focus" : "All Done! 🎉"}
          </Text>
        )}
        renderItem={({ item }) => <RenderItem item={item} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks for today.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' }, // Clean light-grey/blue background
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  greetingText: { fontSize: 16, color: '#627D98', fontWeight: '500' },
  titleText: { fontSize: 32, fontWeight: '800', color: '#102A43' },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#615EFC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#615EFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  progressValue: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  progressContainer: {
    height: 6,
    backgroundColor: '#D9E2EC',
    marginHorizontal: 24,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: { height: '100%', backgroundColor: '#615EFC' },
  listPadding: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#334E68', marginBottom: 15 },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    // Professional Shadow
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 3 },
    }),
  },
  cardCompleted: { backgroundColor: '#F0F4F8', opacity: 0.7 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 15 },
  dotPending: { backgroundColor: '#615EFC' },
  dotDone: { backgroundColor: '#9FB3C8' },
  taskName: { fontSize: 16, fontWeight: '600', color: '#102A43' },
  categoryText: { fontSize: 12, color: '#627D98', marginTop: 2 },
  textDone: { textDecorationLine: 'line-through', color: '#829AB1' },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D9E2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#615EFC', borderColor: '#615EFC' },
  checkIcon: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#829AB1' },
});