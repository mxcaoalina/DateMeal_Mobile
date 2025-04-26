/**
 * Shared type definitions for the DateMeal application
 */

/**
 * Restaurant recommendation type
 */
export interface RestaurantRecommendation {
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  location: string;
  rating: number;
  imageUrl: string;
  highlights?: string[];
  whyYoullLoveIt?: string[];
  details?: {
    address?: string;
    phoneNumber?: string;
    websiteUrl?: string;
    hours?: string;
    // Additional details
    [key: string]: any;
  };
}

/**
 * API response for restaurant recommendations
 */
export interface RecommendationResponse {
  recommendations: RestaurantRecommendation[];
  reasoning: string;
}

/**
 * Chat message type
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * User preferences type
 */
export interface UserPreferences {
  partySize?: string;
  moodOrVibe?: string;
  venueType?: string;
  budgetRange?: string;
  cuisines?: string[];
  dietaryRestrictions?: string[];
  absoluteNogos?: string[];
  location?: string;
}

/**
 * Request format when the mobile app sends a new message
 */
export interface ConversationRequest {
  message: string;                // The latest user message
  history: ChatMessage[];          // Previous conversation history
  preferences: UserPreferences;    // Full structured preferences
}
