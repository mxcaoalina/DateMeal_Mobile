import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
  // User information - persistent across sessions
  userName: string | null;
  userEmail: string | null;
  
  // App state
  onboardingComplete: boolean;
  
  // Session preferences - reset on app restart
  // These align with the 6 onboarding steps
  sessionPreferences: {
    // Step 1: Party details
    partySize: string | null;
    
    // Step 2: Mood/vibe preferences 
    mood: string | null;
    occasion: string | null;
    
    // Step 3: Budget
    budget: string | null;
    
    // Step 4: Cuisine preferences
    cuisinePreferences: string[];
    
    // Step 5: Dietary restrictions and no-gos
    dietaryRestrictions: string[];
    absoluteNogos: string[]; // Foods to completely avoid
    
    // Step 6: Location and ambience
    ambience: string | null;
    useLocation: boolean;
    location: {
      city: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  };
  
  // Search history - persistent
  recentSearches: string[];
  
  // Functions to update state
  // User data
  setUserName: (name: string) => void;
  setUserEmail: (email: string) => void;
  
  // App state
  setOnboardingComplete: (complete: boolean) => void;
  
  // Session preferences
  // Step 1
  setPartySize: (size: string) => void;
  
  // Step 2
  setOccasion: (occasion: string) => void;
  
  // Step 3
  setBudget: (budget: string) => void;
  
  // Step 4
  setCuisinePreferences: (cuisines: string[]) => void;
  
  // Step 5
  setDietaryRestrictions: (restrictions: string[]) => void;
  setAbsoluteNogos: (nogos: string[]) => void;
  
  // Step 6
  setAmbience: (ambience: string) => void;
  setUseLocation: (use: boolean) => void;
  setLocation: (city: string, latitude: number, longitude: number) => void;
  
  // Add setMood function for Step 2
  setMood: (mood: string) => void;
  
  // Utility functions
  resetSessionPreferences: () => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  
  // Debug function
  debugState: () => void;
}

// Initial session preferences structure - used for resets
const initialSessionPreferences = {
  partySize: null,
  mood: null,
  occasion: null,
  budget: null,
  cuisinePreferences: [],
  dietaryRestrictions: [],
  absoluteNogos: [],
  ambience: null,
  useLocation: false,
  location: {
    city: null,
    latitude: null,
    longitude: null,
  },
};

// Custom AsyncStorage implementation with logging
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      console.log(`[PREFERENCES] Loaded from AsyncStorage:`, value ? 'found data' : 'no data');
      return value;
    } catch (error) {
      console.error(`[PREFERENCES] Error loading from AsyncStorage:`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
      console.log(`[PREFERENCES] Saved to AsyncStorage`);
    } catch (error) {
      console.error(`[PREFERENCES] Error saving to AsyncStorage:`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
      console.log(`[PREFERENCES] Removed from AsyncStorage`);
    } catch (error) {
      console.error(`[PREFERENCES] Error removing from AsyncStorage:`, error);
    }
  },
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      userName: null,
      userEmail: null,
      onboardingComplete: false,
      
      // Initialize session preferences
      sessionPreferences: { ...initialSessionPreferences },
      
      recentSearches: [],
      
      // Update functions
      setUserName: (name) => {
        console.log(`[PREFERENCES] Setting userName to:`, name);
        set({ userName: name });
      },
      
      setUserEmail: (email) => set({ userEmail: email }),
      
      setOnboardingComplete: (complete) => {
        console.log(`[PREFERENCES] Setting onboardingComplete to:`, complete);
        set({ onboardingComplete: complete });
      },
      
      // Session preference setters
      setPartySize: (size) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          partySize: size
        }
      })),
      
      setOccasion: (occasion) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          occasion: occasion
        }
      })),
      
      setBudget: (budget) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          budget: budget
        }
      })),
      
      setCuisinePreferences: (cuisines) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          cuisinePreferences: cuisines
        }
      })),
      
      setDietaryRestrictions: (restrictions) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          dietaryRestrictions: restrictions
        }
      })),
      
      setAbsoluteNogos: (nogos) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          absoluteNogos: nogos
        }
      })),
      
      setAmbience: (ambience) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          ambience: ambience
        }
      })),
      
      setUseLocation: (use) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          useLocation: use
        }
      })),
      
      setLocation: (city, latitude, longitude) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          location: { city, latitude, longitude }
        }
      })),
      
      // Add setMood function for Step 2
      setMood: (mood) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          mood: mood
        }
      })),
      
      // Utility functions
      resetSessionPreferences: () => set({
        sessionPreferences: { ...initialSessionPreferences }
      }),
      
      addRecentSearch: (search) => set((state) => ({
        recentSearches: [
          search,
          ...state.recentSearches.filter(s => s !== search)
        ].slice(0, 10) // Keep only 10 recent searches
      })),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      // Debug function
      debugState: () => {
        const state = get();
        console.log('[PREFERENCES] Current state:', {
          userName: state.userName,
          onboardingComplete: state.onboardingComplete,
          sessionPreferences: {
            partySize: state.sessionPreferences.partySize,
            cuisinePreferences: state.sessionPreferences.cuisinePreferences.length > 0 
              ? state.sessionPreferences.cuisinePreferences 
              : 'none',
            dietaryRestrictions: state.sessionPreferences.dietaryRestrictions.length > 0 
              ? state.sessionPreferences.dietaryRestrictions 
              : 'none',
            absoluteNogos: state.sessionPreferences.absoluteNogos.length > 0 
              ? state.sessionPreferences.absoluteNogos 
              : 'none',
          }
        });
      }
    }),
    {
      name: 'datemeal-preferences',
      storage: createJSONStorage(() => customStorage),
      // Only persist user data and recent searches, not session preferences
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        recentSearches: state.recentSearches,
        // Persist the onboardingComplete flag so users don't have to go through onboarding each launch
        onboardingComplete: state.onboardingComplete
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[PREFERENCES] Hydrating state from storage', state);
        
        // Don't reset onboarding flag on app start
        // if (state) {
        //   state.onboardingComplete = false;
        //   state.sessionPreferences = { ...initialSessionPreferences };
        // }
      }
    }
  )
); 