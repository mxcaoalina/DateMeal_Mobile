# DateMeal Mobile App - Full Stack Documentation

---

## Project Overview

**DateMeal** is a full-stack mobile application designed to help users find the perfect restaurant for a date, based on their preferences like mood, ambience, budget, cuisine, and dietary needs.  
The app features a delightful onboarding experience, AI-driven chat recommendations, dynamic restaurant detail views, and fallback handling for offline situations.

---

## Tech Stack

| Layer         | Technology                         |
|---------------|-------------------------------------|
| Mobile Frontend | React Native (Expo), TypeScript, Zustand, React Navigation |
| Backend API   | FastAPI (Python), Azure OpenAI, Bing Search API |
| Storage       | AsyncStorage (mobile local storage) |
| Hosting       | Local development; ready for production deployment |
| AI Services   | Azure OpenAI (gpt-4o deployment), optional Bing Web Search |
| Styling       | Custom theming, StyleSheet, React Native components |

---

## Project Structure

### Frontend (`app/`)

```plaintext
app/
├── components/          # Reusable UI components
├── navigation/          # Navigation setup (Stacks)
├── screens/             # App screens (Chat, Onboarding, Restaurant Details)
├── services/            # API services (FastAPI adapter, mock fallback)
├── store/               # Global state management (Zustand + AsyncStorage)
├── theme/               # Custom theming
├── types/               # Shared TypeScript types
├── utils/               # Utilities (network config, helpers)
├── App.tsx              # App entry point
```
### Backend (`backend-python/`)

```plaintext
backend-python/
├── api/                 # API route handlers
│   ├── advise.py
│   ├── health.py
│   ├── refine.py
├── models/              # Request/response schemas (Pydantic)
│   └── schemas.py
├── services/            # External API integration (OpenAI, Bing)
│   ├── openai_service.py
│   ├── bing_service.py
├── utils/               # Utilities (optional)
├── main.py              # FastAPI entry point
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (private)
```

---

## System Architecture
```
User (Mobile App) ↔ API Requests ↔ FastAPI Server ↔ Azure OpenAI + Bing Search APIs (optional)
```
-- Frontend communicates with FastAPI backend over HTTP.
-- Backend generates dynamic restaurant recommendations using Azure OpenAI GPT-4o and enriches them using Bing.
-- Fallback mechanism: If API is unreachable, frontend displays cached or mock data.

---

## API Endpoints

| Method | Endpoint             | Purpose                                    |
|--------|----------------------|--------------------------------------------|
| GET    | `/health`            | Check server health                        |
| POST   | `/advise`            | Get restaurant recommendations             |
| POST   | `/restaurant/refine` | Refine previous recommendations            |

### Key Frontend Features
- Onboarding flow: Collects preferences like vibe, ambience, party size, cuisine, budget, dietary restrictions, no-gos.
- Chat interface: Natural language interaction with DateMeal AI Agent.
- Restaurant details: Dynamic menu items, contact info, location.
- Error handling: Graceful fallbacks with mock data if offline.
- Offline persistence: AsyncStorage stores user preferences and recommendations.

### Design Patterns
- Adapter Pattern: API adapter (fastApiAdapter.ts) between frontend data and backend API format.
- Observer Pattern: Zustand hooks to listen for preference changes.
- Repository Pattern: API services encapsulate data access.
- Graceful Degradation: Offline fallback for a smooth UX even when API fails.

### Key Backend Features
- OpenAI Prompt Engineering: Detailed prompts to generate structured JSON responses (restaurant data + menu items).
- Bing Search Enrichment: Searches for real URLs and images when needed.
- Data Validation: All incoming requests validated using Pydantic models.
- Error Handling: Structured try/except handling with friendly error messages.
- CORS Setup: Open CORS policy for mobile device access.

### Key Backend Models

```
# models/schemas.py

class AdviseRequest(BaseModel):
    vibe: Optional[str] = "romantic"
    ambience: Optional[str] = None
    partySize: Optional[str] = "2"
    budget: Optional[str] = "$$"
    cuisines: Optional[List[str]] = Field(default_factory=list)
    location: Optional[str] = "NYC"
    dietaryRestrictions: Optional[List[str]] = Field(default_factory=list)
    absoluteNogos: Optional[List[str]] = Field(default_factory=list)

class AdviseResponse(BaseModel):
    response: str
    restaurant: Restaurant

class Restaurant(BaseModel):
    id: str
    name: str
    description: str
    cuisineType: str
    priceRange: str
    location: str
    rating: float
    imageUrl: str
    address: str
    phone: str
    website: str
    openingHours: List[str]
    highlights: List[str]
    reasonsToRecommend: List[str]
    menuItems: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
```

## Running the Project (Step by Step)

### 1. Start the Backend First

```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

The backend should now be running on http://localhost:8001.

### 2. Configure Frontend (if needed)

If testing on a physical device, edit `app/utils/networkUtils.ts` and set `YOUR_COMPUTER_IP`
to your computer's local IP address (e.g., "192.168.1.100").

### 3. Start the Frontend

In a new terminal:

```bash
npm install
npx expo start
```

Follow the QR code instructions to run on your device or use the emulator options.

## Version Compatibility

- Node.js: v16.x or higher (v18.x recommended)
- Python: 3.9+ (3.11 recommended)
- NPM: 8.x or higher
- Expo: SDK 49+