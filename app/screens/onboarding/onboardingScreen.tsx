import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import { usePreferences } from '../../store/usePreferences';
import theme from '../../theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const preferences = usePreferences();
  const { setPartySize, setMood, setAmbience, setBudget, setCuisinePreferences, setLocation, setOnboardingComplete } = preferences;

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const totalSteps = 6;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setSelectedOption(null);
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleExitToHome = () => {
    navigation.navigate('Home');
  };

  const handleNextStep = (value: string) => {
    setSelectedOption(value);

    setTimeout(() => {
      if (currentStep === 1) setPartySize(value);
      if (currentStep === 2) setMood(value);
      if (currentStep === 3) setAmbience(value);
      if (currentStep === 4) setBudget(value);
      if (currentStep === 5) setCuisinePreferences([value]);

      setSelectedOption(null);
      setCurrentStep((prev) => prev + 1);
    }, 300);
  };

  const handleLocationSelection = (location: string) => {
    setSelectedOption(location);
    setTimeout(() => {
      setIsLoading(true);
      setLocation(location, 0, 0);
      setOnboardingComplete(true);

      setTimeout(() => {
        navigation.navigate('Chat');
      }, 1500);
    }, 300);
  };

  const renderContent = () => {
    if (currentStep === 1) {
      const partySizes = [
        'Just Me (Self-care night)',
        'Date for Two (Cute energy)',
        'Group Date (the more, the merrier)'
      ];
      return (
        <>
          <Text style={styles.title}>Planning for...?</Text>
          <View style={styles.buttonContainer}>
            {partySizes.map((size) => (
              <SelectableButton
                key={size}
                label={size}
                onPress={() => handleNextStep(size)}
                selected={selectedOption === size}
              />
            ))}
          </View>
        </>
      );
    }

    if (currentStep === 2) {
      const moods = ['Romantic', 'Scenic View', 'Classy & Chill', 'Cozy', 'Joy & Fun', 'Surprise Me!!'];
      return (
        <>
          <Text style={styles.title}>
            What kind of night are you in the mood for?
          </Text>
          <View style={styles.gridContainer}>
            {moods.map((mood) => (
              <View key={mood} style={styles.gridItem}>
                <SelectableButton
                  label={mood}
                  variant="grid"
                  onPress={() => handleNextStep(mood)}
                  selected={selectedOption === mood}
                />
              </View>
            ))}
          </View>
        </>
      );
    }

    if (currentStep === 3) {
      const vibes = ['Restaurant', 'Bar/Lounge', 'Takeout & Picnic', 'Surprise Me!!'];
      return (
        <>
          <Text style={styles.title}>Where are we taking this vibe?</Text>
          <View style={styles.buttonContainer}>
            {vibes.map((vibe) => (
              <SelectableButton
                key={vibe}
                label={vibe}
                variant="grid"
                onPress={() => handleNextStep(vibe)}
                selected={selectedOption === vibe}
              />
            ))}
          </View>
        </>
      );
    }

    if (currentStep === 4) {
      const budgets = ['Budget-Friendly ($)', 'Mid-Range ($$)', "Let's go Fancy ($$$)", 'Luxurious Experience ($$$$)'];
      return (
        <>
          <Text style={styles.title}>What's your budget vibe?</Text>
          <View style={styles.buttonContainer}>
            {budgets.map((budget) => (
              <SelectableButton
                key={budget}
                label={budget}
                variant="grid"
                onPress={() => handleNextStep(budget)}
                selected={selectedOption === budget}
              />
            ))}
          </View>
        </>
      );
    }

    if (currentStep === 5) {
      const cuisines = ['French', 'Japanese', 'Italian', 'American', 'Mediterranean', 'Mexican', 'Chinese', 'Thai', 'Indian', 'Surprise Me!'];
      return (
        <>
          <Text style={styles.title}>
            What cuisine are you craving?
          </Text>

          <View style={styles.gridContainer}>
            {cuisines.map((cuisine) => (
              <View key={cuisine} style={styles.gridItem}>
                <SelectableButton
                  label={cuisine}
                  variant="grid"
                  onPress={() => handleNextStep(cuisine)}
                  selected={selectedOption === cuisine}
                />
              </View>
            ))}
          </View>
        </>
      );
    }

    if (currentStep === 6) {
      const locations = ["Manhattan", "Brooklyn", "Queens", "Surprise Me!"];
      return (
        <>
          <Text style={styles.title}>Where in NYC are you looking?</Text>
          <View style={styles.buttonContainer}>
            {locations.map((location) => (
              <SelectableButton
                key={location}
                label={location}
                variant="grid"
                onPress={() => handleLocationSelection(location)}
                selected={selectedOption === location}
              />
            ))}
          </View>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Finding the perfect spots for you...</Text>
            </View>
          )}
        </>
      );
    }

    // Default case (should never happen)
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Static Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <PreferencesMenuButton />
        </View>
        <View style={styles.divider} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
          {renderContent()}
        </Animated.View>
      </View>

      {/* Static Footer */}
      <View style={styles.footer}>
        <PageControl total={totalSteps} current={currentStep - 1} />
      </View>

      {/* Exit to Home */}
      <View style={styles.exitContainer}>
        <View style={styles.exitDivider} />
        <TouchableOpacity style={styles.exitToHomeButton} onPress={handleExitToHome}>
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginTop: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg, // Add space between title and buttons
    width: '100%',
    gap: theme.spacing.md,
  },  
  gridContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },  
  gridItem: {
    width: '46%',
    marginBottom: theme.spacing.md,
    height: 70,
  },
  loadingContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.md,
  },
  exitContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  exitDivider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginVertical: theme.spacing.md,
  },
  exitToHomeButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  exitToHomeText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
});
