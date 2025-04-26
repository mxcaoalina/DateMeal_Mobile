import axios from 'axios';
import { Restaurant } from '../types/restaurant';
import { Message } from '../types/conversation';
import { getApiBaseUrl } from '../utils/networkUtils';

// API configuration
const API_URL = getApiBaseUrl();

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
    // Format preferences to match the FastAPI endpoint
    const requestData = {
      vibe: preferences.mood || preferences.ambience,
      partySize: preferences.partySize?.toString(),
      budget: preferences.priceRange,
      cuisines: preferences.cuisines,
      location: typeof preferences.location === 'string'
        ? preferences.location
        : preferences.location?.city
    };

    console.log('🔍 Sending request to FastAPI with data:', JSON.stringify(requestData));
    
    // Use the advise endpoint directly
    const response = await restaurantApi.post('/advise', requestData);
    
    if (response.data && response.data.restaurant) {
      return {
        recommendations: [response.data.restaurant],
        reasoning: response.data.response
      };
    }

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
    // Format preferences to match the FastAPI endpoint
    const requestData = {
      vibe: preferences.mood || preferences.ambience,
      partySize: preferences.partySize?.toString(),
      budget: preferences.priceRange,
      cuisines: preferences.cuisines,
      location: typeof preferences.location === 'string'
        ? preferences.location
        : preferences.location?.city
    };
    
    const response = await restaurantApi.post('/advise', requestData);
    
    return {
      response: response.data.response,
      updatedRecommendations: response.data.restaurant ? [response.data.restaurant] : undefined
    };
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
    // Format preferences to match the FastAPI endpoint
    const requestData = {
      vibe: preferences.mood || preferences.ambience,
      partySize: preferences.partySize?.toString(),
      budget: preferences.priceRange,
      cuisines: preferences.cuisines,
      location: typeof preferences.location === 'string'
        ? preferences.location
        : preferences.location?.city
    };
    
    const response = await restaurantApi.post('/advise', requestData);
    
    return {
      response: response.data.response,
      updatedRecommendations: response.data.restaurant ? [response.data.restaurant] : undefined
    };
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
