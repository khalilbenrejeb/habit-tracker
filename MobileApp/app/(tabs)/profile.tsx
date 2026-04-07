import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity, Image, Alert 
} from 'react-native';
import { Avatar, Button, Card, Text, Surface, Portal, Modal, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../../context/ThemeContext'; 
import { useAuth } from '../../context/AuthContext'; 
import { supabase } from '../../supabase';

// 🎨 7 Clean "Drawn" Avatars (PSN style vibe)
const PRESETS = [
  'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&backgroundColor=b6e3f4', // Blue background
  'https://api.dicebear.com/7.x/adventurer/png?seed=Aneka&backgroundColor=c0aede', // Purple background
  'https://api.dicebear.com/7.x/adventurer/png?seed=Max&backgroundColor=d1d4f9',   // Light Blue
  'https://api.dicebear.com/7.x/adventurer/png?seed=Jack&backgroundColor=ffdfbf',  // Peach
  'https://api.dicebear.com/7.x/adventurer/png?seed=Luna&backgroundColor=ffd5dc',  // Pink
  'https://api.dicebear.com/7.x/adventurer/png?seed=Zoe&backgroundColor=d1f4f9',   // Cyan
  'https://api.dicebear.com/7.x/adventurer/png?seed=Oliver&backgroundColor=ffecb3',// Yellow
];

const ACHIEVEMENTS = [
  { id: '1', name: 'Early Bird', icon: 'weather-sunset-up', color: '#FFB300', desc: 'Login 1 time' },
  { id: '2', name: 'Grinder', icon: 'arm-flex', color: '#FF5252', desc: '5+ Logins' },
  { id: '3', name: 'Elite', icon: 'crown', color: '#7C4DFF', desc: '20+ Logins' },
  { id: '4', name: 'Legend', icon: 'trophy', color: '#00E676', desc: '50+ Logins' },
];

export default function ProfileScreen() {
  const { colors, isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false); 
  const [profileData, setProfileData] = useState({ logins: 0, totalTasks: 0, rank: 'Rookie' });

  useEffect(() => {
    if (user) fetchProfileData();
    else setLoading(false);
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('userdata').select('*').eq('id', user?.id).maybeSingle();
      if (error) throw error;
      if (data) {
        setAvatarUrl(data.avatar_url);
        const loginCount = data.number_of_logins || 0;
        let rank = 'Rookie';
        if (loginCount > 50) rank = 'Legend';
        else if (loginCount > 20) rank = 'Elite';
        else if (loginCount > 5) rank = 'Grinder';
        setProfileData({ logins: loginCount, totalTasks: (data.habits || []).filter((h: any) => h.completed).length, rank });
      }
    } catch (err) { console.log(err); } finally { setLoading(false); }
  };

  const handlePresetSelect = async (url: string) => {
    setMenuVisible(false);
    setUploading(true);
    try {
      setAvatarUrl(url);
      const { error } = await supabase.from('userdata').update({ avatar_url: url }).eq('id', user?.id);
      if (error) throw error;
    } catch (e) { Alert.alert("Error", "Failed to save avatar choice."); }
    finally { setUploading(false); }
  };

  const pickImage = async () => {
    setMenuVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert("Access Denied", "We need gallery access to upload a pic.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.3, base64: true,
    });

    if (result.canceled || !result.assets[0].base64) return;

    try {
      setUploading(true);
      const file = result.assets[0];
      // FIX: Use a unique filename every time to avoid cache/policy issues
      const fileName = `avatar_${user?.id}_${Date.now()}.png`; 

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(file.base64), { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      const { error: dbError } = await supabase.from('userdata').update({ avatar_url: publicUrl }).eq('id', user?.id);
      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
    } catch (err: any) {
      Alert.alert("Upload Error", err.message || "Check your Supabase Storage policies.");
    } finally { setUploading(false); }
  };

  if (!user && !loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <MaterialCommunityIcons name="account-lock" size={80} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Identity Required</Text>
        <Button mode="contained" onPress={() => router.push('/login')} style={styles.authButton}>Sign In / Sign Up</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Portal>
        <Modal visible={menuVisible} onDismiss={() => setMenuVisible(false)} contentContainerStyle={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Profile Picture</Text>
          <Button mode="contained" icon="camera" onPress={pickImage} style={styles.modalBtn}>Custom Upload</Button>
          <View style={styles.presetGrid}>
            {PRESETS.map((url, i) => (
              <TouchableOpacity key={i} onPress={() => handlePresetSelect(url)}>
                <Image source={{ uri: url }} style={styles.modalPresetImg} />
              </TouchableOpacity>
            ))}
          </View>
          <Button onPress={() => setMenuVisible(false)} textColor={colors.subtext}>Cancel</Button>
        </Modal>
      </Portal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.profileHeader, { backgroundColor: colors.card }]} elevation={1}>
          {/* ⚙️ SETTINGS ICON - PUT IT HERE */}
    <IconButton
      icon="cog"
      iconColor={colors.subtext}
      size={24}
      style={styles.settingsIcon}
      onPress={() => router.push('/settings')} 
    />
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.avatarWrapper}>
            {avatarUrl ? <Avatar.Image size={110} source={{ uri: avatarUrl }} /> : <Avatar.Icon size={110} icon="account" />}
            <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}><MaterialCommunityIcons name="pencil" size={16} color="#FFF" /></View>
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.user_metadata?.first_name || 'Grinder'}</Text>
          <Text style={[styles.userEmail, { color: colors.subtext }]}>{user?.email}</Text>
        </Surface>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementScroll}>
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = 
              (ach.id === '1' && profileData.logins >= 1) ||
              (ach.id === '2' && profileData.logins >= 5) ||
              (ach.id === '3' && profileData.logins >= 20) ||
              (ach.id === '4' && profileData.logins >= 50);

            return (
              <Surface key={ach.id} style={[styles.achCard, { backgroundColor: colors.card, opacity: isUnlocked ? 1 : 0.3 }]} elevation={1}>
                <MaterialCommunityIcons name={ach.icon as any} size={30} color={isUnlocked ? ach.color : colors.subtext} />
                <Text style={[styles.achName, { color: colors.text }]}>{ach.name}</Text>
                <Text style={styles.achDesc}>{ach.desc}</Text>
              </Surface>
            );
          })}
        </ScrollView>

        <View style={styles.statsRow}>
          <StatBox icon="fire" label="Logins" value={profileData.logins} color="#FF5722" colors={colors} />
          <StatBox icon="medal" label="Rank" value={profileData.rank} color="#FFD700" colors={colors} />
          <StatBox icon="check-all" label="Tasks" value={profileData.totalTasks} color={colors.primary} colors={colors} />
        </View>

        <Button onPress={logout} textColor="#E11D48" icon="logout" style={{ marginTop: 40 }}>Logout</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatBox = ({ icon, label, value, color, colors }: any) => (
  <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.divider }]}>
    <MaterialCommunityIcons name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  settingsIcon: {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10, // Ensures it stays on top
},
  scrollContent: { padding: 20 },
  profileHeader: { alignItems: 'center', padding: 30, borderRadius: 35, marginBottom: 25 },
  avatarWrapper: { position: 'relative' },
  cameraBadge: { position: 'absolute', bottom: 5, right: 5, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#121212' },
  userName: { fontSize: 26, fontWeight: '900', marginTop: 15 },
  userEmail: { fontSize: 14, opacity: 0.6 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 15, marginTop: 10 },
  achievementScroll: { flexDirection: 'row', marginBottom: 30, paddingBottom: 10 },
  achCard: { width: 110, padding: 15, borderRadius: 24, alignItems: 'center', marginRight: 15 },
  achName: { fontSize: 13, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  achDesc: { fontSize: 10, color: '#888', textAlign: 'center', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { width: '31%', padding: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', marginTop: 2 },
  modalContent: { margin: 20, padding: 25, borderRadius: 30 },
  modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  modalBtn: { borderRadius: 15, marginBottom: 20 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 20 },
  modalPresetImg: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#f0f0f0' },
  authButton: { width: '100%', height: 50, marginTop: 20, borderRadius: 15 },
  emptyTitle: { fontSize: 24, fontWeight: '800', marginTop: 15 }
  
});