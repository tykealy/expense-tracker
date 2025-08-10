
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, List, Divider } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const ManageCategoriesScreen = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .eq('user_id', user.id)
            .order('name');
        
        if (error) {
            Alert.alert("Error", "Failed to fetch categories.");
        } else {
            setCategories(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isFocused) {
            fetchCategories();
        }
    }, [isFocused, fetchCategories]);

    const handleAddCategory = async () => {
        if (newCategory.trim() === '') return;

        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('categories')
            .insert({ name: newCategory, user_id: user.id });

        if (error) {
            Alert.alert("Error", "Failed to add category. It might already exist.");
        } else {
            setNewCategory('');
            fetchCategories(); // Refresh list
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .match({ id: categoryId });

        if (error) {
            Alert.alert("Error", "Failed to delete category.");
        } else {
            fetchCategories(); // Refresh list
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.addCategoryContainer}>
                <TextInput
                    label="New Category Name"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    style={styles.input}
                />
                <Button mode="contained" onPress={handleAddCategory} style={styles.button}>
                    Add
                </Button>
            </View>
            <Divider style={styles.divider}/>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <List.Item
                        title={item.name}
                        right={() => (
                            <IconButton
                                icon="delete"
                                onPress={() => handleDeleteCategory(item.id)}
                            />
                        )}
                    />
                )}
                refreshing={loading}
                onRefresh={fetchCategories}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addCategoryContainer: {
        padding: 20,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 5,
    },
    divider: {
        marginVertical: 10,
    }
});

export default ManageCategoriesScreen;
