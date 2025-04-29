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
  Button,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import RecommendationCard from '../../components/RecommendationCard';
import { PreferenceData, restaurantApiService } from '../../services/restaurantApiService';
import { Message } from '../../types/conversation';
import { Restaurant } from '../../types/restaurant';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import fastApiAdapter from '../../services/fastApiAdapter';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp } from '@react-navigation/native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

function cleanPreferences(preferences: any): PreferenceData {
  return {
    ...preferences,
    partySize: preferences.partySize ?? undefined,
    location: preferences.location ?? undefined,
  };
}


const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
        {message.content}
      </Text>
    </View>
  );
};

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
export default function ChatScreen({ route }: { route: ChatScreenRouteProp }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const preferences = usePreferences();
  const initialRecommendations = route.params?.initialRecommendations;
  const initialResponse = route.params?.initialResponse;
  const {
    userName,
    sessionPreferences: {
      partySize,
      mood,
      ambience,
      budget,
      cuisinePreferences,
      dietaryRestrictions,
      absoluteNogos,
      location
    }
  } = preferences;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Restaurant[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  const createWelcomeMessage = () => {
    const name = userName || 'friend';
    return `Hey ${name}! I'm here to find you the perfect spot. What kind of vibe or craving do you have today?`;
  };

  useEffect(() => {
    const messages: ChatMessage[] = [];
    
    if (initialResponse) {
      messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: initialResponse,
        timestamp: Date.now()
      });
    } else {
      messages.push({
        id: Date.now().toString(),
        role: 'assistant',
        content: createWelcomeMessage(),
        timestamp: Date.now()
      });
    }
    
    setMessages(messages);
    setRecommendations(initialRecommendations ?? []);
}, [initialResponse, initialRecommendations]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, recommendations]);

  useEffect(() => {
    if (recommendations.length > 0) {
      AsyncStorage.setItem('@DateMeal:recommendations', JSON.stringify(recommendations))
        .catch(error => console.error('Error saving recommendations:', error));
    }
  }, [recommendations]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
  
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
      const historyForApi: Message[] = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
  
      const rawPreferences = {
        partySize,
        moodOrVibe: mood,
        venueType: ambience,
        budgetRange: budget,
        cuisines: cuisinePreferences,
        dietaryRestrictions,
        absoluteNogos,
        location: location?.city
      };
  
      const apiPreferences = cleanPreferences(rawPreferences);
  
      const response = await fastApiAdapter.processConversationMessage(
        historyForApi,
        inputText,
        apiPreferences
      );
  
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: Date.now() + 1
      };
  
      setMessages(prev => [...prev, assistantMessage]);
  
      if (response.updatedRecommendations?.length) {
        setRecommendations(response.updatedRecommendations);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to our recommendation service. Please try again in a moment.",
        timestamp: Date.now() + 1
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleBack = () => navigation.goBack();
  const handleViewRestaurant = (id: string) => navigation.navigate('RestaurantDetail', { id });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Let's Pick a Place!</Text>
        <PreferencesMenuButton />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageContainer}
        contentContainerStyle={styles.messageContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}

        {recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            {recommendations.map(restaurant => (
              <RecommendationCard key={restaurant.id} restaurant={restaurant} onPress={() => handleViewRestaurant(restaurant.id)} />
            ))}
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me about restaurant recommendations..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={Platform.OS === 'ios' ? handleSend : undefined}
            placeholderTextColor={theme.colors.gray[400]}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="paper-plane" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: theme.spacing.lg, 
    paddingVertical: theme.spacing.md, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.gray[200] 
  },
  backButton: { 
    padding: theme.spacing.xs 
  },
  headerTitle: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '600', 
    color: theme.colors.text 
  },
  messageContainer: { 
    flex: 1, 
    paddingHorizontal: theme.spacing.lg 
  },
  messageContent: { 
    paddingTop: theme.spacing.md, 
    paddingBottom: theme.spacing.xl 
  },
  messageBubble: { 
    maxWidth: '80%', 
    paddingHorizontal: theme.spacing.md, 
    paddingVertical: theme.spacing.sm, 
    borderRadius: theme.borderRadius.default, 
    marginBottom: theme.spacing.md 
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: theme.colors.primary 
  },
  assistantBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: theme.colors.gray[200] 
  },
  messageText: { 
    fontSize: theme.fontSizes.md, 
    lineHeight: theme.fontSizes.md * 1.4 
  },
  userText: { 
    color: '#FFFFFF' 
  },
  assistantText: { 
    color: theme.colors.text 
  },
  loadingContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    padding: theme.spacing.sm, 
    backgroundColor: theme.colors.gray[100], 
    borderRadius: theme.borderRadius.default, 
    marginBottom: theme.spacing.md 
  },
  loadingText: { 
    marginLeft: theme.spacing.sm, 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary 
  },
  recommendationsContainer: { 
    marginTop: theme.spacing.md, 
    marginBottom: theme.spacing.xl 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: theme.spacing.lg, 
    paddingVertical: theme.spacing.md, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.gray[200], 
    backgroundColor: theme.colors.background 
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
    maxHeight: 100 
  },
  sendButton: { 
    marginLeft: theme.spacing.md, 
    backgroundColor: theme.colors.primary,
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  disabledButton: { 
    backgroundColor: theme.colors.gray[300] 
  }
});
