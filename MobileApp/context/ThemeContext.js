import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: {
      background: isDarkMode ? '#0F172A' : '#F8FAFC',
      card: isDarkMode ? '#1E293B' : '#FFFFFF',
      text: isDarkMode ? '#F8FAFC' : '#0F172A',
      subtext: isDarkMode ? '#94A3B8' : '#64748B',
      primary: '#615EFC', // Your purple
      divider: isDarkMode ? '#334155' : '#E2E8F0',
    },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};