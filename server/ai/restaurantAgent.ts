import { AIKernel } from './semanticKernel';
import { getKernel } from './semanticKernel';
import { RecommendationPlugin } from './plugins/RecommendationPlugin';
import { RecommendationResponse, RestaurantRecommendation, ChatMessage, UserPreferences } from '../shared/types';
import { log } from '../vite';

export class RestaurantAgent {
  private kernel: AIKernel | null = null;
  private recommendationPlugin: RecommendationPlugin | null = null;

  async initialize(): Promise<void> {
    if (!this.kernel) this.kernel = await getKernel();
    if (!this.recommendationPlugin) {
      this.recommendationPlugin = new RecommendationPlugin();
      await this.recommendationPlugin.initialize();
    }
  }

  async getRecommendations(preferences: string[], conversationHistory: string = ''): Promise<RecommendationResponse> {
    await this.initialize();
    return this.recommendationPlugin!.generateRecommendations(preferences, conversationHistory);
  }

  async refineRecommendations(previousRecommendations: RestaurantRecommendation[], userMessage: string): Promise<RecommendationResponse> {
    await this.initialize();
    return this.recommendationPlugin!.refineRecommendations(previousRecommendations, userMessage);
  }

  async processMessage(
    conversationHistory: ChatMessage[],
    userMessage: string,
    preferences: UserPreferences
  ): Promise<{ response: string; updatedRecommendations?: RestaurantRecommendation[] }> {
    await this.initialize();

    const extractedPreferences = extractPreferencesFromUserPreferences(preferences);

    const newRecommendations = await this.recommendationPlugin!.generateRecommendations(
      extractedPreferences,
      conversationHistory.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')
    );

    return {
      response: `Here are some great matches for your updated preferences!`,
      updatedRecommendations: newRecommendations.recommendations
    };
  }
}

// helper
function extractPreferencesFromUserPreferences(preferences: UserPreferences): string[] {
  const extracted: string[] = [];

  if (preferences.cuisines?.length) extracted.push(...preferences.cuisines);
  if (preferences.moodOrVibe) extracted.push(preferences.moodOrVibe);
  if (preferences.venueType) extracted.push(preferences.venueType);
  if (preferences.budgetRange) extracted.push(preferences.budgetRange);
  if (preferences.dietaryRestrictions?.length) extracted.push(...preferences.dietaryRestrictions);
  if (preferences.absoluteNogos?.length) extracted.push(...preferences.absoluteNogos);
  if (preferences.location) extracted.push(typeof preferences.location === 'string' ? preferences.location : JSON.stringify(preferences.location));
  if (preferences.partySize) extracted.push(`Party size: ${preferences.partySize}`);

  return extracted;
}
