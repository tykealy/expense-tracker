import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../services/supabase';

import DashboardScreen from '../screens/DashboardScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import BudgetsScreen from '../screens/BudgetsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import AddBudgetScreen from '../screens/AddBudgetScreen';
import EditExpenseScreen from '../screens/EditExpenseScreen';
import ManageCategoriesScreen from '../screens/ManageCategoriesScreen';
import AuthScreen from '../screens/AuthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator 
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          elevation: 8,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1e293b',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={22} />
          ),
          headerTitle: 'Overview',
        }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="receipt-outline" color={color} size={22} />
          ),
          headerTitle: 'Expenses',
        }}
      />
      <Tab.Screen 
        name="Budgets" 
        component={BudgetsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" color={color} size={22} />
          ),
          headerTitle: 'Budgets',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" color={color} size={22} />
          ),
          headerTitle: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#1e293b',
          },
          headerTintColor: '#2563eb',
        }}
      >
        {session && session.user ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddExpense" 
              component={AddExpenseScreen} 
              options={{ 
                presentation: 'modal', 
                headerTitle: 'Add Expense',
                headerStyle: {
                  backgroundColor: '#ffffff',
                }
              }}
            />
            <Stack.Screen 
              name="AddBudget" 
              component={AddBudgetScreen} 
              options={{ 
                presentation: 'modal', 
                headerTitle: 'Add Budget',
                headerStyle: {
                  backgroundColor: '#ffffff',
                }
              }}
            />
            <Stack.Screen 
              name="EditExpense" 
              component={EditExpenseScreen} 
              options={{ headerTitle: 'Edit Expense' }}
            />
            <Stack.Screen 
              name="ManageCategories" 
              component={ManageCategoriesScreen} 
              options={{ headerTitle: 'Manage Categories' }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;