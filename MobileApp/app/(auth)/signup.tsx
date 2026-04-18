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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuth } from '../../context/AuthContext'; // To set the user globally
import { supabase } from '../../supabase';
import { useTheme } from '../../context/ThemeContext'; // Import your hook

export default function SignupScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

const { setUser } = useAuth();

  // Configure Google on Load
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '217079460112-vkgl0504jhv63oktlqoatvfkaguth35u.apps.googleusercontent.com',
      iosClientId: '217079460112-99geqe8e42o0a0t10umqcnf38ajrro1o.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // This handles the database stats after any type of login/signup
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
      setUser(userData); 
      router.replace('/(tabs)');
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      // Sign into Supabase with the Google Token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
      
      // If successful, update stats and go to the home screen
      if (data.user) await finalizeLogin(data.user);

    } catch (error: any) {
      if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Google Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // 1. Validation
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
      // 2. Create the User in Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      if (data.user) {
        // 3. Upload data to your 'users' table
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id, 
              first_name: firstName,
              last_name: lastName,
              email: email,
              password: password, // Storing password as requested (Note: Auth handles hashing)
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              
              <View style={styles.header}>
                <Text style={[styles.titleText, { color: colors.text }]}>Join the Grind</Text>
                <Text style={[styles.subtitleText, { color: colors.subtext }]}>
                  Create your account and start tracking progress.
                </Text>
              </View>
              {/* Google Signup Button */}
<TouchableOpacity 
  style={[
    styles.loginButton, // Use your existing button style
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
                <TouchableOpacity onPress={() => router.push('/login' as any)}>
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
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
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
    // This adds a slight shadow for Android/iOS
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