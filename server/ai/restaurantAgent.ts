import { AIKernel } from './semanticKernel';
import { getKernel } from './semanticKernel';
import { RecommendationPlugin } from './plugins/RecommendationPlugin';
import { RecommendationResponse, RestaurantRecommendation, ChatMessage } from '../shared/types';
import { log } from '../vite';

export class RestaurantAgent {
  private kernel: AIKernel | null = null;
  private recommendationPlugin: RecommendationPlugin | null = null;

  /**
   * Initialize the Restaurant Agent with the AI kernel and plugins
   */
  async initialize(): Promise<void> {
    try {
      // Get or initialize the kernel
      this.kernel = await getKernel();
      
      // Create and initialize the recommendation plugin
      this.recommendationPlugin = new RecommendationPlugin();
      await this.recommendationPlugin.initialize();
      
      log('Restaurant Agent initialized successfully', 'ai');
    } catch (error) {
      log(`Error initializing Restaurant Agent: ${(error as Error).message}`, 'ai');
      throw error;
    }
  }

  /**
   * Generate restaurant recommendations based on user preferences
   */
  async getRecommendations(preferences: string[], conversationHistory: string = ''): Promise<RecommendationResponse> {
    try {
      if (!this.recommendationPlugin) {
        await this.initialize();
      }
      
      if (!this.recommendationPlugin) {
        throw new Error('Recommendation plugin not initialized');
      }
      
      log(`Generating recommendations for preferences: ${preferences.join(', ')}`, 'ai');
      const response = await this.recommendationPlugin.generateRecommendations(preferences, conversationHistory);
      return response;
    } catch (error) {
      log(`Error generating recommendations: ${(error as Error).message}`, 'ai');
      throw error;
    }
  }

  /**
   * Refine recommendations based on user feedback
   */
  async refineRecommendations(
    previousRecommendations: RestaurantRecommendation[],
    userMessage: string
  ): Promise<RecommendationResponse> {
    try {
      if (!this.recommendationPlugin) {
        await this.initialize();
      }
      
      if (!this.recommendationPlugin) {
        throw new Error('Recommendation plugin not initialized');
      }
      
      log(`Refining recommendations based on user feedback: ${userMessage}`, 'ai');
      const response = await this.recommendationPlugin.refineRecommendations(
        previousRecommendations,
        userMessage
      );
      return response;
    } catch (error) {
      log(`Error refining recommendations: ${(error as Error).message}`, 'ai');
      throw error;
    }
  }

  /**
   * Process a message in the context of an ongoing conversation
   */
  async processMessage(
    conversationHistory: ChatMessage[],
    userMessage: string,
    currentRecommendations?: RestaurantRecommendation[]
  ): Promise<{
    response: string;
    updatedRecommendations?: RestaurantRecommendation[];
  }> {
    try {
      if (!this.recommendationPlugin) {
        await this.initialize();
      }
      
      if (!this.kernel) {
        await this.initialize();
        if (!this.kernel) {
          throw new Error('AI kernel not initialized');
        }
      }
      
      // Convert conversation history to a string format for the AI
      const historyString = conversationHistory
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n');
      
      if (currentRecommendations && currentRecommendations.length > 0) {
        // If we have current recommendations, refine them
        const refinedResult = await this.recommendationPlugin!.refineRecommendations(
          currentRecommendations,
          userMessage
        );
        
        return {
          response: refinedResult.reasoning,
          updatedRecommendations: refinedResult.recommendations
        };
      } else {
        // Direct approach using the NYC date-night expert prompt
        const promptTemplate = `
          You're my stylish NYC bestie who always knows the hottest spots. Your vibe is upbeat, a bit sassy, and you use casual language with the occasional emoji. Talk like you're texting a friend - short sentences, slang, and enthusiasm!
          
          USER'S MESSAGE:
          "${userMessage}"
          
          ${historyString ? `PREVIOUS CONVERSATION CONTEXT:\n${historyString}` : ''}
          
          When suggesting restaurants, don't just list facts - paint a picture! Be excited about the places, add little personal touches like "their pasta is TO DIE FOR" or "perfect for that romantic moment 💕"
          
          If the user has expressed preferences, recommend 3 different restaurants. For each one:
          1. Name
          2. A brief, vibrant description with personality (make it sound like you've been there and LOVED it)
          3. 3-5 highlight tags like "rooftop", "live-music", "hidden gem", "instagrammable", etc.
          4. 2-3 bullet points on why they'll love it (super specific, like "their chocolate soufflé will change your life")
          5. Cuisine type
          6. Price range
          7. Location
          8. Rating (1-5)
          
          Start your response with a friendly, casual line that feels like you're continuing a text conversation with a good friend.
          
          IMPORTANT: Your response MUST be formatted exactly as valid JSON with the following structure. Don't add any text before or after the JSON object:
          {
            "conversationalResponse": "Your friendly, conversational response that feels like texting a bestie. Keep it upbeat, use some slang, abbreviations and emojis where appropriate.",
            "recommendations": [
              {
                "name": "Restaurant Name",
                "description": "Super enthusiastic description",
                "highlights": ["rooftop", "live-music", "hidden gem"],
                "whyYoullLoveIt": ["The chocolate soufflé will change your life", "The bartender makes the best off-menu drinks"],
                "cuisine": "Cuisine type",
                "priceRange": "Price range (e.g. $, $$, $$$)",
                "location": "Location",
                "rating": 4.5
              }
            ]
          }
          
          Remember: Your response must be a single valid JSON object with no other text - do not wrap in markdown code blocks. All your friendly, conversational text should be inside the "conversationalResponse" field.
          
          Only include the "recommendations" array if you have enough information to make specific recommendations.
        `;

        try {
          // Use the OpenAI kernel directly
          const response = await this.kernel.chatCompletion({
            messages: [
              { role: 'system', content: promptTemplate }
            ],
            temperature: 0.7,
            maxTokens: 1200  // Ensure we get a full response
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
            
            // Try to parse the JSON
            const result = JSON.parse(jsonContent);
            
            // Ensure the response is engaging and not just a summary
            const formattedResponse = result.conversationalResponse || 
              "Here are some recommendations based on your preferences. Each one offers a unique experience that matches what you're looking for!";
            
            return {
              response: formattedResponse,
              updatedRecommendations: result.recommendations || []
            };
          } catch (parseError) {
            log(`Error parsing AI response: ${(parseError as Error).message}`, 'ai');
            log(`Raw response content: ${response.content}`, 'ai');
            
            // If we can't parse JSON, use the raw response as the formatted response
            // but still fallback to extracted preferences for recommendations
            const extractedPreferences = extractPreferencesFromMessage(userMessage);
            
            if (extractedPreferences.length > 0) {
              const newRecommendations = await this.recommendationPlugin!.generateRecommendations(
                extractedPreferences,
                historyString
              );
              
              // If we have a raw response, use it, otherwise use a generated one
              const responseText = response.content.length > 0 
                ? response.content.replace(/```json|```/g, '').trim()
                : `Based on your preferences for ${extractedPreferences.join(', ')}, here are some charming spots that would make for a perfect evening: ${newRecommendations.reasoning}`;
                
              return {
                response: responseText,
                updatedRecommendations: newRecommendations.recommendations
              };
            } else {
              // If no preferences can be extracted, provide a generic response
              return {
                response: "I'd be happy to recommend some restaurants for your date night in NYC. Could you tell me what type of cuisine you're interested in, your budget, or any other preferences you have for the perfect evening?"
              };
            }
          }
        } catch (apiError) {
          log(`Error in direct chat completion: ${(apiError as Error).message}`, 'ai');
          
          // Fallback to the original implementation
          const extractedPreferences = extractPreferencesFromMessage(userMessage);
          
          if (extractedPreferences.length > 0) {
            const newRecommendations = await this.recommendationPlugin!.generateRecommendations(
              extractedPreferences,
              historyString
            );
            
            return {
              response: `I've found some wonderful spots in NYC that match your preferences for ${extractedPreferences.join(', ')}. Each one offers a unique atmosphere and delicious cuisine: ${newRecommendations.reasoning}`,
              updatedRecommendations: newRecommendations.recommendations
            };
          } else {
            // If no preferences can be extracted, provide a generic response
            return {
              response: "I'd be happy to recommend some restaurants for your date night in NYC. Could you tell me what type of cuisine you're interested in, your budget, or any specific neighborhood you'd like to explore?"
            };
          }
        }
      }
    } catch (error) {
      log(`Error processing message: ${(error as Error).message}`, 'ai');
      return {
        response: "I'm sorry, I encountered an error while processing your request. Please try again with your preferences."
      };
    }
  }
}

// Singleton instance of the agent
let agentInstance: RestaurantAgent | null = null;

export function getRestaurantAgent(): RestaurantAgent {
  if (!agentInstance) {
    agentInstance = new RestaurantAgent();
  }
  return agentInstance;
}

// Helper function to extract preferences from a message
function extractPreferencesFromMessage(message: string): string[] {
  const preferences: string[] = [];
  
  // Simple keyword matching - in a real implementation, this would use NLP
  const cuisineKeywords = {
    italian: ["italian", "pasta", "pizza"],
    japanese: ["japanese", "sushi", "ramen"],
    chinese: ["chinese", "dim sum", "szechuan"],
    mexican: ["mexican", "tacos", "burritos"],
    indian: ["indian", "curry", "tandoori"],
    french: ["french", "bistro", "patisserie"],
    thai: ["thai", "pad thai", "curry"],
    american: ["american", "burgers", "steaks"]
  };
  
  const priceKeywords = {
    budget: ["cheap", "affordable", "budget", "inexpensive"],
    moderate: ["moderate", "reasonable", "mid-range", "mid price"],
    upscale: ["upscale", "fancy", "fine dining", "high-end"],
    luxury: ["luxury", "expensive", "exclusive", "premium"]
  };
  
  const message_lower = message.toLowerCase();
  
  // Check for cuisine preferences
  for (const [cuisine, keywords] of Object.entries(cuisineKeywords)) {
    if (keywords.some(keyword => message_lower.includes(keyword))) {
      preferences.push(cuisine);
    }
  }
  
  // Check for price preferences
  for (const [price, keywords] of Object.entries(priceKeywords)) {
    if (keywords.some(keyword => message_lower.includes(keyword))) {
      preferences.push(price);
    }
  }
  
  // Additional keywords
  if (message_lower.includes("romantic") || message_lower.includes("date night")) {
    preferences.push("romantic");
  }
  
  if (message_lower.includes("quiet") || message_lower.includes("peaceful")) {
    preferences.push("quiet");
  }
  
  if (message_lower.includes("vegetarian")) {
    preferences.push("vegetarian");
  }
  
  if (message_lower.includes("vegan")) {
    preferences.push("vegan");
  }
  
  return preferences;
} 