import { Restaurant } from '../types/restaurant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Message } from '../types/message';
import { UserPreferences } from '../types/userPreferences';

const API_URL = 'https://api.openai.com/v1/chat/completions';
// For development, we'll use a mock API or a self-hosted backend
// const API_URL = 'http://localhost:3000/api/recommendations';

// Storage keys
const CONVERSATION_KEY = '@DateMeal:conversation';
const PREFERENCES_KEY = '@DateMeal:preferences';
const RECOMMENDATIONS_KEY = '@DateMeal:recommendations';

interface RecommendationResponse {
  restaurants: Restaurant[];
  reasoning: string;
}

export class RecommendationService {
  private apiKey: string | null = null;

  /**
   * Initialize with an OpenAI API key
   */
  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  /**
   * Set the API key
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

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
   * Generate restaurant recommendations based on user preferences and conversation
   */
  async generateRecommendations(
    preferences: UserPreferences,
    conversationHistory: Message[]
  ): Promise<Restaurant[]> {
    if (!this.apiKey) {
      console.error('API key not set');
      return this.generateMockRecommendations(preferences);
    }

    try {
      const response = await axios.post(
        API_URL,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.generateSystemPrompt(preferences),
            },
            ...conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsedResponse = this.parseRecommendationResponse(content);
      
      // Save the recommendations for offline access
      await this.saveRecommendations(parsedResponse.restaurants);
      
      return parsedResponse.restaurants;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to mock recommendations
      return this.generateMockRecommendations(preferences);
    }
  }

  /**
   * Refine existing recommendations based on user feedback
   */
  async refineRecommendations(
    existingRecommendations: Restaurant[],
    feedback: string,
    conversationHistory: Message[]
  ): Promise<Restaurant[]> {
    if (!this.apiKey) {
      console.error('API key not set');
      return existingRecommendations;
    }

    try {
      const response = await axios.post(
        API_URL,
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: this.generateRefinementPrompt(existingRecommendations),
            },
            ...conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: `Please refine these recommendations based on this feedback: ${feedback}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      const content = response.data.choices[0].message.content;
      const parsedResponse = this.parseRecommendationResponse(content);
      
      // Save the refined recommendations
      await this.saveRecommendations(parsedResponse.restaurants);
      
      return parsedResponse.restaurants;
    } catch (error) {
      console.error('Error refining recommendations:', error);
      return existingRecommendations;
    }
  }

  /**
   * Parse the JSON response from the OpenAI API
   */
  private parseRecommendationResponse(content: string): RecommendationResponse {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        const parsed = JSON.parse(jsonString);
        
        if (Array.isArray(parsed)) {
          return {
            restaurants: parsed,
            reasoning: '',
          };
        } else if (parsed.restaurants) {
          return parsed;
        }
      }
      
      // If we can't parse it properly, try a fallback approach
      const fallbackJson = this.extractJSONFromText(content);
      if (fallbackJson && fallbackJson.restaurants) {
        return fallbackJson;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error parsing recommendation response:', error, content);
      return {
        restaurants: [],
        reasoning: 'Failed to parse recommendations',
      };
    }
  }

  /**
   * Fallback method to extract JSON from text
   */
  private extractJSONFromText(text: string): any {
    try {
      const startIdx = text.indexOf('{');
      const endIdx = text.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate system prompt based on user preferences
   */
  private generateSystemPrompt(preferences: UserPreferences): string {
    return `You are a helpful restaurant recommendation assistant. Your task is to recommend restaurants for dates based on the user's preferences.

User preferences:
- Party size: ${preferences.partySize || 'Not specified'}
- Cuisine preferences: ${preferences.cuisinePreferences?.join(', ') || 'Not specified'}
- Price range: ${preferences.priceRange || 'Not specified'}
- Location: ${preferences.location || 'Not specified'}

Please recommend 3-5 restaurants that would be good for a date based on these preferences. For each restaurant, provide:
1. Name
2. Description (2-3 sentences)
3. Cuisine type
4. Price range ($ to $$$$)
5. Location
6. Rating (1-5 stars)
7. A short list of reasons why you're recommending this restaurant
8. An image URL (leave blank or use a placeholder)

Format your response as a JSON object with the following structure:
{
  "restaurants": [
    {
      "id": "unique-id",
      "name": "Restaurant Name",
      "description": "Description of the restaurant",
      "cuisineType": "Cuisine type",
      "priceRange": "$$",
      "location": "Neighborhood or address",
      "rating": 4.5,
      "imageUrl": "",
      "reasonsToRecommend": ["Reason 1", "Reason 2", "Reason 3"]
    }
  ],
  "reasoning": "Brief explanation of why these restaurants match the user's preferences"
}`;
  }

  /**
   * Generate refinement prompt based on existing recommendations
   */
  private generateRefinementPrompt(existingRecommendations: Restaurant[]): string {
    const existingRestaurantsText = existingRecommendations
      .map((r) => `- ${r.name} (${r.cuisineType}, ${r.priceRange}, ${r.location})`)
      .join('\n');

    return `You are a helpful restaurant recommendation assistant. The user has received the following restaurant recommendations:

${existingRestaurantsText}

The user is providing feedback to refine these recommendations. Please update the recommendations based on their feedback.

Provide 3-5 restaurants in the same JSON format as before:
{
  "restaurants": [
    {
      "id": "unique-id",
      "name": "Restaurant Name",
      "description": "Description of the restaurant",
      "cuisineType": "Cuisine type",
      "priceRange": "$$",
      "location": "Neighborhood or address",
      "rating": 4.5,
      "imageUrl": "",
      "reasonsToRecommend": ["Reason 1", "Reason 2", "Reason 3"]
    }
  ],
  "reasoning": "Brief explanation of how you refined the recommendations based on the user's feedback"
}`;
  }

  /**
   * Generate mock recommendations for testing or when API calls fail
   */
  private generateMockRecommendations(preferences: UserPreferences): Restaurant[] {
    const cuisines = preferences.cuisinePreferences || ['Italian', 'Japanese', 'American'];
    const priceRange = preferences.priceRange || '$$';
    const location = preferences.location || 'Downtown';
    
    return [
      {
        id: '1',
        name: 'Bella Notte',
        description: 'An intimate Italian restaurant with candlelit tables and authentic cuisine. Perfect for a romantic evening.',
        cuisineType: 'Italian',
        priceRange: priceRange,
        location: location,
        rating: 4.7,
        imageUrl: 'https://source.unsplash.com/random/?italian,restaurant',
        reasonsToRecommend: [
          'Romantic atmosphere',
          'Authentic Italian cuisine',
          'Excellent wine selection'
        ]
      },
      {
        id: '2',
        name: 'Sakura Garden',
        description: 'A modern Japanese restaurant featuring both traditional dishes and innovative fusion creations. Known for their exceptional sushi.',
        cuisineType: 'Japanese',
        priceRange: priceRange,
        location: location,
        rating: 4.5,
        imageUrl: 'https://source.unsplash.com/random/?japanese,restaurant',
        reasonsToRecommend: [
          'Fresh, high-quality ingredients',
          'Intimate private dining options',
          'Chef\'s tasting menu available'
        ]
      },
      {
        id: '3',
        name: 'Harvest Table',
        description: 'Farm-to-table restaurant with seasonal menus featuring locally sourced ingredients. The rustic yet elegant ambiance is perfect for meaningful conversation.',
        cuisineType: 'American',
        priceRange: priceRange,
        location: location,
        rating: 4.6,
        imageUrl: 'https://source.unsplash.com/random/?american,restaurant',
        reasonsToRecommend: [
          'Locally sourced ingredients',
          'Seasonal menu that changes regularly',
          'Cozy, intimate atmosphere'
        ]
      }
    ];
  }
} 