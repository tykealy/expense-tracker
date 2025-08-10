
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, ProgressBar, useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const BudgetsScreen = ({ navigation }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isFocused = useIsFocused();
    const { colors } = useTheme();

    const fetchBudgetData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("User not found");
            setLoading(false);
            return;
        }

        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

        const [budgetsResponse, expensesResponse] = await Promise.all([
            supabase.from('budgets').select('*').eq('user_id', user.id),
            supabase.from('expenses').select('category, amount').eq('user_id', user.id).gte('date', firstDay).lte('date', lastDay)
        ]);

        if (budgetsResponse.error || expensesResponse.error) {
            setError(budgetsResponse.error?.message || expensesResponse.error?.message);
            setLoading(false);
            return;
        }

        const expensesByCategory = expensesResponse.data.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const budgetWithSpending = budgetsResponse.data.map(budget => ({
            ...budget,
            spent: expensesByCategory[budget.category] || 0,
        }));

        setBudgets(budgetWithSpending);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchBudgetData();
        }
    }, [isFocused, fetchBudgetData]);

    const getBudgetStatus = (spent, budget) => {
        const ratio = budget > 0 ? spent / budget : 0;
        if (ratio >= 1) return { color: '#dc2626', label: 'Over budget' };
        if (ratio >= 0.8) return { color: '#d97706', label: 'Nearly full' };
        return { color: '#059669', label: 'On track' };
    };

    const renderItem = ({ item }) => {
        const progress = item.amount > 0 ? Math.min(item.spent / item.amount, 1) : 0;
        const status = getBudgetStatus(item.spent, item.amount);
        const remaining = Math.max(item.amount - item.spent, 0);

        return (
            <Card style={styles.budgetCard}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.header}>
                        <Text style={styles.categoryName}>{item.category}</Text>
                        <View style={styles.statusContainer}>
                            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.amountContainer}>
                        <View style={styles.amountRow}>
                            <Text style={styles.spentAmount}>${item.spent.toFixed(2)}</Text>
                            <Text style={styles.budgetAmount}>of ${item.amount.toFixed(2)}</Text>
                        </View>
                        <Text style={styles.remainingAmount}>
                            ${remaining.toFixed(2)} remaining
                        </Text>
                    </View>
                    
                    <ProgressBar 
                        progress={progress} 
                        color={status.color} 
                        style={styles.progressBar}
                    />
                </Card.Content>
            </Card>
        );
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator animating={true} size="large" style={styles.loader} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : budgets.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No budgets yet</Text>
                    <Text style={styles.emptyText}>Create your first budget to track spending</Text>
                </View>
            ) : (
                <FlatList
                    data={budgets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddBudget')}
                color="#ffffff"
                customSize={56}
            />
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
    budgetCard: {
        marginBottom: 12,
        elevation: 2,
        borderRadius: 12,
    },
    cardContent: {
        paddingVertical: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    amountContainer: {
        marginBottom: 12,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    spentAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginRight: 8,
    },
    budgetAmount: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    remainingAmount: {
        fontSize: 14,
        color: '#64748b',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: '#f1f5f9',
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
    }
});

export default BudgetsScreen;
