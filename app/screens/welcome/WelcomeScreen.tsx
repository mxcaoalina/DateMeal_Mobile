import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { setUserName } = usePreferences();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleNameSubmit = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setUserName(name.trim());
    // Navigate to onboarding
    // @ts-ignore - We know this route exists
    navigation.navigate('Step1');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="restaurant" size={32} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>Date Night Dining</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>
            Hey! How should I call you, superstar?
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (error) setError('');
              }}
              placeholderTextColor={theme.colors.gray[400]}
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.button}
              onPress={handleNameSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    fontSize: theme.fontSizes.md,
  },
  inputContainer: {
    gap: theme.spacing.md,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.default,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    backgroundColor: theme.colors.gray[50],
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.sm,
  },
  button: {
    height: 48,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
  },
}); 