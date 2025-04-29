import axios, { AxiosError } from 'axios';
import { Restaurant } from '../types/restaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../utils/networkUtils';
import { Alert, Platform } from 'react-native';

const API_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export interface AdviseRequest {
  vibe?: string;
  ambience?: string;
  partySize?: string;
  budget?: string;
  cuisines?: string[];
  location?: string;
  dietaryRestrictions?: string[];
  absoluteNogos?: string[];
}

interface AdviseResponse {
  response: string;
  restaurant: Restaurant;
}

export const conversationService = {
  processMessage: async (data: AdviseRequest): Promise<AdviseResponse> => {
    try {
      console.log(`📤 Sending request to: ${API_URL}/advise with data:`, JSON.stringify(data));
      const response = await api.post<AdviseResponse>('/advise', data);
      console.log(`📥 Received response:`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
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

      throw error;
    }
  },

  getRestaurantDetails: async (id: string): Promise<Restaurant | null> => {
    try {
      const storedRestaurants = await AsyncStorage.getItem('@DateMeal:recommendations');
      if (storedRestaurants) {
        const restaurants = JSON.parse(storedRestaurants);
        const restaurant = restaurants.find((r: Restaurant) => r.id === id);
        if (restaurant) {
          return restaurant;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      return null;
    }
  }
};

export default api;