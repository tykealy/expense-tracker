
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../services/supabase';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) setError(error.message);
    // The user will be logged in automatically on sign up, 
    // and the session change will be detected by the AppNavigator.
    setLoading(false);
  };

  return (
    <View style={styles.container}>
        <Text style={styles.header}>Expense Tracker</Text>
        <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
        />
        <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
        />
        <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.button}
        >
            Sign In
        </Button>
        <Button 
            mode="outlined" 
            onPress={handleSignUp} 
            loading={loading}
            style={styles.button}
        >
            Sign Up
        </Button>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },
    errorText: {
        marginTop: 10,
        color: 'red',
        textAlign: 'center',
    }
});

export default AuthScreen;
