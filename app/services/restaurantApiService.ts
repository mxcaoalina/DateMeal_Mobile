import axios from 'axios';
import { Restaurant } from '../types/restaurant';
import { Message } from '../types/conversation';

// API configuration
const API_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

const restaurantApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Preferences to send to backend
export interface PreferenceData {
  cuisines?: string[];
  priceRange?: string;
  dietaryRestrictions?: string[];
  absoluteNogos?: string[];
  mood?: string;
  ambience?: string;
  partySize?: string | number;
  location?: {
    city?: string;
    latitude?: number;
    longitude?: number;
  } | string | null;
}

export interface RecommendationResponse {
  recommendations: Restaurant[];
  reasoning: string;
}

export const restaurantApiService = {
  /**
   * Get restaurant recommendations based on user preferences (used during onboarding or reset)
   */
  getRecommendations: async (
    preferences: PreferenceData,
    conversationHistory: Message[] = []
  ): Promise<RecommendationResponse> => {
    const formattedPreferences = Object.entries(preferences)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(', ')}`;
        } else if (typeof value === 'object' && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      });

    const formattedHistory = conversationHistory
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    const response = await restaurantApi.post('/restaurant/recommendations', {
      preferences: formattedPreferences,
      conversationHistory: formattedHistory,
    });

    return response.data;
  },

  /**
   * Start a conversation with user message + preferences (first user input after onboarding)
   */
  startConversationMessage: async (
    history: Message[],
    message: string,
    preferences: PreferenceData
  ): Promise<{
    response: string;
    updatedRecommendations?: Restaurant[];
  }> => {
    const response = await restaurantApi.post('/conversation', {
      message,
      history,
      preferences,
    });

    return response.data;
  },

  /**
   * Continue a conversation (follow-up message after initial recommendations)
   */
  processConversationMessage: async (
    history: Message[],
    message: string,
    preferences: PreferenceData
  ): Promise<{
    response: string;
    updatedRecommendations?: Restaurant[];
  }> => {
    const response = await restaurantApi.post('/restaurant/conversation', {
      message,
      history,
      preferences,
    });
  
    return response.data;
  },
  

  /**
   * Refine recommendations based on user feedback
   */
  refineRecommendations: async (
    previousRecommendations: Restaurant[],
    userMessage: string
  ): Promise<RecommendationResponse> => {
    const response = await restaurantApi.post('/restaurant/refine', {
      previousRecommendations,
      userMessage,
    });

    return response.data;
  },
};

export default restaurantApiService;
