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
} from 'react-native';

// Points to your supabase.js in the root
import { supabase } from '../../supabase';

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // 1. Validation
    if (!email || !password || !firstName || !lastName) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
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

      // 3. Upload data to your 'users' table
      // We use the ID from the auth signup to keep things synced
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id, // Links this row to the Auth account
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password, // Storing password in custom table as requested
          },
        ]);

      if (dbError) throw dbError;

      alert("Success! Account created and data saved.");
      router.push('/login');

    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inner}>
              
              <View style={styles.header}>
                <Text style={styles.titleText}>Join the Grind</Text>
                <Text style={styles.subtitleText}>Create your account and start tracking progress.</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#9FB3C8"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#9FB3C8"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor="#9FB3C8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    placeholderTextColor="#9FB3C8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repeat your password"
                    placeholderTextColor="#9FB3C8"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.signupButton, loading && styles.buttonDisabled]} 
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
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={styles.loginLink}>Log In</Text>
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
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1, paddingHorizontal: 30, paddingVertical: 40, justifyContent: 'center' },
  header: { alignItems: 'flex-start', marginBottom: 35 },
  titleText: { fontSize: 32, fontWeight: '800', color: '#102A43', marginBottom: 10 },
  subtitleText: { fontSize: 16, color: '#627D98', lineHeight: 22 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '700', color: '#334E68', marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#FFF',
    height: 55,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#102A43',
    borderWidth: 1,
    borderColor: '#D9E2EC',
    ...Platform.select({
      web: { boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)' },
      default: { elevation: 2 },
    }),
  },
  signupButton: {
    backgroundColor: '#615EFC',
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    ...Platform.select({
      web: { boxShadow: '0px 4px 5px rgba(97, 94, 252, 0.2)' },
      default: { elevation: 4 },
    }),
  },
  buttonDisabled: { backgroundColor: '#A5A3FF' },
  signupButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: 20 },
  footerText: { color: '#627D98', fontSize: 15 },
  loginLink: { color: '#615EFC', fontWeight: '700', fontSize: 15 },
});