import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';

export default function Step5Screen() {
  const navigation = useNavigation();
  const { userName } = usePreferences();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const handleSelection = (cuisine: string) => {
    setSelectedOption(cuisine);
    
    // Add a small delay to show the selected state before navigating
    setTimeout(() => {
      // @ts-ignore - We know this route exists
      navigation.navigate('Step6');
    }, 300);
  };
  
  const handleBack = () => {
    // @ts-ignore - We know this route exists
    navigation.goBack();
  };

  // Cuisine options - KEEPING EXACTLY THE SAME AS WEB VERSION
  const options = [
    "French",
    "Japanese",
    "Italian",
    "American",
    "Mediterranean",
    "Mexican",
    "Chinese",
    "Thai",
    "Surprise Me!"
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
        <Text style={styles.title}>
          What cuisine are you craving?
        </Text>
        
        <View style={styles.gridContainer}>
          {options.map((option) => (
            <View key={option} style={styles.gridItem}>
              <SelectableButton
                label={option}
                onPress={() => handleSelection(option)}
                selected={selectedOption === option}
              />
            </View>
          ))}
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={4} />
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
    fontSize: theme.fontSizes.lg,
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
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '32%',
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginBottom: theme.spacing.xxl,
  },
}); 