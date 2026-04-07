import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../context/ThemeContext'; // Ensure this path is correct

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();

  return (
    <Tabs
      screenOptions={{
        // Use the primary purple for the selected tab
        tabBarActiveTintColor: colors.primary, 
        // Use a clear grey for unselected tabs
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#64748B',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.divider,
          height: 65,
          paddingBottom: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add', 
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'assistant',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}