import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

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
  
  // Exit to Home handler
  const handleExitToHome = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };
  
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
        <View style={styles.headerTop}>
          {/* No back button on first screen */}
          <View style={{width: 24}} />
          <PreferencesMenuButton />
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
      
      {/* Exit to Home */}
      <View style={styles.exitContainer}>
        <View style={styles.exitDivider} />
        <TouchableOpacity 
          style={styles.exitToHomeButton}
          onPress={handleExitToHome}
        >
          <Text style={styles.exitToHomeText}>Exit to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingBottom: theme.spacing.sm,
    height: 80, // Narrower header
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignSelf: 'center',
  },
  buttonContainer: {
    gap: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
  },
  footer: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  exitContainer: {
    width: '100%',
  },
  exitDivider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    width: '100%',
  },
  exitToHomeButton: {
    paddingTop: theme.spacing.lg,
    //paddingBottom: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  exitToHomeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
}); 