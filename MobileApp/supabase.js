import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


const supabaseUrl = 'https://tfunpfqsonkbswauuqyd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdW5wZnFzb25rYnN3YXV1cXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDI3MDYsImV4cCI6MjA4NTg3ODcwNn0.eMGz5_7nh70Jp35lnZIuQXtvWK652fMvs-h3Y5A089U';

// This fix prevents the "window is not defined" error
const isWeb = Platform.OS === 'web';

// 1. Create a safe storage wrapper
const SafeStorage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

// 2. Initialize with the SafeStorage wrapper
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


