import { Platform, TextStyle } from 'react-native';

// Define font family names
export const fontFamilies = {
  // We'll use system fonts until we can download and include custom ones
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'System' : 'Roboto',
  semibold: Platform.OS === 'ios' ? 'System' : 'Roboto', 
  bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  // Once we include custom fonts, we'd use:
  // regular: 'Inter-Regular',
  // medium: 'Inter-Medium',
  // semibold: 'Inter-SemiBold',
  // bold: 'Inter-Bold',
};

// Font sizes
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

// Line heights
export const lineHeights = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 44,
  display: 52,
};

// Text styles
export const createTextStyle = (
  size: number,
  lineHeight: number,
  family: string,
  color: string
): TextStyle => ({
  fontSize: size,
  lineHeight: lineHeight,
  fontFamily: family,
  color: color,
});

// Typography presets
export const createTypography = (textColor: string) => ({
  h1: createTextStyle(fontSizes.display, lineHeights.display, fontFamilies.bold, textColor),
  h2: createTextStyle(fontSizes.xxxl, lineHeights.xxxl, fontFamilies.bold, textColor),
  h3: createTextStyle(fontSizes.xxl, lineHeights.xxl, fontFamilies.semibold, textColor),
  h4: createTextStyle(fontSizes.xl, lineHeights.xl, fontFamilies.semibold, textColor),
  h5: createTextStyle(fontSizes.lg, lineHeights.lg, fontFamilies.semibold, textColor),
  body: createTextStyle(fontSizes.md, lineHeights.md, fontFamilies.regular, textColor),
  bodyBold: createTextStyle(fontSizes.md, lineHeights.md, fontFamilies.bold, textColor),
  caption: createTextStyle(fontSizes.sm, lineHeights.sm, fontFamilies.regular, textColor),
  captionBold: createTextStyle(fontSizes.sm, lineHeights.sm, fontFamilies.medium, textColor),
  small: createTextStyle(fontSizes.xs, lineHeights.xs, fontFamilies.regular, textColor),
  button: createTextStyle(fontSizes.md, lineHeights.md, fontFamilies.semibold, textColor),
});

export default createTypography; 