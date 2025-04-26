import React from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle, Animated, View } from 'react-native';
import theme from '../theme';

interface SelectableButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'default' | 'small' | 'primary' | 'grid';
  selected?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export default function SelectableButton({ 
  label, 
  onPress, 
  variant = 'default',
  selected = false,
  style,
  icon
}: SelectableButtonProps) {
  // Animation for press feedback
  const [pressed, setPressed] = React.useState(false);
  const animatedScale = React.useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(animatedScale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4
    }).start();
  };
  
  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 2
    }).start();
  };
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'small':
        return styles.small;
      case 'primary':
        return styles.primary;
      case 'grid':
        return styles.grid;
      default:
        return styles.default;
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: animatedScale }] }
      ]}
    >
      <Pressable 
        style={[
          styles.buttonBase,
          getVariantStyle(),
          selected && styles.selected,
          pressed && styles.pressed,
          style
        ]} 
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', borderless: false }}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text 
          style={[
            styles.buttonText,
            variant === 'primary' && styles.primaryText,
            variant === 'grid' && styles.gridText,
            selected && styles.selectedText
          ]}
          numberOfLines={variant === 'grid' ? 1 : 2}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: theme.borderRadius.default,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  default: {
    height: 60,
    width: '100%',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  small: {
    width: 150,
    height: 60,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  grid: {
    height: 60,
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    marginBottom: 0,
  },
  primary: {
    height: 60,
    minWidth: 280,
    maxWidth: '85%',
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    alignSelf: 'center',
  },
  selected: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: theme.colors.gray[100],
  },
  buttonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.foreground,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.sm,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  primaryText: {
    color: 'white',
    fontWeight: '700',
  },
  selectedText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  gridText: {
    fontSize: theme.fontSizes.sm,
    paddingHorizontal: theme.spacing.xs,
  },
}); 