import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert,
} from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from '../../context/AuthContext'; 
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { setUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // MANUALLY TRIGGER THE SAME OAUTH FLOW THAT WORKED IN LOGIN
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const redirection = AuthSession.makeRedirectUri({ scheme: 'mobileapp' });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirection,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirection);

      if (res.type === 'success' && res.url) {
        // Give Supabase a moment to process the session
        setTimeout(async () => {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            await finalizeLogin(sessionData.session.user);
          }
        }, 500);
      }
    } catch (err) {
      Alert.alert("Error", "Google Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = async (userData: any) => {
    try {
      // Create user record in your custom table if it doesn't exist
      await supabase
        .from('userdata')
        .upsert({ 
          id: userData.id, 
          number_of_logins: 1 
        }, { onConflict: 'id' });

      setUser(userData); 
      router.replace('/(tabs)'); 
    } catch (err) {
      setUser(userData); 
      router.replace('/(tabs)');
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match!");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (data.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id, 
              first_name: firstName,
              last_name: lastName,
              email: email,
              password: password, 
            },
          ]);

        if (dbError) throw dbError;
        Alert.alert("Success!", "Account created successfully.");
        router.push('/login');
      }
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              
              <View style={styles.header}>
                <Text style={[styles.titleText, { color: colors.text }]}>Join the Grind</Text>
                <Text style={[styles.subtitleText, { color: colors.subtext }]}>
                  Create your account and start tracking progress.
                </Text>
              </View>

              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { backgroundColor: isDarkMode ? '#FFF' : '#1A1A1A', marginTop: 12, flexDirection: 'row', gap: 10 }
                ]} 
                onPress={handleGoogleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={isDarkMode ? "#000" : "#FFF"} />
                ) : (
                  <Text style={[styles.loginButtonText, { color: isDarkMode ? '#000' : '#FFF' }]}>
                       Continue with Google
                  </Text>
                )}
              </TouchableOpacity> 

              <View style={styles.form}>
                {[
                  { label: 'First Name', val: firstName, set: setFirstName, placeholder: 'First Name' },
                  { label: 'Last Name', val: lastName, set: setLastName, placeholder: 'Last Name' },
                  { label: 'Email Address', val: email, set: setEmail, placeholder: 'name@example.com', type: 'email-address' as const },
                ].map((input, index) => (
                  <View key={index} style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>{input.label}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.divider }]}
                      placeholder={input.placeholder}
                      placeholderTextColor={colors.subtext}
                      keyboardType={input.type || 'default'}
                      autoCapitalize={input.label.includes('Email') ? 'none' : 'words'}
                      value={input.val}
                      onChangeText={input.set}
                      editable={!loading}
                    />
                  </View>
                ))}

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.divider }]}
                    placeholder="Create a password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.divider }]}
                    placeholder="Repeat your password"
                    placeholderTextColor={colors.subtext}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.signupButton, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} 
                  onPress={handleSignup}
                  activeOpacity={0.9}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.signupButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.subtext }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={[styles.loginLink, { color: colors.primary }]}>Log In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1, paddingHorizontal: 30, paddingVertical: 40, justifyContent: 'center' },
  header: { alignItems: 'flex-start', marginBottom: 35 },
  titleText: { fontSize: 32, fontWeight: '800', marginBottom: 10 },
  subtitleText: { fontSize: 16, lineHeight: 22 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: {
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  signupButton: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonDisabled: { opacity: 0.6 },
  signupButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: 20 },
  footerText: { fontSize: 15 },
  loginLink: { fontWeight: '700', fontSize: 15 },
  loginButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});