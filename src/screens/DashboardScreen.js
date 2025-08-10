import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, Title, ActivityIndicator } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../services/supabase';
import { useEffect } from 'react';
import QuickAddExpense from '../components/QuickAddExpense';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#ffffff",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
        borderRadius: 16
    },
    propsForLabels: {
        fontSize: 12,
        fontWeight: '500',
        fill: '#475569'
    }
};

const DashboardScreen = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            .eq('user_id', user.id);

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

    const handleExpenseAdded = () => {
        fetchExpenses();
    };

    const getCategoryData = () => {
        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {});

        const colors = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];
        return Object.keys(categoryTotals).map((category, index) => ({
            name: category,
            population: categoryTotals[category],
            color: colors[index % colors.length],
            legendFontColor: "#475569",
            legendFontSize: 12
        }));
    };

    const getWeeklyData = () => {
        const today = new Date();
        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
            const dailyTotal = expenses
                .filter(e => new Date(e.date).toDateString() === d.toDateString())
                .reduce((sum, e) => sum + e.amount, 0);
            data.push(dailyTotal);
        }
        return { labels, datasets: [{ data }] };
    };

    const getTotalSpent = () => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const getThisMonthSpent = () => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return expenses
            .filter(expense => new Date(expense.date) >= firstDayOfMonth)
            .reduce((sum, expense) => sum + expense.amount, 0);
    };

    if (loading) {
        return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <QuickAddExpense onExpenseAdded={handleExpenseAdded} />
            
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <Text style={styles.summaryLabel}>This Month</Text>
                        <Text style={styles.summaryAmount}>${getThisMonthSpent().toFixed(2)}</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.summaryCard}>
                    <Card.Content style={styles.summaryContent}>
                        <Text style={styles.summaryLabel}>Total Spent</Text>
                        <Text style={styles.summaryAmount}>${getTotalSpent().toFixed(2)}</Text>
                    </Card.Content>
                </Card>
            </View>

            <Card style={styles.chartCard}>
                <Card.Content style={styles.chartContent}>
                    <Title style={styles.chartTitle}>Spending by Category</Title>
                    {expenses.length > 0 ? (
                        <PieChart
                            data={getCategoryData()}
                            width={screenWidth - 64}
                            height={200}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>No expenses yet</Text>
                            <Text style={styles.noDataSubtext}>Add your first expense to see insights</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>

            <Card style={styles.chartCard}>
                <Card.Content style={styles.chartContent}>
                    <Title style={styles.chartTitle}>Last 7 Days</Title>
                    {expenses.length > 0 ? (
                        <BarChart
                            data={getWeeklyData()}
                            width={screenWidth - 64}
                            height={200}
                            yAxisLabel="$"
                            chartConfig={chartConfig}
                            verticalLabelRotation={0}
                            showValuesOnTopOfBars={true}
                            fromZero={true}
                        />
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>No recent activity</Text>
                            <Text style={styles.noDataSubtext}>Start tracking your daily expenses</Text>
                        </View>
                    )}
                </Card.Content>
            </Card>
        </ScrollView>
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
    summaryContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        elevation: 2,
        borderRadius: 12,
    },
    summaryContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
        fontWeight: '500',
    },
    summaryAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
    },
    chartCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
        borderRadius: 12,
    },
    chartContent: {
        paddingVertical: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noDataText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 4,
    },
    noDataSubtext: {
        fontSize: 14,
        color: '#94a3b8',
    },
    errorText: {
        flex: 1,
        textAlign: 'center',
        marginTop: 20,
        color: '#dc2626',
        fontSize: 16,
    },
});

export default DashboardScreen;