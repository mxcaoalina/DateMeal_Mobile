# DateMeal AI Server

This is the backend AI service for the DateMeal Mobile application. It provides restaurant recommendations based on user preferences and a conversational interface.

## Features

- AI-powered restaurant recommendations
- Conversation-based refinement of preferences
- Integration with OpenAI API
- Bing Search API for grounding recommendations in real data
- Fallback mechanisms for offline mode

## Prerequisites

- Node.js 16.x or higher
- API keys for:
  - OpenAI (or Azure OpenAI)
  - Bing Search API (optional, but recommended for better results)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/datemeal-server.git
   cd datemeal-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file to add your API keys.

## Running the Server

### Development Mode

```bash
npm run dev
```

This will start the server with hot reloading.

### Production Mode

```bash
npm run build
npm run serve
```

## API Endpoints

### `POST /api/restaurant/recommendations`

Generate restaurant recommendations based on user preferences.

**Request:**
```json
{
  "preferences": ["italian", "romantic", "midtown", "moderate"],
  "conversationHistory": "Optional conversation history string"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "name": "Restaurant Name",
      "description": "Restaurant description",
      "cuisine": "Italian",
      "priceRange": "$$",
      "location": "Midtown",
      "rating": 4.5,
      "imageUrl": "https://example.com/image.jpg",
      "highlights": ["romantic", "wine list", "outdoor seating"],
      "whyYoullLoveIt": ["Amazing pasta", "Great ambiance"]
    }
  ],
  "reasoning": "Explanation of why these recommendations match preferences"
}
```

### `POST /api/restaurant/refine`

Refine recommendations based on user feedback.

**Request:**
```json
{
  "previousRecommendations": [/* Previous restaurant recommendations */],
  "userMessage": "I'd prefer something cheaper"
}
```

**Response:**
Same format as /recommendations endpoint.

### `POST /api/restaurant/conversation`

Process a conversation message and get updated recommendations.

**Request:**
```json
{
  "conversationHistory": [/* Array of previous chat messages */],
  "userMessage": "I'm looking for Italian restaurants",
  "currentRecommendations": [/* Current restaurant recommendations, if any */]
}
```

**Response:**
```json
{
  "response": "Conversational response from the AI",
  "updatedRecommendations": [/* Updated restaurant recommendations */]
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "DateMeal AI service is running"
}
```

## Architecture

The server uses:
- Express.js for the API
- OpenAI for generating recommendations and handling conversation
- Bing Search API for grounding recommendations in real data
- A modular architecture with plugins for extensibility

## License

MIT 