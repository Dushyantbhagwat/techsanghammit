import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function SettingsTest() {
  const { settings } = useSettings();
  const { showNotification, requestNotificationPermission } = useNotifications();

  const testNotification = () => {
    showNotification({
      title: 'Settings Test',
      message: 'This is a test notification to verify settings are working!',
      type: 'alert',
      priority: 'medium',
      sound: true,
    });
  };

  const testPermissions = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      showNotification({
        title: 'Permission Granted',
        message: 'Browser notifications are now enabled!',
        type: 'alert',
        priority: 'low',
      });
    }
  };

  return (
    <Card className="p-6 m-4 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Settings Test Panel</h3>
      
      <div className="space-y-4">
        <div className="text-sm">
          <p><strong>Theme:</strong> {settings.display.theme}</p>
          <p><strong>Language:</strong> {settings.display.language}</p>
          <p><strong>Notifications:</strong> {settings.notifications.alerts ? 'Enabled' : 'Disabled'}</p>
          <p><strong>Sound:</strong> {settings.notifications.sound ? 'Enabled' : 'Disabled'}</p>
        </div>
        
        <div className="space-y-2">
          <Button onClick={testNotification} className="w-full">
            Test Notification
          </Button>
          
          <Button onClick={testPermissions} variant="outline" className="w-full">
            Request Notification Permission
          </Button>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>This panel demonstrates that settings are working correctly.</p>
          <p>Check the browser console for notification logs.</p>
        </div>
      </div>
    </Card>
  );
}
