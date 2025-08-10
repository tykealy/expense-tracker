
import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563eb', // Modern blue
    accent: '#06b6d4', // Cyan accent
    background: '#fafafa', // Lighter background
    surface: '#ffffff',
    surfaceVariant: '#f8fafc', // Subtle surface variant
    text: '#1e293b', // Darker text for better contrast
    onSurface: '#475569', // Secondary text
    placeholder: '#94a3b8',
    outline: '#e2e8f0', // Border color
    success: '#059669', // Success green
    warning: '#d97706', // Warning orange
    error: '#dc2626', // Error red
  },
  fonts: {
    ...DefaultTheme.fonts,
    displayLarge: {
      fontFamily: 'System',
      fontWeight: '300',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: 'System',
      fontWeight: '300',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: 'System',
      fontWeight: '600',
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyLarge: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.5,
    },
    bodyMedium: {
      fontFamily: 'System',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    labelLarge: {
      fontFamily: 'System',
      fontWeight: '500',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
  },
  roundness: 12, // More rounded corners for modern look
};

export default theme;
