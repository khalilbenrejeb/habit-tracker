import React, { useState } from 'react';
import {
  StyleSheet, View, FlatList, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Alert
} from 'react-native';
import { TextInput, Button, SegmentedButtons, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../supabase'; // Ensure this path is correct

const PRESET_TASKS = [
  { name: 'Drink Water', type: 'active', icon: 'water' },
  { name: 'Workout', type: 'active', icon: 'dumbbell' },
  { name: 'Read Quran', type: 'active', icon: 'book-open-variant' },
  { name: 'No Sugar', type: 'passive', icon: 'food-off' },
  { name: 'No Smoke', type: 'passive', icon: 'smoking-off' },
];

export default function AddScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [type, setType] = useState<'active' | 'passive'>('active');
  const [amount, setAmount] = useState('');

  const selectPreset = (task: any) => {
    setTaskName(task.name);
    setType(task.type);
    setAmount('');
  };

  const handleSave = async () => {
    if (!taskName.trim()) return;
    
    setLoading(true);

    try {
      // 1. Get the current logged-in user's ID
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Error", "You must be logged in to add habits.");
        setLoading(false);
        return;
      }

      // 2. Insert the habit into Supabase
      const { error } = await supabase
        .from('habits')
        .insert([
          {
            name: taskName,
            type: type,
            amount: type === 'active' ? parseInt(amount) || 1 : null,
            completed: false,
            user_id: user.id, // Links it to Khalil
          },
        ]);

      if (error) {
        Alert.alert("Save Failed", error.message);
      } else {
        // 3. Success! Go back to the main list
        router.replace('/(tabs)'); 
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong saving your habit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Habit</Text>
            <Text style={styles.headerSubtitle}>Choose a preset or create your own</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Quick Select</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={PRESET_TASKS}
              keyExtractor={(item) => item.name}
              contentContainerStyle={styles.presetList}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => selectPreset(item)}>
                  <Surface style={[
                    styles.presetCard, 
                    taskName === item.name && styles.selectedPreset
                  ]}>
                    <MaterialCommunityIcons 
                      name={item.icon as any} 
                      size={24} 
                      color={taskName === item.name ? '#FFF' : '#615EFC'} 
                    />
                    <Text style={[
                      styles.presetText, 
                      taskName === item.name && styles.selectedPresetText
                    ]}>{item.name}</Text>
                  </Surface>
                </TouchableOpacity>
              )}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>Habit Details</Text>
            
            <TextInput
              label="Habit Name"
              value={taskName}
              onChangeText={setTaskName}
              mode="outlined"
              activeOutlineColor="#615EFC"
              style={styles.input}
              editable={!loading}
            />

            <Text style={styles.subLabel}>Type</Text>
            <SegmentedButtons
              value={type}
              onValueChange={(v) => setType(v as any)}
              buttons={[
                { value: 'active', label: 'Active', icon: 'run' },
                { value: 'passive', label: 'Avoidance', icon: 'cancel' },
              ]}
              style={styles.segmented}
              theme={{ colors: { secondaryContainer: '#EEF2FF', onSecondaryContainer: '#615EFC' } }}
            />

            {type === 'active' && (
              <View style={styles.amountContainer}>
                <TextInput
                  label="Daily Goal"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  mode="outlined"
                  activeOutlineColor="#615EFC"
                  style={styles.input}
                  left={<TextInput.Icon icon="counter" />}
                  editable={!loading}
                />
              </View>
            )}
          </View>

          <Button 
            mode="contained" 
            onPress={handleSave} 
            loading={loading}
            disabled={!taskName || loading}
            style={styles.saveButton}
            contentStyle={styles.buttonInner}
            labelStyle={styles.buttonLabel}
          >
            {loading ? "Saving..." : "Create Habit"}
          </Button>

          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 24 },
  header: { marginBottom: 30 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1 },
  presetList: { paddingRight: 20 },
  presetCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginRight: 12, alignItems: 'center', justifyContent: 'center', minWidth: 100, elevation: 2 },
  selectedPreset: { backgroundColor: '#615EFC' },
  presetText: { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#475569' },
  selectedPresetText: { color: '#FFF' },
  formCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 30 },
  input: { backgroundColor: '#FFF', marginBottom: 16 },
  subLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  segmented: { marginBottom: 20 },
  amountContainer: { marginTop: 10 },
  saveButton: { borderRadius: 16, backgroundColor: '#615EFC' },
  buttonInner: { height: 56 },
  buttonLabel: { fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { marginTop: 20, alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontWeight: '600' },
});