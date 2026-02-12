export interface PerformanceMetric {
  id: string;
  date: string; // ISO date string
  category: PerformanceCategory;
  value: number;
  unit: string;
  notes?: string;
  tags?: string[];
}

export interface PerformanceGoal {
  id: string;
  category: PerformanceCategory;
  targetValue: number;
  unit: string;
  deadline?: string; // ISO date string
  description: string;
  isActive: boolean;
}

export interface PerformanceCategory {
  id: string;
  name: string;
  icon: string; // SF Symbol name or MaterialIcons name
  color: string;
  unit: string;
  description: string;
  isCustom?: boolean;
}

export interface PerformanceAnalytics {
  category: string;
  totalEntries: number;
  average: number;
  best: number;
  worst: number;
  trend: 'up' | 'down' | 'stable';
  improvement: number; // percentage
  recentEntries: PerformanceMetric[];
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  defaultView: 'dashboard' | 'add' | 'analytics';
  hapticFeedback: boolean;
  notifications: boolean;
  dataRetention: number; // days
}

// Default categories for common performance metrics
export const DEFAULT_CATEGORIES: PerformanceCategory[] = [
  {
    id: 'fitness',
    name: 'Fitness',
    icon: 'figure.run',
    color: '#FF6B6B',
    unit: 'reps/min/lbs',
    description: 'Track workout performance, strength, and endurance'
  },
  {
    id: 'productivity',
    name: 'Productivity',
    icon: 'checkmark.circle',
    color: '#4ECDC4',
    unit: 'tasks/hours',
    description: 'Monitor work efficiency and task completion'
  },
  {
    id: 'learning',
    name: 'Learning',
    icon: 'book',
    color: '#45B7D1',
    unit: 'hours/pages',
    description: 'Track study time and knowledge acquisition'
  },
  {
    id: 'health',
    name: 'Health',
    icon: 'heart',
    color: '#96CEB4',
    unit: 'various',
    description: 'Monitor health metrics like sleep, water intake, etc.'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: 'dollarsign.circle',
    color: '#FFEAA7',
    unit: '$',
    description: 'Track financial goals and spending habits'
  },
  {
    id: 'habits',
    name: 'Habits',
    icon: 'calendar',
    color: '#DDA0DD',
    unit: 'streak/count',
    description: 'Monitor daily habits and consistency'
  }
];