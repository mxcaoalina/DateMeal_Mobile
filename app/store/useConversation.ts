import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  priceRange: string;
  location: string;
  rating: number;
  reasons?: string[];
  imageUrl?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string;
  reviews?: Array<{
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  recommendations?: Restaurant[];
}

interface ConversationState {
  messages: Message[];
  recommendations: Restaurant[];
  savedRestaurants: Restaurant[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMessage: (content: string, role: 'user' | 'assistant', recommendations?: Restaurant[]) => void;
  setRecommendations: (recommendations: Restaurant[]) => void;
  saveRestaurant: (restaurant: Restaurant) => void;
  removeRestaurant: (restaurantId: string) => void;
  clearMessages: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useConversation = create<ConversationState>()(
  persist(
    (set) => ({
      messages: [],
      recommendations: [],
      savedRestaurants: [],
      isLoading: false,
      error: null,
      
      addMessage: (content, role, recommendations = []) => 
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              content,
              role,
              timestamp: Date.now(),
              recommendations,
            }
          ],
          ...(recommendations.length > 0 ? { recommendations } : {})
        })),
      
      setRecommendations: (recommendations) => 
        set({ recommendations }),
        
      saveRestaurant: (restaurant) =>
        set((state) => ({
          savedRestaurants: [
            ...state.savedRestaurants.filter(r => r.id !== restaurant.id),
            restaurant
          ]
        })),
      
      removeRestaurant: (restaurantId) =>
        set((state) => ({
          savedRestaurants: state.savedRestaurants.filter(
            restaurant => restaurant.id !== restaurantId
          )
        })),
      
      clearMessages: () => set({ messages: [], recommendations: [] }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'datemeal-conversation',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 