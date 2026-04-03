import React, { useState, useCallback } from 'react'; // Added useCallback
import { 
  StyleSheet, Text, View, ScrollView, SafeAreaView, 
  StatusBar, Platform, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter, useFocusEffect } from 'expo-router'; // Added useFocusEffect
import { supabase } from '../../supabase';

export default function StatsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); 
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    logins: 0,
    habitsCount: 0,
    startDate: '...',
    completedToday: 0,
    luckynumber: Math.floor(Math.random() * 100) + 1,
  });

  // 🔄 THE REFRESH LOGIC: Fires every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user) fetchRealStats();
    }, [user])
  );

  const fetchRealStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('userdata')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const habitsArray = data.habits || [];
        const completed = habitsArray.filter((h: any) => h.completed).length;

        const date = new Date(data.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        setStats(prev => ({
          ...prev,
          logins: data.number_of_logins || 0,
          habitsCount: habitsArray.length,
          startDate: date,
          completedToday: completed,
        }));
      }
    } catch (err) {
      console.log("Stats Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.card, width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }]}>
          <MaterialCommunityIcons name="chart-arc" size={50} color={colors.primary} />
        </View>
        <Text style={[styles.titleText, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>Your Growth Story</Text>
        <Text style={[styles.subtitleText, { color: colors.subtext, marginVertical: 15, textAlign: 'center' }]}>
          Sign in to see your daily stats, streaks, and total progress.
        </Text>
        <TouchableOpacity 
          style={[styles.loginButton, { backgroundColor: colors.primary, width: '100%', marginTop: 20 }]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Sign In to See Stats</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={[styles.titleText, { color: colors.text }]}>Your Journey</Text>
          <Text style={[styles.subtitleText, { color: colors.subtext }]}>
            Tracking your growth since {stats.startDate}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            <View style={[styles.heroCard, { backgroundColor: isDarkMode ? colors.card : '#1E293B' }]}>
              <View>
                <Text style={[styles.heroLabel, { color: isDarkMode ? colors.subtext : '#94A3B8' }]}>
                  Tasks Smashed Today
                </Text>
                <Text style={styles.heroValue}>{stats.completedToday}</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{stats.completedToday > 0 ? 'ON FIRE' : 'STARTING'}</Text>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Text style={[styles.miniValue, { color: "#0EA5E9" }]}>{stats.completedToday}</Text>
                <Text style={[styles.miniLabel, { color: colors.text }]}>Daily Streak</Text>
                <Text style={[styles.subtext, { color: colors.subtext }]}>Tasks done</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Text style={[styles.miniValue, { color: "#8B5CF6" }]}>{stats.habitsCount}</Text>
                <Text style={[styles.miniLabel, { color: colors.text }]}>Active Habits</Text>
                <Text style={[styles.subtext, { color: colors.subtext }]}>In progress</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Text style={[styles.miniValue, { color: "#F59E0B" }]}>{stats.logins}</Text>
                <Text style={[styles.miniLabel, { color: colors.text }]}>Total Logins</Text>
                <Text style={[styles.subtext, { color: colors.subtext }]}>Loyalty level</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <Text style={[styles.miniValue, { color: "#10B981" }]}>{stats.luckynumber}</Text>
                <Text style={[styles.miniLabel, { color: colors.text }]}>Lucky Number</Text>
                <Text style={[styles.subtext, { color: colors.subtext }]}>Your daily vibe</Text>
              </View>
            </View>
          </>
        )}

        <View style={[
          styles.infoBox, 
          { backgroundColor: isDarkMode ? colors.card : '#EEF2FF', borderColor: colors.primary }
        ]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>Designer's Note</Text>
          <Text style={[styles.infoBody, { color: isDarkMode ? colors.subtext : '#475569' }]}>
            "Consistency is the playground of the dull." Keep checking in to see these numbers climb.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { marginBottom: 25 },
  titleText: { fontSize: 32, fontWeight: '800' },
  subtitleText: { fontSize: 15, marginTop: 4 },
  
  heroCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  heroLabel: { fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  heroValue: { color: '#FFFFFF', fontSize: 48, fontWeight: '800' },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  miniCard: {
    width: '48%', 
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  miniValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  miniLabel: { fontSize: 14, fontWeight: '700' },
  subtext: { fontSize: 11, marginTop: 2 },

  infoBox: {
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  infoTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  infoBody: { fontSize: 13, lineHeight: 18, fontStyle: 'italic' },

  iconBox: { borderRadius: 18 },
  loginButton: { 
    height: 55, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});