import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  FlatList, Alert, StatusBar, ImageBackground, Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../supabase';
import { Surface } from 'react-native-paper';

const { width } = Dimensions.get('window');

export default function PassiveHabitScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [now, setNow] = useState(new Date());

const checkAndAwardXP = async (selectedHabit: any) => {
    if (!selectedHabit || !user) return;

    const start = new Date(selectedHabit.created_at);
    const lastReward = selectedHabit.last_xp_reward ? new Date(selectedHabit.last_xp_reward) : start;
    
    // Calculate how many full days passed since the last reward
    const diffInMs = now.getTime() - lastReward.getTime();
    const daysToReward = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (daysToReward >= 1) {
      const xpEarned = daysToReward * 10;

      // 1. Get current user stats (XP and Level)
      const { data: userData } = await supabase
        .from('userdata')
        .select('xp, habits')
        .eq('id', user.id)
        .single();

      const newXP = (userData?.xp || 0) + xpEarned;
      
      // 2. Update the specific habit's "last reward" timestamp
      const updatedHabits = userData?.habits.map((h: any) => 
        h.id === selectedHabit.id ? { ...h, last_xp_reward: new Date().toISOString() } : h
      );

      // 3. Save everything back to Supabase
      await supabase.from('userdata').update({ 
        xp: newXP, 
        habits: updatedHabits 
      }).eq('id', user.id);

      Alert.alert("LEVEL UP!", `You stayed disciplined for ${daysToReward} more day(s). +${xpEarned} XP added!`);
    }
  };

  

  // Get the ID from the previous screen
  const { id } = useLocalSearchParams();


  // 1. The Clock: Keeps the seconds ticking live
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch: Grabbing only the Passive habits
  useFocusEffect(
    useCallback(() => {
      if (user) fetchPassiveHabits();
    }, [user])
  );

  const fetchPassiveHabits = async () => {
    const { data } = await supabase
      .from('userdata')
      .select('habits')
      .eq('id', user?.id)
      .maybeSingle();
    
    const all = data?.habits || [];
    const selectedHabit = all.find((h: any) => h.id === id);

    if (selectedHabit) {
      setHabits([selectedHabit]);
      // Run the XP check here
      checkAndAwardXP(selectedHabit);
    }
  };

  // 3. Stats & Rank Logic
  const getStats = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const diff = now.getTime() - start.getTime();

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    let rank = "Noob 🤡";
    let rankColor = "#94A3B8";
    if (d >= 90) { rank = "Legend 👑"; rankColor = "#F59E0B"; }
    else if (d >= 30) { rank = "Grandmaster 🏆"; rankColor = "#8B5CF6"; }
    else if (d >= 7) { rank = "Average 🛡️"; rankColor = "#0EA5E9"; }
    else if (d >= 2) { rank = "Survivor ⚔️"; rankColor = "#10B981"; }

    return { d, h, m, s, rank, rankColor };
  };

  // 4. Relapse: Reset to 0
  const handleRelapse = (habitId: string) => {
    Alert.alert(
      "DID YOU ACTUALLY RELAPSE?",
      "Be honest with yourself, dawg. This resets everything to zero.",
      [
        { text: "No, I'm chilling", style: "cancel" },
        { 
          text: "Yes, I failed", 
          style: "destructive",
          onPress: async () => {
            // Get current full list to update specifically the one habit
            const { data } = await supabase.from('userdata').select('habits').eq('id', user?.id).maybeSingle();
            const allHabits = data?.habits || [];
            
            const updated = allHabits.map((h: any) => 
              h.id === habitId ? { ...h, created_at: new Date().toISOString() } : h
            );

            setHabits(updated.filter((h: any) => h.type?.toLowerCase() === 'passive'));
            await supabase.from('userdata').update({ habits: updated }).eq('id', user?.id);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: colors.primary }]}>SYSTEM RECOVERY</Text>
        <Text style={[styles.title, { color: colors.text }]}>Passive Grind</Text>
      </View>

      <FlatList
        data={habits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const { d, h, m, s, rank, rankColor } = getStats(item.created_at);
          return (
            <Surface style={[styles.card, { backgroundColor: colors.card }]} elevation={5}>
              <Text style={[styles.habitTitle, { color: colors.text }]}>{item.name}</Text>
              
              <View style={[styles.rankBadge, { backgroundColor: rankColor + '20' }]}>
                <Text style={[styles.rankText, { color: rankColor }]}>{rank}</Text>
              </View>

              {/* MASSIVE COUNTER */}
              <View style={styles.counterGrid}>
                <TimeUnit value={d} label="Days" color={colors.text} />
                <TimeUnit value={h} label="Hours" color={colors.text} />
                <TimeUnit value={m} label="Mins" color={colors.text} />
                <TimeUnit value={s} label="Secs" color={colors.primary} />
              </View>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.relapseBtn, { backgroundColor: '#EF4444' }]} 
                onPress={() => handleRelapse(item.id)}
              >
                <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
                <Text style={styles.relapseText}>RELAPSED / RESET</Text>
              </TouchableOpacity>
            </Surface>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: colors.subtext, marginTop: 50 }}>
            No passive habits found. Add some in the main screen!
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const TimeUnit = ({ value, label, color }: any) => (
  <View style={styles.timeBox}>
    <Text style={[styles.timeValue, { color }]}>{value.toString().padStart(2, '0')}</Text>
    <Text style={styles.timeLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 20 },
  headerLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  title: { fontSize: 36, fontWeight: '900' },
  card: { 
    marginHorizontal: 20, 
    marginVertical: 12, 
    padding: 25, 
    borderRadius: 35, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  habitTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  rankBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 25 },
  rankText: { fontWeight: '900', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  counterGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginBottom: 35,
    paddingHorizontal: 10
  },
  timeBox: { alignItems: 'center' },
  timeValue: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  timeLabel: { fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', marginTop: 5, fontWeight: '700' },
  relapseBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15, 
    paddingHorizontal: 35, 
    borderRadius: 20,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  relapseText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1, marginLeft: 8 }
});