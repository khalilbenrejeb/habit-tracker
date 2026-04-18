import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert,
} from 'react-native';
// 1. New Imports for Google
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Configure Google on Load
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '217079460112-vkgl0504jhv63oktlqoatvfkaguth35u.apps.googleusercontent.com', // Get from Google Console
      iosClientId: '217079460112-99geqe8e42o0a0t10umqcnf38ajrro1o.apps.googleusercontent.com', // Get from Google Console
      offlineAccess: true,
    });
  }, []);

  const finalizeLogin = async (userData: any) => {
    try {
      const { data: stats } = await supabase
        .from('userdata')
        .select('number_of_logins')
        .eq('id', userData.id)
        .single();

      const currentLogins = stats?.number_of_logins || 0;

      await supabase
        .from('userdata')
        .upsert({ 
          id: userData.id, 
          number_of_logins: currentLogins + 1 
        }, { onConflict: 'id' });

      setUser(userData); 
      router.replace('/(tabs)'); 
    } catch (err) {
      console.log("Stats update failed, but logging in anyway.");
      setUser(userData); 
      router.replace('/(tabs)');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Fill in all fields.");
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('users') 
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error || !data) {
        setLoading(false);
        Alert.alert("Login Failed", "Invalid email or password.");
      } else {
        await finalizeLogin(data);
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Database connection failed.");
    }
  };

  
const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn() as any; // 'as any' silences TS

    // Check both locations just in case
    const idToken = response.data?.idToken || response.idToken;

    if (!idToken) {
      // If we reach here, we got a response but NO token
      const raw = JSON.stringify(response, null, 2);
      Alert.alert("Debug: No Token", `Response was received but idToken is missing.\n\nFull Response: ${raw}`);
      return;
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) throw error;
    if (data?.user) await finalizeLogin(data.user);

  } catch (error: any) {
    // THIS IS THE KEY: Stringify the entire error object
    const fullError = JSON.stringify(error, null, 2);
    
    console.log("FULL ERROR OBJECT:", fullError);
    
    Alert.alert(
      "Exact Error Found",
      `Message: ${error.message}\n\nCode: ${error.code}\n\nFull Details: ${fullError}`
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>DG</Text>
              </View>
              <Text style={[styles.titleText, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitleText, { color: colors.subtext }]}>Log in to your Daily Grind.</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.divider }]}
                placeholder="Email Address"
                placeholderTextColor={colors.subtext}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.divider, marginTop: 15 }]}
                placeholder="Password"
                placeholderTextColor={colors.subtext}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              
              {/* Regular Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
              </TouchableOpacity>

              {/* 4. Google Login Button */}
              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { backgroundColor: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 12, flexDirection: 'row', gap: 10 }
                ]} 
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Text style={[styles.loginButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                   Continue with Google
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/signup')} style={{ marginTop: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Don't have an account? Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 30, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoPlaceholder: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  titleText: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitleText: { fontSize: 16, textAlign: 'center' },
  form: { width: '100%' },
  input: { height: 55, borderRadius: 16, paddingHorizontal: 20, fontSize: 16, borderWidth: 1 },
  loginButton: { height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});