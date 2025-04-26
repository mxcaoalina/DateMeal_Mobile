import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import SelectableButton from '../../components/SelectableButton';
import PageControl from '../../components/PageControl';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import PreferencesMenuButton from '../../components/PreferencesMenuButton';

type Step2NavigationProp = StackNavigationProp<RootStackParamList, 'Step2'>;

export default function Step2Screen() {
  const navigation = useNavigation<Step2NavigationProp>();
  const { setMood, userName } = usePreferences();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
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
    navigation.goBack();
  };
  
  // Exit to Home handler
  const handleExitToHome = () => {
    // @ts-ignore
    navigation.navigate('Home');
  };
  
  const handleSelection = (mood: string) => {
    setSelectedMood(mood);
    
    // Add a small delay for visual feedback
    setTimeout(() => {
      setMood(mood);
      navigation.navigate('Step3');
    }, 300);
  };

  const moods = [
    'Romantic',
    'Scenic View',
    'Classy & Chill',
    'Cozy',
    'Joy & Fun',
    'Surprise Me!!'
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
        <Animated.View style={{ 
          opacity: fadeAnim, 
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] 
        }}>
          <Text style={styles.title}>
            What kind of night are you in the mood for?
          </Text>
          
          <View style={styles.buttonGrid}>
            {moods.map((mood) => (
              <View key={mood} style={styles.moodButtonContainer}>
                <SelectableButton
                  label={mood}
                  variant="grid"
                  onPress={() => handleSelection(mood)}
                  selected={selectedMood === mood}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <PageControl total={6} current={1} />
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
  },
  moodButtonContainer: {
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