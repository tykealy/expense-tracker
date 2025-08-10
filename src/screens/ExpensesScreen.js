
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Title, Dialog, Paragraph, Button } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const ExpensesScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const isFocused = useIsFocused();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setError("User not found");
        setLoading(false);
        return;
    }

    const { data, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setExpenses(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchExpenses();
    }
  }, [isFocused, fetchExpenses]);

  const showDialog = (expense) => {
    setSelectedExpense(expense);
    setIsDialogVisible(true);
  };

  const hideDialog = () => {
    setSelectedExpense(null);
    setIsDialogVisible(false);
  };

  const handleDelete = async () => {
    if (!selectedExpense) return;

    const { error: deleteError } = await supabase
      .from('expenses')
      .delete()
      .match({ id: selectedExpense.id });

    if (deleteError) {
      setError(deleteError.message);
    } else {
      // Refresh the list after deletion
      fetchExpenses();
    }
    hideDialog();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        onLongPress={() => showDialog(item)}
        onPress={() => navigation.navigate('EditExpense', { expense: item })}
    >
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.cardContent}>
                    <View style={styles.leftContent}>
                        <Title>{item.category}</Title>
                        <Text>{item.description}</Text>
                    </View>
                    <View style={styles.rightContent}>
                        <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                        <Text>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator animating={true} size="large" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : expenses.length === 0 ? (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses yet. Add one!</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddExpense')}
      />
      <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
        <Dialog.Title>Delete Expense</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Are you sure you want to delete this expense? This action cannot be undone.</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Cancel</Button>
          <Button onPress={handleDelete} color="red">Delete</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 10,
  },
  card: {
    marginVertical: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  }
});

export default ExpensesScreen;
