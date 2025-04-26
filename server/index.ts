import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RestaurantAgent } from './ai/restaurantAgent';
import { log } from './vite';
import { ConversationRequest } from './shared/types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const restaurantAgent = new RestaurantAgent();

app.post('/api/restaurant/conversation', async (req: Request, res: Response) => {
  try {
    const { message, history, preferences } = req.body as ConversationRequest;

    if (!message || !preferences) {
      return res.status(400).json({ error: 'Message and preferences are required' });
    }

    await restaurantAgent.initialize();
    const result = await restaurantAgent.processMessage(history || [], message, preferences);

    return res.json(result);
  } catch (error) {
    log(`Error processing conversation: ${(error as Error).message}`, 'error');
    return res.status(500).json({ error: 'Failed to process conversation' });
  }
});

// other routes (recommendations, refine, health check) remain the same
app.listen(port, () => {
  log(`Server running on port ${port}`, 'info');
});
