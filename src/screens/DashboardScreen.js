import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text, Card, Title, ActivityIndicator } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../services/supabase';
import { useEffect } from 'react';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
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

    const getCategoryData = () => {
        const categoryTotals = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + expense.amount;
            return acc;
        }, {});

        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
        return Object.keys(categoryTotals).map((category, index) => ({
            name: category,
            population: categoryTotals[category],
            color: colors[index % colors.length],
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
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

    if (loading) {
        return <ActivityIndicator animating={true} size="large" style={styles.loader} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Spending by Category</Title>
                    {expenses.length > 0 ? (
                        <PieChart
                            data={getCategoryData()}
                            width={screenWidth - 40} // from card padding
                            height={220}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                        />
                    ) : <Text>No data to display</Text>}
                </Card.Content>
            </Card>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Spending Last 7 Days</Title>
                    {expenses.length > 0 ? (
                        <BarChart
                            data={getWeeklyData()}
                            width={screenWidth - 40}
                            height={220}
                            yAxisLabel="$"
                            chartConfig={chartConfig}
                            verticalLabelRotation={30}
                        />
                    ) : <Text>No data to display</Text>}
                </Card.Content>
            </Card>
        </ScrollView>
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
    card: {
        margin: 10,
    },
    errorText: {
        flex: 1,
        textAlign: 'center',
        marginTop: 20,
        color: 'red',
    },
});

export default DashboardScreen;