import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, List, Divider, Avatar } from 'react-native-paper';
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
    setLoading(false);
  };

  const getInitials = (email) => {
    return email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {user && (
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileContent}>
              <Avatar.Text 
                size={60} 
                label={getInitials(user.email)}
                style={styles.avatar}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Account</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.menuCard}>
          <List.Item
            title="Manage Categories"
            description="Add, edit, or remove expense categories"
            left={props => <List.Icon {...props} icon="shape-outline" color="#2563eb" />}
            right={props => <List.Icon {...props} icon="chevron-right" color="#94a3b8" />}
            onPress={() => navigation.navigate('ManageCategories')}
            style={styles.listItem}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
          />
        </Card>

        <View style={styles.signOutContainer}>
          <Button 
            mode="outlined" 
            onPress={handleSignOut} 
            loading={loading} 
            style={styles.signOutButton}
            icon="logout"
            textColor="#dc2626"
            buttonColor="transparent"
          >
            Sign Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    backgroundColor: '#2563eb',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  menuCard: {
    marginBottom: 24,
    elevation: 2,
    borderRadius: 12,
  },
  listItem: {
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  listDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  signOutContainer: {
    marginTop: 32,
  },
  signOutButton: {
    borderColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 6,
  },
});

export default SettingsScreen;