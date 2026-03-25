import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, SafeAreaView, ScrollView, Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { Avatar, Button, Card, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; 
import { useAuth } from '../../context/AuthContext'; 
import { supabase } from '../../supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    logins: 0,
    totalTasks: 0,
    rank: 'Rookie',
    badges: [] as string[]
  });

  useEffect(() => {
    if (user) fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('userdata')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const habits = data.habits || [];
        const completedCount = habits.filter((h: any) => h.completed).length;
        const loginCount = data.number_of_logins || 0;

        // --- DYNAMIC LOGIC ---
        // 1. Rank Logic
        let currentRank = 'Rookie';
        if (loginCount > 50) currentRank = 'Legend';
        else if (loginCount > 20) currentRank = 'Elite';
        else if (loginCount > 5) currentRank = 'Grinder';

        // 2. Badge Logic (Magic happens here)
        const earnedBadges = [];
        if (loginCount >= 1) earnedBadges.push('Early Bird');
        if (loginCount >= 10) earnedBadges.push('Consistency King');
        if (habits.some((h: any) => h.name.toLowerCase().includes('water') && h.completed)) {
          earnedBadges.push('Water Champ');
        }
        if (habits.length >= 5) earnedBadges.push('Goal Getter');

        setProfileData({
          logins: loginCount,
          totalTasks: completedCount,
          rank: currentRank,
          badges: earnedBadges
        });
      }
    } catch (err) {
      console.log("Profile Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.guestIconCircle, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="account-lock-outline" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>Join the Grind</Text>
        <Button mode="contained" onPress={() => router.push('/login')} style={[styles.loginBtn, { backgroundColor: colors.primary }]}>
          Login / Sign Up
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <Surface style={[styles.profileHeader, { backgroundColor: colors.card }]} elevation={1}>
          <Avatar.Text size={80} label={userInitial} style={{ backgroundColor: colors.primary }} />
          <Text style={[styles.userName, { color: colors.text }]}>Khalil</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>{user.email}</Text>
        </Surface>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* STATS ROW */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <MaterialCommunityIcons name="fire" size={20} color="#FF5722" />
                <Text style={[styles.statValue, { color: colors.text }]}>{profileData.logins}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Logins</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <MaterialCommunityIcons name="medal" size={20} color="#FFD700" />
                <Text style={[styles.statValue, { color: colors.text }]}>{profileData.rank}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Rank</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                <MaterialCommunityIcons name="check-all" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{profileData.totalTasks}</Text>
                <Text style={[styles.statLabel, { color: colors.subtext }]}>Tasks</Text>
              </View>
            </View>

            {/* ASSISTANT CARD */}
            <Card style={[styles.assistantCard, { backgroundColor: isDarkMode ? colors.card : '#1E293B' }]}>
               <View style={styles.assistantContent}>
                <View style={styles.assistantTextWrapper}>
                  <Text style={styles.assistantTitle}>AI Assistant</Text>
                  <Text style={[styles.assistantSub, { color: isDarkMode ? colors.subtext : '#94A3B8' }]}>
                    Ask for tips on how to level up to the next rank.
                  </Text>
                </View>
                <MaterialCommunityIcons name="robot-outline" size={40} color={colors.primary} />
              </View>
              <Card.Actions style={styles.assistantActions}>
                <Button mode="contained" onPress={() => router.push('/assistant')} style={{ width: '100%', borderRadius: 12, backgroundColor: colors.primary }}>
                  Open Assistant
                </Button>
              </Card.Actions>
            </Card>

            {/* BADGES */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
            <View style={styles.badgeContainer}>
              {profileData.badges.length > 0 ? (
                profileData.badges.map((badge, i) => (
                  <View key={i} style={[styles.badge, { backgroundColor: colors.card, borderColor: colors.divider }]}>
                    <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                    <Text style={[styles.badgeText, { color: colors.text }]}>{badge}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ color: colors.subtext, fontSize: 12 }}>Finish more habits to unlock badges.</Text>
              )}
            </View>
          </>
        )}

        <Button onPress={logout} textColor="#E11D48" style={{ marginTop: 40 }} icon="logout">
          Logout
        </Button>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  guestIconCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  loginBtn: { width: '100%', borderRadius: 16, marginTop: 30 },
  profileHeader: { alignItems: 'center', padding: 24, borderRadius: 32, marginBottom: 20 },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  userEmail: { fontSize: 14, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '31%', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 10, textTransform: 'uppercase', fontWeight: '700' },
  assistantCard: { borderRadius: 24, padding: 8 },
  assistantContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  assistantTextWrapper: { flex: 1 },
  assistantTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  assistantSub: { fontSize: 13, marginTop: 4 },
  assistantActions: { padding: 12, paddingTop: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 25, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { marginLeft: 6, fontSize: 12, fontWeight: '600' },
});