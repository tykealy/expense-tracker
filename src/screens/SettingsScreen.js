import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card, List, Divider } from 'react-native-paper';
import { supabase } from '../services/supabase';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // The onAuthStateChange listener in AppNavigator will handle navigation.
    setLoading(false);
  };

  return (
    <View style={styles.container}>
        {user && 
            <Card style={styles.card}>
                <Card.Title title="Current User" />
                <Card.Content>
                    <Text>Email: {user.email}</Text>
                </Card.Content>
            </Card>
        }
        <Card style={styles.card}>
            <List.Item
                title="Manage Categories"
                left={props => <List.Icon {...props} icon="shape-outline" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => navigation.navigate('ManageCategories')}
            />
        </Card>
        <Button 
            mode="contained" 
            onPress={handleSignOut} 
            loading={loading} 
            style={styles.button}
            icon="logout"
        >
            Sign Out
        </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default SettingsScreen;