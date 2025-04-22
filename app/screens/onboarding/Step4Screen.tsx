import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';

export default function Step4Screen() {
  const navigation = useNavigation();
  const { setBudget, userName } = usePreferences();
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  
  // Fade in animation
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  
  // Back button handler
  const handleBack = () => {
    // @ts-ignore
    navigation.goBack();
  };
  
  const handleSelection = (budget: string) => {
    setSelectedBudget(budget);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setBudget(budget);
      // @ts-ignore - We know this route exists, even if TS doesn't
      navigation.navigate('Step5');
    }, 300);
  };

  const budgets = [
    'Budget-Friendly',
    'Mid-Range',
    'Let\'s go Fancy',
    'Luxurious Experience'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hi {userName || "Superstar"}!
        </Text>
        <View style={styles.divider} />
      </View>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBack}
      >
        <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      
      {/* Main Content */}
      <View style={styles.content}>
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] 
        }}>
          <Text style={styles.title}>
            What's your budget vibe?
          </Text>
          
          <View style={styles.buttonContainer}>
            {budgets.map((budget) => (
              <SelectableButton
                key={budget}
                label={budget}
                onPress={() => handleSelection(budget)}
                selected={selectedBudget === budget}
              />
            ))}
          </View>
        </Animated.View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={3} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.xl,
    height: 80,
  },
  greeting: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginTop: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  footer: {
    marginBottom: theme.spacing.xxl,
  },
}); 