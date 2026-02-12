import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Stack } from 'expo-router/stack';
import { router } from 'expo-router';
import * as AC from '@bacons/apple-colors';
import { PerformanceMetric, PerformanceCategory } from '../types/performance';
import { PerformanceStorage } from '../services/storage';
import PerformanceForm from '../components/performance-form';

export default function AddPerformance() {
  const [categories, setCategories] = useState<PerformanceCategory[]>([]);

  const loadCategories = async () => {
    try {
      const categoriesData = await PerformanceStorage.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSave = (metric: PerformanceMetric) => {
    Alert.alert(
      'Success!',
      'Your performance metric has been saved.',
      [
        {
          text: 'Add Another',
          style: 'default'
        },
        {
          text: 'View Dashboard',
          style: 'default',
          onPress: () => router.push('/')
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Entry',
          headerLargeTitle: true
        }}
      />

      <View style={{ flex: 1, backgroundColor: AC.systemBackground as string }}>
        <PerformanceForm
          categories={categories}
          onSave={handleSave}
        />
      </View>
    </>
  );
}