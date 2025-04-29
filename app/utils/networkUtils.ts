import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Important: Change this to your computer's actual IP address when testing on a physical device
// Example: '192.168.1.100' (don't include the port)
const YOUR_COMPUTER_IP = '192.168.1.40';

export function getApiBaseUrl(): string {
  if (__DEV__) {
    // Development environment
    if (YOUR_COMPUTER_IP) {
      // Use the specified IP address when provided (best for physical devices)
      return `http://${YOUR_COMPUTER_IP}:8001`;
    } else if (Platform.OS === 'ios') {
      // For iOS simulator
      return 'http://localhost:8001';
    } else {
      // For Android emulator
      return 'http://10.0.2.2:8001';
    }
  }
  // Production environment
  return 'https://datemeal-backend-cga2d8fqfsctesh9.eastus2-01.azurewebsites.net';
}

// Helper function to get specific endpoint URLs
export function getAdviseEndpointUrl(): string {
  return `${getApiBaseUrl()}/advise`;
}