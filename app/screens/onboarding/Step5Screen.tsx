import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

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
    navigation.goBack();
  };
  
  const handleExitToHome = () => {
    // @ts-ignore
    navigation.navigate('Home');
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
    "Indian",
    "Surprise Me!"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <PreferencesMenuButton />
        </View>
        <View style={styles.divider} />
      </View>
      
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
                variant="grid"
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
      
      {/* Exit to Home */}
      <View style={styles.exitContainer}>
        <View style={styles.exitDivider} />
        <TouchableOpacity 
          style={styles.exitToHomeButton}
          onPress={handleExitToHome}
        >
          <Text style={styles.exitToHomeText}>Exit to Home</Text>
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
  header: {
    paddingBottom: theme.spacing.sm,
    height: 80, // Narrower header
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    marginTop: theme.spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: 4,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    width: '100%',
    alignSelf: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
  },
  gridItem: {
    width: '46%',
    marginBottom: theme.spacing.md,
    height: 70,
  },
  footer: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  exitContainer: {
    width: '100%',
  },
  exitDivider: {
    height: 1,
    backgroundColor: theme.colors.gray[200],
    width: '100%',
  },
  exitToHomeButton: {
    paddingTop: theme.spacing.lg,
    //paddingBottom: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
  },
  exitToHomeText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
}); 