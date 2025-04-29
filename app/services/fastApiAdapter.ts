import { conversationService, AdviseRequest } from './api';
import { PreferenceData } from './restaurantApiService';
import { Message } from '../types/conversation';
import { Restaurant } from '../types/restaurant';
import { generateMockRecommendations } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECOMMENDATIONS_KEY = '@DateMeal:recommendations';

export const fastApiAdapter = {
  processConversationMessage: async (
    history: Message[],
    message: string,
    preferences: PreferenceData
  ): Promise<{
    response: string;
    updatedRecommendations?: Restaurant[];
  }> => {
    try {
      const requestData: AdviseRequest = {
        vibe: preferences.mood,
        ambience: preferences.ambience,
        partySize: preferences.partySize?.toString(),
        budget: preferences.priceRange,
        cuisines: preferences.cuisines,
        location: typeof preferences.location === 'string'
          ? preferences.location
          : preferences.location?.city,
        dietaryRestrictions: preferences.dietaryRestrictions,
        absoluteNogos: preferences.absoluteNogos
      };

      console.log('Sending preferences to API:', JSON.stringify(requestData, null, 2));

      const result = await conversationService.processMessage(requestData);
      console.log('Received response from API:', result.response);

      const recommendations = [result.restaurant];

      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
        console.log('Saved recommendations to storage');
      } catch (err) {
        console.error('Error saving recommendations to AsyncStorage:', err);
      }

      return {
        response: result.response,
        updatedRecommendations: recommendations
      };
    } catch (error) {
      console.error('Error in FastAPI adapter:', error);

      const mockRecommendations = generateMockRecommendations(message, history, preferences);

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

  getRecommendations: async (
    preferences: PreferenceData,
    conversationHistory: Message[] = []
  ): Promise<{
    recommendations: Restaurant[];
    reasoning: string;
  }> => {
    try {
      const requestData: AdviseRequest = {
        vibe: preferences.mood,
        ambience: preferences.ambience,
        partySize: preferences.partySize?.toString(),
        budget: preferences.priceRange,
        cuisines: preferences.cuisines,
        location: typeof preferences.location === 'string'
          ? preferences.location
          : preferences.location?.city,
        dietaryRestrictions: preferences.dietaryRestrictions,
        absoluteNogos: preferences.absoluteNogos
      };

      console.log('Getting recommendations with preferences:', JSON.stringify(requestData, null, 2));

      const result = await conversationService.processMessage(requestData);
      console.log('Received recommendation from API');

      const recommendations = [result.restaurant];

      try {
        await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(recommendations));
        console.log('Saved recommendations to storage');
      } catch (err) {
        console.error('Error saving recommendations to AsyncStorage:', err);
      }

      return {
        recommendations,
        reasoning: result.response
      };
    } catch (error) {
      console.error('Error in FastAPI adapter:', error);

      const mockRecommendations = generateMockRecommendations('', [], preferences);

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