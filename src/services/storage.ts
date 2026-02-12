import AsyncStorage from '@react-native-async-storage/async-storage';
import { PerformanceMetric, PerformanceGoal, PerformanceCategory, AppSettings, DEFAULT_CATEGORIES } from '../types/performance';

const STORAGE_KEYS = {
  METRICS: 'performance_metrics',
  GOALS: 'performance_goals',
  CATEGORIES: 'performance_categories',
  SETTINGS: 'app_settings'
};

export class PerformanceStorage {
  // Metrics
  static async getMetrics(): Promise<PerformanceMetric[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.METRICS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading metrics:', error);
      return [];
    }
  }

  static async saveMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      const existingIndex = metrics.findIndex(m => m.id === metric.id);

      if (existingIndex >= 0) {
        metrics[existingIndex] = metric;
      } else {
        metrics.push(metric);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error saving metric:', error);
      throw error;
    }
  }

  static async deleteMetric(id: string): Promise<void> {
    try {
      const metrics = await this.getMetrics();
      const filtered = metrics.filter(m => m.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }

  // Goals
  static async getGoals(): Promise<PerformanceGoal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading goals:', error);
      return [];
    }
  }

  static async saveGoal(goal: PerformanceGoal): Promise<void> {
    try {
      const goals = await this.getGoals();
      const existingIndex = goals.findIndex(g => g.id === goal.id);

      if (existingIndex >= 0) {
        goals[existingIndex] = goal;
      } else {
        goals.push(goal);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filtered = goals.filter(g => g.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // Categories
  static async getCategories(): Promise<PerformanceCategory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      } else {
        // Initialize with default categories
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  }

  static async saveCategory(category: PerformanceCategory): Promise<void> {
    try {
      const categories = await this.getCategories();
      const existingIndex = categories.findIndex(c => c.id === category.id);

      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving category:', error);
      throw error;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      } else {
        const defaultSettings: AppSettings = {
          theme: 'system',
          defaultView: 'dashboard',
          hapticFeedback: true,
          notifications: true,
          dataRetention: 365
        };
        await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
        return defaultSettings;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        theme: 'system',
        defaultView: 'dashboard',
        hapticFeedback: true,
        notifications: true,
        dataRetention: 365
      };
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Utility functions
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  static async exportData(): Promise<string> {
    try {
      const [metrics, goals, categories, settings] = await Promise.all([
        this.getMetrics(),
        this.getGoals(),
        this.getCategories(),
        this.getSettings()
      ]);

      return JSON.stringify({
        metrics,
        goals,
        categories,
        settings,
        exportDate: new Date().toISOString()
      }, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}