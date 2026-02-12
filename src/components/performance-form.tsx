import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import * as Haptics from 'expo-haptics';
import { PerformanceMetric, PerformanceCategory } from '../types/performance';
import { PerformanceStorage } from '../services/storage';

interface PerformanceFormProps {
  categories: PerformanceCategory[];
  onSave?: (metric: PerformanceMetric) => void;
  onCancel?: () => void;
  editingMetric?: PerformanceMetric;
}

export default function PerformanceForm({
  categories,
  onSave,
  onCancel,
  editingMetric
}: PerformanceFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingMetric) {
      const category = categories.find(c => c.id === editingMetric.category.id);
      setSelectedCategory(category || null);
      setValue(editingMetric.value.toString());
      setNotes(editingMetric.notes || '');
      setTags(editingMetric.tags?.join(', ') || '');
    }
  }, [editingMetric, categories]);

  const handleSave = async () => {
    if (!selectedCategory || !value.trim()) {
      Alert.alert('Error', 'Please select a category and enter a value');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const metric: PerformanceMetric = {
        id: editingMetric?.id || Date.now().toString(),
        date: editingMetric?.date || new Date().toISOString(),
        category: selectedCategory,
        value: numericValue,
        unit: selectedCategory.unit,
        notes: notes.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined
      };

      await PerformanceStorage.saveMetric(metric);
      onSave?.(metric);

      // Reset form if not editing
      if (!editingMetric) {
        setValue('');
        setNotes('');
        setTags('');
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving metric:', error);
      Alert.alert('Error', 'Failed to save metric. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: '700',
          color: AC.label as string,
          marginBottom: 24,
          textAlign: 'center'
        }}
      >
        {editingMetric ? 'Edit Entry' : 'Log Performance'}
      </Text>

      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: AC.label as string,
          marginBottom: 12
        }}
      >
        Category
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => {
              setSelectedCategory(category);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={{
              backgroundColor: selectedCategory?.id === category.id
                ? category.color + '20'
                : AC.tertiarySystemBackground as string,
              borderWidth: selectedCategory?.id === category.id ? 2 : 1,
              borderColor: selectedCategory?.id === category.id
                ? category.color
                : AC.separator as string,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 16,
              marginRight: 12,
              minWidth: 120,
              alignItems: 'center'
            }}
          >
            {process.env.EXPO_OS === 'ios' ? (
              <Image
                source={`sf:${category.icon}`}
                style={{
                  fontSize: 24,
                  color: selectedCategory?.id === category.id ? category.color : AC.secondaryLabel,
                  marginBottom: 8
                }}
              />
            ) : (
              <Text style={{ fontSize: 24, marginBottom: 8 }}>📊</Text>
            )}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedCategory?.id === category.id ? category.color : AC.label as string,
                textAlign: 'center'
              }}
            >
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: AC.label as string,
          marginBottom: 8
        }}
      >
        Value {selectedCategory && `(${selectedCategory.unit})`}
      </Text>

      <TextInput
        style={{
          backgroundColor: AC.tertiarySystemBackground as string,
          borderRadius: 12,
          borderCurve: 'continuous',
          padding: 16,
          fontSize: 17,
          color: AC.label as string,
          marginBottom: 20
        }}
        placeholder="Enter value..."
        placeholderTextColor={AC.placeholderText as string}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: AC.label as string,
          marginBottom: 8
        }}
      >
        Notes (Optional)
      </Text>

      <TextInput
        style={{
          backgroundColor: AC.tertiarySystemBackground as string,
          borderRadius: 12,
          borderCurve: 'continuous',
          padding: 16,
          fontSize: 17,
          color: AC.label as string,
          marginBottom: 20,
          minHeight: 80
        }}
        placeholder="Add any notes..."
        placeholderTextColor={AC.placeholderText as string}
        value={notes}
        onChangeText={setNotes}
        multiline
        textAlignVertical="top"
      />

      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: AC.label as string,
          marginBottom: 8
        }}
      >
        Tags (Optional)
      </Text>

      <TextInput
        style={{
          backgroundColor: AC.tertiarySystemBackground as string,
          borderRadius: 12,
          borderCurve: 'continuous',
          padding: 16,
          fontSize: 17,
          color: AC.label as string,
          marginBottom: 32
        }}
        placeholder="workout, morning, personal (comma separated)"
        placeholderTextColor={AC.placeholderText as string}
        value={tags}
        onChangeText={setTags}
        returnKeyType="done"
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {onCancel && (
          <Pressable
            onPress={onCancel}
            style={{
              flex: 1,
              backgroundColor: AC.systemGray5 as string,
              borderRadius: 12,
              borderCurve: 'continuous',
              padding: 16,
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '600',
                color: AC.label as string
              }}
            >
              Cancel
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleSave}
          disabled={isLoading || !selectedCategory || !value.trim()}
          style={{
            flex: onCancel ? 1 : undefined,
            backgroundColor: (!selectedCategory || !value.trim())
              ? AC.systemGray4 as string
              : AC.systemBlue as string,
            borderRadius: 12,
            borderCurve: 'continuous',
            padding: 16,
            alignItems: 'center',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: 'white'
            }}
          >
            {isLoading ? 'Saving...' : editingMetric ? 'Update' : 'Save Entry'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}