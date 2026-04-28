import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert,
} from 'react-native';

// 1. REPLACED: Switched from Native Google Signin to Expo Auth Session
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Required for the web popup to close correctly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. NEW: Setup the Google Auth Request for Expo Go
  const [request, response, promptAsync] = Google.useAuthRequest({
    // IMPORTANT: Use the WEB Client ID here for Expo Go to work
    webClientId: '217079460112-vkgl0504jhv63oktlqoatvfkaguth35u.apps.googleusercontent.com',
    iosClientId: '217079460112-99geqe8e42o0a0t10umqcnf38ajrro1o.apps.googleusercontent.com',
  });

  // 3. NEW: Listener for the Google Response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleSupabaseGoogleAuth(id_token);
    } else if (response?.type === 'error') {
      Alert.alert("Google Error", "Failed to connect to Google.");
    }
  }, [response]);

  const handleSupabaseGoogleAuth = async (idToken: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      if (data?.user) await finalizeLogin(data.user);
    } catch (error: any) {
      Alert.alert("Supabase Error", error.message);
    } finally {
      setLoading(false);
    }
  };

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
              
              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: colors.primary }, loading && { opacity: 0.6 }]} 
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
              </TouchableOpacity>

              {/* 4. MODIFIED: Google Login Button for Expo Go */}
              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { backgroundColor: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 12, flexDirection: 'row', gap: 10 }
                ]} 
                onPress={() => promptAsync()} 
                disabled={!request || loading}
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