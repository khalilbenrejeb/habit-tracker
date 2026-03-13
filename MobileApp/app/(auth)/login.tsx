import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext'; // Import your hook

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Fill in all fields.");

    setLoading(true);

    try {
      // Checking manual 'users' table as requested
      const { data, error } = await supabase
        .from('users') 
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      setLoading(false);

      if (error || !data) {
        Alert.alert("Login Failed", "Invalid email or password.");
      } else {
        router.replace('/(tabs)'); 
      }
    } catch (err) {
      setLoading(false);
      Alert.alert("Error", "Database connection failed.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            
            <View style={styles.header}>
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoText}>DG</Text>
              </View>
              <Text style={[styles.titleText, { color: colors.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitleText, { color: colors.subtext }]}>
                Log in to continue your Daily Grind.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.card, 
                      color: colors.text, 
                      borderColor: colors.divider 
                    }
                  ]}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.subtext}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      backgroundColor: colors.card, 
                      color: colors.text, 
                      borderColor: colors.divider 
                    }
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.subtext}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  { backgroundColor: colors.primary },
                  loading && styles.buttonDisabled
                ]} 
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.subtext }]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup' as any)}>
                <Text style={[styles.signUpText, { color: colors.primary }]}>Sign Up</Text>
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
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  logoText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  titleText: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitleText: { fontSize: 16, textAlign: 'center' },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: {
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
  },
  loginButton: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { fontSize: 15 },
  signUpText: { fontWeight: '700', fontSize: 15 },
});