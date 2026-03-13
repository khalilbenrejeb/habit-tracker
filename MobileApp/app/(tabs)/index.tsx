import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, Platform, LayoutAnimation
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HabitScreen() {
  const [userName] = useState('Khalil');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // 1. Habit Data with Streaks
  const [habits, setHabits] = useState([
    { id: '1', name: 'Code Review & Logic', time: 'Morning', completed: false, streak: 12, icon: 'code-braces' },
    { id: '2', name: 'Drink 2L Water', time: 'All Day', completed: true, streak: 5, icon: 'water' },
    { id: '3', name: 'Check Export Orders', time: 'Morning', completed: false, streak: 3, icon: 'ship-wheel' },
    { id: '4', name: '15 Min Reflection', time: 'Night', completed: false, streak: 8, icon: 'moon-waning-crescent' },
    { id: '5', name: 'Exercise / Gym', time: 'Afternoon', completed: false, streak: 0, icon: 'dumbbell' },
  ]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  // Progress logic
  const completedCount = habits.filter(h => h.completed).length;
  const progress = Math.round((completedCount / habits.length) * 100);

  const toggleHabit = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 2. MINIMALIST TOP NAV */}
      <View style={styles.topNav}>
        <View>
          <Text style={styles.dateText}>{today.toDateString()}</Text>
          <Text style={styles.welcomeText}>Hey {userName} 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <MaterialCommunityIcons name="cog" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* 3. HORIZONTAL DAY PICKER */}
      <View style={styles.dayPickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPicker}>
          {days.map((day, index) => {
            const isSelected = index === today.getDay();
            return (
              <View key={day} style={[styles.dayCard, isSelected && styles.selectedDayCard]}>
                <Text style={[styles.dayName, isSelected && styles.selectedDayText]}>{day}</Text>
                <Text style={[styles.dayNum, isSelected && styles.selectedDayText]}>{today.getDate() - (today.getDay() - index)}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. MAIN STATS CARD */}
      <View style={styles.statsCard}>
        <View style={styles.statsContent}>
          <Text style={styles.statsTitle}>Daily Progress</Text>
          <Text style={styles.statsSubtitle}>{completedCount} of {habits.length} habits done</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.statsCircle}>
          <Text style={styles.statsPercent}>{progress}%</Text>
        </View>
      </View>

      {/* 5. HABIT LIST */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => toggleHabit(item.id)}
            style={[styles.habitItem, item.completed && styles.habitCompleted]}
          >
            <View style={[styles.iconBox, { backgroundColor: item.completed ? '#E2E8F0' : '#EEF2FF' }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.completed ? '#94A3B8' : '#615EFC'} />
            </View>
            
            <View style={styles.habitDetails}>
              <Text style={[styles.habitName, item.completed && styles.textDone]}>{item.name}</Text>
              <View style={styles.habitMeta}>
                <Text style={styles.habitTime}>{item.time}</Text>
                {item.streak > 0 && (
                  <View style={styles.streakBadge}>
                    <MaterialCommunityIcons name="fire" size={14} color="#F59E0B" />
                    <Text style={styles.streakText}>{item.streak} day streak</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.checkCircle, item.completed && styles.checkedCircle]}>
              {item.completed && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  dateText: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  welcomeText: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  profileBtn: { padding: 8, backgroundColor: '#FFF', borderRadius: 12, elevation: 1 },
  
  dayPickerContainer: { marginVertical: 10 },
  dayPicker: { paddingHorizontal: 20, gap: 12 },
  dayCard: { width: 60, height: 80, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  selectedDayCard: { backgroundColor: '#615EFC', borderColor: '#615EFC' },
  dayName: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  dayNum: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  selectedDayText: { color: '#FFF' },

  statsCard: { margin: 24, padding: 24, backgroundColor: '#1E293B', borderRadius: 30, flexDirection: 'row', alignItems: 'center' },
  statsContent: { flex: 1 },
  statsTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statsSubtitle: { color: '#94A3B8', fontSize: 12, marginVertical: 4 },
  progressTrack: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginTop: 10, width: '90%' },
  progressFill: { height: '100%', backgroundColor: '#615EFC', borderRadius: 3 },
  statsCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#615EFC', justifyContent: 'center', alignItems: 'center' },
  statsPercent: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  listPadding: { paddingHorizontal: 24, paddingBottom: 40 },
  habitItem: { backgroundColor: '#FFF', padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  habitCompleted: { opacity: 0.7, backgroundColor: '#F8FAFC' },
  iconBox: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  habitDetails: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  habitTime: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  streakText: { fontSize: 10, color: '#B45309', fontWeight: '700', marginLeft: 4 },
  textDone: { textDecorationLine: 'line-through', color: '#94A3B8' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  checkedCircle: { backgroundColor: '#10B981', borderColor: '#10B981' },
});