import createTypography, { fontSizes, fontFamilies, lineHeights } from './theme/typography';

export const colors = {
  primary: '#333333', // Changed from #4b0082 (Indigo) to dark gray
  primaryLight: 'rgba(51, 51, 51, 0.05)', // Updated to match new primary
  primaryDark: '#1a1a1a', // Darker gray
  secondary: '#757575', // Medium gray as secondary color
  background: '#ffffff',
  foreground: '#1e1e1e',
  card: '#ffffff',
  text: '#1e1e1e',
  textSecondary: '#6b6b6b',
  border: '#e2e2e2',
  notification: '#ff4757',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  gray: {
    50: '#f8f8f8',
    100: '#f0f0f0',
    200: '#e2e2e2',
    300: '#d5d5d5',
    400: '#b2b2b2',
    500: '#8e8e8e',
    600: '#6b6b6b',
    700: '#484848',
    800: '#353535',
    900: '#262626',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  small: 4,
  default: 8,
  large: 12,
  xl: 16,
  rounded: 999, // For fully rounded elements
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Gradients
export const gradients = {
  primary: ['#333333', '#1a1a1a'], // Updated to grays
  secondary: ['#757575', '#606060'],
  success: ['#28a745', '#20c997'],
  info: ['#17a2b8', '#0dcaf0'],
  warning: ['#ffc107', '#ff9800'],
  error: ['#dc3545', '#c82333'],
};

// Create the typography with our text color
export const typography = createTypography(colors.text);

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSizes,
  fontFamilies,
  lineHeights,
  fontWeights,
  shadows,
  gradients,
  typography,
};

export default theme; 