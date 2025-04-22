import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { conversationService } from '../../services/api';
import { Restaurant } from '../../types/restaurant';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

export default function RestaurantDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the restaurant ID from route params
  const { id } = route.params as { id: string };
  
  useEffect(() => {
    // Fetch restaurant details from API
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const data = await conversationService.getRestaurantDetails(id);
        setRestaurant(data);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [id]);
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleCall = () => {
    if (restaurant?.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    } else {
      Alert.alert('No Phone Number', 'This restaurant does not have a phone number listed.');
    }
  };
  
  const handleWebsite = () => {
    if (restaurant?.website) {
      Linking.openURL(restaurant.website);
    } else {
      Alert.alert('No Website', 'This restaurant does not have a website listed.');
    }
  };
  
  const handleDirections = () => {
    if (restaurant?.address) {
      const address = encodeURIComponent(restaurant.address);
      Linking.openURL(`http://maps.apple.com/?q=${address}`);
    } else {
      Alert.alert('No Address', 'This restaurant does not have an address listed.');
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </SafeAreaView>
    );
  }
  
  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <Ionicons name="alert-circle-outline" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={handleBack}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header with Image */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuButton}
        >
          <PreferencesMenuButton />
        </TouchableOpacity>
        
        {!imageError && restaurant.imageUrl ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.headerImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.headerPlaceholder}>
            <Text style={styles.headerPlaceholderText}>{restaurant.name[0]}</Text>
          </View>
        )}
        
        <View style={styles.headerOverlay} />
        <View style={styles.restaurantHeaderInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.metaText}>{restaurant.cuisineType}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{restaurant.priceRange}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>{restaurant.rating} ★</Text>
          </View>
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView style={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why You'll Love It</Text>
          {restaurant.reasonsToRecommend.map((reason: string, index: number) => (
            <View key={index} style={styles.reasonItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
        
        {(restaurant.address || restaurant.phone || restaurant.website || restaurant.openingHours) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Info</Text>
            {restaurant.address && (
              <View style={styles.infoItem}>
                <Ionicons name="location" size={18} color={theme.colors.primary} style={styles.infoIcon} />
                <Text style={styles.infoText}>{restaurant.address}</Text>
              </View>
            )}
            {restaurant.openingHours && restaurant.openingHours.length > 0 && (
              <View style={styles.infoItem}>
                <Ionicons name="time" size={18} color={theme.colors.primary} style={styles.infoIcon} />
                <View>
                  {restaurant.openingHours.map((hours: string, index: number) => (
                    <Text key={index} style={styles.infoText}>{hours}</Text>
                  ))}
                </View>
              </View>
            )}
            {restaurant.phone && (
              <View style={styles.infoItem}>
                <Ionicons name="call" size={18} color={theme.colors.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, styles.linkText]} onPress={handleCall}>{restaurant.phone}</Text>
              </View>
            )}
            {restaurant.website && (
              <View style={styles.infoItem}>
                <Ionicons name="globe" size={18} color={theme.colors.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, styles.linkText]} onPress={handleWebsite}>{restaurant.website}</Text>
              </View>
            )}
          </View>
        )}
        
        {restaurant.reviews && restaurant.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {restaurant.reviews.map((review: any, index: number) => (
              <View key={index} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <View style={styles.reviewRating}>
                    <Text style={styles.reviewRatingText}>{review.rating}</Text>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleCall}
          disabled={!restaurant.phone}
        >
          <Ionicons name="call" size={20} color={restaurant.phone ? theme.colors.primary : theme.colors.gray[400]} />
          <Text style={[
            styles.actionButtonText,
            !restaurant.phone && { color: theme.colors.gray[400] }
          ]}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleDirections}
          disabled={!restaurant.address}
        >
          <Ionicons name="navigate" size={20} color={restaurant.address ? theme.colors.primary : theme.colors.gray[400]} />
          <Text style={[
            styles.actionButtonText,
            !restaurant.address && { color: theme.colors.gray[400] }
          ]}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleWebsite}
          disabled={!restaurant.website}
        >
          <Ionicons name="globe" size={20} color={restaurant.website ? theme.colors.primary : theme.colors.gray[400]} />
          <Text style={[
            styles.actionButtonText,
            !restaurant.website && { color: theme.colors.gray[400] }
          ]}>Website</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.default,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
  header: {
    height: 250,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerPlaceholderText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  menuButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
  },
  restaurantHeaderInfo: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  restaurantName: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: theme.fontSizes.md,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  metaDot: {
    fontSize: theme.fontSizes.md,
    color: '#FFFFFF',
    marginHorizontal: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.fontSizes.md * 1.5,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reasonText: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    lineHeight: theme.fontSizes.md * 1.4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.fontSizes.md * 1.4,
  },
  linkText: {
    color: theme.colors.primary,
  },
  reviewItem: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.gray[50],
    borderRadius: theme.borderRadius.default,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    marginRight: 2,
  },
  reviewDate: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.fontSizes.md * 1.4,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    marginTop: 4,
  },
}); 