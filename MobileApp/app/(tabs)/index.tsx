import React, { useState } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity,
  SafeAreaView, StatusBar, ScrollView, LayoutAnimation, Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// 1. DEFINE TYPES (The "TypeScript" way)
interface Habit {
  id: string;
  name: string;
  time: string;
  completed: boolean;
  streak: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap; // Ensures icon name is valid
}

export default function HabitScreen() {
  const { colors, isDarkMode } = useTheme();
  const [userName] = useState<string>('Khalil');

  // Use the Habit interface for the state
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Code Review & Logic', time: 'Morning', completed: false, streak: 12, icon: 'code-braces' },
    { id: '2', name: 'Drink 2L Water', time: 'All Day', completed: true, streak: 5, icon: 'water' },
    { id: '3', name: 'Check Export Orders', time: 'Morning', completed: false, streak: 3, icon: 'ship-wheel' },
    { id: '4', name: '15 Min Reflection', time: 'Night', completed: false, streak: 8, icon: 'moon-waning-crescent' },
    { id: '5', name: 'Exercise / Gym', time: 'Afternoon', completed: false, streak: 0, icon: 'dumbbell' },
  ]);

  const days: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const completedCount = habits.filter(h => h.completed).length;
  const progress = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const toggleHabit = (id: string) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* HEADER */}
      <View style={styles.topNav}>
        <View>
          <Text style={[styles.dateText, { color: colors.subtext }]}>{today.toDateString()}</Text>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Hey {userName} 👋</Text>
        </View>
        <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="cog" size={24} color={colors.subtext} />
        </TouchableOpacity>
      </View>

      {/* DAY PICKER */}
      <View style={styles.dayPickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPicker}>
          {days.map((day, index) => {
            const isSelected = index === today.getDay();
            const dayNum = today.getDate() - (today.getDay() - index);
            return (
              <View 
                key={`${day}-${index}`} 
                style={[
                  styles.dayCard, 
                  { backgroundColor: colors.card, borderColor: colors.divider },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[styles.dayName, { color: colors.subtext }, isSelected && { color: '#FFF' }]}>{day}</Text>
                <Text style={[styles.dayNum, { color: colors.text }, isSelected && { color: '#FFF' }]}>{dayNum}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* STATS CARD */}
      <View style={[styles.statsCard, { backgroundColor: isDarkMode ? colors.card : '#1E293B' }]}>
        <View style={styles.statsContent}>
          <Text style={styles.statsTitle}>Daily Progress</Text>
          <Text style={[styles.statsSubtitle, { color: isDarkMode ? colors.subtext : '#94A3B8' }]}>
            {completedCount} of {habits.length} habits done
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? colors.divider : '#334155' }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
        <View style={[styles.statsCircle, { borderColor: colors.primary }]}>
          <Text style={styles.statsPercent}>{progress}%</Text>
        </View>
      </View>

      {/* HABIT LIST */}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => (
          <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => toggleHabit(item.id)}
            style={[
              styles.habitItem, 
              { backgroundColor: colors.card, borderColor: colors.divider },
              item.completed && { opacity: 0.6, backgroundColor: isDarkMode ? colors.background : '#F1F5F9' }
            ]}
          >
            <View style={[
              styles.iconBox, 
              { backgroundColor: item.completed ? colors.divider : (isDarkMode ? '#334155' : '#EEF2FF') }
            ]}>
              <MaterialCommunityIcons 
                name={item.icon} 
                size={24} 
                color={item.completed ? colors.subtext : colors.primary} 
              />
            </View>
            
            <View style={styles.habitDetails}>
              <Text style={[
                styles.habitName, 
                { color: colors.text }, 
                item.completed && styles.textDone
              ]}>{item.name}</Text>
              <View style={styles.habitMeta}>
                <Text style={[styles.habitTime, { color: colors.subtext }]}>{item.time}</Text>
                {item.streak > 0 && (
                  <View style={[styles.streakBadge, { backgroundColor: isDarkMode ? '#451a03' : '#FFFBEB' }]}>
                    <MaterialCommunityIcons name="fire" size={14} color="#F59E0B" />
                    <Text style={[styles.streakText, { color: '#F59E0B' }]}>{item.streak}d streak</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[
              styles.checkCircle, 
              { borderColor: colors.divider },
              item.completed && { backgroundColor: '#10B981', borderColor: '#10B981' }
            ]}>
              {item.completed && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 15 },
  dateText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  welcomeText: { fontSize: 24, fontWeight: '800' },
  profileBtn: { padding: 8, borderRadius: 12 },
  dayPickerContainer: { marginVertical: 10 },
  dayPicker: { paddingHorizontal: 20, gap: 12 },
  dayCard: { width: 60, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  dayName: { fontSize: 12, fontWeight: '600' },
  dayNum: { fontSize: 18, fontWeight: '800' },
  statsCard: { margin: 24, padding: 24, borderRadius: 30, flexDirection: 'row', alignItems: 'center' },
  statsContent: { flex: 1 },
  statsTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statsSubtitle: { fontSize: 12, marginVertical: 4 },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 10, width: '90%' },
  progressFill: { height: '100%', borderRadius: 3 },
  statsCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  statsPercent: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  listPadding: { paddingHorizontal: 24, paddingBottom: 40 },
  habitItem: { padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  iconBox: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  habitDetails: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '700' },
  habitMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  habitTime: { fontSize: 12, fontWeight: '500' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  streakText: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
  textDone: { textDecorationLine: 'line-through' },
  checkCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
});