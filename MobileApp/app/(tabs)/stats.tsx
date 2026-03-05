import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  Platform 
} from 'react-native';

export default function StatsScreen() {
  // Static data - ready for real data later
  const stats = {
    logins: 34,
    habits: 7,
    startDate: 'Feb 01, 2026',
    totalTasksCompleted: 120,
    dailyTasksCompleted: 3,
    luckynumber: Math.floor(Math.random() * 100) + 1,
  };

  // Helper component for small grid cards
  const StatCard = ({ label, value, subtext, color = '#615EFC' }) => (
    <View style={styles.miniCard}>
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Your Journey</Text>
          <Text style={styles.subtitleText}>Tracking your growth since {stats.startDate}</Text>
        </View>

        {/* HERO STAT (The big achievement) */}
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Total Tasks Smashed</Text>
            <Text style={styles.heroValue}>{stats.totalTasksCompleted}</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.badgeText}>MVP</Text>
          </View>
        </View>

        {/* STATS GRID */}
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

        {/* EXTRA PROFESSIONAL TOUCH: MOTIVATION FOOTER */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Designer's Note</Text>
          <Text style={styles.infoBody}>
            "Consistency is the playground of the dull." Keep checking in to see these numbers climb.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24 },
  header: { marginBottom: 25 },
  titleText: { fontSize: 32, fontWeight: '800', color: '#0F172A' },
  subtitleText: { fontSize: 15, color: '#64748B', marginTop: 4 },
  
  // Big Hero Card
  heroCard: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  heroLabel: { color: '#94A3B8', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
  heroValue: { color: '#FFFFFF', fontSize: 48, fontWeight: '800' },
  heroBadge: {
    backgroundColor: '#615EFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  // Grid Layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  miniCard: {
    backgroundColor: '#FFF',
    width: '48%', // Fits two per row with gap
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  miniValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  miniLabel: { fontSize: 14, fontWeight: '700', color: '#334155' },
  subtext: { fontSize: 11, color: '#94A3B8', marginTop: 2 },

  // Info Box
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#615EFC',
  },
  infoTitle: { color: '#615EFC', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  infoBody: { color: '#475569', fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
});