import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, TextInput, Button, Text, Chip, IconButton } from 'react-native-paper';
import { supabase } from '../services/supabase';

const QuickAddExpense = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', user.id)
        .order('name');
    
    if (error) {
        Alert.alert("Error", "Failed to fetch categories.");
    } else {
        setUserCategories(data || []);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        setError("You must be logged in to add an expense.");
        setLoading(false);
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setError("Please enter a valid positive amount.");
        setLoading(false);
        return;
    }

    const { error: insertError } = await supabase
      .from('expenses')
      .insert([{ 
        amount: parsedAmount, 
        category: category,
        description, 
        user_id: user.id,
        date: new Date().toISOString(),
      }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      // Reset form
      setAmount('');
      setCategory(null);
      setDescription('');
      setError(null);
      setIsExpanded(false);
      // Notify parent component
      if (onExpenseAdded) {
        onExpenseAdded();
      }
    }
    setLoading(false);
  };

  if (!isExpanded) {
    return (
      <Card style={styles.collapsedCard}>
        <Card.Content style={styles.collapsedContent}>
          <View style={styles.collapsedHeader}>
            <Text style={styles.quickAddTitle}>Quick Add Expense</Text>
            <IconButton 
              icon="plus" 
              size={24}
              iconColor="#2563eb"
              onPress={() => setIsExpanded(true)}
            />
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Add Expense</Text>
          <IconButton 
            icon="close" 
            size={20}
            iconColor="#64748b"
            onPress={() => setIsExpanded(false)}
          />
        </View>
        
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#2563eb"
        />
        
        <Text style={styles.label}>Category</Text>
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
        
        <TextInput
          label="Description (Optional)"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          mode="outlined"
          outlineColor="#e2e8f0"
          activeOutlineColor="#2563eb"
        />
        
        <Button 
          mode="contained" 
          onPress={handleSave} 
          loading={loading} 
          style={styles.button}
          buttonColor="#2563eb"
          textColor="#ffffff"
        >
          Add Expense
        </Button>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  collapsedCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  collapsedContent: {
    paddingVertical: 12,
  },
  collapsedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#475569',
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chip: {
    marginRight: 8,
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
  },
  selectedChipText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 4,
  },
  errorText: {
    marginTop: 8,
    color: '#dc2626',
    textAlign: 'center',
    fontSize: 14,
  }
});

export default QuickAddExpense;