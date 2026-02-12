import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import { PerformanceMetric, PerformanceCategory } from '../types/performance';
import { Link } from 'expo-router';

interface MetricCardProps {
  metric: PerformanceMetric;
  category: PerformanceCategory;
  onPress?: () => void;
}

export default function MetricCard({ metric, category, onPress }: MetricCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      return `$${value.toFixed(2)}`;
    }
    return `${value} ${unit}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: AC.secondarySystemGroupedBackground as string,
        borderRadius: 12,
        borderCurve: 'continuous',
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: category.color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12
        }}
      >
        {process.env.EXPO_OS === 'ios' ? (
          <Image
            source={`sf:${category.icon}`}
            style={{ fontSize: 20, color: category.color }}
          />
        ) : (
          <Text style={{ fontSize: 20, color: category.color }}>📊</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: AC.label as string,
            marginBottom: 2
          }}
          selectable
        >
          {category.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: AC.secondaryLabel as string,
            marginBottom: 4
          }}
          selectable
        >
          {formatDate(metric.date)}
        </Text>
        {metric.notes && (
          <Text
            style={{
              fontSize: 12,
              color: AC.tertiaryLabel as string,
              fontStyle: 'italic'
            }}
            numberOfLines={1}
            selectable
          >
            {metric.notes}
          </Text>
        )}
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: category.color,
            fontVariant: ['tabular-nums']
          }}
          selectable
        >
          {formatValue(metric.value, metric.unit)}
        </Text>
        {metric.tags && metric.tags.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {metric.tags.slice(0, 2).map((tag, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: AC.systemGray5 as string,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginLeft: index > 0 ? 4 : 0
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: AC.secondaryLabel as string,
                    fontWeight: '500'
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}