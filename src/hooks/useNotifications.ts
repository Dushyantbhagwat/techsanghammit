import { useSettings } from '@/contexts/SettingsContext';
import { useCallback } from 'react';

export interface NotificationOptions {
  title: string;
  message: string;
  type: 'alert' | 'traffic' | 'environmental' | 'security' | 'parking';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sound?: boolean;
}

export function useNotifications() {
  const { settings } = useSettings();

  const showNotification = useCallback((options: NotificationOptions) => {
    const { title, message, type, priority = 'medium', sound = false } = options;

    // Check if notifications are enabled for this type
    const notificationSettings = settings.notifications;
    
    if (!notificationSettings[type]) {
      return; // Notifications disabled for this type
    }

    // Check if push notifications are enabled
    if (notificationSettings.push) {
      // Show browser notification if supported and permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: `${type}-${Date.now()}`,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    }

    // Play sound if enabled
    if ((sound || notificationSettings.sound) && settings.alerts.soundEnabled) {
      playNotificationSound();
    }

    // Show in-app notification (you could integrate with a toast library here)
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    
    // You could also dispatch to a global notification state here
    // or integrate with libraries like react-hot-toast, sonner, etc.
    
  }, [settings]);

  const playNotificationSound = useCallback(() => {
    if (!settings.alerts.soundEnabled) return;

    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      // Set volume based on settings
      gainNode.gain.setValueAtTime(settings.alerts.soundVolume / 100, audioContext.currentTime);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2); // Play for 200ms
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [settings.alerts.soundEnabled, settings.alerts.soundVolume]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  const isNotificationSupported = 'Notification' in window;
  const notificationPermission = isNotificationSupported ? Notification.permission : 'denied';

  return {
    showNotification,
    playNotificationSound,
    requestNotificationPermission,
    isNotificationSupported,
    notificationPermission,
    settings: settings.notifications,
  };
}
