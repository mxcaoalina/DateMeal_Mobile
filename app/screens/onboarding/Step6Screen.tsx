import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import { RootStackParamList } from '../../navigation/AppNavigator';

// Define the navigation prop type
type Step6NavigationProp = StackNavigationProp<RootStackParamList, 'Step6'>;

export default function Step6Screen() {
  const navigation = useNavigation<Step6NavigationProp>();
  const preferences = usePreferences();
  const { userName, setLocation, setOnboardingComplete } = preferences;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // NYC neighborhood options - KEEPING EXACTLY THE SAME AS WEB VERSION
  const options = [
    "Manhattan",
    "Brooklyn",
    "Queens",
    "Anywhere in NYC",
    "Surprise Me!"
  ];

  const handleSelection = (location: string) => {
    setSelectedOption(location);
    
    // Add a small delay to show the selected state before showing loading
    setTimeout(() => {
      setIsLoading(true);
      
      // Save the location to preferences
      setLocation(location, 0, 0);
      
      // Mark onboarding as complete
      setOnboardingComplete(true);
      
      // Simulate API call - in a real app, this would be an actual API call
      setTimeout(() => {
        // Navigate directly to the Chat screen for recommendations
        console.log('[STEP 6] Onboarding complete. Navigating to Chat screen for recommendations.');
        // Use navigate instead of reset to maintain navigation history
        navigation.navigate('Chat');
      }, 1500); // Reduced timeout slightly for faster transition
    }, 300);
  };
  
  const handleBack = () => {
    // Go back to the previous screen in the stack
    navigation.goBack();
  };

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
        disabled={isLoading}
      >
        <Ionicons name="chevron-back" size={20} color={isLoading ? theme.colors.gray[400] : theme.colors.text} />
        <Text style={[styles.backText, isLoading && { color: theme.colors.gray[400] }]}>Back</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          Where in NYC are you looking?
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              Preparing your recommendations...
            </Text>
            <Text style={styles.loadingSubtext}>
              This will only take a moment
            </Text>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {options.map((option) => (
              <SelectableButton
                key={option}
                label={option}
                onPress={() => handleSelection(option)}
                selected={selectedOption === option}
              />
            ))}
          </View>
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={5} />
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
    fontSize: theme.fontSizes.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  footer: {
    marginBottom: theme.spacing.xxl,
  },
}); 