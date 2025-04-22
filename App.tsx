import React, { useEffect, useState } from 'react';
// Remove unused navigation imports
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { usePreferences } from './app/store/usePreferences';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the main AppNavigator
import AppNavigator from './app/navigation/AppNavigator';

// Remove screen imports, as they are handled by AppNavigator
// import WelcomeScreen from './app/screens/welcome/WelcomeScreen';
// import Step1Screen from './app/screens/onboarding/Step1Screen';
// ... (and other screen imports)
// import HomeScreen from './app/screens/home/HomeScreen';

// Remove Stack navigator definition
// const Stack = createStackNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  // Keep usePreferences if needed elsewhere, or remove if only used for navigation logic here
  const { userName } = usePreferences(); 

  useEffect(() => {
    // Check if it's the first launch
    AsyncStorage.getItem('hasLaunched').then(value => {
      if (value == null) {
        // First time
        AsyncStorage.setItem('hasLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  // If we haven't checked if it's first launch yet, show nothing (or a splash screen)
  if (isFirstLaunch === null) {
    return null; 
  }

  // Render the main AppNavigator within SafeAreaProvider
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Render the AppNavigator which contains its own NavigationContainer */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}

// Remove placeholder components
// const ProfileScreen = () => null;
// const ChatScreen = () => null;
// const RestaurantDetailsScreen = () => null;
