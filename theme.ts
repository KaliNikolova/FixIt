/**
 * Global Color Palette for FixIt Application
 * Centralized theme configuration for consistency and maintainability
 */

export const colors = {
  // Primary Colors
  primary: {
    orange: '#FF9450',      // Main action color
    orangeHover: '#FF7D15', // Darker orange for hover/active states
  },

  // Secondary Colors
  secondary: {
    steelBlue: '#34495E', // Text, headings, accents
  },

  // Backgrounds
  background: {
    offWhite: '#FFFAF6',
    lightOffWhite: '#FFF8F4',
    orangeLight15: 'rgba(255, 148, 80, 0.15)',
    orangeLight20: 'rgba(255, 148, 80, 0.2)',
    orangeLight8: 'rgba(255, 148, 80, 0.08)',
  },

  // Neutral/Gray
  neutral: {
    slate900: '#1F2937',
    slate800: '#1F2937',
    slate600: '#4B5563',
    slate500: '#6B7280',
    slate400: '#9CA3AF',
    slate300: '#D1D5DB',
    slate200: '#E5E7EB',
    slate100: '#F3F4F6',
    slate50: '#F9FAFB',
  },

  // Semantic Colors
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
} as const;

// Helper function to get hover state color
export const getHoverColor = (baseColor: string): string => {
  if (baseColor === colors.primary.orange) {
    return colors.primary.orangeHover;
  }
  return baseColor;
};
