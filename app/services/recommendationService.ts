import { Restaurant } from '../types/restaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types/userPreferences';
import { Message } from '../types/conversation';
import api, { AdviseRequest } from './api'; // <-- use your corrected api.ts

const CONVERSATION_KEY = '@DateMeal:conversation';
const PREFERENCES_KEY = '@DateMeal:preferences';
const RECOMMENDATIONS_KEY = '@DateMeal:recommendations';

export class RecommendationService {
  /**
   * Save the conversation history to AsyncStorage
   */
  async saveConversation(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  /**
   * Load the conversation history from AsyncStorage
   */
  async loadConversation(): Promise<Message[]> {
    try {
      const json = await AsyncStorage.getItem(CONVERSATION_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  }

  /**
   * Save user preferences to AsyncStorage
   */
  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Load user preferences from AsyncStorage
   */
  async loadPreferences(): Promise<UserPreferences | null> {
    try {
      const json = await AsyncStorage.getItem(PREFERENCES_KEY);
      return json ? JSON.parse(json) : null;
    } catch (error) {
      console.error('Error loading preferences:', error);
      return null;
    }
  }

  /**
   * Save recommendations to AsyncStorage
   */
  async saveRecommendations(restaurants: Restaurant[]): Promise<void> {
    try {
      await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(restaurants));
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  /**
   * Load recommendations from AsyncStorage
   */
  async loadRecommendations(): Promise<Restaurant[]> {
    try {
      const json = await AsyncStorage.getItem(RECOMMENDATIONS_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Error loading recommendations:', error);
      return [];
    }
  }

  /**
   * Request recommendations from FastAPI backend
   */
  async generateRecommendations(preferences: UserPreferences): Promise<string> {
    try {
      const requestData: AdviseRequest = {
        vibe: preferences.moodOrVibe,
        partySize: preferences.partySize,
        budget: preferences.budgetRange,
        cuisines: preferences.cuisines,
        location: preferences.location,
      };

      const response = await api.post('/advise', requestData);
      return response.data.response;
    } catch (error) {
      console.error('Error getting recommendations from backend:', error);
      return "Sorry, I couldn't fetch recommendations right now.";
    }
  }
}
