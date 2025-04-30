# DateMeal Mobile App - Full Stack Documentation

---

## Project Overview

**DateMeal** is an AI-powered mobile application that helps users find ideal restaurants for a date by chatting with a personalized recommendation agent. The app tailors suggestions based on mood, ambience, budget, cuisine preferences, and dietary needs.

With a delightful onboarding experience, natural-language chat, and a sleek mobile UI, DateMeal guides users from selection to detail view—and even saves favorites. It uses Azure OpenAI (GPT-4o) to generate recommendations and optionally enriches them with real-world data via Bing Web Search Grounding.

---

## Tech Stack

| Layer           | Technology                                  |
|----------------|----------------------------------------------|
| Mobile Frontend | React Native (Expo), TypeScript, Zustand     |
| Backend API     | FastAPI (Python), Azure OpenAI, Bing Search  |
| Storage         | AsyncStorage (local)                         |
| Hosting         | Azure App Service (Backend) + EAS (Frontend) |
| AI Services     | Azure OpenAI (GPT-4o), Bing Web Search        |
| Styling         | Custom theming + StyleSheet                  |

---

## System Architecture
```
User (Mobile App)
    ↓
React Native (Expo)
    ↓
FastAPI Backend (Azure App Service)
    ↓
Azure OpenAI (GPT-4o)
    ⇳ (optional) Bing Web Search Grounding
```
- The mobile client calls the FastAPI backend.
- The backend constructs a structured prompt, sends it to Azure OpenAI, and parses the structured JSON response.
- If available, the backend enriches results with real images and links via Bing Search API.


---

## Project Structure

### Frontend (`app/`)
```plaintext
app/
├── components/          # Reusable UI elements
├── navigation/          # Stack navigator
├── screens/             # Chat, Onboarding, Details, Home
├── services/            # API adapters (axios)
├── store/               # Zustand + AsyncStorage
├── theme/               # Style constants
├── types/               # Shared interfaces
├── utils/               # API base URL config, helpers
├── App.tsx              # Entry point
```

### Backend (`backend-python/`)
```plaintext
backend-python/
├── api/                 # API route handlers
│   ├── advise.py
│   ├── health.py
│   └── refine.py
├── models/              # Pydantic schemas
├── services/            # Azure OpenAI & Bing search wrappers
├── utils/               # Logger setup, etc.
├── main.py              # FastAPI app
├── requirements.txt     # Dependencies
├── .env                 # API keys and configs
```

---


## System Flow Overview

```
+--------------------+         +--------------------+
|  React Native App  |         |   AsyncStorage     |
|--------------------|         |--------------------|
| - User Onboarding  |<------->| - Preferences      |
| - Chat Interface   |         | - Cached Results   |
+--------+-----------+         +---------^----------+
         |                               |
         | HTTP Request                  |
         v                               |
+--------+-----------+         +---------+----------+
|       FastAPI      |         | Azure OpenAI (GPT) |
|--------------------|         |--------------------|
| - Receives input   |         | - Chat Completion  |
| - Formats prompt   |-------->| - Returns JSON     |
| - Handles fallback |         +--------------------+
+--------+-----------+                   
         |                                   
         v                                   
+--------------------+         +--------------------+
|  Bing Search API   |-------->|  Restaurant Data   |
|--------------------|         | (Structured JSON)  |
| - Image lookup     |         +--------------------+
| - URL enrichment   |
+--------------------+
```


---


## API Endpoints
| Method | Endpoint             | Purpose                                    |
|--------|----------------------|--------------------------------------------|
| GET    | `/health`            | Health check                               |
| POST   | `/advise`            | Generate restaurant recommendations        |
| POST   | `/restaurant/refine` | Refine a previous recommendation           |

---

## Key Frontend Features
- **Onboarding Flow**: Set preferences (mood, party size, cuisine, vibe, budget, allergies).
- **Chat Interface**: Converse with DateMeal AI Agent to discover ideal restaurants.
- **Restaurant Detail View**: Menus, hours, contact, map links.
- **Save for Later**: Saved restaurants displayed on home.
- **Offline Storage**: Preferences and past results stored via AsyncStorage.

---

## Key Backend Features
- **AI-Powered JSON Recommendations**: GPT-4o returns structured JSON.
- **Bing Enrichment (optional)**: Uses Bing Search API to add live URLs and photos.
- **Validation**: Strong schema enforcement with Pydantic.
- **Graceful Fallbacks**: If GPT fails, user still receives a static response.
- **CORS**: Enabled for Expo device access.

---


## Prompting Strategy

The backend sends a structured system prompt with examples, instructing GPT-4o to return exactly 3 restaurant recommendations in valid JSON format with specific fields such as:
- `name`, `description`, `cuisine`, `priceRange`, `rating`
- `menuItems` (array of dishes)
- `highlights`, `website`, `location`

It uses dynamic input from the user (e.g., "Romantic Italian in Brooklyn") to populate the prompt. If the response is malformed or missing, fallback handling is triggered.


---

## Demo

<figure style="text-align:center;">
  <img src="assets/home.png" alt="Home Screen" width="400"/>
  <figcaption><strong>Home Screen</strong>: Displays a greeting, shows saved restaurants and quick actions like chatting or editing preferences.</figcaption>
</figure>

<figure style="text-align:center;">
  <img src="assets/preferences.png" alt="Preferences Page" width="400"/>
  <figcaption><strong>Preferences Page</strong>: Update dietary restrictions, must-not-haves, and more to refine future results.</figcaption>
</figure>

<figure style="text-align:center;">
  <img src="assets/onboarding.png" alt="Onboarding Flow" width="400"/>
  <figcaption><strong>Onboarding Flow</strong>: Users specify vibe, cuisine, party size, budget, dietary needs, and no-gos before receiving tailored results.</figcaption>
</figure>

<figure style="text-align:center;">
  <img src="assets/chat.png" alt="Chat Assistant" width="400"/>
  <figcaption><strong>Chat Assistant</strong>: Conversational UI lets users ask for suggestions and receive real-time responses from the AI agent.</figcaption>
</figure>

<figure style="text-align:center;">
  <img src="assets/refine-chat.png" alt="Refine Recommendations" width="400"/>
  <figcaption><strong>Refine Recommendations</strong>: After receiving suggestions, users can refine results by asking the agent to adjust based on new criteria.</figcaption>
</figure>

<figure style="text-align:center;">
  <img src="assets/restaurant-detail.png" alt="Restaurant Detail View" width="400"/>
  <figcaption><strong>Restaurant Detail View</strong>: Expanded view of a selected restaurant, including highlights, contact info, hours, and curated menu.</figcaption>
</figure>


---

## Deployment

- **Backend**: Deployed to Azure App Service — [View Deployment](https://datemeal-backend-cga2d8fqfsctesh9.eastus2-01.azurewebsites.net/)
- **Frontend**: Published via Expo EAS Update — [Expo Dashboard](https://expo.dev/accounts/mxcao_alina/projects/DateMealMobile)

<p align="center">
  <img src="assets/qr-code.svg" alt="QR Code to try the DateMeal app" width="200"/><br/>
  <em>Scan to preview the latest DateMeal app</em>
</p>


---


## Running Locally

### 1. Start Backend
```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

### 2. Configure Frontend (for device testing)
Edit `utils/networkUtils.ts`:
```ts
const YOUR_COMPUTER_IP = '192.168.x.x';
```

### 3. Run Expo Frontend
```bash
npm install
npx expo start
```

Scan QR code to run on mobile or simulator.

---

© AI Agent Hackathon 2025 · Team: Mingxi Cao, Ziqun Liu & Raja

