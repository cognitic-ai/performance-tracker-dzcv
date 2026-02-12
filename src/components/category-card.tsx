import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import { PerformanceCategory } from '../types/performance';

interface CategoryCardProps {
  category: PerformanceCategory;
  metricCount?: number;
  averageValue?: number;
  onPress?: () => void;
}

export default function CategoryCard({
  category,
  metricCount = 0,
  averageValue,
  onPress
}: CategoryCardProps) {
  const formatAverage = (value: number) => {
    if (category.unit === '$') {
      return `$${value.toFixed(2)}`;
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: AC.secondarySystemGroupedBackground as string,
        borderRadius: 16,
        borderCurve: 'continuous',
        padding: 20,
        margin: 8,
        minHeight: 140,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flex: 1,
        minWidth: 160
      }}
    >
      <View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: category.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}
        >
          {process.env.EXPO_OS === 'ios' ? (
            <Image
              source={`sf:${category.icon}`}
              style={{ fontSize: 24, color: category.color }}
            />
          ) : (
            <Text style={{ fontSize: 24 }}>📊</Text>
          )}
        </View>

        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: AC.label as string,
            marginBottom: 4
          }}
          selectable
        >
          {category.name}
        </Text>

        <Text
          style={{
            fontSize: 13,
            color: AC.secondaryLabel as string,
            lineHeight: 18
          }}
          numberOfLines={2}
          selectable
        >
          {category.description}
        </Text>
      </View>

      <View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 12,
              color: AC.tertiaryLabel as string,
              fontWeight: '600'
            }}
          >
            ENTRIES
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: category.color,
              fontVariant: ['tabular-nums']
            }}
            selectable
          >
            {metricCount}
          </Text>
        </View>

        {averageValue !== undefined && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4
          }}>
            <Text
              style={{
                fontSize: 12,
                color: AC.tertiaryLabel as string,
                fontWeight: '600'
              }}
            >
              AVERAGE
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: AC.label as string,
                fontVariant: ['tabular-nums']
              }}
              selectable
            >
              {formatAverage(averageValue)} {category.unit}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}