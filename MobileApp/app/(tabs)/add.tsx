import React, { useState } from 'react';
import {
  StyleSheet, View, FlatList, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; 
import { useAuth } from '../../context/AuthContext'; // USE THIS
import { supabase } from '../../supabase'; 

interface PresetTask {
  name: string;
  type: 'active' | 'passive';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const PRESET_TASKS: PresetTask[] = [
  { name: 'Drink Water', type: 'active', icon: 'water' },
  { name: 'Workout', type: 'active', icon: 'dumbbell' },
  { name: 'Read Quran', type: 'active', icon: 'book-open-variant' },
  { name: 'No Sugar', type: 'passive', icon: 'food-off' },
  { name: 'No Smoke', type: 'passive', icon: 'smoking-off' },
];

export default function AddScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth(); // Get global user
  
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [type, setType] = useState<'active' | 'passive'>('active');
  const [amount, setAmount] = useState('');

  const selectPreset = (task: PresetTask) => {
    setTaskName(task.name);
    setType(task.type);
    setAmount('');
  };

  const handleSave = async () => {
    if (!taskName.trim()) return;
    setLoading(true);

    try {
      if (!user) {
        Alert.alert("Error", "You must be logged in to add habits.");
        return;
      }

      const { error } = await supabase
        .from('habits')
        .insert([
          {
            name: taskName,
            type: type,
            amount: type === 'active' ? parseInt(amount) || 1 : null,
            completed: false,
            user_id: user.id, // Using ID from our AuthContext
          },
        ]);

      if (error) {
        Alert.alert("Save Failed", error.message);
      } else {
        router.replace('/(tabs)'); 
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong saving your habit.");
    } finally {
      setLoading(false);
    }
  };

  // --- GUEST VIEW ---
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <Surface style={[styles.iconBox, { backgroundColor: colors.card, width: 100, height: 100, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }]} elevation={2}>
          <MaterialCommunityIcons name="plus-circle-outline" size={50} color={colors.primary} />
        </Surface>
        <Text style={[styles.headerTitle, { color: colors.text, marginTop: 20, textAlign: 'center' }]}>Start a New Habit</Text>
        <Text style={[styles.headerSubtitle, { color: colors.subtext, marginVertical: 15, textAlign: 'center' }]}>
          Log in to create your custom daily grind and track your consistency.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => router.push('/login')}
          style={[styles.saveButton, { backgroundColor: colors.primary, width: '100%', marginTop: 20 }]}
          contentStyle={styles.buttonInner}
          labelStyle={styles.buttonLabel}
        >
          Sign In to Create Habits
        </Button>
      </SafeAreaView>
    );
  }

  // --- FORM VIEW ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>New Habit</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
              Choose a preset or create your own
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.subtext }]}>Quick Select</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={PRESET_TASKS}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.presetList}
              renderItem={({ item }) => {
                const isSelected = taskName === item.name;
                return (
                  <TouchableOpacity onPress={() => selectPreset(item)}>
                    <Surface style={[
                      styles.presetCard, 
                      { backgroundColor: colors.card },
                      isSelected && { backgroundColor: colors.primary }
                    ]} elevation={isSelected ? 4 : 1}>
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={24} 
                        color={isSelected ? '#FFF' : colors.primary} 
                      />
                      <Text style={[
                        styles.presetText, 
                        { color: colors.text },
                        isSelected && { color: '#FFF' }
                      ]}>{item.name}</Text>
                    </Surface>
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.divider }]}>
            <TextInput
              label="Habit Name"
              value={taskName}
              onChangeText={setTaskName}
              mode="outlined"
              activeOutlineColor={colors.primary}
              textColor={colors.text}
              style={[styles.input, { backgroundColor: colors.card }]}
              theme={{ colors: { outline: colors.divider, onSurfaceVariant: colors.subtext } }}
              editable={!loading}
            />

            <Text style={[styles.subLabel, { color: colors.text }]}>Type</Text>
            <SegmentedButtons
              value={type}
              onValueChange={(v) => setType(v as any)}
              buttons={[
                { value: 'active', label: 'Active', icon: 'run', checkedColor: '#FFF', uncheckedColor: colors.subtext },
                { value: 'passive', label: 'Avoidance', icon: 'cancel', checkedColor: '#FFF', uncheckedColor: colors.subtext },
              ]}
              style={styles.segmented}
              theme={{ 
                colors: { 
                  secondaryContainer: colors.primary, 
                  onSecondaryContainer: '#FFF', 
                  outline: colors.divider 
                } 
              }}
            />

            {type === 'active' && (
              <TextInput
                label="Daily Goal"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                activeOutlineColor={colors.primary}
                textColor={colors.text}
                style={[styles.input, { backgroundColor: colors.card }]}
                theme={{ colors: { outline: colors.divider, onSurfaceVariant: colors.subtext } }}
                left={<TextInput.Icon icon="counter" iconColor={colors.subtext} />}
                editable={!loading}
              />
            )}
          </View>

          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={loading}
            disabled={!taskName || loading}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            contentStyle={styles.buttonInner}
            labelStyle={styles.buttonLabel}
          >
            Create Habit
          </Button>

          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: colors.subtext }]}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  headerSubtitle: { fontSize: 16, marginTop: 4 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  presetList: { paddingRight: 20 },
  presetCard: { padding: 16, borderRadius: 20, marginRight: 12, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  presetText: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  formCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 30 },
  input: { marginBottom: 16 },
  subLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  segmented: { marginBottom: 20 },
  saveButton: { borderRadius: 16 },
  buttonInner: { height: 56 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  cancelBtn: { marginTop: 20, alignItems: 'center' },
  cancelText: { fontWeight: '600' },
  iconBox: { marginBottom: 10 }
});