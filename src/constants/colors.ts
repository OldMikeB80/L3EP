export const colors = {
  // Primary colors - Maize and Blue
  primary: '#00274C', // Michigan Blue
  primaryDark: '#001633', // Darker blue
  primaryLight: '#1E4D8A', // Lighter blue
  
  // Accent color - Maize
  accent: '#FFCB05', // Michigan Maize
  accentDark: '#E6B700', // Darker maize
  accentLight: '#FFD633', // Lighter maize
  
  // Neutral colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#00274C', // Blue text on maize
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Category colors (using maize/blue variations)
  categories: {
    cert_standards: '#00274C', // Deep blue
    materials_processes: '#1E4D8A', // Medium blue
    ndt_methods: '#FFCB05', // Maize
    safety_quality: '#E6B700', // Dark maize
  },
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Borders
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
};

export const colorScheme = {
  light: colors,
  dark: {
    ...colors,
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#3C3C3C',
    borderLight: '#2C2C2C',
  },
}; 