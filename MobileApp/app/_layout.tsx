import { DarkTheme, DefaultTheme, ThemeProvider as NavProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { PaperProvider } from 'react-native-paper';

function RootLayoutContent() {
  const { isDarkMode, colors } = useTheme();

  return (
    <NavProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <PaperProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false, // Cleaner look
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      </PaperProvider>
      </AuthProvider>
    </NavProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}