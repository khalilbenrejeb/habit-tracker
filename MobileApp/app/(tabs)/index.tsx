import React, { useState, useCallback, useMemo } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  FlatList, ActivityIndicator, StatusBar, Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { Surface, ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics'; // Optional: Add 'npx expo install expo-haptics'

const MOTIVATIONAL_QUOTES = [
  "The secret of your future is hidden in your daily routine.",
  "Discipline is doing what needs to be done, even if you don't want to.",
  "Small wins lead to big victories. Keep grinding.",
  "Your only limit is you. Level up.",
  "Don't stop when you're tired. Stop when you're done.",
  "Focus on the step, not the mountain.",
  "Hustle until your haters ask if you're hiring.",
  "Great things never come from comfort zones.",
  "Success is the sum of small efforts, repeated daily.",
  "Be the person your 10-year-old self would be proud of."
];

export default function HabitScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); 
  const router = useRouter();

  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");

  // Stats Logic
  const stats = useMemo(() => {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const progress = total > 0 ? completed / total : 0;
    return { total, completed, progress };
  }, [habits]);

  useFocusEffect(
    useCallback(() => {
      // Pick a random quote on every screen focus
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);

      if (user) {
        fetchHabits();
      } else {
        setLoading(false);
      }
    }, [user])
  );

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('userdata').select('habits').eq('id', user?.id).maybeSingle();
      if (error) throw error;
      setHabits(data?.habits || []);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getElapsedShort = (startDate: string) => {
    const diff = new Date().getTime() - new Date(startDate).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    return `${days}d ${hours}h`;
  };

  const toggleHabit = async (habitId: string) => {
    // Add a little vibration feel when completing a task
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const updatedHabits = habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);
    await supabase.from('userdata').update({ habits: updatedHabits }).eq('id', user?.id);
  };

  if (!user && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <View style={[styles.emptyIconBox, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to Level Up?</Text>
        <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
          Sign in to sync your habits, track your streaks, and start your daily grind.
        </Text>
        <TouchableOpacity 
          style={[styles.authButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.authButtonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ padding: 24, flex: 1 }}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ color: colors.subtext, fontSize: 13, fontWeight: '700', letterSpacing: 1.5 }}>{new Date().toLocaleDateString().toUpperCase()}</Text>
            <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900' }}>The Grind</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/add')} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* 💡 THE QUOTE BOX */}
        <Surface style={[styles.quoteCard, { backgroundColor: isDarkMode ? '#1e1e1e' : '#f3f4f6' }]} elevation={0}>
          <MaterialCommunityIcons name="format-quote-open" size={20} color={colors.primary} />
          <Text style={[styles.quoteText, { color: colors.text }]}>{quote}</Text>
        </Surface>

        {/* 📊 PROGRESS SECTION */}
        <View style={styles.progressContainer}>
           <View style={styles.progressTextRow}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Today's Completion</Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>{Math.round(stats.progress * 100)}%</Text>
           </View>
           <ProgressBar progress={stats.progress} color={colors.primary} style={styles.progressBar} />
           <Text style={[styles.statsSub, { color: colors.subtext }]}>{stats.completed} of {stats.total} habits finished</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item, index) => item.id || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => {
              const isPassive = item.type?.toLowerCase() === 'passive';
              const isDone = item.completed;

              return (
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  onPress={() => {
                    if (isPassive) {
                      router.push({ pathname: '/passiveHabitScreen', params: { id: item.id } });
                    } else {
                      toggleHabit(item.id);
                    }
                  }}
                >
                  <Surface style={[
                    styles.habitCard, 
                    { 
                      backgroundColor: colors.card, 
                      borderColor: isDone ? colors.primary : 'transparent',
                      borderWidth: isDone ? 1 : 0,
                      opacity: !isPassive && isDone ? 0.7 : 1 
                    }
                  ]} elevation={1}>
                    <View style={styles.cardMain}>
                      <View style={[styles.iconCircle, { backgroundColor: isDone ? colors.primary : (isPassive ? '#8B5CF622' : colors.divider) }]}>
                        <MaterialCommunityIcons 
                          name={isPassive ? "clock-fast" : (isDone ? "check" : "flash-outline")} 
                          size={22} 
                          color={isDone ? "#FFF" : (isPassive ? "#8B5CF6" : colors.subtext)} 
                        />
                      </View>
                      
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={[styles.habitName, { color: colors.text, textDecorationLine: !isPassive && isDone ? 'line-through' : 'none' }]}>
                          {item.name}
                        </Text>
                        <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                          {isPassive 
                            ? `🔥 STREAK: ${getElapsedShort(item.created_at)}` 
                            : `${item.type} ${item.amount ? `• ${item.amount}` : ''}`}
                        </Text>
                      </View>

                      {isPassive && (
                        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.divider} />
                      )}
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                 <MaterialCommunityIcons name="clipboard-text-outline" size={50} color={colors.divider} />
                <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 10 }}>No habits set for today.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  addBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  
  // Quote Section
  quoteCard: { padding: 16, borderRadius: 20, marginBottom: 25, flexDirection: 'row', alignItems: 'flex-start' },
  quoteText: { flex: 1, marginLeft: 8, fontSize: 14, fontStyle: 'italic', lineHeight: 20, fontWeight: '500' },

  // Progress Section
  progressContainer: { marginBottom: 30 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  progressLabel: { fontSize: 16, fontWeight: '800' },
  progressPercent: { fontSize: 18, fontWeight: '900' },
  progressBar: { height: 10, borderRadius: 5 },
  statsSub: { fontSize: 12, marginTop: 6, fontWeight: '600' },

  // Habit Cards
  habitCard: { padding: 16, borderRadius: 24, marginBottom: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  habitName: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  authButton: { width: '100%', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  authButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  emptyList: { marginTop: 50, alignItems: 'center', opacity: 0.4 }
});