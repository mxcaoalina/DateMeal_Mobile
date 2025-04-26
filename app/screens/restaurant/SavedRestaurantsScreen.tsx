import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useConversation, Restaurant } from '../../store/useConversation';
import theme from '../../theme';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.restaurantCard} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {!imageError && restaurant.imageUrl ? (
          <Image 
            source={{ uri: restaurant.imageUrl }} 
            style={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{restaurant.name[0]}</Text>
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.cuisineText}>{restaurant.cuisineType}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.priceText}>{restaurant.priceRange}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.ratingText}>{restaurant.rating} ★</Text>
        </View>
        <Text style={styles.locationText}>{restaurant.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function SavedRestaurantsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { savedRestaurants, removeRestaurant } = useConversation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRestaurantPress = (id: string) => {
    navigation.navigate('RestaurantDetail', { id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Restaurants</Text>
        <View style={styles.backButton} />
      </View>
      
      {savedRestaurants.length > 0 ? (
        <FlatList
          data={savedRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => handleRestaurantPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={theme.colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Saved Restaurants</Text>
          <Text style={styles.emptyText}>
            You haven't saved any restaurants yet. Explore and save restaurants you like to see them here.
          </Text>
          <TouchableOpacity 
            style={styles.findButton}
            onPress={() => navigation.navigate('Onboarding')}
          >
            <Text style={styles.findButtonText}>Find Restaurants</Text>
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.default,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  dotSeparator: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[400],
    marginHorizontal: 4,
  },
  priceText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  ratingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  locationText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  findButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.default,
  },
  findButtonText: {
    color: 'white',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
}); 