import axios, { AxiosError } from 'axios';
import { Restaurant } from '../types/restaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../utils/networkUtils';
import { Alert, Platform } from 'react-native';

// Get the appropriate API URL based on environment and platform
const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for slow connections
  timeout: 15000,
});

// New type for FastAPI backend request
export interface AdviseRequest {
  vibe?: string;
  partySize?: string;
  budget?: string;
  cuisines?: string[];
  location?: string;
}

export const conversationService = {
  processMessage: async (data: AdviseRequest): Promise<{ response: string }> => {
    try {
      console.log(`📤 Sending request to: ${API_URL}/advise with data:`, JSON.stringify(data));
      const response = await api.post('/advise', data);
      console.log(`📥 Received response:`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      // Get detailed error information
      const axiosError = error as AxiosError;
      
      console.error('🔴 API Error:', {
        message: axiosError.message,
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        method: axiosError.config?.method,
      });
      
      // Show an alert with helpful troubleshooting tips
      if (axiosError.message.includes('Network Error')) {
        const tips = Platform.OS === 'ios' 
          ? '• Make sure you entered the correct IP address in networkUtils.ts\n• Ensure your phone and computer are on the same WiFi network\n• Check if your FastAPI server is running with --host 0.0.0.0'
          : '• Check network configuration\n• Ensure the server is running';
          
        Alert.alert(
          'Network Connection Error',
          `Could not connect to the server at ${API_URL}.\n\nTroubleshooting tips:\n${tips}`,
          [{ text: 'OK' }]
        );
      }
      
      return {
        response: "Sorry, I couldn't fetch a recommendation right now. Please check your network connection and make sure your phone and computer are on the same WiFi network.",
      };
    }
  },
  
  // Method to get restaurant details by ID from AsyncStorage
  getRestaurantDetails: async (id: string): Promise<Restaurant | null> => {
    try {
      // Check AsyncStorage for restaurant data
      const storedRestaurants = await AsyncStorage.getItem('@DateMeal:recommendations');
      if (storedRestaurants) {
        const restaurants = JSON.parse(storedRestaurants);
        const restaurant = restaurants.find((r: Restaurant) => r.id === id);
        if (restaurant) {
          return restaurant;
        }
      }
      
      // If not found in storage, return a mock restaurant
      return {
        id,
        name: "Sample Restaurant",
        description: "This is a sample restaurant description. The restaurant was selected based on your preferences.",
        cuisineType: "Italian",
        priceRange: "$$$",
        location: "NYC",
        rating: 4.7,
        imageUrl: `https://source.unsplash.com/featured/?restaurant,italian`,
        address: "123 Main St, New York, NY",
        phone: "(212) 555-1234",
        website: "https://example.com",
        openingHours: ["11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 11:00 PM", "11:00 AM - 11:00 PM", "12:00 PM - 9:00 PM"],
        highlights: ["Italian", "Romantic", "Authentic"],
        reasonsToRecommend: ["Perfect for a romantic evening", "Outstanding service", "Award-winning chef"],
      };
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  }
};

export default api;
