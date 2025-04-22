import axios from 'axios';
import { Restaurant } from '../types/restaurant';
import { Message } from '../types/conversation';

// In development, you'll use your machine's IP address or localhost
// In production, you'll use your deployed API URL
const API_URL = __DEV__ ? 'http://localhost:3000/api' : 'https://your-production-api.com/api';

// Set up axios instance with base URL and common headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface for conversation request payload
interface ConversationRequest {
  message: string;
  history: Message[];
  preferences?: {
    partySize?: number;
    cuisines?: string[];
    dietaryRestrictions?: string[];
    priceRange?: string;
    location?: string | { city: string; neighborhood?: string } | null;
  };
}

// Interface for conversation response
interface ConversationResponse {
  message: string;
  recommendations?: Restaurant[];
}

// Mock function to generate recommendations (for development/testing)
export const generateMockRecommendations = (
  message: string,
  history: Message[],
  preferences?: ConversationRequest['preferences']
): Restaurant[] => {
  try {
    // Extract location name (could be string or object with city property)
    const locationName = preferences?.location 
      ? (typeof preferences.location === 'string' 
        ? preferences.location 
        : preferences.location.city) 
      : 'Downtown';

    // Safely get cuisines, with fallback to default array
    const cuisines = (preferences?.cuisines && preferences.cuisines.length > 0) 
      ? preferences.cuisines 
      : ['Italian', 'Japanese', 'Mexican', 'American', 'Thai'];
    
    // Create 3 mock restaurants
    return Array(3).fill(0).map((_, i) => {
      // Safely pick a random cuisine
      const randomIndex = Math.floor(Math.random() * cuisines.length);
      const randomCuisine = cuisines[randomIndex] || 'American'; // Fallback if array access fails
      
      const randomPrice = preferences?.priceRange || ['$', '$$', '$$$'][Math.floor(Math.random() * 3)];
      
      // Safely handle all uses of randomCuisine
      const cuisineDisplay = randomCuisine ? randomCuisine : 'Restaurant';
      const cuisineDescriptionText = randomCuisine ? randomCuisine.toLowerCase() : 'delicious';
      
      return {
        id: `mock-${i}-${Date.now()}`,
        name: `${cuisineDisplay} Delight ${i + 1}`,
        description: `A wonderful ${cuisineDescriptionText} restaurant with a cozy atmosphere.`,
        cuisineType: cuisineDisplay,
        priceRange: randomPrice,
        location: locationName,
        rating: (Math.random() * 2 + 3).toFixed(1), // Rating between 3.0 and 5.0
        imageUrl: null, // Will be replaced with fallback image
        reasonsToRecommend: [
          `Serves authentic ${cuisineDescriptionText} cuisine`,
          `Perfect for parties of ${preferences?.partySize || 2}`,
          `Offers a ${randomPrice} price point`
        ]
      };
    });
  } catch (error) {
    console.error('Error generating mock recommendations:', error);
    // Return fallback recommendation if anything fails
    return [{
      id: `fallback-${Date.now()}`,
      name: 'Restaurant Recommendation',
      description: 'A nice restaurant we think you might enjoy based on your preferences.',
      cuisineType: 'Various',
      priceRange: '$$',
      location: 'Nearby',
      rating: 4.2,
      imageUrl: '',
      reasonsToRecommend: [
        'Selected based on your preferences',
        'Popular choice in the area',
        'Good reviews from diners'
      ]
    }];
  }
};

// API functions
export const conversationService = {
  // Process a user message and get a response with recommendations
  processMessage: async (data: ConversationRequest): Promise<ConversationResponse> => {
    try {
      const response = await api.post('/conversations', data);
      return response.data;
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Return mock data if API call fails
      const mockResponse: ConversationResponse = {
        message: "I found these restaurants that match your preferences:",
        recommendations: generateMockRecommendations(data.message, data.history, data.preferences)
      };
      
      return mockResponse;
    }
  },
  
  // Get detailed information about a specific restaurant
  getRestaurantDetails: async (id: string): Promise<Restaurant> => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      throw error;
    }
  }
};

export default api; 