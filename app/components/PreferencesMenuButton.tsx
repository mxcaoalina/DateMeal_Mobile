import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import theme from '../theme';

/**
 * A reusable hamburger menu button that navigates to the Preferences screen
 * This component is designed to be placed in the top-right corner of screens
 */
export default function PreferencesMenuButton() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  
  const handlePress = () => {
    navigation.navigate('Preferences');
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 