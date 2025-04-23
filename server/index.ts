import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getRestaurantAgent } from './ai/restaurantAgent';
import { log } from './vite';
import { ChatMessage, RecommendationResponse } from './shared/types';

// Load environment variables
dotenv.config();

// Create Express server
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize restaurant agent
const restaurantAgent = getRestaurantAgent();

// Routes

// Process conversation messages and generate recommendations
app.post('/api/restaurant/conversation', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, userMessage, currentRecommendations } = req.body;
    
    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }
    
    log(`Processing conversation message: "${userMessage}"`, 'ai');
    
    const result = await restaurantAgent.processMessage(
      conversationHistory || [],
      userMessage,
      currentRecommendations
    );
    
    return res.json(result);
  } catch (error) {
    log(`Error processing conversation: ${(error as Error).message}`, 'error');
    return res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get restaurant recommendations based on preferences
app.post('/api/restaurant/recommendations', async (req: Request, res: Response) => {
  try {
    const { preferences, conversationHistory } = req.body;
    
    if (!preferences || !Array.isArray(preferences)) {
      return res.status(400).json({ error: 'Preferences array is required' });
    }
    
    log(`Generating recommendations for preferences: ${preferences.join(', ')}`, 'ai');
    
    // Initialize the agent if not already done
    await restaurantAgent.initialize();
    
    const result = await restaurantAgent.getRecommendations(
      preferences,
      conversationHistory || ''
    );
    
    return res.json(result);
  } catch (error) {
    log(`Error generating recommendations: ${(error as Error).message}`, 'error');
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Refine recommendations based on user feedback
app.post('/api/restaurant/refine', async (req: Request, res: Response) => {
  try {
    const { previousRecommendations, userMessage } = req.body;
    
    if (!previousRecommendations || !Array.isArray(previousRecommendations)) {
      return res.status(400).json({ error: 'Previous recommendations array is required' });
    }
    
    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }
    
    log(`Refining recommendations based on feedback: "${userMessage}"`, 'ai');
    
    // Initialize the agent if not already done
    await restaurantAgent.initialize();
    
    const result = await restaurantAgent.refineRecommendations(
      previousRecommendations,
      userMessage
    );
    
    return res.json(result);
  } catch (error) {
    log(`Error refining recommendations: ${(error as Error).message}`, 'error');
    return res.status(500).json({ error: 'Failed to refine recommendations' });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', message: 'DateMeal AI service is running' });
});

// Start server
app.listen(port, () => {
  log(`Server running on port ${port}`, 'info');
});

// Initialize agent when server starts
(async () => {
  try {
    log('Initializing restaurant agent...', 'info');
    await restaurantAgent.initialize();
    log('Restaurant agent initialized successfully', 'info');
  } catch (error) {
    log(`Error initializing restaurant agent: ${(error as Error).message}`, 'error');
  }
})(); 