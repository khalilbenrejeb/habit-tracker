import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'expo-router';
import { supabase } from '../../supabase';
import { Surface } from 'react-native-paper';

export default function HabitScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth(); 
  const router = useRouter();

  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('userdata')
        .select('habits')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setHabits(data?.habits || []);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: string) => {
    // 1. Update UI immediately (Optimistic Update)
    const updatedHabits = habits.map(h => 
      h.id === habitId ? { ...h, completed: !h.completed } : h
    );
    setHabits(updatedHabits);

    try {
      // 2. Push the entire updated array back to Supabase
      const { error } = await supabase
        .from('userdata')
        .update({ habits: updatedHabits })
        .eq('id', user?.id);

      if (error) throw error;
    } catch (err) {
      Alert.alert("Error", "Failed to update habit. Try again.");
      // Rollback if it fails
      fetchHabits();
    }
  };

  if (!colors) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <MaterialCommunityIcons name="lock-outline" size={80} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text, marginTop: 20 }]}>Locked</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={() => router.push('/login')}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ padding: 24, flex: 1 }}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={{ color: colors.subtext, fontSize: 14, fontWeight: '600' }}>DAILY GRIND</Text>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>Habits</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/add')} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={habits}
            keyExtractor={(item, index) => item.id || index.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isDone = item.completed;
              return (
                <TouchableOpacity activeOpacity={0.7} onPress={() => toggleHabit(item.id)}>
                  <Surface 
                    style={[
                      styles.habitCard, 
                      { backgroundColor: colors.card, opacity: isDone ? 0.6 : 1 }
                    ]} 
                    elevation={isDone ? 0 : 1}
                  >
                    <View style={styles.cardMain}>
                      <MaterialCommunityIcons 
                        name={isDone ? "checkbox-marked-circle" : "circle-outline"} 
                        size={28} 
                        color={isDone ? colors.primary : colors.subtext} 
                      />
                      <View style={{ marginLeft: 15 }}>
                        <Text style={[
                          styles.habitName, 
                          { color: colors.text, textDecorationLine: isDone ? 'line-through' : 'none' }
                        ]}>
                          {item.name}
                        </Text>
                        <Text style={{ color: colors.subtext, fontSize: 12, textTransform: 'uppercase' }}>
                          {item.type} {item.amount ? `• Goal: ${item.amount}` : ''}
                        </Text>
                      </View>
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="Leaf" size={50} color={colors.divider} />
                <Text style={{ color: colors.subtext, marginTop: 10 }}>Nothing here yet. Build something.</Text>
              </View>
            }
          />
        )}
        
        {/* Footer actions */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={{ color: colors.subtext, fontSize: 12 }}>Logout: {user.email}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: { 
    padding: 18, 
    borderRadius: 16, 
    marginTop: 20, 
    width: '100%', 
    alignItems: 'center' 
  },
  habitCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  habitName: { 
    fontSize: 17, 
    fontWeight: '700' 
  },
  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
    opacity: 0.5
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    alignItems: 'center'
  },
  logoutBtn: {
    padding: 10
  }
});