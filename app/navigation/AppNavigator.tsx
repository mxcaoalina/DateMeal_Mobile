import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { usePreferences } from '../store/usePreferences';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import OnboardingScreen from '../screens/onboarding/onboardingScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import RestaurantDetailScreen from '../screens/restaurant/RestaurantDetailScreen';
import SavedRestaurantsScreen from '../screens/restaurant/SavedRestaurantsScreen';
import PreferencesScreen from '../screens/preferences/PreferencesScreen';
import { Restaurant } from '../types/restaurant';

// Define the types for our navigation parameters
export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Home: undefined;
  Chat: {
    initialRecommendations?: Restaurant[];
    initialResponse?: string;
  };
  RestaurantDetail: { id: string };
  SavedRestaurants: undefined;
  Preferences: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { userName, onboardingComplete } = usePreferences();

  // Debug logs to help troubleshoot
  useEffect(() => {
    console.log('Navigation state:', { userName, onboardingComplete });
  }, [userName, onboardingComplete]);

  // Determine initial route name based on state
  // const getInitialRouteName = () => {
  //   if (!userName) {
  //     console.log('Initial route: Welcome screen');
  //     return 'Welcome';
  //   } else if (!onboardingComplete) {
  //     console.log('Initial route: Step1 screen');
  //     return 'Onboarding';
  //   } else {
  //     console.log('Initial route: Home screen');
  //     return 'Home';
  //   }
  // };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        // initialRouteName={getInitialRouteName()} 
        initialRouteName="Home" // Always start at Home
        screenOptions={{ headerShown: false }}
      >
        {/* Always include all screens to enable direct navigation */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="SavedRestaurants" component={SavedRestaurantsScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 