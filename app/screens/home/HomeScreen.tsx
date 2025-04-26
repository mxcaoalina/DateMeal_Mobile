import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import Button from '../../components/Button';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import { generateMockRecommendations } from '../../services/api';

// Define type for restaurant data
interface SavedRestaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  image: string;
}

// Define props for RestaurantCard component
interface RestaurantCardProps {
  item: SavedRestaurant;
  onPress: () => void;
}

// Mock saved restaurants for demo
const SAVED_RESTAURANTS: SavedRestaurant[] = [
  {
    id: 'restaurant-1',
    name: 'La Trattoria',
    cuisine: 'Italian',
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 'restaurant-2',
    name: 'Sushi Zen',
    cuisine: 'Japanese',
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1602273660127-a0000560a4c1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fHN1c2hpJTIwcmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'
  },
  {
    id: 'restaurant-3',
    name: 'El Camino',
    cuisine: 'Mexican',
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8bWV4aWNhbiUyMHJlc3RhdXJhbnR8ZW58MHx8MHx8&w=1000&q=80'
  },
  {
    id: 'restaurant-4',
    name: 'Bistro Moderne',
    cuisine: 'French',
    priceRange: '$$$$',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZnJlbmNoJTIwcmVzdGF1cmFudHxlbnwwfHwwfHw%3D&w=1000&q=80'
  }
];

// Restaurant Card Component
const RestaurantCard = ({ item, onPress }: RestaurantCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.restaurantCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <Text style={styles.restaurantName}>{item.name}</Text>
      <View style={styles.restaurantInfo}>
        <Text style={styles.cuisineText}>{item.cuisine}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.priceText}>{item.priceRange}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const preferences = usePreferences();
  const { userName, onboardingComplete, setOnboardingComplete, resetSessionPreferences, debugState } = preferences;
  
  const [timeOfDay, setTimeOfDay] = useState('');
  const [greeting, setGreeting] = useState('');
  const [tagline, setTagline] = useState('');
  const [emoji, setEmoji] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Redirect logic: Check if user needs to go through onboarding
  useEffect(() => {
    // Short delay to ensure preferences are loaded from storage
    const timer = setTimeout(() => {
      console.log('[HOME] Checking onboarding status:', { userName, onboardingComplete });
      if (!userName) {
        console.log('[HOME] No username found, redirecting to Welcome');
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }
    }, 50); // 50ms delay, adjust if needed

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [userName, navigation]);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let newTimeOfDay = 'morning';
    let newEmoji = '☕';
    let newTagline = 'Start your day with a tasty plan.';
    
    if (hour >= 12 && hour < 18) {
      newTimeOfDay = 'afternoon';
      newEmoji = '🌤️';
      newTagline = 'Let\'s find the perfect spot for your next date.';
    } else if (hour >= 18) {
      newTimeOfDay = 'evening';
      newEmoji = '🌙';
      newTagline = 'Ready for a cozy night out?';
    }
    
    setTimeOfDay(newTimeOfDay);
    setEmoji(newEmoji);
    setTagline(newTagline);
    setGreeting(`Good ${newTimeOfDay}, ${userName || 'there'}!`);
    
    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [userName]);

  // Navigate to chat assistant
  const handleTalkToAssistant = () => {
    console.log('[HOME] Navigating to Chat screen');
    try {
      navigation.navigate('Chat');
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
      navigation.navigate('Chat');
    }
  };

  // Navigate to restaurant preferences
  const handleEditPreferences = () => {
    console.log('[HOME] Navigating to Preferences screen');
    try {
      navigation.navigate('Preferences');
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
    }
  };

  // Find restaurants based on preferences
  const handleFindRestaurants = () => {
    console.log('[HOME] Navigating to onboarding to set preferences for restaurant recommendations');
    try {
      // Set onboardingComplete to false to enter onboarding flow
      setOnboardingComplete(false);
      
      // Use a small delay for state to update
      setTimeout(() => {
        navigation.navigate('Onboarding');
      }, 100);
    } catch (error) {
      console.error('[HOME] Navigation error:', error);
      navigation.navigate('Onboarding');
    }
  };
  
  // Navigate to restaurant detail
  const handleRestaurantPress = (restaurantId: string) => {
    navigation.navigate('RestaurantDetail', { id: restaurantId });
  };

  // See all saved restaurants
  const handleSeeAllPress = () => {
    // Navigate to a saved restaurants screen (not yet implemented)
    alert('See All Saved Restaurants coming soon!');
  };

  // Demo restaurant detail
  const handleViewDemoRestaurant = () => {
    // Generate a mock restaurant ID and navigate to the detail page
    const mockRestaurants = generateMockRecommendations('', [], {
      partySize: 2,
      cuisines: ['Italian'],
      priceRange: '$$$'
    });
    if (mockRestaurants && mockRestaurants.length > 0) {
      navigation.navigate('RestaurantDetail', { id: mockRestaurants[0].id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section with Greeting */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{greeting} {emoji}</Text>
            <Text style={styles.headerSubtitle}>{tagline}</Text>
          </View>
          
          {/* Find Restaurants Button */}
          <TouchableOpacity 
            style={styles.findRestaurantsButton}
            onPress={handleFindRestaurants}
            activeOpacity={0.9}
          >
            <Text style={styles.findRestaurantsText}>Find Restaurants</Text>
          </TouchableOpacity>
          
          {/* Saved Spots Section */}
          <View style={styles.savedSpotsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Saved Spots</Text>
              <TouchableOpacity onPress={handleSeeAllPress}>
                <View style={styles.seeAllButton}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Horizontal ScrollView for Restaurant Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.restaurantsScrollContainer}
            >
              {SAVED_RESTAURANTS.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  item={restaurant}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* What would you like to do section */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>What would you like to do?</Text>
            
            {/* Talk to Date Assistant */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleTalkToAssistant}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={28} color="#333" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Talk to your Date Assistant</Text>
                <Text style={styles.actionDescription}>Not sure where to go? Let's explore together.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
            
            {/* Edit Preferences */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleEditPreferences}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="options-outline" size={28} color="#333" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Edit Preferences</Text>
                <Text style={styles.actionDescription}>Fine-tune your tastes and must-avoids.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
            
            {/* View Restaurant Demo (for debugging) */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleViewDemoRestaurant}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="restaurant-outline" size={28} color="#333" />
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>View Restaurant Demo</Text>
                <Text style={styles.actionDescription}>See a sample restaurant detail page</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
  },
  findRestaurantsButton: {
    backgroundColor: '#000',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  findRestaurantsText: {
    color: '#fff',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  savedSpotsSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.primary,
    marginRight: 4,
  },
  restaurantsScrollContainer: {
    paddingVertical: theme.spacing.md,
    paddingRight: theme.spacing.lg,
  },
  restaurantCard: {
    width: 180,
    marginRight: theme.spacing.lg,
    borderRadius: theme.borderRadius.large,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
  },
  restaurantName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  cuisineText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  dotSeparator: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: 4,
  },
  priceText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  actionsSection: {
    marginTop: theme.spacing.lg,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    paddingVertical: theme.spacing.lg,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
}); 