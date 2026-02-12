import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { Stack } from 'expo-router/stack';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import { PerformanceMetric, PerformanceCategory } from '../types/performance';
import { PerformanceStorage } from '../services/storage';
import MetricCard from '../components/metric-card';
import CategoryCard from '../components/category-card';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [categories, setCategories] = useState<PerformanceCategory[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [metricsData, categoriesData] = await Promise.all([
        PerformanceStorage.getMetrics(),
        PerformanceStorage.getCategories()
      ]);
      setMetrics(metricsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRecentMetrics = () => {
    return metrics
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getCategoryStats = () => {
    return categories.map(category => {
      const categoryMetrics = metrics.filter(m => m.category.id === category.id);
      const average = categoryMetrics.length > 0
        ? categoryMetrics.reduce((sum, m) => sum + m.value, 0) / categoryMetrics.length
        : 0;

      return {
        category,
        count: categoryMetrics.length,
        average: average > 0 ? average : undefined
      };
    });
  };

  const getTodaysMetrics = () => {
    const today = new Date().toISOString().split('T')[0];
    return metrics.filter(m => m.date.startsWith(today));
  };

  const recentMetrics = getRecentMetrics();
  const categoryStats = getCategoryStats();
  const todaysMetrics = getTodaysMetrics();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Performance Tracker',
          headerLargeTitle: true,
          headerSearchBarOptions: {
            placeholder: 'Search metrics...',
          }
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: AC.systemBackground as string }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Summary */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: AC.label as string,
              marginBottom: 16
            }}
          >
            Today's Activity
          </Text>

          <View
            style={{
              backgroundColor: AC.secondarySystemGroupedBackground as string,
              borderRadius: 16,
              borderCurve: 'continuous',
              padding: 20,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {process.env.EXPO_OS === 'ios' ? (
                <Image
                  source="sf:calendar.badge.plus"
                  style={{ fontSize: 20, color: AC.systemBlue, marginRight: 8 }}
                />
              ) : (
                <Text style={{ fontSize: 20, marginRight: 8 }}>📅</Text>
              )}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: AC.label as string
                }}
              >
                {todaysMetrics.length} {todaysMetrics.length === 1 ? 'Entry' : 'Entries'}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: AC.secondaryLabel as string
              }}
              selectable
            >
              {todaysMetrics.length === 0
                ? "No entries today. Tap below to log your first performance metric!"
                : `Great job! You've logged ${todaysMetrics.length} performance metric${todaysMetrics.length === 1 ? '' : 's'} today.`}
            </Text>
          </View>

          {/* Categories Overview */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: AC.label as string,
              marginBottom: 16
            }}
          >
            Categories
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {categoryStats.map(({ category, count, average }) => (
              <CategoryCard
                key={category.id}
                category={category}
                metricCount={count}
                averageValue={average}
              />
            ))}
          </ScrollView>

          {/* Recent Activity */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: AC.label as string
              }}
            >
              Recent Activity
            </Text>

            {recentMetrics.length > 0 && (
              <Pressable>
                <Text
                  style={{
                    fontSize: 16,
                    color: AC.systemBlue as string,
                    fontWeight: '600'
                  }}
                >
                  View All
                </Text>
              </Pressable>
            )}
          </View>

          {recentMetrics.length === 0 ? (
            <View
              style={{
                backgroundColor: AC.secondarySystemGroupedBackground as string,
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 40,
                alignItems: 'center',
                marginBottom: 20
              }}
            >
              {process.env.EXPO_OS === 'ios' ? (
                <Image
                  source="sf:chart.line.uptrend.xyaxis"
                  style={{ fontSize: 48, color: AC.systemGray, marginBottom: 16 }}
                />
              ) : (
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📈</Text>
              )}

              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: AC.label as string,
                  textAlign: 'center',
                  marginBottom: 8
                }}
              >
                No Metrics Yet
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: AC.secondaryLabel as string,
                  textAlign: 'center',
                  lineHeight: 20
                }}
                selectable
              >
                Start tracking your performance by adding your first metric. Tap the "Add" tab to get started!
              </Text>
            </View>
          ) : (
            <View>
              {recentMetrics.map(metric => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  category={metric.category}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
