import { conversationService, AdviseRequest } from './api';
import { PreferenceData } from './restaurantApiService';
import { Message } from '../types/conversation';
import { Restaurant } from '../types/restaurant';
import { generateMockRecommendations } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const RECOMMENDATIONS_KEY = '@DateMeal:recommendations';

/**
 * Adapter service to bridge the old restaurant API service with the new FastAPI backend
 */
export const fastApiAdapter = {
  /**
   * Process a conversation message using the FastAPI backend
   */
  processConversationMessage: async (
    history: Message[],
    message: string,
    preferences: PreferenceData
  ): Promise<{
    response: string;
    updatedRecommendations?: Restaurant[];
  }> => {
    try {
      // Convert the preferences to the format expected by the FastAPI backend
      const requestData: AdviseRequest = {
        vibe: preferences.mood || preferences.ambience,
        partySize: preferences.partySize?.toString(),
        budget: preferences.priceRange,
        cuisines: preferences.cuisines,
        location: typeof preferences.location === 'string'
          ? preferences.location
          : preferences.location?.city
      };

      console.log('🔍 Sending preferences to API:', JSON.stringify(requestData, null, 2));

      // Send the request to the FastAPI backend
      const result = await conversationService.processMessage(requestData);
      
      console.log('✅ Received response from API:', result.response);
      
      // Create structured recommendations based on the API response
      // In the future, the FastAPI could return actual restaurant data
      // For now, we'll use the response text but create structured data
      let recommendations: Restaurant[] = [];
      
      // Generate a single "real" recommendation from the API response
      const recommendation: Restaurant = {
        id: `rec-${Date.now()}`,
        name: `The ${requestData.vibe || 'Nice'} Spot`,
        description: result.response,
        cuisineType: requestData.cuisines?.[0] || 'Fine Dining',
        priceRange: requestData.budget || '$$',
        location: requestData.location || 'NYC',
        rating: 4.8,
        imageUrl: `https://source.unsplash.com/featured/?restaurant,${requestData.cuisines?.[0] || 'dining'}`,
        address: `123 Main St, ${requestData.location || 'NYC'}`,
        phone: "(212) 555-1234",
        website: "https://example.com",
        openingHours: ["11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 11:00 PM", "11:00 AM - 11:00 PM", "12:00 PM - 9:00 PM"],
        highlights: [requestData.cuisines?.[0] || 'Fine Dining', requestData.vibe || 'Nice', requestData.location || 'NYC'],
        reasonsToRecommend: [
          "Based on your preferences",
          `Perfect for a ${requestData.vibe || 'nice'} evening`,
          `${requestData.budget || '$$'} price range`
        ],
      };
      
      recommendations.push(recommendation);
      
      // Save recommendations to AsyncStorage for later retrieval
      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
        console.log('💾 Saved recommendations to storage');
      } catch (err) {
        console.error('Error saving recommendations to AsyncStorage:', err);
      }
      
      return {
        response: result.response,
        updatedRecommendations: recommendations
      };
    } catch (error) {
      console.error('Error in FastAPI adapter:', error);
      
      // Use mock data as fallback when API fails
      console.log('⚠️ API failed, using mock data as fallback');
      const mockRecommendations = generateMockRecommendations(message, history, preferences);
      
      // Save recommendations to AsyncStorage for later retrieval
      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(mockRecommendations));
      } catch (err) {
        console.error('Error saving mock recommendations to AsyncStorage:', err);
      }
      
      return {
        response: "I'm having trouble connecting to the recommendation service, but I've generated some suggestions based on your preferences.",
        updatedRecommendations: mockRecommendations
      };
    }
  },

  /**
   * Get restaurant recommendations based on user preferences
   * This is a simplified version that only returns the text response
   */
  getRecommendations: async (
    preferences: PreferenceData,
    conversationHistory: Message[] = []
  ): Promise<{
    recommendations: Restaurant[];
    reasoning: string;
  }> => {
    try {
      // Convert the preferences to the format expected by the FastAPI backend
      const requestData: AdviseRequest = {
        vibe: preferences.mood || preferences.ambience,
        partySize: preferences.partySize?.toString(),
        budget: preferences.priceRange,
        cuisines: preferences.cuisines,
        location: typeof preferences.location === 'string'
          ? preferences.location
          : preferences.location?.city
      };

      console.log('🔍 Getting recommendations with preferences:', JSON.stringify(requestData, null, 2));

      // Send the request to the FastAPI backend
      const result = await conversationService.processMessage(requestData);
      
      console.log('✅ Received recommendation reasoning from API');
      
      // Create structured recommendations based on the API response
      // In the future, the FastAPI could return actual restaurant data
      let recommendations: Restaurant[] = [];
      
      // Generate a single "real" recommendation from the API response
      const recommendation: Restaurant = {
        id: `rec-${Date.now()}`,
        name: `The ${requestData.vibe || 'Nice'} Spot`,
        description: result.response,
        cuisineType: requestData.cuisines?.[0] || 'Fine Dining',
        priceRange: requestData.budget || '$$',
        location: requestData.location || 'NYC',
        rating: 4.8,
        imageUrl: `https://source.unsplash.com/featured/?restaurant,${requestData.cuisines?.[0] || 'dining'}`,
        address: `123 Main St, ${requestData.location || 'NYC'}`,
        phone: "(212) 555-1234",
        website: "https://example.com",
        openingHours: ["11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 10:00 PM", "11:00 AM - 11:00 PM", "11:00 AM - 11:00 PM", "12:00 PM - 9:00 PM"],
        highlights: [requestData.cuisines?.[0] || 'Fine Dining', requestData.vibe || 'Nice', requestData.location || 'NYC'],
        reasonsToRecommend: [
          "Based on your preferences",
          `Perfect for a ${requestData.vibe || 'nice'} evening`,
          `${requestData.budget || '$$'} price range`
        ],
      };
      
      recommendations.push(recommendation);
      
      // Save recommendations to AsyncStorage for later retrieval
      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
        console.log('💾 Saved recommendations to storage');
      } catch (err) {
        console.error('Error saving recommendations to AsyncStorage:', err);
      }
      
      return {
        recommendations: recommendations,
        reasoning: result.response
      };
    } catch (error) {
      console.error('Error in FastAPI adapter:', error);
      
      // Use mock data as fallback when API fails
      console.log('⚠️ API failed, using mock data as fallback');
      const mockRecommendations = generateMockRecommendations('', [], preferences);
      
      // Save mock recommendations to AsyncStorage
      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(mockRecommendations));
      } catch (err) {
        console.error('Error saving mock recommendations to AsyncStorage:', err);
      }
      
      return {
        recommendations: mockRecommendations,
        reasoning: "I'm having trouble connecting to the recommendation service, but I've generated some suggestions based on your preferences."
      };
    }
  }
};

export default fastApiAdapter; 