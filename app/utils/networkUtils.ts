import { Platform } from 'react-native';

/**
 * Determines the appropriate base URL for API requests based on environment
 * This handles the common issue of connecting to development servers from mobile devices
 */
export const getApiBaseUrl = (): string => {
  let baseUrl: string;
  
  if (__DEV__) {
    // For iOS devices (including Expo Go on physical iPhone)
    if (Platform.OS === 'ios') {
      // IMPORTANT: When using Expo Go on a physical iPhone, you MUST use your computer's 
      // actual IP address on your local network
      
      // Replace with your computer's actual local IP address (find it in System Settings > Network)
      // Look for your WiFi IP address like 192.168.x.x
      baseUrl = 'http://192.168.1.40:8001'; // ⚠️ CHANGE THIS TO YOUR ACTUAL IP ⚠️
      
      // Uncomment this if using iOS Simulator instead of a physical device
      // baseUrl = 'http://localhost:8001';
    }
    // For Android emulators
    else if (Platform.OS === 'android') {
      // 10.0.2.2 is the special IP that Android emulators use to access the localhost of your computer
      baseUrl = 'http://10.0.2.2:8001';
      
      // For physical Android devices or Expo Go on Android, use your computer's IP address
      // baseUrl = 'http://192.168.1.x:8001'; // REPLACE with your actual IP
    }
    // Fallback (web browser, etc.)
    else {
      baseUrl = 'http://localhost:8001';
    }
    
    // Log the API URL for debugging
    console.log(`🌐 API Base URL: ${baseUrl} (Platform: ${Platform.OS})`);
    return baseUrl;
  }
  
  // Production URL
  return 'https://your-production-api.com';
}; 