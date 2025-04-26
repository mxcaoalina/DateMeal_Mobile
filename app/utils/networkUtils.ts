import { Platform } from 'react-native';
import Constants from 'expo-constants';

export function getApiBaseUrl(): string {
  if (__DEV__) {
    // Development environment
    if (Platform.OS === 'ios') {
      // For iOS simulator/device
      return 'http://0.0.0.0:8001';
    } else {
      // For Android
      return 'http://10.0.2.2:8001';
    }
  }
  // Production environment
  return 'https://' + Constants.expoConfig?.extra?.apiUrl || '0.0.0.0:8001';
}