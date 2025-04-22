import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Step3NavigationProp = StackNavigationProp<RootStackParamList, 'Step3'>;

export default function Step3Screen() {
  const navigation = useNavigation<Step3NavigationProp>();
  const preferences = usePreferences();
  const { userName, setAmbience, sessionPreferences } = preferences;
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  
  // Fade in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Back button handler
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleSelection = (vibe: string) => {
    setSelectedVibe(vibe);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setAmbience(vibe); // Save the venue type/ambience
      navigation.navigate('Step4');
    }, 300);
  };

  // Venue type options
  const vibeOptions = [
    'Restaurant',
    'Bar/Lounge',
    'Takeout & Picnic',
    'Surprise Me!!'
  ];

  // Check for existing ambience value and set it as selected if found
  useEffect(() => {
    // Get the current ambience from preferences if available
    const currentAmbience = sessionPreferences?.ambience;
    if (currentAmbience && vibeOptions.includes(currentAmbience)) {
      setSelectedVibe(currentAmbience);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi {userName || "Superstar"}!
        </Text>
        <View style={styles.divider} />
      </View>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] 
        }}>
          <Text style={styles.title}>
            Where are we taking this vibe?
          </Text>
          
          <View style={styles.optionsContainer}>
            {vibeOptions.map((option) => (
              <SelectableButton
                key={option}
                label={option}
                onPress={() => handleSelection(option)}
                selected={selectedVibe === option}
                style={styles.optionButton}
              />
            ))}
          </View>
        </Animated.View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={2} />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    marginBottom: theme.spacing.sm,
  },
  footer: {
    marginBottom: theme.spacing.xxl,
  },
}); 