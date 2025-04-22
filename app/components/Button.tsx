import React from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  PressableProps, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  ...props
}: ButtonProps) {
  // Animation for press feedback
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2
    }).start();
  };
  
  // Determine button styles based on variant and size
  const getButtonContainer = () => {
    const baseStyle = [
      styles.button,
      styles[`${size}Button`],
      fullWidth && styles.fullWidth,
      props.disabled && styles.disabled,
      style
    ];
    
    // Return gradient container for primary and secondary variants
    if (variant === 'primary' || variant === 'secondary') {
      return (
        <LinearGradient
          colors={variant === 'primary' 
            ? ['#4b0082', '#380061'] as readonly string[] 
            : ['#FFA500', '#FF8C00'] as readonly string[]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={baseStyle}
        >
          {renderContent()}
        </LinearGradient>
      );
    }
    
    // Return regular container for outline and ghost variants
    return (
      <Pressable
        style={[
          ...baseStyle,
          variant === 'outline' && styles.outlineButton,
          variant === 'ghost' && styles.ghostButton,
        ]}
        {...props}
      >
        {renderContent()}
      </Pressable>
    );
  };
  
  // Render button content (text, loading indicator, icon)
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : 'white'} 
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              styles[`${size}Text`],
              variant === 'outline' && styles.outlineText,
              variant === 'ghost' && styles.ghostText,
              textStyle
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );
  
  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      <Pressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
      >
        {getButtonContainer()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.default,
    ...theme.shadows.medium,
  },
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...theme.shadows.small,
  },
  text: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.fontSizes.sm,
  },
  mediumText: {
    fontSize: theme.fontSizes.md,
  },
  largeText: {
    fontSize: theme.fontSizes.lg,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
}); 