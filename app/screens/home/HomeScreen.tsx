import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import Button from '../../components/Button';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const preferences = usePreferences();
  const { userName, onboardingComplete, setOnboardingComplete, resetSessionPreferences, debugState } = preferences;
  
  const [greeting, setGreeting] = useState('Good morning');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Redirect logic: Check if user needs to go through onboarding
  useEffect(() => {
    // Short delay to ensure preferences are loaded from storage
    const timer = setTimeout(() => {
      console.log('[HOME] Checking onboarding status:', { userName, onboardingComplete });
      if (!userName) {
        console.log('[HOME] No username found, redirecting to Welcome');
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }
      // Removed the automatic redirection when onboardingComplete is false
      // Users can now choose to update preferences via the button
    }, 50); // 50ms delay, adjust if needed

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [userName, navigation]); // Removed onboardingComplete from dependencies

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newGreeting = 'Good morning';
    
    if (hour >= 12 && hour < 18) {
      newGreeting = 'Good afternoon';
    } else if (hour >= 18) {
      newGreeting = 'Good evening';
    }
    
    setGreeting(newGreeting);
    
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Navigate to chat screen
  const handleStartChat = () => {
    console.log('[HOME] Navigating to Chat screen');
    try {
      // Use navigate instead of reset to maintain navigation history
      navigation.navigate('Chat');
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
      navigation.navigate('Chat');
    }
  };

  // Navigate to profile
  const handleProfilePress = () => {
    console.log('[HOME] Profile button pressed');
    alert('Profile features coming soon!');
  };

  // Find restaurants based on preferences - should go to onboarding first
  const handleFindRestaurants = () => {
    console.log('[HOME] Navigating to onboarding to set preferences for restaurant recommendations');
    try {
      // Set onboardingComplete to false to enter onboarding flow
      setOnboardingComplete(false);
      
      // Use a small delay for state to update
      setTimeout(() => {
        navigation.navigate('Step1');
      }, 100);
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
      navigation.navigate('Step1');
    }
  };
  
  // Return to onboarding to edit preferences
  const handleEditPreferences = () => {
    console.log('[HOME] Navigating to Preferences screen');
    
    // Navigate to the Preferences screen instead of onboarding
    try {
      navigation.navigate('Preferences');
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
    }
  };

  // Debug function for direct navigation
  const navigateToScreen = (screenName: string) => {
    console.log(`[HOME] Debug navigation to: ${screenName}`);
    
    try {
      if (screenName.startsWith('Step')) {
        // For onboarding steps, change app state first
        setOnboardingComplete(false);
        
        // Then navigate
        navigation.reset({
          index: 0,
          routes: [{ name: screenName as any }]
        });
      } else if (screenName === 'Chat') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Chat' }]
        });
      } else if (screenName === 'RestaurantDetail') {
        navigation.navigate('RestaurantDetail', { id: 'default-id' });
      } else {
        navigation.navigate(screenName as any);
      }
    } catch (error) {
      console.error(`[HOME] Navigation error to ${screenName}:`, error);
      // Fallback
      try {
        navigation.navigate(screenName as any);
      } catch (innerError) {
        console.error('[HOME] Fallback navigation also failed:', innerError);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Date Night Dining</Text>
          <Text style={styles.welcomeBack}>{greeting}, {userName || 'there'}!</Text>
        </View>
        
        <PreferencesMenuButton />
      </View>
      
      {/* Main Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Main Action Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ready for restaurant suggestions?</Text>
            <Text style={styles.cardSubtitle}>Find the perfect spot for your next meal</Text>
            
            <Button
              title="Find Restaurants"
              variant="primary"
              onPress={handleFindRestaurants}
              style={styles.findButton}
            />
          </View>
          
          {/* Navigation Options */}
          <View style={styles.navigationCard}>
            <Text style={styles.sectionTitle}>Options</Text>
            
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={handleStartChat}
            >
              <Ionicons name="chatbubble-outline" size={24} color={theme.colors.primary} style={styles.buttonIcon} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Chat with AI</Text>
                <Text style={styles.buttonDescription}>Ask questions and get personalized recommendations</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={handleEditPreferences}
            >
              <Ionicons name="options-outline" size={24} color={theme.colors.primary} style={styles.buttonIcon} />
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle}>Edit Preferences</Text>
                <Text style={styles.buttonDescription}>Update your dining preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>
          
          {/* Debug Navigation Section Removed */}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  welcomeBack: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: 'white',
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  findButton: {
    marginTop: theme.spacing.sm,
  },
  loadingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  navigationCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.default,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  buttonIcon: {
    marginRight: theme.spacing.md,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  buttonDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
}); 