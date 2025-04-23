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
  name?: string;
  partySize?: number | string;
  occasion?: string;
  venueType?: string;
  budgetRange?: string;
  cuisinePreferences?: string[];
  dietaryRestrictions?: string[];
  location?: string;
  moodOrVibe?: string;
  absoluteNogos?: string[];
} 