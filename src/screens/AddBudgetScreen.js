
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const AddBudgetScreen = ({ navigation }) => {
  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();

  const fetchCategories = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', user.id)
        .order('name');
    
    if (error) {
        Alert.alert("Error", "Failed to fetch your categories.");
    } else {
        setUserCategories(data);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
        fetchCategories();
    }
  }, [isFocused, fetchCategories]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    if (!category) {
        setError("Please select a category.");
        setLoading(false);
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError("You must be logged in to add a budget.");
        setLoading(false);
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid positive amount.");
        setLoading(false);
        return;
    }

    const { error: upsertError } = await supabase
      .from('budgets')
      .upsert({ 
        user_id: user.id,
        category: category,
        amount: parsedAmount,
       }, { onConflict: 'user_id, category' });

    if (upsertError) {
      setError(upsertError.message);
    } else {
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.chipContainer}
          >
              {userCategories.map((cat) => (
                  <Chip 
                    key={cat.name} 
                    style={[
                      styles.chip,
                      category === cat.name && styles.selectedChip
                    ]}
                    textStyle={[
                      styles.chipText,
                      category === cat.name && styles.selectedChipText
                    ]}
                    selected={category === cat.name}
                    onPress={() => setCategory(cat.name)}
                  >
                    {cat.name}
                  </Chip>
              ))}
          </ScrollView>
          
          <Text style={styles.sectionTitle}>Budget Amount</Text>
          <TextInput
            label="Enter monthly budget"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            outlineColor="#e2e8f0"
            activeOutlineColor="#2563eb"
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={loading} 
          style={styles.saveButton}
          buttonColor="#2563eb"
          textColor="#ffffff"
        >
          Save Budget
        </Button>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  chip: {
    marginRight: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  chipText: {
    color: '#475569',
    fontSize: 14,
  },
  selectedChipText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  input: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 6,
  },
  errorText: {
    marginTop: 12,
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  }
});

export default AddBudgetScreen;
