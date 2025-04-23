import OpenAI from 'openai';
import { log } from '../vite';

// Create an interface to represent our Kernel functionality
export interface AIKernel {
  chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
}

// Definition of chat message format
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Chat completion options
export interface ChatCompletionOptions {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

// Chat completion response
export interface ChatCompletionResponse {
  content: string;
  role: string;
}

// OpenAI implementation of our AIKernel
class OpenAIKernel implements AIKernel {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const { messages, maxTokens = 800, temperature = 0.7, model } = options;
      
      const completion = await this.client.chat.completions.create({
        model: model || this.model,
        messages,
        max_tokens: maxTokens,
        temperature,
      });

      if (!completion.choices || completion.choices.length === 0) {
        throw new Error('No completion choices returned from OpenAI');
      }

      const choice = completion.choices[0];
      
      return {
        content: choice.message?.content || '',
        role: choice.message?.role || 'assistant'
      };
    } catch (error) {
      log(`Error in chat completion: ${(error as Error).message}`, 'ai');
      throw error;
    }
  }
}

// Initialize the AI Kernel with OpenAI
export async function initializeAIKernel(): Promise<AIKernel> {
  try {
    // First try to use OpenAI directly
    const apiKey = process.env.OPENAI_API_KEY || '';
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    if (!apiKey) {
      throw new Error('OpenAI API key not provided in environment variables');
    }

    const kernel = new OpenAIKernel(apiKey, model);

    log('AI Kernel initialized successfully with OpenAI', 'ai');
    return kernel;
  } catch (error) {
    log(`Error initializing AI Kernel: ${(error as Error).message}`, 'ai');
    throw error;
  }
}

// Get or initialize the AI kernel
let kernel: AIKernel | null = null;

export async function getKernel(): Promise<AIKernel> {
  if (!kernel) {
    kernel = await initializeAIKernel();
  }
  return kernel;
} 