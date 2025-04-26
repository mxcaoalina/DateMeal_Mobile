import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';
import { usePreferences } from '../../store/usePreferences';
import theme from '../../theme';

export default function Step4Screen() {
  const navigation = useNavigation();
  const { setBudget } = usePreferences();
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    // @ts-ignore
    navigation.goBack();
  };

  const handleExitToHome = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };

  const handleBudgetSelection = (budget: string) => {
    setSelectedBudget(budget);
    setTimeout(() => {
      setBudget(budget);
      // @ts-ignore
      navigation.navigate('Step5');
    }, 300);
  };

  const budgets = [
    'Budget-Friendly ($)',
    'Mid-Range ($$)',
    'Let\'s go Fancy ($$$)',
    'Luxurious Experience ($$$$)',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Static Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <PreferencesMenuButton />
        </View>
        <View style={styles.divider} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }}>
          <Text style={styles.title}>What's your budget vibe?</Text>
          <View style={styles.buttonContainer}>
            {budgets.map((budget) => (
              <SelectableButton
                key={budget}
                label={budget}
                variant="grid"
                onPress={() => handleBudgetSelection(budget)}
                selected={selectedBudget === budget}
              />
            ))}
          </View>
        </Animated.View>
      </View>

      {/* Static Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={3} />
      </View>

      {/* Exit to Home */}
      <View style={styles.exitContainer}>
        <View style={styles.exitDivider} />
        <TouchableOpacity style={styles.exitToHomeButton} onPress={handleExitToHome}>
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
    paddingTop: theme.spacing.lg,
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
  buttonContainer: {
    gap: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
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