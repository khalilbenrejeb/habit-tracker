import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Avatar, Button, Card, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  // Helper for small stat highlights
  const ProfileStat = ({ label, value, icon }: any) => (
    <View style={styles.statBox}>
      <MaterialCommunityIcons name={icon} size={20} color="#615EFC" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* TOP PROFILE HEADER */}
        <Surface style={styles.profileHeader} elevation={1}>
          <Avatar.Text 
            size={80} 
            label="YN" 
            style={styles.avatar} 
            labelStyle={styles.avatarLabel} 
          />
          <Text style={styles.userName}>Your Name</Text>
          <Text style={styles.userEmail}>developer@example.com</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => alert('Edit Profile')} 
            style={styles.editBtn}
            contentStyle={{ height: 36 }}
            labelStyle={{ fontSize: 13 }}
          >
            Edit Profile
          </Button>
        </Surface>

        {/* STATS ROW */}
        <View style={styles.statsRow}>
          <ProfileStat icon="fire" value="12" label="Day Streak" />
          <ProfileStat icon="medal" value="Elite" label="Rank" />
          <ProfileStat icon="check-all" value="120" label="Tasks" />
        </View>

        {/* ASSISTANT CARD */}
        <Card style={styles.assistantCard}>
          <View style={styles.assistantContent}>
            <View style={styles.assistantTextWrapper}>
              <Text style={styles.assistantTitle}>AI Assistant</Text>
              <Text style={styles.assistantSub}>Need help reaching your goals? Ask our AI for tips.</Text>
            </View>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="robot-outline" size={30} color="#615EFC" />
            </View>
          </View>
          <Card.Actions style={styles.assistantActions}>
            <Button 
              mode="contained" 
              onPress={() => router.push('/assistant' as any)}
              style={styles.assistantBtn}
              icon="sparkles"
            >
              Open Assistant
            </Button>
          </Card.Actions>
        </Card>

        {/* BADGES SECTION */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.badgeContainer}>
          {['Early Bird', 'Consistency King', 'Water Champ'].map((badge, i) => (
            <View key={i} style={styles.badge}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#059669" />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  
  // Profile Header
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 32,
    backgroundColor: '#FFF',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 3 },
    }),
  },
  avatar: { backgroundColor: '#615EFC' },
  avatarLabel: { fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 12 },
  userEmail: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  editBtn: { borderRadius: 10, borderColor: '#E2E8F0' },

  // Stats Row
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    backgroundColor: '#FFF',
    width: '31%',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 4 },
  statLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', fontWeight: '700' },

  // Assistant Card
  assistantCard: {
    borderRadius: 24,
    backgroundColor: '#1E293B',
    padding: 8,
    overflow: 'hidden',
  },
  assistantContent: { 
    flexDirection: 'row', 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  assistantTextWrapper: { flex: 1, paddingRight: 10 },
  assistantTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  assistantSub: { color: '#94A3B8', fontSize: 13, marginTop: 4, lineHeight: 18 },
  iconCircle: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(97, 94, 252, 0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  assistantActions: { padding: 12, paddingTop: 0 },
  assistantBtn: { width: '100%', borderRadius: 12, backgroundColor: '#615EFC' },

  // Badges
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 25, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ECFDF5', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5'
  },
  badgeText: { marginLeft: 6, color: '#065F46', fontSize: 12, fontWeight: '600' },
});