import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator 
} from 'react-native';
import theme from '../theme';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisineType: string;
  priceRange: string;
  location: string;
  rating: number;
  imageUrl: string;
  reasonsToRecommend: string[];
}

interface RecommendationCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ restaurant, onPress }) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        
        {!imageError ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.image}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>{restaurant.name[0]}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{restaurant.description}</Text>
        
        <View style={styles.metaContainer}>
          <Text style={styles.metaText}>{restaurant.cuisineType}</Text>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.metaText}>{restaurant.priceRange}</Text>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.metaText}>{restaurant.rating} ★</Text>
        </View>
        
        <View style={styles.reasonsContainer}>
          {restaurant.reasonsToRecommend.slice(0, 2).map((reason, index) => (
            <View key={index} style={styles.reasonPill}>
              <Text style={styles.reasonText} numberOfLines={1}>{reason}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.default,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.gray[100],
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  name: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: theme.fontSizes.sm * 1.4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  bulletPoint: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[400],
    marginHorizontal: 4,
  },
  reasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reasonPill: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default RecommendationCard; 