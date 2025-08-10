
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, FAB, ActivityIndicator, Title, ProgressBar, useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const BudgetsScreen = ({ navigation }) => {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const isFocused = useIsFocused();
    const { colors } = useTheme(); // Get theme colors

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

    const renderItem = ({ item }) => {
        const progress = item.amount > 0 ? item.spent / item.amount : 0;
        const progressColor = progress > 1 ? colors.error : colors.primary;

        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Title>{item.category}</Title>
                    <View style={styles.progressContainer}>
                        <Text>${item.spent.toFixed(2)} / ${item.amount.toFixed(2)}</Text>
                    </View>
                    <ProgressBar progress={progress} color={progressColor} style={styles.progressBar}/>
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
                    <Text style={styles.emptyText}>No budgets yet. Create one!</Text>
                </View>
            ) : (
                <FlatList
                    data={budgets}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('AddBudget')}
            />
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
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    progressBar: {
        marginTop: 8,
        height: 10,
        borderRadius: 5,
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

export default BudgetsScreen;
