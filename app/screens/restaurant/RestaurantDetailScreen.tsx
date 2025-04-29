import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { conversationService } from '../../services/api';
import { Restaurant } from '../../types/restaurant';
import { useConversation } from '../../store/useConversation';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import Button from '../../components/Button';

export default function RestaurantDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { savedRestaurants, saveRestaurant, removeRestaurant } = useConversation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { id } = route.params as { id: string };

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        const data = await conversationService.getRestaurantDetails(id);
        setRestaurant(data);
        
        // Check if this restaurant is already saved
        const isAlreadySaved = savedRestaurants.some(r => r.id === id);
        setIsSaved(isAlreadySaved);
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id, savedRestaurants]);

  const handleBack = () => navigation.goBack();
  
  const isRealData = (info: string | undefined) => {
    if (!info) return false;
    return !info.startsWith('[Sample]');
  };
  
  const formatContactInfo = (info: string | undefined) => {
    if (!info) return '';
    // Remove the "[Sample]" prefix if it exists
    return info.replace(/^\[Sample\]\s*/, '');
  };
  
  const handleCall = () => {
    if (!restaurant?.phone || !isRealData(restaurant.phone)) {
      Alert.alert('No Phone Number', 'Sorry, we don\'t have the phone number for this restaurant.');
      return;
    }
    
    Linking.openURL(`tel:${formatContactInfo(restaurant.phone)}`);
  };
  
  const handleWebsite = () => {
    if (!restaurant?.website || !isRealData(restaurant.website)) {
      Alert.alert('No Website', 'Sorry, we don\'t have the website for this restaurant.');
      return;
    }
    
    Linking.openURL(formatContactInfo(restaurant.website));
  };
  
  const handleDirections = () => {
    if (!restaurant?.address || !isRealData(restaurant.address)) {
      Alert.alert('No Address', 'Sorry, we don\'t have the address for this restaurant.');
      return;
    }
    
    Linking.openURL(`http://maps.apple.com/?q=${encodeURIComponent(formatContactInfo(restaurant.address))}`);
  };

  const handleSave = () => {
    if (!restaurant) return;
    
    if (isSaved) {
      removeRestaurant(id);
      setIsSaved(false);
      Alert.alert(
        "Restaurant Removed",
        "Restaurant removed from your saved list.",
        [{ text: "OK" }]
      );
    } else {
      // Convert the restaurant to the expected format in useConversation
      const convertedRestaurant = {
        ...restaurant,
        // Handle the conversion from string[] to string for openingHours, if needed
        openingHours: Array.isArray(restaurant.openingHours) 
          ? restaurant.openingHours.join(', ') 
          : restaurant.openingHours
      };
      saveRestaurant(convertedRestaurant as any);
      setIsSaved(true);
      Alert.alert(
        "Restaurant Saved",
        "Restaurant saved to your list!",
        [{ text: "OK" }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}><View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View></SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.safeArea}><View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <Ionicons name="alert-circle-outline" size={50} color={theme.colors.error} />
        <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
        <TouchableOpacity style={styles.errorButton} onPress={handleBack}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View></SafeAreaView>
    );
  }

  const headerHeight = 250;

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight * 0.5, headerHeight],
    outputRange: [1, 0.8, 0.6],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, headerHeight * 0.5],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-headerHeight, 0],
    outputRange: [1.5, 1],
    extrapolateRight: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <Animated.ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          <View style={styles.header}>
            {!imageError && restaurant.imageUrl ? (
              <Animated.Image
                source={{ uri: restaurant.imageUrl }}
                style={[styles.headerImage, { opacity: imageOpacity, transform: [{ translateY: imageTranslateY }, { scale: imageScale }] }]}
                onError={() => setImageError(true)}
              />
            ) : (
              <Animated.View style={[styles.headerPlaceholder, { opacity: imageOpacity, transform: [{ translateY: imageTranslateY }] }]}> 
                <Text style={styles.headerPlaceholderText}>{restaurant.name[0]}</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.floor(restaurant.rating) ? "star" : (star <= restaurant.rating + 0.5 ? "star-half" : "star-outline")}
                    size={20}
                    color="#FFD700"
                    style={styles.starIcon}
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{restaurant.rating} ({restaurant.reviews?.length || 0})</Text>
            </View>

            <Text style={styles.description}>{restaurant.description}</Text>
            <Text style={styles.sectionTitle}>Why you'll love it</Text>
            {restaurant.reasonsToRecommend.map((reason: string, index: number) => (
              <View key={index} style={styles.reasonItem}><Text style={styles.reasonText}>"{reason}"</Text></View>
            ))}

            <View style={styles.tagsContainer}>
              <View style={styles.tag}><Text style={styles.tagText}>Popular for {restaurant.cuisineType}</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>{restaurant.priceRange}</Text></View>
            </View>

            <Text style={styles.sectionTitle}>Menu preview</Text>
            <View style={styles.menuContainer}>
              {restaurant.menuItems && restaurant.menuItems.length > 0 ? (
                restaurant.menuItems.map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.menuItemText}>{item.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.menuItemText}>Menu information not available</Text>
              )}
            </View>

            <Text style={styles.sectionTitle}>Contact Information</Text>
            {restaurant.address && isRealData(restaurant.address) && (
              <View style={styles.contactItem}>
                <Ionicons name="location" size={24} color={theme.colors.primary} style={styles.contactIcon} />
                <Text style={styles.contactText}>{formatContactInfo(restaurant.address)}</Text>
              </View>
            )}
            {restaurant.website && isRealData(restaurant.website) && (
              <View style={styles.contactItem}>
                <Ionicons name="globe" size={24} color={theme.colors.primary} style={styles.contactIcon} />
                <TouchableOpacity onPress={handleWebsite}>
                  <Text style={[styles.contactText, styles.linkText]}>{formatContactInfo(restaurant.website)}</Text>
                </TouchableOpacity>
              </View>
            )}
            {restaurant.phone && isRealData(restaurant.phone) && (
              <View style={styles.contactItem}>
                <Ionicons name="call" size={24} color={theme.colors.primary} style={styles.contactIcon} />
                <TouchableOpacity onPress={handleCall}>
                  <Text style={[styles.contactText, styles.linkText]}>{formatContactInfo(restaurant.phone)}</Text>
                </TouchableOpacity>
              </View>
            )}
            {(!restaurant.address || !isRealData(restaurant.address)) && 
             (!restaurant.website || !isRealData(restaurant.website)) && 
             (!restaurant.phone || !isRealData(restaurant.phone)) && (
              <Text style={styles.menuItemText}>No contact information available</Text>
            )}
            <View style={styles.bottomPadding} />
          </View>
        </Animated.ScrollView>

        <View style={styles.fixedNavigation}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.menuButtonContainer}><PreferencesMenuButton /></View>
        </View>

        <View style={styles.bottomButtons}>
          <Button 
            title={isSaved ? "Remove" : "Save"} 
            variant={isSaved ? "secondary" : "primary"} 
            onPress={handleSave} 
            style={styles.saveButton} 
            icon={
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color="white" 
                style={{ marginRight: 8 }} 
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  fixedNavigation: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonContainer: {
    // Container for the menu button
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    height: 250,
    overflow: 'hidden', // Important for image animation
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
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // Overlap with image
  },
  restaurantName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.fontSizes.md * 1.5,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  reasonItem: {
    marginBottom: theme.spacing.sm,
  },
  reasonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    lineHeight: theme.fontSizes.md * 1.4,
    fontStyle: 'italic',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  tagText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  menuContainer: {
    marginTop: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    lineHeight: theme.fontSizes.md * 1.4,
  },
  menuItemText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  contactIcon: {
    marginRight: theme.spacing.md,
  },
  contactText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
  },
  linkText: {
    color: theme.colors.primary,
  },
  bottomButtons: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    width: '100%',
  },
  bottomPadding: {
    height: 60, // Extra padding to account for the save button
  },
}); 