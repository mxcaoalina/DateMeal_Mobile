import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import RecommendationCard from '../../components/RecommendationCard';
import { conversationService, generateMockRecommendations } from '../../services/api';
import { Message } from '../../types/conversation';
import { Restaurant } from '../../types/restaurant';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import { AxiosError } from 'axios';

// Message types
type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// Component for individual messages
const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.messageBubble,
      isUser ? styles.userBubble : styles.assistantBubble
    ]}>
      <Text style={[
        styles.messageText,
        isUser ? styles.userText : styles.assistantText
      ]}>
        {message.content}
      </Text>
    </View>
  );
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const preferences = usePreferences();
  const { 
    userName, 
    sessionPreferences: { 
      partySize, 
      mood,
      occasion, 
      ambience,
      budget, 
      cuisinePreferences, 
      dietaryRestrictions,
      absoluteNogos,
      useLocation, 
      location 
    } 
  } = preferences;
  
  // Create a welcome message with personalized content based on preferences
  const createWelcomeMessage = () => {
    let welcomeText = `Hi ${userName || 'there'}! I'm your restaurant AI assistant. `;
    
    // Add preference summary if any are set
    if (mood || occasion || budget || (cuisinePreferences && cuisinePreferences.length > 0)) {
      welcomeText += "Based on your preferences, I'll help you find ";
      
      if (partySize) {
        if (partySize === "Just Me (Self-care night)") {
          welcomeText += "a solo dining spot ";
        } else if (partySize === "Date for Two (Cute energy)") {
          welcomeText += "a romantic spot for two ";
        } else {
          welcomeText += "a place for your group ";
        }
      } else {
        welcomeText += "restaurants ";
      }
      
      if (mood) {
        welcomeText += `with a ${mood.toLowerCase()} atmosphere `;
      }
      
      if (ambience) {
        welcomeText += `at a ${ambience.toLowerCase()} venue `;
      }
      
      if (budget) {
        welcomeText += `in the ${budget} price range `;
      }
      
      if (cuisinePreferences && cuisinePreferences.length > 0) {
        welcomeText += `serving ${cuisinePreferences.join(", ")} cuisine `;
      }
      
      if (location && location.city) {
        welcomeText += `in ${location.city} `;
      }
      
      welcomeText += ". ";
    }
    
    welcomeText += "How can I help you find the perfect dining spot today?";
    return welcomeText;
  };
  
  // Prepare initial message using preferences
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: createWelcomeMessage(),
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, showRecommendations]);
  
  // Handle message send
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Convert our ChatMessage to the API's Message format
      const historyForApi: Message[] = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      // Enhanced API preferences with more details from the onboarding
      const apiPreferences: any = {
        partySize: partySize ? partySize.substring(0, 10) : undefined, // Just take the first part of the string
        mood: mood,
        occasion: occasion,
        ambience: ambience,
        cuisines: cuisinePreferences,
        priceRange: budget,
        dietaryRestrictions: dietaryRestrictions,
        absoluteNogos: absoluteNogos,
      };
      
      // Only add location if useLocation is true and city is not null
      if (useLocation && location && location.city) {
        apiPreferences.location = location.city;
      }
      
      // Debug log to see what preferences are being sent
      console.log("Sending preferences to API:", JSON.stringify(apiPreferences));
      
      const response = await conversationService.processMessage({
        message: userMessage.content,
        history: historyForApi,
        preferences: apiPreferences
      });
      
      // Add the response as an assistant message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now() + 1
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // If there are recommendations, show them
      if (response.recommendations && response.recommendations.length > 0) {
        setRecommendations(response.recommendations);
        setShowRecommendations(true);
      }
    } catch (error: any) {
      // Enhanced error handling
      console.error('Error processing message:', error);
      
      let errorMessage: ChatMessage;
      
      // Check if it's a network error
      if (error.message && (error.message.includes('Network Error') || error.message.includes('network'))) {
        errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Sorry, I can't connect to the server right now. Please check your internet connection and try again. If the problem persists, the server might be temporarily unavailable.",
          timestamp: Date.now() + 1
        };
      } else {
        // Generic error message
        errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error trying to find recommendations. Please try again later.",
          timestamp: Date.now() + 1
        };
      }
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Show fallback recommendations from mock data if available
      try {
        const mockPreferences = { cuisines: cuisinePreferences || [], priceRange: budget || '$$' };
        const historyForMock: Message[] = messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        
        const fallbackRecommendations = generateMockRecommendations(userMessage.content, historyForMock, mockPreferences);
        
        if (fallbackRecommendations && fallbackRecommendations.length > 0) {
          // Add a message explaining these are offline recommendations
          const fallbackMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: "I've provided some offline restaurant suggestions based on your preferences:",
            timestamp: Date.now() + 2
          };
          
          setMessages(prev => [...prev, fallbackMessage]);
          setRecommendations(fallbackRecommendations);
          setShowRecommendations(true);
        }
      } catch (fallbackError) {
        console.error('Failed to generate fallback recommendations:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigate back
  const handleBack = () => {
    navigation.goBack();
  };
  
  // View restaurant details
  const handleViewRestaurant = (restaurantId: string) => {
    // @ts-ignore
    navigation.navigate('RestaurantDetail', { id: restaurantId });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>AI Restaurant Chat</Text>
        
        <PreferencesMenuButton />
      </View>
      
      {/* Chat Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageContainer}
          contentContainerStyle={styles.messageContent}
        >
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          )}
          
          {showRecommendations && recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              {recommendations.map(restaurant => (
                <RecommendationCard 
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() => handleViewRestaurant(restaurant.id)}
                />
              ))}
            </View>
          )}
        </ScrollView>
        
        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.gray[400]}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={!inputText.trim() || isLoading ? theme.colors.gray[400] : "#FFFFFF"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholderRight: {
    width: 32,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  messageContent: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.default,
    marginBottom: theme.spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.gray[200],
  },
  messageText: {
    fontSize: theme.fontSizes.md,
    lineHeight: theme.fontSizes.md * 1.4,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: theme.colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.default,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  recommendationsContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
}); 