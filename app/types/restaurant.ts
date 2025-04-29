/**
 * Interface for Restaurant data structure
 */

/**
 * Interface for menu item
 */
export interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  priceRange: string;
  location: string;
  rating: number;
  imageUrl: string;
  
  // Optional fields
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  reviews?: {
    rating: number;
    comment: string;
    author: string;
    date: string;
  }[];
  highlights?: string[];
  reasonsToRecommend: string[];
  menuItems?: MenuItem[];
}

/**
 * Restaurant recommendation source
 */
export type RecommendationSource = 'ai' | 'bing';

/**
 * User feedback on a restaurant recommendation
 */
export interface RestaurantFeedback {
  restaurantId: string;
  liked: boolean;
  feedback?: string;
} 