import axios from 'axios';
// Remove Azure OpenAI SDK dependency due to compatibility issues
// import * as Azure from "@azure/openai";
import { RestaurantRecommendation } from '../shared/types';
import { log } from '../vite';

// Declare global variables to allow TypeScript to recognize them
declare global {
  var lastGeneratedRecommendations: RestaurantRecommendation[] | undefined;
  var lastGeneratedReasoning: string | undefined;
}

// Azure OpenAI configuration
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

// Bing Search configuration
const BING_API_KEY = process.env.BING_SEARCH_API_KEY;
const BING_SEARCH_URL = 'https://api.bing.microsoft.com/v7.0/search';
const BING_IMAGES_URL = 'https://api.bing.microsoft.com/v7.0/images/search';

// We'll use axios directly instead of the SDK due to compatibility issues

/**
 * Get restaurant recommendations using Azure OpenAI with Bing grounding
 */
export async function getGroundedRecommendations(
  preferences: string[],
  conversationHistory: string = '',
  limit = 3
): Promise<{
  recommendations: RestaurantRecommendation[],
  reasoning: string
}> {
  try {
    // Step 1: Generate restaurant candidates using Azure OpenAI
    let generatedCandidates = await generateRestaurantCandidates(preferences, conversationHistory);
    let usingFallback = false;
    
    if (!generatedCandidates || generatedCandidates.length === 0) {
      log('Failed to generate restaurant candidates from Azure OpenAI - will use fallback data', 'azure');
      usingFallback = true;
      
      // Instead of returning empty results, look for OpenAI-generated results in the response
      // This is a new approach to allow Bing grounding even when Azure OpenAI fails
      try {
        // This will be filled in if OpenAI already generated recommendations
        const openAIRecommendations = global.lastGeneratedRecommendations || [];
        
        if (openAIRecommendations && openAIRecommendations.length > 0) {
          log(`Using ${openAIRecommendations.length} recommendations from OpenAI as fallback`, 'azure-bing');
          generatedCandidates = openAIRecommendations.map((r: RestaurantRecommendation) => ({
            name: r.name, 
            cuisine: r.cuisine,
            priceRange: r.priceRange,
            location: r.location,
            description: r.description,
            highlights: r.highlights || r.whyYoullLoveIt
          }));
        } else {
          // Still no candidates, we'll have to return empty results
          return { 
            recommendations: [], 
            reasoning: 'Unable to generate recommendations based on your preferences.' 
          };
        }
      } catch (fallbackError) {
        log(`Error accessing fallback data: ${fallbackError}`, 'azure-bing');
        return { 
          recommendations: [], 
          reasoning: 'Unable to generate recommendations based on your preferences.' 
        };
      }
    }
    
    // Step 2: Ground each restaurant with Bing Search (now will happen even with fallback data)
    log(`Grounding ${generatedCandidates.length} restaurant candidates with Bing`, 'bing');
    const groundedRestaurants = await Promise.all(
      generatedCandidates.map(candidate => groundRestaurantWithBing(candidate, preferences))
    );
    
    // Step 3: Filter to restaurants that were successfully grounded
    const validRestaurants = groundedRestaurants.filter(r => r.imageUrl && r.name);
    
    if (validRestaurants.length === 0) {
      log('No valid grounded restaurants found', 'azure-bing');
      return { 
        recommendations: [], 
        reasoning: 'Unable to find suitable restaurant matches at this time.' 
      };
    }
    
    // Step 4: Generate reasoning using Azure OpenAI or use existing reasoning
    let reasoning: string;
    if (usingFallback && global.lastGeneratedReasoning) {
      reasoning = global.lastGeneratedReasoning;
    } else {
      reasoning = await generateReasoning(validRestaurants, preferences);
    }
    
    return {
      recommendations: validRestaurants.slice(0, limit),
      reasoning
    };
    
  } catch (error) {
    log(`Error in Azure OpenAI + Bing grounding: ${(error as Error).message}`, 'azure-bing');
    return { 
      recommendations: [], 
      reasoning: 'An error occurred while processing your request.' 
    };
  }
}

/**
 * Generate restaurant candidates using Azure OpenAI
 */
async function generateRestaurantCandidates(
  preferences: string[],
  conversationHistory: string
): Promise<Partial<RestaurantRecommendation>[]> {
  try {
    const prompt = `
You are a restaurant recommendation expert for New York City.
Based on the following preferences: ${preferences.join(', ')}
${conversationHistory ? `And considering this conversation context: ${conversationHistory}` : ''}

Generate ${preferences.length > 0 ? 5 : 3} restaurant options that would be perfect matches.
Each restaurant should be a real, well-known establishment in NYC that matches the preferences.
For each restaurant, provide:
1. The restaurant name
2. Cuisine type
3. Price range ($ to $$$)
4. Location (neighborhood in NYC)
5. A brief description (1-2 sentences)
6. 2-3 key highlights that make it special

Respond in JSON format like this:
{
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "priceRange": "$$",
      "location": "Neighborhood",
      "description": "Brief description of the restaurant",
      "highlights": ["highlight 1", "highlight 2"]
    }
  ]
}
`;

    // Use direct axios call to Azure OpenAI API instead of SDK
    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}/openai/chat/completions?api-version=2025-01-01-preview`,
      {
        model: DEPLOYMENT_NAME,
        messages: [
          { role: "system", content: "You are a restaurant recommendation expert for New York City. Provide accurate, specific recommendations based on preferences." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY
        }
      }
    );

    const content = response.data.choices[0].message?.content || "";
    
    try {
      const parsed = JSON.parse(content);
      return parsed.restaurants || [];
    } catch (parseError) {
      log(`Failed to parse Azure OpenAI response: ${parseError}`, 'azure');
      return [];
    }
    
  } catch (error) {
    log(`Error generating restaurant candidates: ${(error as Error).message}`, 'azure');
    return [];
  }
}

/**
 * Find the best image from a list based on quality and dimensions
 */
function findBestImage(images: any[]): any {
  // Prefer images with width between 600-1200px as they're good for UI display
  const sizeFiltered = images.filter(img => 
    img.width >= 600 && img.width <= 1200 && img.height >= 400
  );
  
  if (sizeFiltered.length > 0) {
    return sizeFiltered[0];
  }
  
  // Fall back to first image
  return images[0];
}

/**
 * Ground a restaurant candidate with real information from Bing Search
 */
async function groundRestaurantWithBing(
  candidate: Partial<RestaurantRecommendation>,
  preferences: string[]
): Promise<RestaurantRecommendation> {
  try {
    // Initialize groundedRestaurant at the beginning
    let groundedRestaurant = { ...candidate } as RestaurantRecommendation;
    
    // Create specific search query for this restaurant
    const query = `${candidate.name} restaurant ${candidate.location || 'NYC'} ${candidate.cuisine || ''}`;
    log(`Searching Bing for: ${query}`, 'bing');
    
    // First, search for web results about this restaurant
    try {
      const webResponse = await axios.get(BING_SEARCH_URL, {
        headers: {
          'Ocp-Apim-Subscription-Key': BING_API_KEY
        },
        params: {
          q: query,
          count: 3,
          responseFilter: 'Webpages',
          mkt: 'en-US'
        }
      });
      
      log(`Bing Web Search response status: ${webResponse.status}`, 'bing');
      
      // Extract and enhance restaurant information from search results
      if (webResponse.data.webPages?.value?.length > 0) {
        log(`Found ${webResponse.data.webPages.value.length} web results for ${candidate.name}`, 'bing');
        const result = webResponse.data.webPages.value[0];
        
        // Update/validate information with Bing results
        groundedRestaurant = {
          ...groundedRestaurant,
          name: candidate.name || cleanRestaurantName(result.name),
          description: groundedRestaurant.description || result.snippet,
          location: groundedRestaurant.location || extractLocationFromText(result.snippet) || 'NYC',
          // Store website URL in details object instead of directly
          details: { ...groundedRestaurant.details, websiteUrl: result.url }
        };
        
        // Extract any missing information from snippet
        if (!groundedRestaurant.cuisine) {
          groundedRestaurant.cuisine = extractCuisineFromText(result.snippet) || 'Restaurant';
        }
        
        if (!groundedRestaurant.priceRange) {
          groundedRestaurant.priceRange = extractPriceRangeFromText(result.snippet) || '$$';
        }
        
        if (!groundedRestaurant.rating) {
          groundedRestaurant.rating = extractRatingFromText(result.snippet) || 4.2;
        }
      } else {
        log(`No web results found for ${candidate.name}`, 'bing');
      }
    } catch (webError) {
      log(`Error in Bing Web Search: ${(webError as Error).message}`, 'bing');
      log(`Using Bing API Key: ${BING_API_KEY ? 'YES (defined)' : 'NO (undefined)'}`, 'bing');
    }
    
    // Now, get images for the restaurant (this is the critical step for your issue)
    log(`Searching Bing Images for: ${groundedRestaurant.name}`, 'bing');
    log(`Using Bing API Key for Images: ${BING_API_KEY ? 'YES (defined)' : 'NO (undefined)'}`, 'bing');
    let imageUrl = '';
    
    try {
      const imageQuery = `${groundedRestaurant.name} restaurant ${groundedRestaurant.location} food interior`;
      log(`Bing Image Search query: ${imageQuery}`, 'bing');
      
      const imageResponse = await axios.get(BING_IMAGES_URL, {
        headers: {
          'Ocp-Apim-Subscription-Key': BING_API_KEY
        },
        params: {
          q: imageQuery,
          count: 5, // Get more images to increase chances of finding good ones
          mkt: 'en-US',
          safeSearch: 'Moderate'
        }
      });
      
      log(`Bing Image Search response status: ${imageResponse.status}`, 'bing');
      
      if (imageResponse.data.value && imageResponse.data.value.length > 0) {
        log(`Found ${imageResponse.data.value.length} images for ${groundedRestaurant.name}`, 'bing');
        // Find the best image - prefer those with proper dimensions and size
        const bestImage = findBestImage(imageResponse.data.value);
        imageUrl = bestImage.contentUrl;
        
        log(`Selected image URL: ${imageUrl.substring(0, 30)}...`, 'bing');
      } else {
        log(`No images found in Bing response`, 'bing');
        
        // Try a more generic search if specific one failed
        const backupImageQuery = `${groundedRestaurant.cuisine} restaurant food NYC`;
        const backupImageResponse = await axios.get(BING_IMAGES_URL, {
          headers: {
            'Ocp-Apim-Subscription-Key': BING_API_KEY
          },
          params: {
            q: backupImageQuery,
            count: 5,
            mkt: 'en-US',
            safeSearch: 'Moderate'
          }
        });
        
        if (backupImageResponse.data.value?.length > 0) {
          const bestImage = findBestImage(backupImageResponse.data.value);
          imageUrl = bestImage.contentUrl;
          log(`Selected backup image URL: ${imageUrl.substring(0, 30)}...`, 'bing');
        } else {
          log(`Still no images found, using placeholder`, 'bing');
          // Use placeholder if still no images
          imageUrl = `https://source.unsplash.com/featured/?${groundedRestaurant.cuisine.replace(/\s+/g, ',')},restaurant,food`;
        }
      }
    } catch (imageError: any) { // Using any type to resolve the TypeScript error
      log(`Error in Bing Image Search: ${(imageError as Error).message}`, 'bing');
      if (imageError.response) {
        log(`Response status: ${imageError.response.status}`, 'bing');
        log(`Response data: ${JSON.stringify(imageError.response.data)}`, 'bing');
      }
      // Use a fallback image source when Bing fails
      imageUrl = `https://source.unsplash.com/featured/?${groundedRestaurant.cuisine.replace(/\s+/g, ',')},restaurant,food`;
    }
    
    // Assign the image URL to the restaurant
    groundedRestaurant.imageUrl = imageUrl;
    
    // Generate "why you'll love it" using original highlights or create new ones
    groundedRestaurant.whyYoullLoveIt = candidate.highlights || generateReasons(groundedRestaurant);
    
    // Ensure highlights exist
    groundedRestaurant.highlights = groundedRestaurant.highlights || 
      generateHighlights(groundedRestaurant, preferences);
    
    return groundedRestaurant;
    
  } catch (error) {
    log(`Error grounding restaurant with Bing: ${(error as Error).message}`, 'bing');
    
    // Return the ungrounded candidate, but make sure it has all required fields
    // Use a fallback image if we couldn't get one from Bing
    const fallbackImage = `https://source.unsplash.com/featured/?${(candidate.cuisine || 'food').replace(/\s+/g, ',')},restaurant`;
    
    return {
      name: candidate.name || 'Restaurant',
      description: candidate.description || 'A restaurant in NYC',
      cuisine: candidate.cuisine || 'Restaurant',
      priceRange: candidate.priceRange || '$$',
      location: candidate.location || 'NYC',
      rating: candidate.rating || 4.0,
      imageUrl: candidate.imageUrl || fallbackImage,
      highlights: candidate.highlights || ['Restaurant'],
      whyYoullLoveIt: candidate.highlights || ['Great dining experience']
    };
  }
}

/**
 * Generate reasoning for the restaurant recommendations
 */
async function generateReasoning(
  restaurants: RestaurantRecommendation[],
  preferences: string[]
): Promise<string> {
  try {
    const restaurantNames = restaurants.map(r => r.name).join(', ');
    
    const prompt = `
Based on the user's preferences (${preferences.join(', ')}), I've found these restaurants: ${restaurantNames}.
Write a brief paragraph (2-3 sentences) explaining why these restaurants match the user's preferences.
Be specific about how they match the preferences. Keep it conversational and friendly.
`;

    // Use direct axios call to Azure OpenAI API instead of SDK
    const response = await axios.post(
      `${AZURE_OPENAI_ENDPOINT}/openai/chat/completions?api-version=2025-01-01-preview`,
      {
        model: DEPLOYMENT_NAME,
        messages: [
          { role: "system", content: "You are a helpful restaurant recommendation assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY
        }
      }
    );

    return response.data.choices[0].message?.content || 
      `Based on your preferences (${preferences.join(', ')}), I found these restaurants that should be perfect for you!`;
    
  } catch (error) {
    log(`Error generating reasoning: ${(error as Error).message}`, 'azure');
    return `Based on your preferences (${preferences.join(', ')}), I found these restaurants that should be perfect for you!`;
  }
}

function cleanRestaurantName(name: string): string {
  return name
    .replace(/\s*[-–|]\s*.*(official|restaurant|menu|reviews|reservations).*/i, '')
    .replace(/\s*[-–|]\s*.*\b(yelp|tripadvisor|opentable)\b.*/i, '')
    .trim();
}

function extractLocationFromText(text: string): string | undefined {
  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'NYC', 'New York'];
  
  for (const borough of boroughs) {
    if (text.includes(borough)) {
      return borough;
    }
  }
  
  return undefined;
}

function extractCuisineFromText(text: string): string | undefined {
  const cuisines = [
    'Italian', 'Japanese', 'Thai', 'Mexican', 'French', 
    'Mediterranean', 'American', 'Chinese', 'Indian', 
    'Korean', 'Vietnamese', 'Greek', 'Spanish', 'Sushi',
    'Pizza', 'Burger', 'Steakhouse', 'Seafood', 'Vegetarian'
  ];
  
  for (const cuisine of cuisines) {
    const regex = new RegExp(`\\b${cuisine}\\b`, 'i');
    if (regex.test(text)) {
      return cuisine;
    }
  }
  
  return undefined;
}

function extractPriceRangeFromText(text: string): string | undefined {
  if (text.includes('$$$') || text.includes('expensive')) {
    return '$$$';
  } else if (text.includes('$$') || text.includes('moderate')) {
    return '$$';
  } else if (text.includes('$') || text.includes('cheap') || text.includes('budget')) {
    return '$';
  }
  
  return undefined;
}

function extractRatingFromText(text: string): number | undefined {
  const ratingMatch = text.match(/(\d\.\d)\s*stars?|\b(\d\.\d)\b/);
  if (ratingMatch) {
    return parseFloat(ratingMatch[1] || ratingMatch[2]);
  }
  
  const otherRatingMatch = text.match(/(\d)[ -]stars?|\b(\d)[ -]star\b/);
  if (otherRatingMatch) {
    return parseInt(otherRatingMatch[1] || otherRatingMatch[2], 10);
  }
  
  return undefined;
}

function generateHighlights(restaurant: any, preferences: string[]): string[] {
  const highlights: string[] = [];
  
  // Add cuisine
  if (restaurant.cuisine) {
    highlights.push(restaurant.cuisine);
  }
  
  // Add location
  if (restaurant.location) {
    highlights.push(restaurant.location);
  }
  
  // Add price range
  if (restaurant.priceRange) {
    highlights.push(restaurant.priceRange);
  }
  
  // Add ambiance-related highlight if mentioned in preferences
  if (preferences.includes('Romantic') && highlights.length < 4) {
    highlights.push('Romantic');
  } else if (preferences.includes('Cozy') && highlights.length < 4) {
    highlights.push('Cozy');
  } else if (preferences.includes('Bar or Lounge') && highlights.length < 4) {
    highlights.push('Bar');
  }
  
  return highlights;
}

function generateReasons(restaurant: any): string[] {
  const reasons: string[] = [];
  
  // Rating-based reason
  if (restaurant.rating) {
    reasons.push(`Highly rated with ${restaurant.rating} stars`);
  }
  
  // Location-based reason
  if (restaurant.location) {
    reasons.push(`Perfect location in ${restaurant.location}`);
  }
  
  // Cuisine-based reason
  if (restaurant.cuisine) {
    reasons.push(`Authentic ${restaurant.cuisine} cuisine`);
  }
  
  // Ensure we have at least one reason
  if (reasons.length === 0) {
    reasons.push(`Popular dining destination with excellent ambiance`);
  }
  
  return reasons;
} 