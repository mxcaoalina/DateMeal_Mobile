import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
  userName: string | null;
  onboardingComplete: boolean;
  sessionPreferences: {
    partySize: string | null;
    mood: string | null;
    budget: string | null;
    cuisinePreferences: string[];
    dietaryRestrictions: string[];
    absoluteNogos: string[];
    ambience: string | null;
    location: {
      city: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  };
  recentSearches: string[];

  setUserName: (name: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setPartySize: (size: string) => void;
  setBudget: (budget: string) => void;
  setCuisinePreferences: (cuisines: string[]) => void;
  setDietaryRestrictions: (restrictions: string[]) => void;
  setAbsoluteNogos: (nogos: string[]) => void;
  setAmbience: (ambience: string) => void;
  setLocation: (city: string, latitude: number, longitude: number) => void;
  setMood: (mood: string) => void;

  resetSessionPreferences: () => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  debugState: () => void;
}

const initialSessionPreferences = {
  partySize: null,
  mood: null,
  budget: null,
  cuisinePreferences: [],
  dietaryRestrictions: [],
  absoluteNogos: [],
  ambience: null,
  location: {
    city: null,
    latitude: null,
    longitude: null,
  },
};

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
      userName: null,
      onboardingComplete: false,
      sessionPreferences: { ...initialSessionPreferences },
      recentSearches: [],

      setUserName: (name) => set({ userName: name }),
      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),

      setPartySize: (size) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, partySize: size }
      })),
      setMood: (mood) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, mood: mood }
      })),
      setBudget: (budget) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, budget: budget }
      })),
      setCuisinePreferences: (cuisines) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, cuisinePreferences: cuisines }
      })),
      setDietaryRestrictions: (restrictions) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, dietaryRestrictions: restrictions }
      })),
      setAbsoluteNogos: (nogos) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, absoluteNogos: nogos }
      })),
      setAmbience: (ambience) => set((state) => ({
        sessionPreferences: { ...state.sessionPreferences, ambience: ambience }
      })),
      setLocation: (city, latitude, longitude) => set((state) => ({
        sessionPreferences: {
          ...state.sessionPreferences,
          location: { city, latitude, longitude }
        }
      })),

      resetSessionPreferences: () => set({
        sessionPreferences: { ...initialSessionPreferences }
      }),

      addRecentSearch: (search) => set((state) => ({
        recentSearches: [search, ...state.recentSearches.filter(s => s !== search)].slice(0, 10)
      })),

      clearRecentSearches: () => set({ recentSearches: [] }),

      debugState: () => {
        const state = get();
        console.log('[PREFERENCES] Current state:', {
          userName: state.userName,
          onboardingComplete: state.onboardingComplete,
          sessionPreferences: state.sessionPreferences
        });
      }
    }),
    {
      name: 'datemeal-preferences',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        userName: state.userName,
        recentSearches: state.recentSearches,
        onboardingComplete: state.onboardingComplete
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[PREFERENCES] Hydrating state from storage', state);
      }
    }
  )
);
