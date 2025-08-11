import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Settings interface definitions
export interface NotificationSettings {
  alerts: boolean;
  traffic: boolean;
  environmental: boolean;
  security: boolean;
  parking: boolean;
  email: boolean;
  push: boolean;
  sound: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface DashboardSettings {
  defaultView: 'grid' | 'list';
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  showWelcomeMessage: boolean;
  compactMode: boolean;
  showTooltips: boolean;
}

export interface AlertSettings {
  autoAcknowledge: boolean;
  autoAcknowledgeDelay: number; // in minutes
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  priorityFilter: 'all' | 'high' | 'critical';
  groupSimilar: boolean;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  shareLocation: boolean;
  cookiesEnabled: boolean;
  trackingEnabled: boolean;
}

export interface SystemSettings {
  autoSave: boolean;
  autoSaveInterval: number; // in minutes
  backupEnabled: boolean;
  debugMode: boolean;
  performanceMode: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  display: DisplaySettings;
  dashboard: DashboardSettings;
  alerts: AlertSettings;
  privacy: PrivacySettings;
  system: SystemSettings;
}

// Default settings
const defaultSettings: AppSettings = {
  notifications: {
    alerts: true,
    traffic: true,
    environmental: true,
    security: true,
    parking: true,
    email: false,
    push: true,
    sound: true,
  },
  display: {
    theme: 'dark',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
  },
  dashboard: {
    defaultView: 'grid',
    autoRefresh: true,
    refreshInterval: 30,
    showWelcomeMessage: true,
    compactMode: false,
    showTooltips: true,
  },
  alerts: {
    autoAcknowledge: false,
    autoAcknowledgeDelay: 5,
    soundEnabled: true,
    soundVolume: 70,
    priorityFilter: 'all',
    groupSimilar: true,
  },
  privacy: {
    shareAnalytics: false,
    shareLocation: true,
    cookiesEnabled: true,
    trackingEnabled: false,
  },
  system: {
    autoSave: true,
    autoSaveInterval: 2,
    backupEnabled: true,
    debugMode: false,
    performanceMode: false,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (category: keyof AppSettings, newSettings: Partial<AppSettings[keyof AppSettings]>) => void;
  resetSettings: (category?: keyof AppSettings) => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to ensure all properties exist
        setSettings(prev => ({
          ...prev,
          ...parsed,
          // Ensure nested objects are properly merged
          notifications: { ...prev.notifications, ...parsed.notifications },
          display: { ...prev.display, ...parsed.display },
          dashboard: { ...prev.dashboard, ...parsed.dashboard },
          alerts: { ...prev.alerts, ...parsed.alerts },
          privacy: { ...prev.privacy, ...parsed.privacy },
          system: { ...prev.system, ...parsed.system },
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('appSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoading]);

  const updateSettings = (category: keyof AppSettings, newSettings: Partial<AppSettings[keyof AppSettings]>) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...newSettings,
      },
    }));
  };

  const resetSettings = (category?: keyof AppSettings) => {
    if (category) {
      setSettings(prev => ({
        ...prev,
        [category]: defaultSettings[category],
      }));
    } else {
      setSettings(defaultSettings);
    }
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);
      // Validate the structure (basic validation)
      if (imported && typeof imported === 'object') {
        setSettings(prev => ({
          ...prev,
          ...imported,
          notifications: { ...prev.notifications, ...imported.notifications },
          display: { ...prev.display, ...imported.display },
          dashboard: { ...prev.dashboard, ...imported.dashboard },
          alerts: { ...prev.alerts, ...imported.alerts },
          privacy: { ...prev.privacy, ...imported.privacy },
          system: { ...prev.system, ...imported.system },
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  };

  const value = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
