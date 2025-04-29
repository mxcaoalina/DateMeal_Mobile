# DateMeal Mobile App - Project Handoff

## Project Overview

DateMeal is a React Native mobile application that helps users find restaurant recommendations based on their preferences. The app features an onboarding process to collect user preferences, a chat interface for interacting with the recommendation system, and detailed restaurant views.

## Tech Stack

### Frontend
- React Native with Expo
- TypeScript
- React Navigation for routing
- AsyncStorage for local data persistence

### Backend
- FastAPI (Python)
- Environment variables for configuration
- CORS enabled for cross-origin requests

## Important Note About Backend Implementations

### Backend Choice: Use `backend-python` (FastAPI), NOT the `server` folder

The project contains two backend implementations:

1. ✅ **`backend-python/`** - **USE THIS ONE**: The current, active FastAPI Python backend
2. ❌ **`server/`** - **DO NOT USE**: Legacy Node.js implementation that is no longer maintained

The application has been configured to work exclusively with the FastAPI backend in the `backend-python` directory. All recent development and fixes have been applied to work with this backend implementation. The legacy `server` folder remains in the repository for reference purposes only but should not be used for continued development.

### Why We're Using FastAPI

The FastAPI Python backend was chosen for several advantages:
- Faster development of the recommendation engine
- Better support for text generation and AI capabilities
- Cleaner API contract with automatic documentation
- Better type validation through Pydantic models

The React Native app has been fully adapted to communicate with the FastAPI backend through the adapter pattern (see `fastApiAdapter.ts`). This allows for a clean separation of concerns and easier maintenance as the backend evolves.

## Detailed Architecture

### System Architecture Overview

DateMeal follows a client-server architecture:

```
┌─────────────────┐                  ┌──────────────────┐
│                 │                  │                  │
│  React Native   │  HTTP Requests   │  FastAPI Server  │
│  Mobile App     │ ────────────────▶│                  │
│  (Expo)         │ ◀────────────────│                  │
│                 │     Responses    │                  │
└─────────────────┘                  └──────────────────┘
```

### Frontend Architecture

The React Native app follows a feature-based architecture with the following key components:

1. **Screens**: Container components that represent entire app screens
2. **Components**: Reusable UI elements shared across screens
3. **Services**: Handle API calls and data transformations
4. **Store**: Manages global state using custom hooks
5. **Navigation**: Handles routing between screens
6. **Types**: TypeScript interfaces and types

#### Key Implementation Files

Here are the most important files in the frontend and what they do:

| File | Purpose | Key Features |
|------|---------|--------------|
| `app/navigation/AppNavigator.tsx` | Main navigation setup | Defines the navigation structure and screen hierarchy |
| `app/screens/onboarding/onboardingScreen.tsx` | Multi-step onboarding process | Uses step state to show different preference collection screens |
| `app/screens/chat/ChatScreen.tsx` | Chat interface for recommendations | Handles message display, recommendation requests, and API calls |
| `app/screens/restaurant/RestaurantDetailScreen.tsx` | Restaurant details view | Displays full restaurant information with actions |
| `app/services/api.ts` | Base API configuration | Sets up Axios with the correct base URL and request defaults |
| `app/services/fastApiAdapter.ts` | Backend adapter | Converts between app data formats and API formats |
| `app/services/mockData.ts` | Mock data generator | Creates realistic restaurant data when the API is unavailable |
| `app/store/usePreferences.ts` | Preference management | Custom hook for global preference state |
| `app/types/restaurant.ts` | Type definitions | TypeScript interfaces for restaurant data |
| `app/utils/networkUtils.ts` | Network configuration | Determines correct API URL for different environments |

#### State Management

The app uses a combination of:

1. **Local component state** (useState): For UI-specific state within components
2. **Custom hooks**: For shared state logic and global state management
   - `usePreferences`: Manages user preferences across the app
3. **AsyncStorage**: For persisting data between app sessions
   - Restaurant recommendations
   - User preferences
   - Conversation history

#### Data Flow

1. **User Input Flow**:
   ```
   User Input → Component State → Service Layer → API Request → Backend
   ```

2. **Data Display Flow**:
   ```
   Backend → API Response → Service Layer → Component State → UI Rendering
   ```

3. **Preference Management**:
   ```
   Onboarding Screens → usePreferences Hook → AsyncStorage → Available in all components
   ```

#### Component Hierarchy

```
App
└── AppNavigator
    ├── OnboardingStack
    │   ├── OnboardingScreen (master screen)
    │   │   ├── Step 1: Party Size
    │   │   ├── Step 2: Mood/Vibe
    │   │   ├── Step 3: Ambience
    │   │   ├── Step 4: Budget
    │   │   ├── Step 5: Cuisine
    |   |   └── Step 6: Location
    │   └── LocationScreen
    │
    └── MainStack
        ├── HomeScreen
        ├── ChatScreen
        │   └── RecommendationCard
        └── RestaurantDetailScreen
```

#### Key Design Patterns

The app implements several important design patterns:

1. **Adapter Pattern**: 
   - `fastApiAdapter.ts` adapts between the app's data model and the FastAPI backend
   - Isolates the app from changes in the API contract

2. **Observer Pattern**: 
   - Custom hooks notify components when preferences change
   - Used to synchronize UI across different screens

3. **Provider Pattern**:
   - Context providers make state available throughout the component tree
   - Reduces prop drilling for frequently used data

4. **Repository Pattern**:
   - Services abstract data access logic
   - Provides a consistent interface to data sources (API, AsyncStorage)

5. **Factory Pattern**:
   - `mockData.ts` generates mock restaurant objects
   - Creates consistent test data with realistic values

### Backend Architecture

The FastAPI backend follows a simple structure:

1. **main.py**: Entry point with endpoint definitions
2. **Models**: Pydantic models for request/response validation
3. **Routes**: API endpoints organized by function
4. **Middleware**: CORS configuration for cross-origin requests

#### Key Implementation Details

The current FastAPI implementation is intentionally simple but designed for expansion:

1. **Request Validation**: Uses Pydantic models to validate incoming requests
   ```python
   class AdviseRequest(BaseModel):
       vibe: Optional[str] = "romantic"
       partySize: Optional[str] = "2"
       budget: Optional[str] = "$$"
       cuisines: Optional[List[str]] = []
       location: Optional[str] = "NYC"
   ```

2. **Response Format**: Consistent response structure
   ```python
   return {"response": recommendation_text}
   ```

3. **Error Handling**: Try/except blocks with structured error responses
   ```python
   try:
       # Process request
       return {"response": result}
   except Exception as e:
       return {"error": str(e)}
   ```

4. **CORS Configuration**: Configured to allow requests from any origin during development
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

#### API Endpoints Design

The backend follows RESTful principles with these key endpoints:

- `GET /health`: Server health check
- `POST /advise`: Recommendation service entry point

#### Future Backend Components (planned)

```
backend-python/
├── main.py                # Entry point
├── models/                # Data models
│   ├── request.py         # Request models
│   └── response.py        # Response models
├── services/              # Business logic
│   ├── recommendation.py  # Recommendation engine
│   └── restaurant_data.py # Restaurant data access
├── database/              # Database connections
├── config.py              # Configuration management
└── utils/                 # Utility functions
```

### Integration Layer

The frontend and backend are connected through several key components:

1. **NetworkUtils**: Determines correct API URL based on environment and device type
2. **API Service**: Configures and manages HTTP requests
3. **FastAPI Adapter**: Transforms app data to match the API contract

#### Network Configuration Strategy

The app uses a sophisticated approach to handling different network environments:

```typescript
// From networkUtils.ts
export const getApiBaseUrl = (): string => {
  let baseUrl: string;
  
  if (__DEV__) {
    // For iOS devices (including Expo Go on physical iPhone)
    if (Platform.OS === 'ios') {
      // Physical device needs the actual IP address
      baseUrl = 'http://192.168.1.40:8001';
      
      // iOS simulator could use localhost
      // baseUrl = 'http://localhost:8001';
    }
    // For Android emulators - uses special IP for host machine
    else if (Platform.OS === 'android') {
      baseUrl = 'http://10.0.2.2:8001';
    }
    // Fallback for other platforms
    else {
      baseUrl = 'http://localhost:8001';
    }
    
    console.log(`🌐 API Base URL: ${baseUrl} (Platform: ${Platform.OS})`);
    return baseUrl;
  }
  
  // Production URL for release builds
  return 'https://your-production-api.com';
};
```

#### Request/Response Flow

```
┌─────────────────┐                             ┌──────────────────┐
│ React Native    │                             │ FastAPI Server   │
│                 │                             │                  │
│  Component      │                             │                  │
│     ↓           │                             │                  │
│  Service Call   │                             │                  │
│     ↓           │                             │                  │
│  API Adapter    │         HTTP Request        │  Route Handler   │
│  (Transforms    │ ───────────────────────────▶│                  │
│   data format)  │                             │     ↓            │
│     ↓           │                             │  Business Logic  │
│  NetworkUtils   │                             │     ↓            │
│  (Selects URL)  │                             │  Response Data   │
│     ↓           │                             │                  │
│  HTTP Client    │         HTTP Response       │                  │
│  (Axios)        │ ◀───────────────────────────│                  │
│                 │                             │                  │
└─────────────────┘                             └──────────────────┘
```

#### Data Transformation Example

Here's how data is transformed between the app and API:

1. **App-side data**:
```typescript
// Internal preference format
const preferences = {
  partySize: 2,
  mood: "romantic",
  ambience: undefined,
  priceRange: "$$$",
  cuisines: ["Italian", "French"],
  location: { city: "NYC", neighborhood: "Manhattan" }
};
```

2. **Transformed for API**:
```typescript
// Format sent to FastAPI
const requestData = {
  vibe: "romantic",
  partySize: "2",
  budget: "$$$",
  cuisines: ["Italian", "French"],
  location: "NYC"
};
```

### Error Handling Architecture

The app implements a comprehensive error handling strategy:

1. **Frontend**: 
   - Service layer catches and logs errors
   - UI displays user-friendly error messages
   - Fallback to mock data when API is unavailable

2. **Backend**:
   - Try/except blocks in API handlers
   - Structured error responses
   - Logging for debugging

#### Error Handling Implementation

The app uses a multi-level approach to error handling:

```typescript
// Example from fastApiAdapter.ts
try {
  // API call logic
  const result = await conversationService.processMessage(requestData);
  return {
    response: result.response,
    updatedRecommendations: recommendations
  };
} catch (error) {
  console.error('Error in FastAPI adapter:', error);
  
  // Fall back to mock data when the API fails
  console.log('⚠️ API failed, using mock data as fallback');
  const mockRecommendations = generateMockRecommendations(message, history, preferences);
  
  // Still save to storage so the app can function offline
  try {
    await AsyncStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(mockRecommendations));
  } catch (err) {
    console.error('Error saving mock recommendations to AsyncStorage:', err);
  }
  
  return {
    response: "I'm having trouble connecting to the recommendation service, but I've generated some suggestions based on your preferences.",
    updatedRecommendations: mockRecommendations
  };
}
```

### Offline Capability

The app maintains limited functionality when offline:
- Stored recommendations remain accessible
- Previously entered preferences are preserved
- New recommendation requests fail gracefully with appropriate error messaging

#### Caching Strategy

The app uses AsyncStorage for client-side caching:

```typescript
// Saving recommendations to cache
await AsyncStorage.setItem('@DateMeal:recommendations', JSON.stringify(recommendations));

// Reading from cache when needed
const storedRestaurants = await AsyncStorage.getItem('@DateMeal:recommendations');
if (storedRestaurants) {
  const restaurants = JSON.parse(storedRestaurants);
  // Use cached data
}
```

## Current Implementation Status

### What's Working

- ✅ Onboarding flow to collect user preferences (party size, mood, ambience, budget, cuisine)
- ✅ Chat interface for requesting restaurant recommendations
- ✅ FastAPI backend with basic recommendation endpoint (`/advise`)
- ✅ Connection between React Native app and FastAPI server
- ✅ Restaurant detail screen with mock data
- ✅ Network utilities to handle different device types (iOS, Android)
- ✅ Error handling and fallback to mock data when needed

### Recent Fixes

- Fixed the network connection between Expo Go on iPhone and the FastAPI server
- Added a health check endpoint to verify API connectivity
- Enhanced error handling in the API service
- Improved the logging system for better debugging
- Created structured restaurant data from API responses

## Critical Backend Enhancement: Missing Preference Parameters

⚠️ **IMPORTANT**: There is currently a critical gap between the preferences collected during onboarding and what's being sent to the backend API for generating recommendations.

### Current Limitation

Several important user preferences collected during onboarding are **not being passed** to the backend:

1. **Ambience** - Currently, only "mood" is passed as "vibe" and ambience is only used as a fallback if mood is not present
2. **Dietary Restrictions/Allergies** - Completely ignored in API requests
3. **Absolute No-gos** - Completely ignored in API requests

This means that even though users specify these preferences during onboarding, the recommendations they receive do not take these important factors into account.

### Required Changes

The following changes need to be made to ensure all user preferences are properly considered:

1. **Update the backend AdviseRequest model**:
   ```python
   class AdviseRequest(BaseModel):
       vibe: Optional[str] = Field(default="romantic")
       ambience: Optional[str] = None
       partySize: Optional[str] = Field(default="2")
       budget: Optional[str] = Field(default="$$")
       cuisines: Optional[List[str]] = Field(default_factory=list)
       location: Optional[str] = Field(default="NYC")
       dietaryRestrictions: Optional[List[str]] = Field(default_factory=list)
       absoluteNogos: Optional[List[str]] = Field(default_factory=list)
   ```

2. **Modify the OpenAI prompt** in `generate_azure_openai_recommendation`:
   ```python
   user_prompt = f"""
   Based on the following preferences:
   - Vibe/Mood: {vibe}
   - Ambience: {preferences.get("ambience") or "Any"}
   - Location: {location}
   - Cuisine: {cuisine}
   - Budget: {budget}
   - Party Size: {preferences.get("partySize") or "2"}
   - Dietary Restrictions: {', '.join(preferences.get("dietaryRestrictions", [])) or "None"}
   - Absolute No-gos: {', '.join(preferences.get("absoluteNogos", [])) or "None"}

   Generate 3 restaurant options that would be perfect matches.
   Each restaurant should be a real, well-known establishment in {location} that matches the preferences.
   
   If dietary restrictions are specified, ensure the restaurants can accommodate these needs.
   If there are absolute no-gos listed, make sure to exclude restaurants that feature these items prominently.
   
   For each restaurant, provide:
   1. The restaurant name
   2. Cuisine type
   3. Price range ($ to $$$$)
   4. Location (neighborhood)
   5. A brief description (1-2 sentences)
   6. 2-3 key highlights that make it special
   7. A rating between 4.0 and 5.0
   """
   ```

3. **Update the fastApiAdapter** to pass all preferences:
   ```typescript
   const requestData: AdviseRequest = {
     vibe: preferences.mood,
     ambience: preferences.ambience,
     partySize: preferences.partySize?.toString(),
     budget: preferences.priceRange,
     cuisines: preferences.cuisines,
     location: typeof preferences.location === 'string'
       ? preferences.location
       : preferences.location?.city,
     dietaryRestrictions: preferences.dietaryRestrictions,
     absoluteNogos: preferences.absoluteNogos
   };
   ```

4. **Update the AdviseRequest interface** in the frontend:
   ```typescript
   export interface AdviseRequest {
     vibe?: string;
     ambience?: string;
     partySize?: string;
     budget?: string;
     cuisines?: string[];
     location?: string;
     dietaryRestrictions?: string[];
     absoluteNogos?: string[];
   }
   ```

### Expected Benefits

Implementing these changes will:
- Provide more personalized restaurant recommendations
- Ensure dietary restrictions and allergies are properly considered
- Help users avoid restaurants with their absolute no-gos
- Differentiate between mood/vibe and ambience for better matching
- Result in higher user satisfaction with recommendations

### Implementation Plan

To implement this enhancement, follow these steps:

#### Step 1: Backend Updates

1. Edit `backend-python/main.py` to update the `AdviseRequest` class:
   ```python
   class AdviseRequest(BaseModel):
       vibe: Optional[str] = Field(default="romantic")
       ambience: Optional[str] = None
       partySize: Optional[str] = Field(default="2")
       budget: Optional[str] = Field(default="$$")
       cuisines: Optional[List[str]] = Field(default_factory=list)
       location: Optional[str] = Field(default="NYC")
       dietaryRestrictions: Optional[List[str]] = Field(default_factory=list)
       absoluteNogos: Optional[List[str]] = Field(default_factory=list)
   ```

2. Modify the `generate_azure_openai_recommendation` function to update the prompt:
   ```python
   user_prompt = f"""
   Based on the following preferences:
   - Vibe/Mood: {vibe}
   - Ambience: {preferences.get("ambience") or "Any"}
   - Location: {location}
   - Cuisine: {cuisine}
   - Budget: {budget}
   - Party Size: {preferences.get("partySize") or "2"}
   - Dietary Restrictions: {', '.join(preferences.get("dietaryRestrictions", [])) or "None"}
   - Absolute No-gos: {', '.join(preferences.get("absoluteNogos", [])) or "None"}

   Generate 3 restaurant options that would be perfect matches.
   Each restaurant should be a real, well-known establishment in {location} that matches the preferences.
   
   If dietary restrictions are specified, ensure the restaurants can accommodate these needs.
   If there are absolute no-gos listed, make sure to exclude restaurants that feature these items prominently.
   
   For each restaurant, provide:
   1. The restaurant name
   2. Cuisine type
   3. Price range ($ to $$$$)
   4. Location (neighborhood)
   5. A brief description (1-2 sentences)
   6. 2-3 key highlights that make it special
   7. A rating between 4.0 and 5.0
   """
   ```

3. Update the `get_recommendation` function to use these new fields:
   ```python
   ambience = request.ambience
   dietary_restrictions = request.dietaryRestrictions or []
   absolute_nogos = request.absoluteNogos or []
   
   # Add these to the recommendations object
   restaurants = await generate_azure_openai_recommendation({
       "vibe": vibe,
       "ambience": ambience,
       "location": location,
       "cuisines": request.cuisines,
       "budget": budget,
       "partySize": request.partySize,
       "dietaryRestrictions": dietary_restrictions,
       "absoluteNogos": absolute_nogos
   })
   ```

#### Step 2: Frontend Updates

1. Update the `AdviseRequest` interface in `app/services/api.ts`:
   ```typescript
   export interface AdviseRequest {
     vibe?: string;
     ambience?: string;
     partySize?: string;
     budget?: string;
     cuisines?: string[];
     location?: string;
     dietaryRestrictions?: string[];
     absoluteNogos?: string[];
   }
   ```

2. Modify the `fastApiAdapter.ts` file to pass all preferences:
   ```typescript
   const requestData: AdviseRequest = {
     vibe: preferences.mood,
     ambience: preferences.ambience,
     partySize: preferences.partySize?.toString(),
     budget: preferences.priceRange,
     cuisines: preferences.cuisines,
     location: typeof preferences.location === 'string'
       ? preferences.location
       : preferences.location?.city,
     dietaryRestrictions: preferences.dietaryRestrictions,
     absoluteNogos: preferences.absoluteNogos
   };
   ```

3. Check that `ChatScreen.tsx` is correctly preparing all preferences:
   ```typescript
   const rawPreferences = {
     partySize,
     moodOrVibe: mood,
     venueType: ambience,
     budgetRange: budget,
     cuisines: cuisinePreferences,
     dietaryRestrictions, // Make sure these are passed to the adapter
     absoluteNogos,       // Make sure these are passed to the adapter
     location: location?.city
   };
   ```

#### Step 3: Testing

1. Start the backend server:
   ```bash
   cd backend-python
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. Use Postman or curl to test if the updated endpoint accepts the new fields:
   ```bash
   curl -X POST "http://localhost:8001/advise" \
     -H "Content-Type: application/json" \
     -d '{
       "vibe": "romantic",
       "ambience": "quiet",
       "partySize": "2",
       "budget": "$$$",
       "cuisines": ["Italian", "French"],
       "location": "NYC",
       "dietaryRestrictions": ["Gluten-free", "Vegetarian"],
       "absoluteNogos": ["Seafood", "Spicy"]
     }'
   ```

3. Start the app and test the recommendation flow with different combinations of preferences.

## Restaurant Detail Enhancement: Dynamic Menu Preview

⚠️ **IMPROVEMENT NEEDED**: The menu preview section in the restaurant detail screen currently displays fixed/static content rather than actual menu items for each restaurant.

### Current Limitation

The restaurant detail screen includes a menu preview section, but this is currently implemented with static content rather than using the AI agent to fetch or generate actual menu items specific to each restaurant. This creates an inconsistent user experience, as the recommendations are dynamically generated but the menu previews do not match the actual restaurants being recommended.

### Required Changes

The following changes should be made to improve the menu preview functionality:

1. **Update the Restaurant model** to include menu items:
   ```python
   class Restaurant(BaseModel):
       # Existing fields...
       menuItems: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
   ```

2. **Enhance the OpenAI prompt** to include menu item generation:
   ```python
   # Add to the existing prompt
   Also provide 3-5 popular menu items for each restaurant in this format:
   - Name: [item name]
   - Description: [brief description]
   - Price: [price in $]
   - Category: [appetizer/main/dessert/etc]
   ```

3. **Update the `get_recommendation` function** to process and include menu items:
   ```python
   # Process menu items from the OpenAI response
   menu_items = []
   if "menuItems" in restaurant_data:
       menu_items = restaurant_data["menuItems"]
   
   restaurant = Restaurant(
       # Existing fields...
       menuItems=menu_items
   )
   ```

4. **Modify the frontend Restaurant type** in `app/types/restaurant.ts`:
   ```typescript
   export interface MenuItem {
     name: string;
     description: string;
     price: string;
     category: string;
   }
   
   export interface Restaurant {
     // Existing fields...
     menuItems?: MenuItem[];
   }
   ```

5. **Update the RestaurantDetailScreen** to dynamically display menu items:
   ```typescript
   // In RestaurantDetailScreen.tsx
   const renderMenuItems = () => {
     if (!restaurant.menuItems || restaurant.menuItems.length === 0) {
       return (
         <View style={styles.noMenuContainer}>
           <Text style={styles.noMenuText}>Menu information not available</Text>
         </View>
       );
     }
     
     return (
       <View style={styles.menuContainer}>
         {restaurant.menuItems.map((item, index) => (
           <View key={index} style={styles.menuItem}>
             <View style={styles.menuItemHeader}>
               <Text style={styles.menuItemName}>{item.name}</Text>
               <Text style={styles.menuItemPrice}>{item.price}</Text>
             </View>
             <Text style={styles.menuItemDescription}>{item.description}</Text>
             <Text style={styles.menuItemCategory}>{item.category}</Text>
           </View>
         ))}
       </View>
     );
   };
   ```

### Implementation Plan

To implement this enhancement, follow these steps:

#### Step 1: Backend Updates

1. Modify the `Restaurant` model in `backend-python/main.py` to include the `menuItems` field:
   ```python
   class Restaurant(BaseModel):
       # Existing fields...
       menuItems: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
   ```

2. Update the OpenAI prompt in the `generate_azure_openai_recommendation` function to request menu items:
   ```python
   # Add this to the existing prompt
   Also provide 3-5 popular menu items for each restaurant in this format:
   - Name: [item name]
   - Description: [brief description]
   - Price: [price in $]
   - Category: [appetizer/main/dessert/etc]
   ```

3. In the `get_recommendation` function, extract and process menu items from the OpenAI response:
   ```python
   # If we got restaurants from Azure OpenAI, use the first one
   if restaurants and len(restaurants) > 0:
       restaurant_data = restaurants[0]
       
       # Process menu items if available
       menu_items = []
       if "menuItems" in restaurant_data:
           menu_items = restaurant_data["menuItems"]
       else:
           # Generate some basic menu items based on cuisine
           menu_items = [
               {
                   "name": f"{cuisine.capitalize()} Special",
                   "description": f"Chef's special {cuisine} dish",
                   "price": "$" + str(random.randint(15, 30)),
                   "category": "Main"
               },
               {
                   "name": f"Traditional {cuisine.capitalize()} Appetizer",
                   "description": f"Classic {cuisine} starter",
                   "price": "$" + str(random.randint(8, 15)),
                   "category": "Appetizer"
               }
           ]
       
       # Include menu items in the restaurant object
       restaurant = Restaurant(
           # Existing fields...
           menuItems=menu_items
       )
   ```

#### Step 2: Frontend Updates

1. Update the `Restaurant` interface in `app/types/restaurant.ts`:
   ```typescript
   export interface MenuItem {
     name: string;
     description: string;
     price: string;
     category: string;
   }
   
   export interface Restaurant {
     // Existing fields...
     menuItems?: MenuItem[];
   }
   ```

2. Modify the `RestaurantDetailScreen.tsx` to display dynamic menu items:
   ```typescript
   // Add a section for menu items
   const renderMenuSection = () => {
     return (
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Popular Menu Items</Text>
         {renderMenuItems()}
       </View>
     );
   };
   
   // Function to render individual menu items
   const renderMenuItems = () => {
     if (!restaurant.menuItems || restaurant.menuItems.length === 0) {
       return (
         <View style={styles.noMenuContainer}>
           <Text style={styles.noMenuText}>Menu information not available</Text>
         </View>
       );
     }
     
     return (
       <View style={styles.menuContainer}>
         {restaurant.menuItems.map((item, index) => (
           <View key={index} style={styles.menuItem}>
             <View style={styles.menuItemHeader}>
               <Text style={styles.menuItemName}>{item.name}</Text>
               <Text style={styles.menuItemPrice}>{item.price}</Text>
             </View>
             <Text style={styles.menuItemDescription}>{item.description}</Text>
             <Text style={styles.menuItemCategory}>{item.category}</Text>
           </View>
         ))}
       </View>
     );
   };
   ```

3. Add the menu section to the main render function:
   ```typescript
   return (
     <ScrollView>
       {/* Existing sections */}
       {renderHeaderSection()}
       {renderInfoSection()}
       {renderHighlightsSection()}
       
       {/* New menu section */}
       {renderMenuSection()}
       
       {/* Other sections */}
       {renderContactSection()}
     </ScrollView>
   );
   ```

#### Step 3: Testing

1. Start the backend server with the updated code
2. Test the `/advise` endpoint to verify it returns menu items
3. Run the app and navigate to the restaurant detail screen to ensure menu items are displayed correctly
4. Test with different restaurant types to ensure menu items are appropriate for each cuisine

### Expected Benefits

Implementing these changes will:
- Provide users with actual menu previews for recommended restaurants
- Create a more consistent user experience between recommendations and details
- Give users more practical information to make dining decisions
- Make the app feel more comprehensive and useful

## Project Structure

### Frontend (React Native)

```
app/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
├── screens/             # App screens
│   ├── chat/            # Chat interface
│   ├── onboarding/      # Onboarding flow
│   └── restaurant/      # Restaurant details
├── services/            # API and data services
│   ├── api.ts           # Base API configuration
│   ├── fastApiAdapter.ts # Adapter for FastAPI backend
│   ├── mockData.ts      # Mock data generator
│   └── restaurantApiService.ts # Legacy service
├── store/               # State management
├── theme/               # UI theme configuration
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
    └── networkUtils.ts  # Network configuration helpers
```

### Backend (Python)

```
backend-python/
├── main.py              # FastAPI application entry point
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── venv/                # Virtual environment
```

## Connection Flow

1. The React Native app uses `networkUtils.ts` to determine the appropriate API URL based on device type and environment
2. API requests are made through `api.ts` which configures Axios with the correct base URL
3. The `fastApiAdapter.ts` converts app data to the format expected by the FastAPI backend
4. The FastAPI server processes requests and returns recommendations
5. If the API connection fails, the app falls back to mock data

## Important Technical Details

### API Communication

- The FastAPI backend exposes two endpoints:
  - `GET /health` - Health check endpoint
  - `POST /advise`: Endpoint for getting restaurant recommendations

- Request format for `/advise`:
  ```json
  {
    "vibe": "romantic",
    "partySize": "2",
    "budget": "$$",
    "cuisines": ["Italian", "French"],
    "location": "NYC"
  }
  ```

- Response format:
  ```json
  {
    "response": "For a romantic evening in NYC, I highly recommend..."
  }
  ```

### Network Configuration

For iOS devices using Expo Go:
- The API URL is configured in `networkUtils.ts`
- For physical devices, the computer's IP address is used (currently set to `192.168.1.40:8001`)

Backend server must be started with:
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

## Remaining Tasks

### Backend Enhancement

1. **Fix the Missing Preference Parameters Issue** ⚠️ **HIGH PRIORITY**
   - Update the AdviseRequest model to include ambience, dietary restrictions, and no-gos
   - Modify the OpenAI prompt to use all available preference parameters
   - Update the frontend-backend integration to pass all collected preferences
   - See the "Critical Backend Enhancement" section for details

2. **Implement Real Restaurant Data**
   - Replace the current placeholder response with actual restaurant data
   - Add a database or data store for restaurant information
   - Return structured restaurant objects instead of just text

3. **Enhance Recommendation Logic**
   - Implement more sophisticated recommendation algorithms
   - Consider user preferences more comprehensively
   - Add filtering options for dietary restrictions and other criteria

4. **Add Authentication**
   - Implement user accounts
   - Add authentication endpoints
   - Secure API endpoints

### Frontend Enhancement

1. **Complete Restaurant Detail Screen**
   - Add reviews section
   - Implement "Save to Favorites" functionality
   - Add map integration for directions

2. **Add Dynamic Menu Preview** ⚠️ **HIGH PRIORITY**
   - Update the restaurant detail screen to display actual menu items 
   - Enhance the backend to generate menu items using AI
   - Ensure menu items match the restaurant's cuisine and style
   - See the "Restaurant Detail Enhancement" section for implementation details

3. **Improve Chat Experience**
   - Add conversation history persistence
   - Implement typing indicators
   - Add ability to refine recommendations

4. **Enhance UI/UX**
   - Add animations for smoother transitions
   - Implement skeleton loaders during API calls
   - Add pull-to-refresh functionality

5. **Testing**
   - Add unit tests for key components
   - Implement integration tests for API services
   - Test on multiple device sizes and platforms

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend-python
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   cd backend-python
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

4. Start the frontend:
   ```bash
   npx expo start
   ```

5. Check your network configuration:
   - Make sure the IP address in `app/utils/networkUtils.ts` is set to your computer's local IP

## Development Workflow

### Code Organization Principles

When working on this project, follow these core principles:

1. **Feature Isolation**: Add new features in their own directories/files
2. **Service Abstraction**: All API calls should go through service layers
3. **Type Safety**: Define TypeScript interfaces for all data structures
4. **Component Reusability**: Favor small, reusable components over large, complex ones
5. **Graceful Degradation**: Always handle error cases and provide fallbacks

### Recommended Development Process

1. **Start Both Servers**: 
   - Run the backend server on port 8001
   - Run the Expo development server

2. **Testing on Real Devices**:
   - For iPhone testing, use Expo Go and scan the QR code
   - Ensure your device is on the same WiFi network as your development machine
   - Update the IP address in `networkUtils.ts` to match your computer's IP

3. **Making Frontend Changes**:
   - Focus on one component/screen at a time
   - Test UI changes in multiple device sizes
   - Keep the console open for debugging

4. **Making Backend Changes**:
   - Make small, incremental changes to the FastAPI endpoints
   - Test with both curl commands and the app
   - Document new endpoints in this file

### Version Control Guidelines

1. **Branch Strategy**:
   - `main`: Stable, production-ready code
   - `dev`: Integration branch for testing
   - Feature branches: `feature/feature-name`
   - Bug fixes: `fix/bug-description`

2. **Commit Guidelines**:
   - Use descriptive commit messages
   - Prefix commits with type: `feat:`, `fix:`, `refactor:`, `docs:`, etc.
   - Reference issue numbers where applicable

3. **Pull Request Process**:
   - Create small, focused PRs
   - Include screenshots for UI changes
   - Update documentation when adding features

### Debugging Tips

1. **Frontend Issues**:
   - Check the Metro bundler console for errors
   - Use `console.log` statements with distinct emoji prefixes for visibility
   - Inspect component hierarchy with React DevTools

2. **Backend Issues**:
   - Use `print` statements in Python code
   - Check the uvicorn server logs
   - Test endpoints directly with curl or Postman before testing with the app

3. **Network Issues**:
   - Verify server is running with `--host 0.0.0.0`
   - Check that device and computer are on same network
   - Use the "Test API Connection" button in the app

## Troubleshooting

### Network Issues
- Make sure your phone and computer are on the same WiFi network
- Check if the server is running with the `--host 0.0.0.0` parameter
- Use the "Test API Connection" button in the app to verify connectivity
- Check console logs for detailed error information

### Mock Data vs Real Data
- The app will show mock data if the API connection fails
- Check the logs for `⚠️ API failed, using mock data as fallback` message
- Verify the API response format matches what the app expects

## Contact

For any questions about the implementation details, please contact [Your Name/Email].

## Quick Reference for Common Tasks

### Testing the API Connection

1. Start the FastAPI server:
   ```bash
   cd backend-python
   python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

2. Test with curl:
   ```bash
   # Health check
   curl http://localhost:8001/health
   
   # Get recommendation
   curl -X POST "http://localhost:8001/advise" -H "Content-Type: application/json" -d '{"vibe":"romantic", "location":"NYC"}'
   ```

3. In the app, use the "Test API Connection" button on the Chat screen.

### Adding a New Screen

1. Create a new file in the appropriate directory:
   ```
   app/screens/new-feature/NewFeatureScreen.tsx
   ```

2. Add the screen to the navigation:
   ```typescript
   // In app/navigation/AppNavigator.tsx
   import NewFeatureScreen from '../screens/new-feature/NewFeatureScreen';
   
   // Add to the appropriate stack
   <Stack.Screen name="NewFeature" component={NewFeatureScreen} />
   ```

3. Update types:
   ```typescript
   // In navigation types
   export type RootStackParamList = {
     // existing screens...
     NewFeature: undefined; // or { paramName: paramType } if it takes params
   };
   ```

### Adding a New API Endpoint

1. Add the endpoint to the FastAPI server:
   ```python
   # In backend-python/main.py
   
   class NewEndpointRequest(BaseModel):
       param1: str
       param2: Optional[int] = None
   
   @app.post("/new-endpoint")
   async def new_endpoint(request: NewEndpointRequest):
       try:
           # Process the request
           result = f"Processed {request.param1}"
           return {"response": result}
       except Exception as e:
           return {"error": str(e)}
   ```

2. Add the corresponding method to the API service:
   ```typescript
   // In app/services/api.ts
   
   export interface NewEndpointRequest {
     param1: string;
     param2?: number;
   }
   
   export const myNewService = {
     callNewEndpoint: async (data: NewEndpointRequest): Promise<{ response: string }> => {
       try {
         const response = await api.post('/new-endpoint', data);
         return response.data;
       } catch (error) {
         console.error('Error calling new endpoint:', error);
         return {
           response: "Sorry, I couldn't process your request.",
         };
       }
     },
   };
   ```

### Configuring for a New Environment

1. Update the network utility:
   ```typescript
   // In app/utils/networkUtils.ts
   
   if (__DEV__) {
     // Development environment logic
   } else if (process.env.EXPO_PUBLIC_ENV === 'staging') {
     // Staging environment
     return 'https://api-staging.yourdomain.com';
   } else {
     // Production
     return 'https://api.yourdomain.com';
   }
   ```

2. Set environment variables in app.config.js:
   ```javascript
   extra: {
     apiUrl: process.env.API_URL || "https://default-api-url.com",
     env: process.env.ENV || "development",
   },
   ```