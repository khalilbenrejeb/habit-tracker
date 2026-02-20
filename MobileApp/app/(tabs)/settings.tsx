import { ThemedText } from '@/components/themed-text';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Button, Switch } from 'react-native-paper';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState('YourName');
  const [notifications, setNotifications] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState('08:00');
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Settings</ThemedText>

      <View style={styles.settingItem}>
        <ThemedText>Dark Mode</ThemedText>
        <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
      </View>

      <View style={styles.settingItem}>
        <ThemedText>Username</ThemedText>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />
      </View>

      <View style={styles.settingItem}>
        <ThemedText>Notifications</ThemedText>
        <Switch value={notifications} onValueChange={() => setNotifications(!notifications)} />
      </View>

      <View style={styles.settingItem}>
        <ThemedText>Daily Reminder Time</ThemedText>
        <TextInput
          style={styles.input}
          value={dailyReminderTime}
          onChangeText={setDailyReminderTime}
          placeholder="HH:MM"
        />
      </View>

      <View style={styles.settingItem}>
        <ThemedText>Auto Backup</ThemedText>
        <Switch value={autoBackup} onValueChange={() => setAutoBackup(!autoBackup)} />
      </View>

      <Button mode="contained" onPress={() => alert('Settings Saved')} style={styles.saveBtn}>
        Save Changes
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, width: '60%', borderRadius: 4 },
  saveBtn: { marginTop: 20 },
});