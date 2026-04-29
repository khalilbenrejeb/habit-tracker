import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('🔵 Step 1: Starting Google login...');
      
      const redirectTo = 'mobileapp://auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.log('🔴 Step 2 FAILED - OAuth error:', error.message);
        setLoading(false);
        return;
      }

      if (!data?.url) {
        console.log('🔴 Step 2 FAILED - No URL returned from Supabase');
        setLoading(false);
        return;
      }

      console.log('🟢 Step 2 OK - Got OAuth URL:', data.url);
      console.log('🔵 Step 3: Opening browser...');

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      
      console.log('🟢 Step 3 - Browser result:', JSON.stringify(res));

      if (res.type === 'success') {
        console.log('🔵 Step 4: Browser success, setting session...');
        
        try {
          // Extract tokens from URL hash
          const hashParams = new URLSearchParams(res.url.split('#')[1]);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('🟢 Found tokens in URL, setting session...');
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.log('🔴 Failed to set session:', error.message);
              setLoading(false);
              return;
            }
            
            if (data?.user) {
              console.log('🟢 Step 5: Got user:', data.user.email);
              await finalizeLogin(data.user);
            }
          } else {
            console.log('🔴 No tokens found in URL');
            setLoading(false);
          }
        } catch (pollErr: any) {
          console.log('🔴 Session setup crashed:', pollErr?.message ?? JSON.stringify(pollErr));
          setLoading(false);
        }

      } else if (res.type === 'cancel') {
        console.log('🟡 Step 3 - User closed the browser');
        setLoading(false);
      } else {
        console.log('🔴 Step 3 FAILED - Unexpected result:', JSON.stringify(res));
        setLoading(false);
      }

    } catch (err: any) {
      setLoading(false);
      console.log('🔴 CRASH:', err?.message ?? JSON.stringify(err));
      Alert.alert("Error", err?.message ?? "Google Login failed.");
    }
  };

  const finalizeLogin = async (userData: any) => {
    try {
      console.log('🔵 FinalizeLogin: user:', userData.email);
      
      // Check if user exists in users table
      const { data: existing, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userData.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.log('🟡 User fetch error:', fetchError.message);
      }

      // If user doesn't exist, create them
      if (!existing) {
        console.log('🔵 New user, creating in users and userdata tables...');
        
        // Parse name from full_name
        const fullName = userData.user_metadata?.full_name || userData.email.split('@')[0];
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const avatarUrl = userData.user_metadata?.picture || null;

        // Insert into users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userData.id,
            first_name: firstName,
            last_name: lastName,
            email: userData.email,
            password: null, // Google auth, no password
          });

        if (userError) {
          console.log('🔴 Error inserting user:', userError.message);
        } else {
          console.log('🟢 User created in users table');
        }

        // Insert into userdata table
        const { error: userdataError } = await supabase
          .from('userdata')
          .insert({
            id: userData.id,
            avatar_url: avatarUrl,
          });

        if (userdataError) {
          console.log('🔴 Error inserting userdata:', userdataError.message);
        } else {
          console.log('🟢 User created in userdata table with avatar:', avatarUrl);
        }
      } else {
        console.log('🟢 Existing user, updating login count...');
        
        // Update login count in userdata
        const { data: userdataExisting } = await supabase
          .from('userdata')
          .select('number_of_logins')
          .eq('id', userData.id)
          .single();

        const { error: upsertError } = await supabase
          .from('userdata')
          .upsert({ 
            id: userData.id,
            number_of_logins: (userdataExisting?.number_of_logins ?? 0) + 1,
          }, { onConflict: 'id' });

        if (upsertError) console.log('🔴 Userdata upsert error:', upsertError.message);
      }

      console.log('🟢 FinalizeLogin done, navigating...');
      setUser(userData); 
      router.replace('/(tabs)'); 
    } catch (err: any) {
      console.log('🔴 FinalizeLogin CRASH:', err?.message ?? JSON.stringify(err));
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
        Alert.alert("Login Failed", `Invalid email or password. ${error?.message ?? ''}`);
      } else {
        await finalizeLogin(data);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Error", err?.message ?? "Database connection failed.");
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
                style={[styles.input, { backgroundColor: colors.card, color: colors.card, borderColor: colors.divider }]}
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
                style={[styles.loginButton, { backgroundColor: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 12 }, loading && { opacity: 0.6 }]} 
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