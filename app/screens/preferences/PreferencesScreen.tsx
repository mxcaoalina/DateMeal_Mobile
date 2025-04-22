import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { usePreferences } from '../../store/usePreferences';
import Button from '../../components/Button';

const TagInput = ({ 
  tags, 
  setTags, 
  placeholder, 
  label 
}: { 
  tags: string[], 
  setTags: (tags: string[]) => void, 
  placeholder: string,
  label: string 
}) => {
  const [text, setText] = useState('');
  
  const addTag = () => {
    if (text.trim() !== '' && !tags.includes(text.trim())) {
      setTags([...tags, text.trim()]);
      setText('');
    }
  };
  
  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };
  
  return (
    <View style={styles.tagInputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.tagInput}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray[400]}
          onSubmitEditing={addTag}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTag}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeTag(index)}>
              <Ionicons name="close-circle" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const { 
    sessionPreferences, 
    setCuisinePreferences, 
    setDietaryRestrictions, 
    setAbsoluteNogos 
  } = usePreferences();
  
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [nogos, setNogos] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Initialize state from store
  useEffect(() => {
    setCuisines(sessionPreferences.cuisinePreferences || []);
    setAllergies(sessionPreferences.dietaryRestrictions || []);
    setNogos(sessionPreferences.absoluteNogos || []);
  }, [sessionPreferences]);
  
  // Track changes to enable/disable save button
  useEffect(() => {
    const cuisinesChanged = !arraysEqual(cuisines, sessionPreferences.cuisinePreferences || []);
    const allergiesChanged = !arraysEqual(allergies, sessionPreferences.dietaryRestrictions || []);
    const nogosChanged = !arraysEqual(nogos, sessionPreferences.absoluteNogos || []);
    
    setHasChanges(cuisinesChanged || allergiesChanged || nogosChanged);
  }, [cuisines, allergies, nogos, sessionPreferences]);
  
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };
  
  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Discard", onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  const handleSave = () => {
    setCuisinePreferences(cuisines);
    setDietaryRestrictions(allergies);
    setAbsoluteNogos(nogos);
    Alert.alert("Success", "Your preferences have been updated.");
    setHasChanges(false);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dining Preferences</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionDescription}>
          Update your dining preferences to get better restaurant recommendations.
        </Text>
        
        <TagInput
          tags={cuisines}
          setTags={setCuisines}
          placeholder="Add a cuisine you enjoy..."
          label="Favorite Cuisines"
        />
        
        <TagInput
          tags={allergies}
          setTags={setAllergies}
          placeholder="Add allergies or dietary restrictions..."
          label="Allergies & Dietary Restrictions"
        />
        
        <TagInput
          tags={nogos}
          setTags={setNogos}
          placeholder="Add foods you don't enjoy..."
          label="No-Go Foods"
        />
        
        <Button
          title="Save Preferences"
          variant="primary"
          onPress={handleSave}
          disabled={!hasChanges}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  sectionDescription: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  tagInputContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.default,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    marginRight: 4,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
  },
}); 