import axios from 'axios';
import { Restaurant } from '../types/restaurant';
import { Message } from '../types/conversation';
import { generateMockRecommendations } from './api';

// API configuration - update these with your actual server URLs
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

// Create an axios instance for restaurant recommendations
const restaurantApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Interface for preference data to send to the server
export interface PreferenceData {
  cuisines?: string[];
  priceRange?: string;
  dietaryRestrictions?: string[];
  absoluteNogos?: string[];
  mood?: string;
  occasion?: string;
  ambience?: string;
  partySize?: string | number;
  location?: {
    city?: string;
    latitude?: number;
    longitude?: number;
  } | string | null;
}

// Response from the restaurant recommendation API
export interface RecommendationResponse {
  recommendations: Restaurant[];
  reasoning: string;
}

// Restaurant API service for the mobile app
export const restaurantApiService = {
  /**
   * Get restaurant recommendations based on user preferences
   */
  getRecommendations: async (
    preferences: PreferenceData,
    conversationHistory: Message[] = []
  ): Promise<RecommendationResponse> => {
    try {
      // Format history for the API
      const historyString = conversationHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');
      
      // Extract preferences as an array for the API
      const preferenceArray = Object.entries(preferences)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return `${key}: ${value.join(', ')}`;
          } else if (typeof value === 'object' && value !== null) {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        });

      const response = await restaurantApi.post('/restaurant/recommendations', {
        preferences: preferenceArray,
        conversationHistory: historyString
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting restaurant recommendations:', error);
      
      // Fallback to mock data when API fails
      // Extract cuisine arrays and price range for better mock data
      const mockPreferences = {
        cuisines: preferences.cuisines || [],
        priceRange: preferences.priceRange || '$$'
      };
      
      // Convert conversation history to the format expected by the mock generator
      const mockHistory = conversationHistory.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      // Get the latest user message for the mock data
      const latestUserMessage = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .pop() || '';
      
      const mockRecommendations = generateMockRecommendations(
        latestUserMessage, 
        mockHistory, 
        mockPreferences
      );
      
      return {
        recommendations: mockRecommendations,
        reasoning: 'Based on your preferences, here are some restaurant options that might interest you. (Offline mode)'
      };
    }
  },
  
  /**
   * Refine recommendations based on user feedback
   */
  refineRecommendations: async (
    previousRecommendations: Restaurant[],
    userMessage: string
  ): Promise<RecommendationResponse> => {
    try {
      const response = await restaurantApi.post('/restaurant/refine', {
        previousRecommendations,
        userMessage
      });
      
      return response.data;
    } catch (error) {
      console.error('Error refining restaurant recommendations:', error);
      
      // Mock data for offline mode
      // Use existing fallback in the api.ts file to refine recommendations
      return {
        recommendations: previousRecommendations,
        reasoning: `I've refined the recommendations based on your feedback: "${userMessage}". (Offline mode)`
      };
    }
  },
  
  /**
   * Process a message in a conversation
   */
  processConversationMessage: async (
    conversationHistory: Message[],
    userMessage: string,
    currentRecommendations?: Restaurant[]
  ): Promise<{
    response: string;
    updatedRecommendations?: Restaurant[];
  }> => {
    try {
      const response = await restaurantApi.post('/restaurant/conversation', {
        conversationHistory,
        userMessage,
        currentRecommendations
      });
      
      return response.data;
    } catch (error) {
      console.error('Error processing conversation message:', error);
      
      // Fallback response with existing recommendations
      return {
        response: "I'm sorry, I couldn't connect to the recommendation service right now. Would you like to try again or see some offline recommendations?",
        updatedRecommendations: currentRecommendations
      };
    }
  }
};

export default restaurantApiService; 