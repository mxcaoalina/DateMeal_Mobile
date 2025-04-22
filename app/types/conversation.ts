import { Restaurant } from './restaurant';

/**
 * Interface for Message data structure
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Types of display messages that can be shown in the UI
 */
export type DisplayMessage = 
  | { type: 'text'; message: Message }
  | { type: 'recommendations'; recommendations: Restaurant[] };

/**
 * Interface for conversation state
 */
export interface ConversationState {
  messages: Message[];
  displayMessages: DisplayMessage[];
  recommendations: Restaurant[];
  isLoading: boolean;
  error: string | null;
} 