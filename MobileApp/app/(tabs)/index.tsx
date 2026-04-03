import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  FlatList, ActivityIndicator, StatusBar, Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { Surface } from 'react-native-paper';

export default function HabitScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); 
  const router = useRouter();

  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHabits();
      } else {
        setLoading(false); // Stop loading if no user
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
    const updatedHabits = habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);
    await supabase.from('userdata').update({ habits: updatedHabits }).eq('id', user?.id);
  };

  // 🛡️ AUTH GUARD: Show this if user is not logged in
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
        
        <View style={styles.headerRow}>
          <View>
            <Text style={{ color: colors.subtext, fontSize: 14, fontWeight: '600' }}>DAILY GRIND</Text>
            <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800' }}>Habits</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/add')} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
          </TouchableOpacity>
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
                  <Surface style={[styles.habitCard, { backgroundColor: colors.card, opacity: !isPassive && isDone ? 0.6 : 1 }]} elevation={2}>
                    <View style={styles.cardMain}>
                      <MaterialCommunityIcons 
                        name={isPassive ? "clock-fast" : (isDone ? "checkbox-marked-circle" : "circle-outline")} 
                        size={28} 
                        color={isPassive ? "#8B5CF6" : (isDone ? colors.primary : colors.subtext)} 
                      />
                      
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={[styles.habitName, { color: colors.text, textDecorationLine: !isPassive && isDone ? 'line-through' : 'none' }]}>
                          {item.name}
                        </Text>
                        <Text style={{ color: colors.subtext, fontSize: 12, fontWeight: '600' }}>
                          {isPassive 
                            ? `STREAK: ${getElapsedShort(item.created_at)}` 
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
                <Text style={{ color: colors.subtext, textAlign: 'center' }}>No habits yet. Hit the + to start!</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  addBtn: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  habitCard: { padding: 18, borderRadius: 22, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  habitName: { fontSize: 17, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Auth Guard Styles
  emptyIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30, paddingHorizontal: 10 },
  authButton: { width: '100%', height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  authButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  emptyList: { marginTop: 50, opacity: 0.5 }
});