import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { usePreferences } from '../store/usePreferences';
import WelcomeScreen from '../screens/welcome/WelcomeScreen';
import Step1Screen from '../screens/onboarding/Step1Screen';
import Step2Screen from '../screens/onboarding/Step2Screen';
import Step3Screen from '../screens/onboarding/Step3Screen';
import Step4Screen from '../screens/onboarding/Step4Screen';
import Step5Screen from '../screens/onboarding/Step5Screen';
import Step6Screen from '../screens/onboarding/Step6Screen';
import HomeScreen from '../screens/home/HomeScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import RestaurantDetailScreen from '../screens/restaurant/RestaurantDetailScreen';
import PreferencesScreen from '../screens/preferences/PreferencesScreen';

// Define the types for our navigation parameters
export type RootStackParamList = {
  Welcome: undefined;
  Step1: undefined;
  Step2: undefined;
  Step3: undefined;
  Step4: undefined;
  Step5: undefined;
  Step6: undefined;
  Home: undefined;
  Chat: undefined;
  RestaurantDetail: { id: string };
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
  //     return 'Step1';
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
        <Stack.Screen name="Step1" component={Step1Screen} />
        <Stack.Screen name="Step2" component={Step2Screen} />
        <Stack.Screen name="Step3" component={Step3Screen} />
        <Stack.Screen name="Step4" component={Step4Screen} />
        <Stack.Screen name="Step5" component={Step5Screen} />
        <Stack.Screen name="Step6" component={Step6Screen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 