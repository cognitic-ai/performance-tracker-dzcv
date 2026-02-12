import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, RefreshControl, Dimensions } from 'react-native';
import { Stack } from 'expo-router/stack';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import { PerformanceMetric, PerformanceCategory, PerformanceAnalytics } from '../types/performance';
import { PerformanceStorage } from '../services/storage';

export default function Analytics() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [categories, setCategories] = useState<PerformanceCategory[]>([]);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const loadData = async () => {
    try {
      const [metricsData, categoriesData] = await Promise.all([
        PerformanceStorage.getMetrics(),
        PerformanceStorage.getCategories()
      ]);

      setMetrics(metricsData);
      setCategories(categoriesData);

      // Generate analytics
      const analyticsData = generateAnalytics(metricsData, categoriesData, selectedPeriod);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateAnalytics = (
    metrics: PerformanceMetric[],
    categories: PerformanceCategory[],
    period: string
  ): PerformanceAnalytics[] => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (period) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        cutoffDate = new Date(0);
        break;
    }

    const filteredMetrics = metrics.filter(m => new Date(m.date) >= cutoffDate);

    return categories.map(category => {
      const categoryMetrics = filteredMetrics.filter(m => m.category.id === category.id);

      if (categoryMetrics.length === 0) {
        return {
          category: category.id,
          totalEntries: 0,
          average: 0,
          best: 0,
          worst: 0,
          trend: 'stable' as const,
          improvement: 0,
          recentEntries: []
        };
      }

      const values = categoryMetrics.map(m => m.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const best = Math.max(...values);
      const worst = Math.min(...values);

      // Calculate trend (simplified - comparing first half vs second half)
      const midpoint = Math.floor(categoryMetrics.length / 2);
      const firstHalf = categoryMetrics.slice(0, midpoint);
      const secondHalf = categoryMetrics.slice(midpoint);

      const firstAvg = firstHalf.length > 0
        ? firstHalf.reduce((sum, m) => sum + m.value, 0) / firstHalf.length
        : 0;
      const secondAvg = secondHalf.length > 0
        ? secondHalf.reduce((sum, m) => sum + m.value, 0) / secondHalf.length
        : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      let improvement = 0;

      if (firstAvg > 0) {
        improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (improvement > 5) trend = 'up';
        else if (improvement < -5) trend = 'down';
      }

      return {
        category: category.id,
        totalEntries: categoryMetrics.length,
        average,
        best,
        worst,
        trend,
        improvement: Math.abs(improvement),
        recentEntries: categoryMetrics
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
      };
    }).filter(analytics => analytics.totalEntries > 0);
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatValue = (value: number, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return value.toString();

    if (category.unit === '$') {
      return `$${value.toFixed(2)}`;
    }
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (process.env.EXPO_OS === 'ios') {
      switch (trend) {
        case 'up': return 'arrow.up.right';
        case 'down': return 'arrow.down.right';
        case 'stable': return 'arrow.right';
      }
    }
    return trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return AC.systemGreen;
      case 'down': return AC.systemRed;
      case 'stable': return AC.systemOrange;
    }
  };

  const getOverallStats = () => {
    const totalEntries = analytics.reduce((sum, a) => sum + a.totalEntries, 0);
    const categoriesTracked = analytics.length;
    const improvingCategories = analytics.filter(a => a.trend === 'up').length;

    return { totalEntries, categoriesTracked, improvingCategories };
  };

  const overallStats = getOverallStats();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Analytics',
          headerLargeTitle: true
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: AC.systemBackground as string }}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ padding: 16 }}>
          {/* Time Period Selector */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: AC.secondarySystemGroupedBackground as string,
              borderRadius: 12,
              borderCurve: 'continuous',
              padding: 4,
              marginBottom: 24
            }}
          >
            {[
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
              { key: '90d', label: '90 Days' },
              { key: 'all', label: 'All Time' }
            ].map(period => (
              <Pressable
                key={period.key}
                onPress={() => setSelectedPeriod(period.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderCurve: 'continuous',
                  backgroundColor: selectedPeriod === period.key
                    ? AC.systemBlue as string
                    : 'transparent',
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedPeriod === period.key
                      ? 'white'
                      : AC.label as string
                  }}
                >
                  {period.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Overall Stats */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: AC.label as string,
              marginBottom: 16
            }}
          >
            Overview
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginBottom: 24,
              gap: 12
            }}
          >
            {[
              { label: 'Total Entries', value: overallStats.totalEntries, icon: 'chart.bar' },
              { label: 'Categories', value: overallStats.categoriesTracked, icon: 'folder' },
              { label: 'Improving', value: overallStats.improvingCategories, icon: 'arrow.up' }
            ].map((stat, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: AC.secondarySystemGroupedBackground as string,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  padding: 16,
                  alignItems: 'center'
                }}
              >
                {process.env.EXPO_OS === 'ios' ? (
                  <Image
                    source={`sf:${stat.icon}`}
                    style={{ fontSize: 20, color: AC.systemBlue, marginBottom: 8 }}
                  />
                ) : (
                  <Text style={{ fontSize: 20, marginBottom: 8 }}>📊</Text>
                )}
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '700',
                    color: AC.label as string,
                    fontVariant: ['tabular-nums'],
                    marginBottom: 4
                  }}
                  selectable
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: AC.secondaryLabel as string,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Category Analytics */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: AC.label as string,
              marginBottom: 16
            }}
          >
            Category Insights
          </Text>

          {analytics.length === 0 ? (
            <View
              style={{
                backgroundColor: AC.secondarySystemGroupedBackground as string,
                borderRadius: 16,
                borderCurve: 'continuous',
                padding: 40,
                alignItems: 'center'
              }}
            >
              {process.env.EXPO_OS === 'ios' ? (
                <Image
                  source="sf:chart.line.downtrend.xyaxis"
                  style={{ fontSize: 48, color: AC.systemGray, marginBottom: 16 }}
                />
              ) : (
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📉</Text>
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
                No Data Available
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
                Add some performance metrics to see insights and analytics for your categories.
              </Text>
            </View>
          ) : (
            <View>
              {analytics.map(analytic => {
                const category = categories.find(c => c.id === analytic.category);
                if (!category) return null;

                return (
                  <View
                    key={analytic.category}
                    style={{
                      backgroundColor: AC.secondarySystemGroupedBackground as string,
                      borderRadius: 16,
                      borderCurve: 'continuous',
                      padding: 20,
                      marginBottom: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
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
                          <Text style={{ fontSize: 20 }}>📊</Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: AC.label as string,
                            marginBottom: 2
                          }}
                          selectable
                        >
                          {category.name}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {process.env.EXPO_OS === 'ios' ? (
                            <Image
                              source={`sf:${getTrendIcon(analytic.trend)}`}
                              style={{
                                fontSize: 14,
                                color: getTrendColor(analytic.trend),
                                marginRight: 6
                              }}
                            />
                          ) : (
                            <Text style={{ marginRight: 6 }}>
                              {getTrendIcon(analytic.trend)}
                            </Text>
                          )}
                          <Text
                            style={{
                              fontSize: 14,
                              color: getTrendColor(analytic.trend) as string,
                              fontWeight: '600'
                            }}
                            selectable
                          >
                            {analytic.improvement > 0
                              ? `${analytic.improvement.toFixed(1)}% ${analytic.trend === 'up' ? 'improvement' : 'decline'}`
                              : 'Stable'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 8
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: AC.tertiaryLabel as string,
                            fontWeight: '600',
                            marginBottom: 4
                          }}
                        >
                          AVERAGE
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: AC.label as string,
                            fontVariant: ['tabular-nums']
                          }}
                          selectable
                        >
                          {formatValue(analytic.average, analytic.category)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: AC.tertiaryLabel as string,
                            fontWeight: '600',
                            marginBottom: 4
                          }}
                        >
                          BEST
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '700',
                            color: AC.systemGreen as string,
                            fontVariant: ['tabular-nums']
                          }}
                          selectable
                        >
                          {formatValue(analytic.best, analytic.category)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: AC.tertiaryLabel as string,
                            fontWeight: '600',
                            marginBottom: 4
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
                          {analytic.totalEntries}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}