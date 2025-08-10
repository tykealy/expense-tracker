
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
      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          {userCategories.map((cat) => (
              <Chip 
                key={cat.name} 
                style={styles.chip}
                selected={category === cat.name}
                onPress={() => setCategory(cat.name)}
              >
                {cat.name}
              </Chip>
          ))}
      </ScrollView>
      <TextInput
        label="Budget Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button 
        mode="contained" 
        onPress={handleSave} 
        loading={loading} 
        style={styles.button}
      >
        Save Budget
      </Button>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666'
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  }
});

export default AddBudgetScreen;
