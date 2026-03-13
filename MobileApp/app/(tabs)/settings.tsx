import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Switch } from 'react-native-paper';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const { isDarkMode, toggleTheme, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
        <Switch 
          value={isDarkMode} 
          onValueChange={toggleTheme} 
          color={colors.primary} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 18, fontWeight: '600' }
});