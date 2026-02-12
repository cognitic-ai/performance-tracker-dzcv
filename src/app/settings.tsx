import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, Switch, Alert } from 'react-native';
import { Stack } from 'expo-router/stack';
import { Image } from 'expo-image';
import * as AC from '@bacons/apple-colors';
import * as Haptics from 'expo-haptics';
import { AppSettings } from '../types/performance';
import { PerformanceStorage } from '../services/storage';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    defaultView: 'dashboard',
    hapticFeedback: true,
    notifications: true,
    dataRetention: 365
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const savedSettings = await PerformanceStorage.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await PerformanceStorage.saveSettings(newSettings);
      setSettings(newSettings);
      if (newSettings.hapticFeedback) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const exportData = async () => {
    try {
      const data = await PerformanceStorage.exportData();
      Alert.alert(
        'Export Data',
        'Your data has been exported to the console. In a real app, this would save to a file or share via the system share sheet.',
        [{ text: 'OK' }]
      );
      console.log('Exported data:', data);
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your performance metrics, goals, and custom categories. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await PerformanceStorage.clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: AC.label as string,
          marginBottom: 16
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: AC.secondarySystemGroupedBackground as string,
          borderRadius: 16,
          borderCurve: 'continuous',
          overflow: 'hidden'
        }}
      >
        {children}
      </View>
    </View>
  );

  const SettingRow = ({
    title,
    subtitle,
    icon,
    rightComponent,
    onPress,
    isLast = false
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    isLast?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: AC.separator as string
      }}
    >
      {process.env.EXPO_OS === 'ios' ? (
        <Image
          source={`sf:${icon}`}
          style={{ fontSize: 20, color: AC.systemBlue, marginRight: 12 }}
        />
      ) : (
        <Text style={{ fontSize: 20, marginRight: 12 }}>⚙️</Text>
      )}

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 17,
            color: AC.label as string,
            fontWeight: '400'
          }}
          selectable
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 13,
              color: AC.secondaryLabel as string,
              marginTop: 2
            }}
            selectable
          >
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent}
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: AC.secondaryLabel as string }}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLargeTitle: true
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: AC.systemBackground as string }}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={{ padding: 16 }}>
          <SettingSection title="Preferences">
            <SettingRow
              title="Theme"
              subtitle={`Current: ${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}`}
              icon="paintpalette"
              rightComponent={
                <Text style={{ color: AC.secondaryLabel as string, fontSize: 17 }}>
                  {settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
                </Text>
              }
              onPress={() => {
                const themes: AppSettings['theme'][] = ['system', 'light', 'dark'];
                const currentIndex = themes.indexOf(settings.theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                saveSettings({ ...settings, theme: nextTheme });
              }}
            />

            <SettingRow
              title="Default View"
              subtitle="Which tab to show when opening the app"
              icon="house"
              rightComponent={
                <Text style={{ color: AC.secondaryLabel as string, fontSize: 17 }}>
                  {settings.defaultView.charAt(0).toUpperCase() + settings.defaultView.slice(1)}
                </Text>
              }
              onPress={() => {
                const views: AppSettings['defaultView'][] = ['dashboard', 'add', 'analytics'];
                const currentIndex = views.indexOf(settings.defaultView);
                const nextView = views[(currentIndex + 1) % views.length];
                saveSettings({ ...settings, defaultView: nextView });
              }}
            />

            <SettingRow
              title="Haptic Feedback"
              subtitle="Vibration feedback for interactions"
              icon="iphone.radiowaves.left.and.right"
              rightComponent={
                <Switch
                  value={settings.hapticFeedback}
                  onValueChange={(value) => saveSettings({ ...settings, hapticFeedback: value })}
                />
              }
            />

            <SettingRow
              title="Notifications"
              subtitle="Reminders and achievement notifications"
              icon="bell"
              rightComponent={
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => saveSettings({ ...settings, notifications: value })}
                />
              }
              isLast
            />
          </SettingSection>

          <SettingSection title="Data Management">
            <SettingRow
              title="Data Retention"
              subtitle={`Keep data for ${settings.dataRetention} days`}
              icon="calendar"
              rightComponent={
                <Text style={{ color: AC.secondaryLabel as string, fontSize: 17 }}>
                  {settings.dataRetention} days
                </Text>
              }
              onPress={() => {
                const retentionOptions = [30, 90, 180, 365, 999];
                const currentIndex = retentionOptions.indexOf(settings.dataRetention);
                const nextRetention = retentionOptions[(currentIndex + 1) % retentionOptions.length];
                saveSettings({ ...settings, dataRetention: nextRetention });
              }}
            />

            <SettingRow
              title="Export Data"
              subtitle="Save all your performance data"
              icon="square.and.arrow.up"
              rightComponent={
                process.env.EXPO_OS === 'ios' ? (
                  <Image
                    source="sf:chevron.right"
                    style={{ fontSize: 14, color: AC.systemGray }}
                  />
                ) : (
                  <Text style={{ color: AC.systemGray as string }}>→</Text>
                )
              }
              onPress={exportData}
            />

            <SettingRow
              title="Clear All Data"
              subtitle="Permanently delete all data"
              icon="trash"
              rightComponent={
                process.env.EXPO_OS === 'ios' ? (
                  <Image
                    source="sf:chevron.right"
                    style={{ fontSize: 14, color: AC.systemRed }}
                  />
                ) : (
                  <Text style={{ color: AC.systemRed as string }}>→</Text>
                )
              }
              onPress={clearAllData}
              isLast
            />
          </SettingSection>

          <SettingSection title="About">
            <SettingRow
              title="Performance Tracker"
              subtitle="Track and improve your performance across different areas of life"
              icon="info.circle"
              isLast
            />
          </SettingSection>
        </View>
      </ScrollView>
    </>
  );
}