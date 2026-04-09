import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, 
  SectionList, ActivityIndicator, StatusBar, Alert 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';
import { Surface, ProgressBar, Button } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

const MOTIVATIONAL_QUOTES = [
  "The secret of your future is hidden in your daily routine.",
  "Your only limit is you. Level up.",
  "Small wins lead to big victories. Keep grinding.",
  "Focus on the step, not the mountain."
];

export default function HabitScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user } = useAuth(); 
  const router = useRouter();

  const [habits, setHabits] = useState<any[]>([]);
  const [xp, setXp] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [now, setNow] = useState(new Date());

  // Level Logic: 100 XP per level
  const levelData = useMemo(() => {
    const level = Math.floor(xp / 100) + 1;
    const progress = (xp % 100) / 100;
    return { level, progress };
  }, [xp]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 // 🔊 Shotgun XP Sound (PUMP)
async function playXpSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.myinstants.com/media/sounds/pump-shotgun-fortnite-loud.mp3' } 
    );
    await sound.setVolumeAsync(0.6); // Loud enough to feel it
    await sound.playAsync();
  } catch (e) { console.log("XP Sound error", e); }
}

// 🏆 Epic Level Up Sequence (Default Dance Bass Boosted -> Knocked Sound)
async function playLevelUpSound() {
  try {
    // 1. Load and Play the Bass Boosted Dance
    const { sound: dance } = await Audio.Sound.createAsync(
      { uri: 'https://www.myinstants.com/media/sounds/fortnite-default-dance.mp3' },
      { shouldPlay: true, volume: 0.7 }
    );

    // 2. Set a timeout for the "Knocked" punchline
    setTimeout(async () => {
      try {
        const { sound: knocked } = await Audio.Sound.createAsync(
          { uri: 'https://www.myinstants.com/media/sounds/fortnite-knocked.mp3' },
          { shouldPlay: true, volume: 1.0 }
        );
        
        // Cleanup: Unload sounds after they finish to free up memory
        knocked.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            knocked.unloadAsync();
            dance.unloadAsync();
          }
        });
      } catch (e) { console.log("Knock sound failed", e); }
    }, 4500);

  } catch (e) {
    console.log("Level Up sound sequence failed", e);
  }
}

  useFocusEffect(
    useCallback(() => {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setQuote(randomQuote);
      if (user) fetchUserData();
      else setLoading(false);
    }, [user])
  );

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('userdata').select('habits, xp').eq('id', user?.id).maybeSingle();
      if (error) throw error;
      setHabits(data?.habits || []);
      setXp(data?.xp || 0);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  
  const completeHabit = async (habitId: string) => {
  const oldLevel = Math.floor(xp / 100) + 1;
  const newXp = xp + 10;
  const newLevel = Math.floor(newXp / 100) + 1;

  // 1. Hit the Pump Shotgun sound for every completion
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  playXpSound();

  // 2. If Level Up occurs
  if (newLevel > oldLevel) {
    // Start the epic sequence
    playLevelUpSound();
    
    Alert.alert(
      "👑 LEVEL UP!",
      `GOATED. You reached LEVEL ${newLevel}.\nKeep the streak alive.`,
      [{ text: "GG", style: "default" }]
    );
  }

  // 3. Update Database & State
  const timestamp = new Date().toISOString();
  const updatedHabits = habits.map(h => 
    h.id === habitId ? { ...h, completed: true, updated_at: timestamp } : h
  );
  
  setHabits(updatedHabits);
  setXp(newXp);

  await supabase.from('userdata').update({ 
    habits: updatedHabits,
    xp: newXp 
  }).eq('id', user?.id);
};
  const getSimpleStreak = (startDateStr: string) => {
  const start = new Date(startDateStr);
  const diff = now.getTime() - start.getTime();
  
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  if (days > 0) {
    return `${days}d ${remainingHours}h streak`;
  }
  return `${totalHours}h streak`; // Will show 0h, 1h, etc.
};

  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
  };

  const sections = useMemo(() => {
    const active = habits.filter(h => h.type?.toLowerCase() !== 'passive');
    const passive = habits.filter(h => h.type?.toLowerCase() === 'passive');
    const todo = active.filter(h => !h.completed || !isToday(h.updated_at));
    const completed = active.filter(h => h.completed && isToday(h.updated_at));

    return [
      { title: 'Active Habits', data: todo },
      { title: 'COMPLETED', data: completed },
      { title: 'Habits to avoid', data: passive },
    ].filter(section => section.data.length > 0);
  }, [habits]);

  // AUTH GUARD: Show this if not logged in
  if (!user && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <View style={[styles.emptyIconBox, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={60} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to Level Up?</Text>
        <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
          Sign in to sync your habits, track your streaks, and start the grind.
        </Text>
        <TouchableOpacity style={[styles.authButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/login')}>
          <Text style={styles.authButtonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{ padding: 20, flex: 1 }}>
        
        {/* 🏆 LEVEL HEADER */}
        <Surface style={[styles.levelCard, { backgroundColor: colors.card }]} elevation={2}>
          <View style={styles.levelRow}>
            <View style={[styles.levelBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.levelBadgeText}>{levelData.level}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <View style={styles.xpTextRow}>
                <Text style={[styles.levelLabel, { color: colors.text }]}>LEVEL {levelData.level}</Text>
                <Text style={[styles.xpText, { color: colors.subtext }]}>{xp % 100} / 100 XP</Text>
              </View>
              <ProgressBar progress={levelData.progress} color={colors.primary} style={styles.levelBar} />
            </View>
          </View>
        </Surface>

        <View style={styles.headerRow}>
          <Text style={{ color: colors.text, fontSize: 32, fontWeight: '900' }}>The Grind</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => {
                setIsDeleteMode(!isDeleteMode);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }} 
              style={[styles.headerBtn, { backgroundColor: isDeleteMode ? '#EF4444' : colors.card, marginRight: 10 }]}
            >
              <MaterialCommunityIcons name={isDeleteMode ? "close" : "trash-can-outline"} size={22} color={isDeleteMode ? "#FFF" : colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/add')} style={[styles.headerBtn, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color={colors.primary} /></View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={[styles.sectionHeader, { color: colors.subtext }]}>{title}</Text>
            )}
            renderItem={({ item }) => {
              const isPassive = item.type?.toLowerCase() === 'passive';
              const isDone = item.completed && isToday(item.updated_at);

              return (
                <TouchableOpacity activeOpacity={0.8} onPress={() => {
                   if (isDeleteMode) {
                      Alert.alert("Remove Habit", `Delete "${item.name}"?`, [
                        { text: "Cancel" },
                        { text: "Delete", 
  style: 'destructive', 
  onPress: async () => { // Added async
    const updated = habits.filter(h => h.id !== item.id);
    setHabits(updated);
    // Added await to ensure DB saves
    const { error } = await supabase.from('userdata').update({ habits: updated }).eq('id', user?.id);
    if (error) Alert.alert("Error", "Could not delete from database.");
  }}
                      ]);
                   } else if (isPassive) {
                     router.push({ pathname: '/passiveHabitScreen', params: { id: item.id } });
                   } else if (!isDone) {
                     Alert.alert("Complete Habit?",`Confirming "${item.name}" for today.`,
    [
      { text: "Not yet", style: "cancel" },
      { 
        text: "Let's Go!", 
        onPress: () => completeHabit(item.id) 
      }
    ]
  );
                   }
                }}>
                  <Surface 
  style={[
    styles.habitCard, 
    { backgroundColor: colors.card, opacity: isDone && !isPassive ? 0.6 : 1 },
    isDeleteMode && { borderColor: '#EF4444', borderWidth: 2, borderStyle: 'solid' } 
  ]} 
  elevation={isDeleteMode ? 0 : 1}
>
                    <View style={styles.cardMain}>
                      <View style={[styles.iconCircle, { backgroundColor: isDone ? colors.primary : (isPassive ? '#8B5CF622' : colors.divider) }]}>
                        <MaterialCommunityIcons 
                          name={isPassive ? "fire" : (isDone ? "check" : "flash-outline")} 
                          size={22} 
                          color={isDone ? "#FFF" : (isPassive ? "#8B5CF6" : colors.subtext)} 
                        />
                      </View>
                      <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={[styles.habitName, { color: colors.text, textDecorationLine: isDone && !isPassive ? 'line-through' : 'none' }]}>
                          {item.name}
                        </Text>
                        <Text style={{ color: colors.subtext, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                          {isPassive 
                            ? `🔥 ${getSimpleStreak(item.created_at)}` 
                            : (isDone ? "GOAL REACHED" : `+10 XP • ${item.type}`)}
                        </Text>
                      </View>
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  levelCard: { padding: 15, borderRadius: 25, marginBottom: 20 },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  levelBadgeText: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  xpTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  levelLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  xpText: { fontSize: 12, fontWeight: '700' },
  levelBar: { height: 8, borderRadius: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  habitCard: { padding: 16, borderRadius: 22, marginBottom: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  habitName: { fontSize: 17, fontWeight: '800' },
  sectionHeader: { fontSize: 12, fontWeight: '900', marginTop: 15, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center' },
  emptyIconBox: { width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', opacity: 0.7, marginBottom: 30, paddingHorizontal: 20 },
  authButton: { paddingHorizontal: 40, height: 50, borderRadius: 15, justifyContent: 'center' },
  authButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' }
});