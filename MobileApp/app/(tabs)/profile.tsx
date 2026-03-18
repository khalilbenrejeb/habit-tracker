import React from 'react';
import { 
  StyleSheet, View, SafeAreaView, ScrollView, Platform, TouchableOpacity, StatusBar 
} from 'react-native';
import { Avatar, Button, Card, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; 
import { useAuth } from '../../context/AuthContext'; // USE THIS

interface ProfileStatProps {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { user, logout } = useAuth(); // Get user and logout function

  // Helper for small stat highlights
  const ProfileStat = ({ label, value, icon }: ProfileStatProps) => (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.divider }]}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
    </View>
  );

  // --- GUEST VIEW ---
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.guestIconCircle, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="account-lock-outline" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>Join the Grind</Text>
        <Text style={[styles.guestSubtitle, { color: colors.subtext }]}>
          Log in to track your tasks, earn achievements, and access your personal AI assistant.
        </Text>
        
        <Button 
          mode="contained" 
          onPress={() => router.push('/login')} 
          style={[styles.loginBtn, { backgroundColor: colors.primary }]}
          contentStyle={{ height: 55 }}
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        >
          Login / Sign Up
        </Button>
      </SafeAreaView>
    );
  }

  // --- PROFILE VIEW ---
  // Get first letter of email or name for Avatar
  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP PROFILE HEADER */}
        <Surface style={[styles.profileHeader, { backgroundColor: colors.card }]} elevation={1}>
          <Avatar.Text 
            size={80} 
            label={userInitial} 
            style={{ backgroundColor: colors.primary }} 
            labelStyle={styles.avatarLabel} 
          />
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.user_metadata?.full_name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>{user.email}</Text>
          
          <Button 
            mode="outlined" 
            onPress={() => console.log('Edit Profile')} 
            style={[styles.editBtn, { borderColor: colors.divider }]}
            textColor={colors.text}
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
        <Card style={[styles.assistantCard, { backgroundColor: isDarkMode ? colors.card : '#1E293B' }]}>
          <View style={styles.assistantContent}>
            <View style={styles.assistantTextWrapper}>
              <Text style={styles.assistantTitle}>AI Assistant</Text>
              <Text style={[styles.assistantSub, { color: isDarkMode ? colors.subtext : '#94A3B8' }]}>
                Need help reaching your goals? Ask our AI for tips.
              </Text>
            </View>
            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? colors.divider : 'rgba(97, 94, 252, 0.15)' }]}>
              <MaterialCommunityIcons name="robot-outline" size={30} color={colors.primary} />
            </View>
          </View>
          <Card.Actions style={styles.assistantActions}>
            <Button 
              mode="contained" 
              onPress={() => router.push('/assistant')}
              style={[styles.assistantBtn, { backgroundColor: colors.primary }]}
              icon="sparkles"
            >
              Open Assistant
            </Button>
          </Card.Actions>
        </Card>

        {/* BADGES SECTION */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.badgeContainer}>
          {['Early Bird', 'Consistency King', 'Water Champ'].map((badge, i) => (
            <View key={i} style={[
              styles.badge, 
              { 
                backgroundColor: isDarkMode ? colors.card : '#ECFDF5', 
                borderColor: isDarkMode ? colors.divider : '#D1FAE5' 
              }
            ]}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#059669" />
              <Text style={[styles.badgeText, { color: isDarkMode ? '#10B981' : '#065F46' }]}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <Button 
          onPress={logout} 
          textColor="#E11D48" 
          style={{ marginTop: 40, marginBottom: 20 }}
          icon="logout"
        >
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
  guestIconCircle: { 
    width: 120, height: 120, borderRadius: 60, 
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 }, android: { elevation: 2 } })
  },
  guestSubtitle: { fontSize: 16, textAlign: 'center', marginTop: 10, lineHeight: 24 },
  loginBtn: { width: '100%', borderRadius: 16, marginTop: 30 },
  profileHeader: {
    alignItems: 'center', padding: 24, borderRadius: 32, marginBottom: 20,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15 }, android: { elevation: 3 } }),
  },
  avatarLabel: { fontWeight: 'bold', color: '#FFF' },
  userName: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  userEmail: { fontSize: 14, marginBottom: 16 },
  editBtn: { borderRadius: 10, borderWidth: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '31%', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: 11, textTransform: 'uppercase', fontWeight: '700' },
  assistantCard: { borderRadius: 24, padding: 8, overflow: 'hidden' },
  assistantContent: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  assistantTextWrapper: { flex: 1, paddingRight: 10 },
  assistantTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  assistantSub: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  assistantActions: { padding: 12, paddingTop: 0 },
  assistantBtn: { width: '100%', borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 25, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  badgeText: { marginLeft: 6, fontSize: 12, fontWeight: '600' },
});