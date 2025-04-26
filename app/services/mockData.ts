import { Restaurant } from '../types/restaurant';
import { Message } from '../types/conversation';
import { PreferenceData } from './restaurantApiService';

/**
 * Generate mock restaurant recommendations
 * This is used as a fallback when the API doesn't return restaurant objects
 */
export function generateMockRecommendations(
  message: string = '',
  history: Message[] = [],
  preferences: PreferenceData = {}
): Restaurant[] {
  // Generate a unique ID for this set of recommendations
  const baseId = Date.now().toString();
  
  // Use preferences to customize the mock data if available
  const cuisine = preferences.cuisines?.[0] || 'Italian';
  const priceRange = preferences.priceRange || '$$';
  const vibe = preferences.mood || preferences.ambience || 'Romantic';
  const city = typeof preferences.location === 'string' 
    ? preferences.location 
    : preferences.location?.city || 'NYC';
  
  // Create 3 mock restaurants
  return [
    {
      id: `${baseId}-1`,
      name: `${vibe} ${cuisine} Bistro`,
      description: `A charming ${cuisine} restaurant with a ${vibe.toLowerCase()} atmosphere. Perfect for an unforgettable evening in ${city}.`,
      imageUrl: `https://source.unsplash.com/featured/?restaurant,${cuisine.toLowerCase()}`,
      cuisineType: cuisine,
      priceRange: priceRange,
      location: city,
      address: `123 Main St, ${city}`,
      phone: '(212) 555-1234',
      website: 'https://example.com',
      rating: 4.7,
      openingHours: ['11:00 AM - 10:00 PM', '11:00 AM - 10:00 PM', '11:00 AM - 10:00 PM', '11:00 AM - 10:00 PM', '11:00 AM - 11:00 PM', '11:00 AM - 11:00 PM', '12:00 PM - 9:00 PM'],
      highlights: [cuisine, vibe, 'Authentic'],
      reasonsToRecommend: [`Perfect for a ${vibe.toLowerCase()} evening`, 'Outstanding service', 'Award-winning chef'],
    },
    {
      id: `${baseId}-2`,
      name: `The ${cuisine} Experience`,
      description: `Immerse yourself in authentic ${cuisine} cuisine in a ${vibe.toLowerCase()} setting. Located in the heart of ${city}.`,
      imageUrl: `https://source.unsplash.com/featured/?food,${cuisine.toLowerCase()}`,
      cuisineType: cuisine,
      priceRange: priceRange,
      location: city,
      address: `456 Restaurant Row, ${city}`,
      phone: '(212) 555-5678',
      website: 'https://example.com',
      rating: 4.5,
      openingHours: ['12:00 PM - 11:00 PM', '12:00 PM - 11:00 PM', '12:00 PM - 11:00 PM', '12:00 PM - 11:00 PM', '12:00 PM - 12:00 AM', '12:00 PM - 12:00 AM', 'Closed'],
      highlights: [cuisine, 'Best Seller', 'Local Favorite'],
      reasonsToRecommend: ['Unique dining experience', 'Signature dishes', 'Perfect for foodies'],
    },
    {
      id: `${baseId}-3`,
      name: `${city} ${cuisine} House`,
      description: `A hidden gem for ${cuisine} food lovers. The ${vibe.toLowerCase()} decor and exceptional service make it a standout in ${city}.`,
      imageUrl: `https://source.unsplash.com/featured/?dinner,${cuisine.toLowerCase()}`,
      cuisineType: cuisine,
      priceRange: priceRange,
      location: city,
      address: `789 Culinary Blvd, ${city}`,
      phone: '(212) 555-9012',
      website: 'https://example.com',
      rating: 4.8,
      openingHours: ['5:00 PM - 12:00 AM', '5:00 PM - 12:00 AM', '5:00 PM - 12:00 AM', '5:00 PM - 12:00 AM', '5:00 PM - 1:00 AM', '5:00 PM - 1:00 AM', '5:00 PM - 10:00 PM'],
      highlights: [cuisine, vibe, 'Date Night'],
      reasonsToRecommend: ['Hidden gem', 'Celebrity chef', 'Innovative menu'],
    },
  ];
} 