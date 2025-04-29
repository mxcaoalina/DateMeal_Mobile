import React from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  PressableProps, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  Animated,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'onboarding';
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
  // Animation for press feedback - more subtle for matching onboarding style
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(animatedScale, {
      toValue: 0.98, // More subtle scale effect
      useNativeDriver: true,
      speed: 30,  // Slightly slower
      bounciness: 2 // Less bouncy
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20, // Slightly slower return
      bounciness: 1 // Minimal bounce
    }).start();
  };
  
  // Render button content (text, loading indicator, icon)
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' || variant === 'onboarding' ? theme.colors.primary : 'white'} 
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
              variant === 'onboarding' && styles.onboardingText,
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

  const baseStyle = [
    styles.button,
    styles[`${size}Button`],
    !fullWidth && styles.defaultWidth,
    fullWidth && styles.fullWidth,
    props.disabled && styles.disabled,
    style
  ];
  
  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }] }}>
      {variant === 'primary' || variant === 'secondary' ? (
        <Pressable
          {...props}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
        >
          <LinearGradient
            colors={variant === 'primary' 
              ? ['#333333', '#1a1a1a']
              : ['#757575', '#606060']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={baseStyle}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              {loading ? (
                <ActivityIndicator 
                  size="small" 
                  color="white" 
                />
              ) : (
                <>
                  {icon && iconPosition === 'left' && icon}
                  <Text
                    style={[
                      styles.text,
                      styles[`${size}Text`],
                      textStyle
                    ]}
                  >
                    {title}
                  </Text>
                  {icon && iconPosition === 'right' && icon}
                </>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable
          {...props}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
          style={[
            ...baseStyle,
            variant === 'outline' && styles.outlineButton,
            variant === 'ghost' && styles.ghostButton,
            variant === 'onboarding' && styles.onboardingButton,
          ]}
        >
          {renderContent()}
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.default,
    ...theme.shadows.small,
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
  defaultWidth: {
    alignSelf: 'flex-start',
    width: '100%',
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
  onboardingButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    paddingLeft: 0,
    paddingRight: theme.spacing.xs,
    height: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    minHeight: 30,
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
  onboardingText: {
    color: theme.colors.text,
    fontWeight: '400',
    fontSize: theme.fontSizes.md,
    marginLeft: 4,
  },
}); 