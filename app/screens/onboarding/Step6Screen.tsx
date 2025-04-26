import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

// Define the navigation prop type
type Step6NavigationProp = StackNavigationProp<RootStackParamList, 'Step6'>;

export default function Step6Screen() {
  const navigation = useNavigation<Step6NavigationProp>();
  const preferences = usePreferences();
  const { userName, setLocation, setOnboardingComplete } = preferences;
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fade in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // NYC neighborhood options - KEEPING EXACTLY THE SAME AS WEB VERSION
  const options = [
    "Manhattan",
    "Brooklyn",
    "Queens",
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
    navigation.goBack();
  };
  
  const handleExitToHome = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <PreferencesMenuButton />
        </View>
        <View style={styles.divider} />
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
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
          <Animated.View style={{ 
            opacity: fadeAnim, 
            transform: [{ translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}] 
          }}>
            <Text style={styles.title}>
              Where in NYC are you looking?
            </Text>
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <SelectableButton
                  key={option}
                  label={option}
                  variant="grid"
                  onPress={() => handleSelection(option)}
                  selected={selectedOption === option}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={5} />
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignSelf: 'center',
    marginTop: theme.spacing.xl,
  },
  optionsContainer: {
    gap: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
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