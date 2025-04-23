import { AIKernel, ChatMessage } from '../semanticKernel';
import { RecommendationResponse, RestaurantRecommendation } from '../../shared/types';
import { log } from '../../vite';
import { getKernel } from '../semanticKernel';
import { getGroundedRecommendations } from '../../services/azureOpenAIBingService';

// Add a global declaration at the top of the file
declare global {
  var lastGeneratedRecommendations: RestaurantRecommendation[] | undefined;
  var lastGeneratedReasoning: string | undefined;
}

export class RecommendationPlugin {
  name = 'RecommendationPlugin';
  private kernel: AIKernel | null = null;

  async initialize() {
    this.kernel = await getKernel();
    return this;
  }

  /**
   * Generates restaurant recommendations based on preferences
   * @param preferences Array of user preferences
   * @param conversationHistory Previous conversation for context
   * @returns Structured recommendations with reasoning
   */
  async generateRecommendations(
    preferences: string[],
    conversationHistory: string = ''
  ): Promise<RecommendationResponse> {
    try {
      // Use Azure OpenAI + Bing grounding approach
      const result = await getGroundedRecommendations(
        preferences,
        conversationHistory
      );
      
      if (result.recommendations.length > 0) {
        return result;
      }
      
      // Fall back to original implementation if needed
      const promptTemplate = `
        You are a fun and charming NYC date-night expert. When a user tells you what mood or vibe they want, suggest restaurants that match it. Give recommendations with a short narrative description that sets the scene, not just listing the place.
        
        Given the following preferences and any past conversation context, recommend 3 different restaurants
        that would be perfect for a date night.
        
        USER PREFERENCES:
        ${preferences.join(', ')}
        
        ${conversationHistory ? `PREVIOUS CONVERSATION CONTEXT:\n${conversationHistory}` : ''}
        
        For each restaurant, provide:
        1. Name
        2. A vivid, narrative description that paints a picture of the atmosphere and experience
        3. Cuisine type
        4. Price range
        5. Location
        6. Rating (1-5)
        7. An image URL (optional, will be generated if not provided)
        
        Make your descriptions engaging and scene-setting, as if you're telling a story about the date night experience.
        
        IMPORTANT: Your response MUST be formatted exactly as valid JSON with the following structure. Don't add any text before or after the JSON object:
        {
          "recommendations": [
            {
              "name": "Restaurant Name",
              "description": "Narrative description of the experience",
              "cuisine": "Cuisine type",
              "priceRange": "Price range (e.g. $, $$, $$$)",
              "location": "Location",
              "rating": 4.5,
              "imageUrl": "https://example.com/image.jpg"
            }
          ],
          "reasoning": "Explanation of how these recommendations match preferences, written in a fun, charming tone"
        }
        
        Remember: Your response must be a single valid JSON object with no other text - do not wrap in markdown code blocks.
      `;

      if (!this.kernel) {
        await this.initialize();
      }
      
      if (!this.kernel) {
        log('AI kernel not initialized, using fallback data', 'ai');
        const mockRecommendations = generateMockRecommendations(preferences);
        
        // Store in global for potential Bing grounding
        global.lastGeneratedRecommendations = mockRecommendations;
        global.lastGeneratedReasoning = 'Based on your preferences, here are some restaurant options that might interest you.';
        
        return {
          recommendations: mockRecommendations,
          reasoning: 'Based on your preferences, here are some restaurant options that might interest you.'
        };
      }
      
      try {
        // Use the OpenAI kernel
        const response = await this.kernel.chatCompletion({
          messages: [
            { role: 'system', content: promptTemplate }
          ],
          temperature: 0.7
        });
        
        // Parse the response into the expected format
        try {
          // Extract JSON from response (may include markdown formatting)
          let jsonContent = '';
          
          // First try to extract from code blocks
          const jsonMatch = response.content.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1];
          } 
          // Then try to match any JSON-like structure
          else {
            const fullJsonMatch = response.content.match(/({[\s\S]*})/);
            if (fullJsonMatch) {
              jsonContent = fullJsonMatch[1];
            } else {
              // If no JSON found, use the full response
              jsonContent = response.content;
            }
          }
          
          // Clean up the content
          jsonContent = jsonContent.trim();
          
          // Log the extracted content for debugging
          log(`Extracted JSON content: ${jsonContent.substring(0, 100)}...`, 'ai');
          
          const result = JSON.parse(jsonContent) as RecommendationResponse;
          
          if (!result.recommendations || !Array.isArray(result.recommendations)) {
            log('Malformed recommendations response', 'ai');
            
            // Fallback to mock data if needed
            const mockRecommendations = generateMockRecommendations(preferences);
            global.lastGeneratedRecommendations = mockRecommendations;
            global.lastGeneratedReasoning = 'These are some popular restaurants matching your preferences.';
            
            return {
              recommendations: mockRecommendations,
              reasoning: 'These are some popular restaurants matching your preferences.'
            };
          }
          
          // Store generated recommendations for potential Bing grounding
          global.lastGeneratedRecommendations = result.recommendations;
          global.lastGeneratedReasoning = result.reasoning;
          
          return result;
        } catch (parseError) {
          log(`Error parsing AI response: ${(parseError as Error).message}`, 'ai');
          log(`Raw response content: ${response.content.substring(0, 200)}...`, 'ai');
          
          // Fallback to mock data
          const mockRecommendations = generateMockRecommendations(preferences);
          global.lastGeneratedRecommendations = mockRecommendations;
          global.lastGeneratedReasoning = 'Here are some restaurant options based on your preferences.';
          
          return {
            recommendations: mockRecommendations,
            reasoning: 'Here are some restaurant options based on your preferences.'
          };
        }
      } catch (apiError) {
        // Log detailed API error for debugging
        log(`Error in chat completion: ${(apiError as Error).message}`, 'ai');
        log('Using fallback mock data due to API error', 'ai');
        
        // Always fallback to mock data on API errors
        const mockRecommendations = generateMockRecommendations(preferences);
        global.lastGeneratedRecommendations = mockRecommendations;
        global.lastGeneratedReasoning = `Here are some restaurant suggestions for ${preferences.join(', ')}. (Using fallback data)`;
        
        return {
          recommendations: mockRecommendations,
          reasoning: `Here are some restaurant suggestions for ${preferences.join(', ')}. (Using fallback data)`
        };
      }
    } catch (error) {
      // Log the error but don't throw it
      console.error('Error generating recommendations:', error);
      
      // Provide fallback data instead of throwing error
      const mockRecommendations = generateMockRecommendations(preferences);
      global.lastGeneratedRecommendations = mockRecommendations;
      global.lastGeneratedReasoning = 'Here are some restaurant recommendations based on your preferences. (Fallback data)';
      
      return {
        recommendations: mockRecommendations,
        reasoning: 'Here are some restaurant recommendations based on your preferences. (Fallback data)'
      };
    }
  }

  /**
   * Refines recommendations based on user feedback
   * @param previousRecommendations Previous restaurant recommendations
   * @param userMessage User's feedback or question
   * @returns Updated recommendations with explanation
   */
  async refineRecommendations(
    previousRecommendations: RestaurantRecommendation[],
    userMessage: string
  ): Promise<RecommendationResponse> {
    try {
      // Extract new preferences from user message
      const newPreferences = extractPreferencesFromMessage(userMessage);
      
      // Combine with information from previous recommendations
      const context = `The user previously received recommendations for these restaurants: ${previousRecommendations.map(r => r.name).join(', ')}. 
      They're now looking for something different and mentioned: "${userMessage}"`;
      
      // Get new recommendations with the combined context
      const result = await getGroundedRecommendations(
        newPreferences,
        context
      );
      
      if (result.recommendations.length > 0) {
        return result;
      }
      
      // Fall back to original implementation if needed
      const promptTemplate = `
        You are a fun and charming NYC date-night expert. When a user tells you what mood or vibe they want, suggest restaurants that match it. Give recommendations with a short narrative description that sets the scene, not just listing the place.
        
        You previously recommended these restaurants:
        ${JSON.stringify(previousRecommendations, null, 2)}
        
        The user has provided feedback or asked a question:
        "${userMessage}"
        
        Based on this feedback, refine your recommendations. You may keep some restaurants,
        replace others, or provide completely new options. Explain your reasoning in a fun, conversational tone
        that matches your charming NYC date-night expert persona.
        
        For each restaurant, provide a vivid, narrative description that paints a picture of the atmosphere and experience.
        
        IMPORTANT: Your response MUST be formatted exactly as valid JSON with the following structure. Don't add any text before or after the JSON object:
        {
          "recommendations": [
            {
              "name": "Restaurant Name",
              "description": "Narrative description of the experience",
              "cuisine": "Cuisine type",
              "priceRange": "Price range (e.g. $, $$, $$$)",
              "location": "Location",
              "rating": 4.5,
              "imageUrl": "https://example.com/image.jpg"
            }
          ],
          "reasoning": "Explanation of how you refined the recommendations, written in a fun, charming tone"
        }
        
        Remember: Your response must be a single valid JSON object with no other text - do not wrap in markdown code blocks.
      `;

      if (!this.kernel) {
        await this.initialize();
      }
      
      if (!this.kernel) {
        log('AI kernel not initialized, using fallback data for refinement', 'ai');
        return {
          recommendations: refineRecommendationsBasedOnFeedback(previousRecommendations, userMessage),
          reasoning: `I've adjusted these recommendations based on your feedback about "${userMessage}".`
        };
      }
      
      try {
        // Use the OpenAI kernel
        const response = await this.kernel.chatCompletion({
          messages: [
            { role: 'system', content: promptTemplate }
          ],
          temperature: 0.7
        });
        
        // Parse the response into the expected format
        try {
          // Extract JSON from response (may include markdown formatting)
          let jsonContent = '';
          
          // First try to extract from code blocks
          const jsonMatch = response.content.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1];
          } 
          // Then try to match any JSON-like structure
          else {
            const fullJsonMatch = response.content.match(/({[\s\S]*})/);
            if (fullJsonMatch) {
              jsonContent = fullJsonMatch[1];
            } else {
              // If no JSON found, use the full response
              jsonContent = response.content;
            }
          }
          
          // Clean up the content
          jsonContent = jsonContent.trim();
          
          // Log the extracted content for debugging
          log(`Extracted refined JSON content: ${jsonContent.substring(0, 100)}...`, 'ai');
          
          const result = JSON.parse(jsonContent) as RecommendationResponse;
          
          if (!result.recommendations || !Array.isArray(result.recommendations)) {
            log('Malformed recommendations response', 'ai');
            
            // Fallback to refinement logic
            return {
              recommendations: refineRecommendationsBasedOnFeedback(previousRecommendations, userMessage),
              reasoning: `I've refined the recommendations based on your feedback: "${userMessage}"`
            };
          }
          
          return result;
        } catch (parseError) {
          log(`Error parsing AI response: ${(parseError as Error).message}`, 'ai');
          log(`Raw refined response content: ${response.content.substring(0, 200)}...`, 'ai');
          
          // Fallback to refinement logic
          return {
            recommendations: refineRecommendationsBasedOnFeedback(previousRecommendations, userMessage),
            reasoning: `I've refined the recommendations based on your feedback: "${userMessage}"`
          };
        }
      } catch (apiError) {
        // Log detailed API error for debugging
        log(`Error in chat completion: ${(apiError as Error).message}`, 'ai');
        log('Using fallback refinement logic due to API error', 'ai');
        
        // Always fallback to refinement logic on API errors
        return {
          recommendations: refineRecommendationsBasedOnFeedback(previousRecommendations, userMessage),
          reasoning: `I've updated these restaurants based on your feedback about "${userMessage}". (Using fallback logic)`
        };
      }
    } catch (error) {
      // Log the error but don't throw it
      console.error('Error refining recommendations:', error);
      
      // Provide fallback data instead of throwing error
      return {
        recommendations: refineRecommendationsBasedOnFeedback(previousRecommendations, userMessage),
        reasoning: `I've refined the recommendations based on your input. (Fallback logic)`
      };
    }
  }
}

// Helper function to generate mock recommendations
function generateMockRecommendations(preferences: string[]): RestaurantRecommendation[] {
  // This would use the kernel in a real implementation
  
  // Sample restaurant data based on common preferences
  const italianRestaurants = [
    {
      name: "Bella Notte",
      description: "Intimate Italian restaurant with handmade pasta and romantic ambiance",
      cuisine: "Italian",
      priceRange: "$$$",
      location: "Downtown",
      rating: 4.7,
      imageUrl: "https://source.unsplash.com/featured/?italian,restaurant,romantic"
    },
    {
      name: "Trattoria Milano",
      description: "Authentic Northern Italian cuisine in a cozy setting",
      cuisine: "Italian",
      priceRange: "$$",
      location: "Westside",
      rating: 4.5,
      imageUrl: "https://source.unsplash.com/featured/?italian,pasta,trattoria"
    }
  ];
  
  const japaneseRestaurants = [
    {
      name: "Sakura",
      description: "Upscale sushi and Japanese specialties with private dining options",
      cuisine: "Japanese",
      priceRange: "$$$",
      location: "Financial District",
      rating: 4.8,
      imageUrl: "https://source.unsplash.com/featured/?japanese,sushi,upscale"
    },
    {
      name: "Ramen Koji",
      description: "Authentic ramen in a trendy, intimate setting",
      cuisine: "Japanese",
      priceRange: "$$",
      location: "East Village",
      rating: 4.4,
      imageUrl: "https://source.unsplash.com/featured/?japanese,ramen,cozy"
    }
  ];
  
  const frenchRestaurants = [
    {
      name: "Le Petit Bistro",
      description: "Classic French bistro with intimate setting and extensive wine list",
      cuisine: "French",
      priceRange: "$$$",
      location: "Midtown",
      rating: 4.6,
      imageUrl: "https://source.unsplash.com/featured/?french,bistro,wine"
    },
    {
      name: "Chez Michel",
      description: "Elegant French fine dining with romantic atmosphere",
      cuisine: "French",
      priceRange: "$$$$",
      location: "Uptown",
      rating: 4.9,
      imageUrl: "https://source.unsplash.com/featured/?french,fine-dining,elegant"
    }
  ];
  
  const mexicanRestaurants = [
    {
      name: "Casa Azul",
      description: "Upscale Mexican cuisine with craft cocktails and intimate atmosphere",
      cuisine: "Mexican",
      priceRange: "$$$",
      location: "Arts District",
      rating: 4.5,
      imageUrl: "https://source.unsplash.com/featured/?mexican,upscale,cocktails"
    },
    {
      name: "Taqueria Romantica",
      description: "Authentic regional Mexican dishes in a colorful, romantic setting",
      cuisine: "Mexican",
      priceRange: "$$",
      location: "Riverside",
      rating: 4.3,
      imageUrl: "https://source.unsplash.com/featured/?mexican,taqueria,colorful"
    }
  ];
  
  // Choose restaurants based on preferences
  const selectedRestaurants: RestaurantRecommendation[] = [];
  
  // Check for cuisine preferences
  if (preferences.includes("italian")) {
    selectedRestaurants.push(italianRestaurants[Math.floor(Math.random() * italianRestaurants.length)]);
  }
  
  if (preferences.includes("japanese")) {
    selectedRestaurants.push(japaneseRestaurants[Math.floor(Math.random() * japaneseRestaurants.length)]);
  }
  
  if (preferences.includes("french")) {
    selectedRestaurants.push(frenchRestaurants[Math.floor(Math.random() * frenchRestaurants.length)]);
  }
  
  if (preferences.includes("mexican")) {
    selectedRestaurants.push(mexicanRestaurants[Math.floor(Math.random() * mexicanRestaurants.length)]);
  }
  
  // If we don't have 3 restaurants yet, add random ones to fill
  const allRestaurants = [...italianRestaurants, ...japaneseRestaurants, ...frenchRestaurants, ...mexicanRestaurants];
  while (selectedRestaurants.length < 3) {
    const randomRestaurant = allRestaurants[Math.floor(Math.random() * allRestaurants.length)];
    // Only add if not already included
    if (!selectedRestaurants.some(r => r.name === randomRestaurant.name)) {
      selectedRestaurants.push(randomRestaurant);
    }
  }
  
  return selectedRestaurants;
}

// Helper function to refine recommendations based on feedback
function refineRecommendationsBasedOnFeedback(
  previousRecommendations: RestaurantRecommendation[],
  feedback: string
): RestaurantRecommendation[] {
  // In a real implementation, this would use semantic understanding to interpret the feedback
  
  // For this mock implementation, we'll just change one restaurant if the feedback contains certain keywords
  const refinedRecommendations = [...previousRecommendations];
  
  // Sample refinement logic based on keywords in feedback
  if (feedback.toLowerCase().includes("cheaper") || feedback.toLowerCase().includes("less expensive")) {
    // Replace the most expensive restaurant with a cheaper option
    const mostExpensiveIndex = refinedRecommendations.findIndex(
      r => r.priceRange.length === Math.max(...refinedRecommendations.map(r => r.priceRange.length))
    );
    
    if (mostExpensiveIndex >= 0) {
      refinedRecommendations[mostExpensiveIndex] = {
        name: "Budget Bistro",
        description: "Charming and affordable dining with great value and romantic ambiance",
        cuisine: refinedRecommendations[mostExpensiveIndex].cuisine,
        priceRange: "$",
        location: "University District",
        rating: 4.2,
        imageUrl: "https://source.unsplash.com/featured/?affordable,bistro,charming"
      };
    }
  } else if (feedback.toLowerCase().includes("romantic") || feedback.toLowerCase().includes("intimate")) {
    // Add a more romantic option
    refinedRecommendations[0] = {
      name: "Moonlight Garden",
      description: "Incredibly romantic setting with garden dining, soft lighting and exceptional service",
      cuisine: "Continental",
      priceRange: "$$$",
      location: "Hillside",
      rating: 4.8,
      imageUrl: "https://source.unsplash.com/featured/?romantic,garden,restaurant"
    };
  } else if (feedback.toLowerCase().includes("vegetarian") || feedback.toLowerCase().includes("vegan")) {
    // Add a vegetarian-friendly option
    refinedRecommendations[0] = {
      name: "Green Leaf",
      description: "Upscale vegetarian and vegan cuisine in an intimate setting with garden views",
      cuisine: "Vegetarian/Vegan",
      priceRange: "$$",
      location: "Garden District",
      rating: 4.6,
      imageUrl: "https://source.unsplash.com/featured/?vegetarian,restaurant,garden"
    };
  }
  
  return refinedRecommendations;
}

// Helper function to extract preferences from message
function extractPreferencesFromMessage(message: string): string[] {
  // Implementation of extractPreferencesFromMessage function
  // This function should return an array of preferences extracted from the user message
  return [];
} 