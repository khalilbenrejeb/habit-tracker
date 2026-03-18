import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
// FIX: Ensure icons are imported from @expo/vector-icons
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'expo-router';

export default function HabitScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth(); 
  const router = useRouter();

  // If colors haven't loaded yet, show a blank view to prevent "undefined" errors
  if (!colors) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        {/* If this still errors, try changing name to "lock-outline" */}
        <MaterialCommunityIcons name="lock" size={80} color={colors.primary} />
        
        <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>Locked</Text>
        
        <Text style={{ color: colors.subtext, textAlign: 'center', marginVertical: 10 }}>
          You need to be logged in to see your habits.
        </Text>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: colors.primary }]} 
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>
          Welcome, {user.email}
        </Text>
        
        <TouchableOpacity 
          onPress={logout} 
          style={[styles.logoutBtn, { borderColor: colors.primary }]}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  btn: { 
    padding: 15, 
    borderRadius: 12, 
    marginTop: 20, 
    width: '100%', 
    alignItems: 'center' 
  },
  logoutBtn: {
    marginTop: 40,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    width: 100
  }
});