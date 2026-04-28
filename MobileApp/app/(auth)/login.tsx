import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
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

  // MANUALLY BUILDING THE GOOGLE LOGIN
  const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    // This tells the app where to come back to AFTER the browser closes
    const redirection = AuthSession.makeRedirectUri({ scheme: 'mobileapp' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirection,
        skipBrowserRedirect: false,
      },
    });

    if (error) throw error;

    // This opens the browser to the Supabase/Google login page
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirection);

    if (res.type === 'success' && res.url) {
      // Supabase automatically picks up the session from the URL
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        await finalizeLogin(sessionData.session.user);
      }
    }
  } catch (err) {
    Alert.alert("Error", "Login failed.");
  } finally {
    setLoading(false);
  }
};

  const handleSupabaseGoogleAuth = async (idToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      if (data?.user) await finalizeLogin(data.user);
    } catch (error: any) {
      Alert.alert("Supabase Error", error.message);
      setLoading(false);
    }
  };

  const finalizeLogin = async (userData) => {
  setLoading(true);
  try {
    // 1. SYNC TO 'users' TABLE (Same as your manual signup)
    // We use .upsert() so it creates the user if they're new, 
    // or updates them if they already exist.
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userData.id,
        email: userData.email,
        // Google stores the name in user_metadata
        first_name: userData.user_metadata?.full_name || userData.email.split('@')[0],
        last_name: '', // Google usually sends one "full_name" string
      }, { onConflict: 'id' });

    if (userError) throw userError;

    // 2. SYNC TO 'userdata' TABLE (Tracking logins)
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

    // 3. FINALIZE
    setUser(userData); 
    router.replace('/(tabs)'); 
  } catch (err) {
    console.error("Sync Error:", err);
    // Let them in anyway if the Auth worked
    setUser(userData); 
    router.replace('/(tabs)');
  } finally {
    setLoading(false);
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

              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { backgroundColor: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 12, flexDirection: 'row', gap: 10 }
                ]} 
                onPress={handleGoogleLogin} // UPDATED FUNCTION
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