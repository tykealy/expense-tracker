
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Dialog, Paragraph, Button, IconButton } from 'react-native-paper';
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
      fetchExpenses();
    }
    hideDialog();
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#059669',
      'Transport': '#2563eb',
      'Shopping': '#d97706',
      'Entertainment': '#7c3aed',
      'Bills': '#dc2626',
      'Health': '#0891b2',
    };
    return colors[category] || '#64748b';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
        onLongPress={() => showDialog(item)}
        onPress={() => navigation.navigate('EditExpense', { expense: item })}
        activeOpacity={0.7}
    >
        <Card style={styles.expenseCard}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.leftContent}>
                    <View style={styles.categoryContainer}>
                        <View 
                            style={[
                                styles.categoryIndicator, 
                                { backgroundColor: getCategoryColor(item.category) }
                            ]} 
                        />
                        <Text style={styles.categoryText}>{item.category}</Text>
                    </View>
                    {item.description ? (
                        <Text style={styles.descriptionText} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}
                    <Text style={styles.dateText}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </Text>
                </View>
                <View style={styles.rightContent}>
                    <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                    <IconButton 
                        icon="dots-vertical" 
                        size={16}
                        iconColor="#94a3b8"
                        onPress={() => showDialog(item)}
                    />
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
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptyText}>Tap the + button to add your first expense</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddExpense')}
        color="#ffffff"
        customSize={56}
      />
      <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
        <Dialog.Title style={styles.dialogTitle}>Delete Expense</Dialog.Title>
        <Dialog.Content>
          <Paragraph style={styles.dialogText}>
            Are you sure you want to delete this expense? This action cannot be undone.
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog} textColor="#64748b">Cancel</Button>
          <Button onPress={handleDelete} textColor="#dc2626">Delete</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  expenseCard: {
    marginBottom: 12,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563eb',
    borderRadius: 28,
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 20,
    color: '#dc2626',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  dialogTitle: {
    color: '#1e293b',
  },
  dialogText: {
    color: '#475569',
    lineHeight: 20,
  },
});

export default ExpensesScreen;
