import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';

export default function Step1Screen() {
  const navigation = useNavigation();
  const { setPartySize, userName } = usePreferences();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Fade in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const handleSelection = (size: string) => {
    setSelectedSize(size);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setPartySize(size);
      // @ts-ignore - We know this route exists, even if TS doesn't
      navigation.navigate('Step2');
    }, 300);
  };

  const partySizes = [
    'Just Me (Self-care night)',
    'Date for Two (Cute energy)',
    'Group Date (the more, the merrier)'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>
            Hi {userName || 'Superstar'}!
          </Text>
        </View>
        <View style={styles.divider} />
      </View>
      
      {/* Main Content */}
      <Animated.View 
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] }
        ]}
      >
        <Text style={styles.title}>
          Planning for...?
        </Text>
        
        <View style={styles.buttonContainer}>
          {partySizes.map((size) => (
            <SelectableButton
              key={size}
              label={size}
              onPress={() => handleSelection(size)}
              selected={selectedSize === size}
            />
          ))}
        </View>
      </Animated.View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={0} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.xl,
    height: 80,
  },
  headerTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginTop: theme.spacing.md,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  footer: {
    marginBottom: theme.spacing.xxl,
  },
}); 