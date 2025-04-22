# DateMeal Mobile - Project Memory

## Project Overview
DateMeal Mobile is a React Native application built with Expo that provides restaurant recommendations for dates based on user preferences. It leverages AI to generate personalized restaurant suggestions and provides a conversational interface for users to refine their preferences.

## Architecture

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack and Tab navigators)
- **State Management**: Zustand with persist middleware for local storage
- **Storage**: AsyncStorage for local persistence
- **UI Components**: Custom components with theming support
- **Styling**: StyleSheet API with a custom theming system

### Backend Services
- **AI Integration**: OpenAI API for generating restaurant recommendations
- **External APIs**: 
  - Bing Search API for grounding search results
- **Local APIs**: AsyncStorage for storing user preferences and conversation history

## Key Components

### Screens
- **Welcome**: Initial screen for name entry
- **Onboarding**: Multi-step onboarding process (Steps 1-6)
- **Home**: Main screen displaying restaurant recommendations
- **Chat**: Conversational interface to refine restaurant preferences
- **Restaurant Details**: Detailed view of a recommended restaurant
- **Profile**: User profile and preferences management
- **Preferences**: Screen for updating allergies, no-gos, and favorite cuisines accessible via hamburger menu from all screens

### UI Components
- **SelectableButton**: Button with selected/unselected states for option selection
- **RecommendationCard**: Card displaying restaurant recommendation details with robust image handling:
  - Loading state with ActivityIndicator
  - Error state with fallback to first letter of restaurant name in styled container
  - Support for remote image URLs from API or Unsplash
- **PageControl**: Navigation control for multi-step processes
- **TagPill**: Small pill-shaped tags for displaying categories/labels
- **Typography**: Consistent text styling across the app
- **Button**: Customizable button component with various states and variants
- **PreferencesMenuButton**: Hamburger menu button in the top-right corner of all screens providing access to preference settings

### Data Types
- **Message**: Represents messages in the conversation
- **Restaurant**: Represents restaurant data with all relevant details
- **User Preferences**: Stores user's dining preferences
- **Conversation State**: Manages the state of the chat interface

## Implementation Status

### Completed
- Project setup with Expo
- Basic theme configuration
- Typography components
- SelectableButton component
- PageControl component
- Welcome screen with name entry
- Complete 6-step onboarding flow
- Navigation between onboarding steps
- Consistent UI styling across screens
- Onboarding completion tracking
- Restaurant type definitions
- Conversation interface with API integration
- Home screen implementation
- Restaurant detail screen with dynamic data
- API service for restaurant recommendations
- Error handling for API calls
- Loading states and indicators
- Robust image handling with fallbacks (showing first letter of restaurant name when images fail to load)
- Color scheme update from purple to gray
- Improved home screen navigation
- Simplified UI by removing preferences display
- Hamburger menu for accessing preferences from any screen

### In Progress
- Further enhancements to API integration
- User preferences management improvements
- Search history implementation

### Pending
- Profile screen implementation
- Favorite restaurant saving functionality
- Social sharing features
- Settings screen

## Theming
The app uses a consistent theme with the following key colors:
- Primary: #333333 (Dark Gray)
- Background: #ffffff (White)
- Text: Various shades of gray (#262626 to #f8f8f8)
- Accent colors for UI elements

## Development Guidelines
1. Maintain consistent styling using the theme system
2. Ensure all components are responsive across different device sizes
3. Follow React Native best practices for performance
4. Implement proper error handling and loading states
5. Use TypeScript for type safety
6. Document component props and functions

## Feature Roadmap
1. Complete onboarding flow ✅
2. Implement chat interface with AI integration ✅
3. Add restaurant recommendation display ✅
4. Integrate with Bing Search API for restaurant data grounding ✅
5. Add restaurant details screen with map integration ✅
6. Implement user preferences saving and loading ✅
7. Add profile management
8. Implement sharing functionality
9. Add offline support

## Notes and References
- The app is inspired by the web version but optimized for mobile experiences
- The AI component uses a similar prompt structure to the web version
- External APIs require proper authentication and rate limiting considerations
- UI design prioritizes clean layouts with minimal distracting elements
- The app uses a Zustand store with persistence for managing user preferences
- The color palette has been updated from purple to gray for a more neutral look
- The home screen has been simplified with improved navigation options

## Core Features
1. **Onboarding Flow**: Multi-step process to collect user preferences ✅
   - Party size selection
   - Mood/Vibe preferences
   - Occasion selection
   - Venue type selection (Restaurant, Bar/Lounge, etc.)
   - Budget preferences
   - Cuisine preferences
   - Location settings

2. **Conversation Interface**: Chat with AI to refine restaurant preferences ✅
   - Text input for natural conversation
   - Message history display
   - Real-time recommendation updates

3. **Restaurant Recommendations**: ✅
   - Display of restaurant cards with key information
   - Detailed view for each restaurant
   - Explanation of why restaurants were recommended

4. **User Profile**: 
   - Managing saved preferences
   - Viewing saved restaurants
   - Editing profile information

## Technical Transformation Plan

### Phase 1: Core UI Components (Completed) ✅
- [x] Theme configuration
- [x] Typography components
- [x] SelectableButton
- [x] PageControl
- [x] Basic layout components

### Phase 2: Onboarding Flow (Completed) ✅
- [x] Welcome Screen: Name Entry
- [x] Step 1: Party Size Selection
- [x] Step 2: Occasion Selection
- [x] Step 3: Venue Type Selection
- [x] Step 4: Budget Preferences
- [x] Step 5: Cuisine Preferences
- [x] Step 6: Location Settings

### Phase 3: API Services and State Management (Completed) ✅
- [x] API Service setup with Axios
- [x] Conversation state management
- [x] Preferences state management
- [x] AsyncStorage integration for persistence

### Phase 4: Chat Interface (Completed) ✅
- [x] Message display components
- [x] Input field with send button
- [x] Recommendation card display
- [x] Loading states and animations

### Phase 5: Restaurant Details (Completed) ✅
- [x] Restaurant detail screen
- [x] Map integration
- [x] Call/website/directions actions
- [x] Error handling and fallbacks

### Phase 6: Profile and Settings (In Progress)
- [ ] User profile screen
- [ ] Saved restaurants list
- [ ] Preference management
- [ ] Theme settings

### Phase 7: Backend Integration (In Progress)
- [x] Connect mobile app to API
- [x] Implement error handling
- [ ] Offline support

## Design System
- **Colors**: Updated to a gray palette with primary color `#333333` (dark gray)
- **Typography**: System fonts with defined sizes for headings and body text
- **Spacing**: Consistent spacing system based on 4px increments
- **Components**: Shared UI components with consistent styling

## Image Handling Strategy
The application implements a robust image handling approach:

1. **State Management**:
   - Components track loading and error states for images
   - Uses React's useState to manage image loading status

2. **Loading State**:
   - Displays ActivityIndicator (spinner) while images are loading
   - Positioned over the image container for a smooth transition

3. **Error Handling**:
   - Implements graceful fallbacks when images fail to load
   - Uses the first letter of the restaurant name as a visual placeholder
   - Styled background colors that match the app's theme

4. **Image Sources**:
   - Supports remote URLs from API responses
   - Uses Unsplash random images for mock/demo data
   - Handles null/empty imageUrl values with fallbacks

5. **Consistency**:
   - Same pattern implemented in RecommendationCard and RestaurantDetailScreen
   - Consistent styling for all image states across the application

This approach ensures the UI remains attractive and functional even when image loading fails, which is important for a mobile app where network connectivity can be unpredictable.

## Key Technical Decisions
1. **Expo SDK**: Using Expo for easier development and deployment
2. **React Navigation**: For handling navigation between screens
3. **Axios**: For API requests with interceptors for error handling
4. **Zustand**: For state management with persistence
5. **AsyncStorage**: For persisting user data locally

## API Endpoints
- `/api/conversations`: Process user messages and return recommendations
- `/api/restaurants/:id`: Get detailed information about a specific restaurant
- `/api/users/preferences`: Save and retrieve user preferences

## Migration Notes
- UI components have been adapted from web (React) to mobile (React Native)
- CSS styling replaced with StyleSheet
- Media queries replaced with responsive design based on Dimensions API
- Web routing replaced with React Navigation
- LocalStorage replaced with AsyncStorage
- Backend integration patterns remain similar with adapted response handling
- All onboarding screens designed to fit on a single screen without scrolling

## UI Improvements
- Removed unnecessary images from onboarding screens
- Consistent header and back button styling across all screens
- Maintained exact button text from web version for consistency
- Responsive layout that adapts to different screen sizes
- Clean, distraction-free UI focused on the core content
- Added loading states and error handling for better UX
- Implemented fallback images for restaurant photos
- Updated color palette from purple to gray
- Improved navigation with clear options on the home screen
- Simplified home screen by removing preferences display section
- Added hamburger menu in top-right corner for quick access to preferences from any screen

## Future Enhancements
- Offline mode with cached recommendations
- Push notifications for new restaurant suggestions
- Social sharing features
- User authentication and profile sync
- Reviews and ratings integration 