import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const EditExpenseScreen = ({ route, navigation }) => {
  const { expense } = route.params;

  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description);
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

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);

    if (!category) {
        setError("Please select a category.");
        setLoading(false);
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid positive amount.");
        setLoading(false);
        return;
    }

    const { data, error: updateError } = await supabase
      .from('expenses')
      .update({ 
        amount: parsedAmount, 
        category: category,
        description: description, 
      })
      .match({ id: expense.id });

    if (updateError) {
      setError(updateError.message);
    } else {
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
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
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button 
        mode="contained" 
        onPress={handleUpdate} 
        loading={loading} 
        style={styles.button}
      >
        Save Changes
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

export default EditExpenseScreen;