import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput as RNTextInput,
  Platform,
} from 'react-native';
import { Switch, Text, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('Guest User');
  const [notifications, setNotifications] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState('08:00');

  // Helper for a clean row
  const SettingRow = ({ icon, label, children, description }: any) => (
    <View style={styles.settingWrapper}>
      <View style={styles.settingMain}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={22} color="#615EFC" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        <View style={styles.controlContainer}>{children}</View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* NEW: PROFILE AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <RNTextInput
            style={styles.usernameInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Edit Name"
          />
          <Text style={styles.userStatus}>Free Member</Text>
        </View>

        {/* SECTION: PREFERENCES */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          <SettingRow icon="weather-night" label="Dark Mode">
            <Switch 
               value={darkMode} 
               onValueChange={() => setDarkMode(!darkMode)} 
               color="#615EFC"
            />
          </SettingRow>
          
          <Divider style={styles.divider} />
          
          <SettingRow icon="bell-outline" label="Reminders">
            <Switch 
              value={notifications} 
              onValueChange={() => setNotifications(!notifications)} 
              color="#615EFC"
            />
          </SettingRow>

          <Divider style={styles.divider} />

          <SettingRow icon="clock-outline" label="Goal Time">
             <RNTextInput
              style={styles.timeInput}
              value={dailyReminderTime}
              onChangeText={setDailyReminderTime}
              keyboardType="numbers-and-punctuation"
            />
          </SettingRow>
        </View>

        {/* NEW: SUPPORT SECTION */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.simpleRow} onPress={() => alert('Thanks for the rating!')}>
            <MaterialCommunityIcons name="star-outline" size={22} color="#64748B" />
            <Text style={styles.rowLabel}>Rate the App</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.simpleRow} onPress={() => alert('Support email: help@habitapp.com')}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color="#64748B" />
            <Text style={styles.rowLabel}>Get Help</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Built with ❤️ • 2026</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24 },
  
  // Avatar Styling
  avatarSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#615EFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#615EFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarLetter: { color: '#FFF', fontSize: 32, fontWeight: '800' },
  usernameInput: { fontSize: 20, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  userStatus: { fontSize: 13, color: '#94A3B8', marginTop: 4 },

  sectionHeader: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#94A3B8', 
    textTransform: 'uppercase', 
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginBottom: 25,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },

  settingWrapper: { paddingVertical: 18 },
  settingMain: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: '#334155' },
  settingDescription: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  controlContainer: { marginLeft: 10 },

  timeInput: {
    fontSize: 16,
    color: '#615EFC',
    fontWeight: '700',
    textAlign: 'right',
    minWidth: 60,
  },

  divider: { backgroundColor: '#F8FAFC' },

  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  rowLabel: { flex: 1, marginLeft: 14, fontSize: 16, fontWeight: '500', color: '#475569' },

  versionText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
});