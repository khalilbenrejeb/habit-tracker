import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Platform,
  TouchableOpacity
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // USE THIS instead of supabase.auth
import { useRouter } from 'expo-router';

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  color?: string;
}

export default function StatsScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); // Global auth state
  const router = useRouter();

  // DUMMY DATA 
  const stats = {
    logins: 34,
    habits: 7,
    startDate: 'Feb 01, 2026',
    totalTasksCompleted: 120,
    dailyTasksCompleted: 3,
    luckynumber: Math.floor(Math.random() * 100) + 1,
  };

  const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, color = colors.primary }) => (
    <View style={[styles.miniCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: colors.text }]}>{label}</Text>
      {subtext && <Text style={[styles.subtext, { color: colors.subtext }]}>{subtext}</Text>}
    </View>
  );

  // --- GUEST VIEW (NOT LOGGED IN) ---
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

  // --- MAIN STATS VIEW (LOGGED IN) ---
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

        <View style={[styles.heroCard, { backgroundColor: isDarkMode ? colors.card : '#1E293B' }]}>
          <View>
            <Text style={[styles.heroLabel, { color: isDarkMode ? colors.subtext : '#94A3B8' }]}>
              Total Tasks Smashed
            </Text>
            <Text style={styles.heroValue}>{stats.totalTasksCompleted}</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>MVP</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <StatCard 
            label="Daily Streak" 
            value={stats.dailyTasksCompleted} 
            subtext="Tasks today" 
            color="#0EA5E9" 
          />
          <StatCard 
            label="Active Habits" 
            value={stats.habits} 
            subtext="In progress" 
            color="#8B5CF6" 
          />
          <StatCard 
            label="Total Logins" 
            value={stats.logins} 
            subtext="Loyalty level" 
            color="#F59E0B" 
          />
          <StatCard 
            label="Lucky Number" 
            value={stats.luckynumber} 
            subtext="Your daily vibe" 
            color="#10B981" 
          />
        </View>

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