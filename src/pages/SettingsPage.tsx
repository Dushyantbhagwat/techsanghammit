import { useState, useRef } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  SettingsSection,
  SettingsRow,
  ToggleSwitch,
  SliderSetting,
  SelectSetting,
  InputSetting,
  SettingsActions,
  StatusIndicator,
  SettingsIcons
} from "@/components/settings/SettingsComponents";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { toast } from "sonner"; // Commented out for now

export function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { settings, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const { isDarkMode, toggleDarkMode, isAccessibilityMode, toggleAccessibilityMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    userName: user?.userName || '',
    email: user?.email || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        displayName: formData.displayName,
        userName: formData.userName,
        preferences: user?.preferences || { notifications: true }
      });
      setIsEditing(false);
      showStatus('success', 'Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showStatus('error', 'Failed to update profile');
    }
  };

  const showStatus = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleExportSettings = () => {
    try {
      const settingsData = exportSettings();
      const blob = new Blob([settingsData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus('success', 'Settings exported successfully');
    } catch (error) {
      showStatus('error', 'Failed to export settings');
    }
  };

  const handleImportSettings = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const success = importSettings(content);
          if (success) {
            showStatus('success', 'Settings imported successfully');
          } else {
            showStatus('error', 'Invalid settings file format');
          }
        } catch (error) {
          showStatus('error', 'Failed to import settings');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'GMT' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
    { value: 'Asia/Kolkata', label: 'India Standard Time' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'hi', label: 'Hindi' },
    { value: 'zh', label: 'Chinese' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        {statusMessage && (
          <StatusIndicator status={statusMessage.type} message={statusMessage.message} />
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileImport}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Profile Settings */}
      <SettingsSection
        title="Profile Settings"
        description="Manage your personal information and account details"
        icon={<SettingsIcons.Settings className="h-5 w-5" />}
        actions={
          <SettingsActions
            onSave={isEditing ? handleSubmit : undefined}
            onReset={() => {
              setFormData({
                displayName: user?.displayName || '',
                userName: user?.userName || '',
                email: user?.email || ''
              });
              setIsEditing(false);
            }}
            showSave={isEditing}
            showReset={isEditing}
            showExport={false}
            showImport={false}
          />
        }
      >
        <form onSubmit={handleSubmit}>
          <SettingsRow label="Display Name" description="Your public display name">
            <InputSetting
              value={formData.displayName}
              onValueChange={(value) => setFormData(prev => ({ ...prev, displayName: value }))}
              disabled={!isEditing}
              placeholder="Enter display name"
            />
          </SettingsRow>

          <SettingsRow label="Username" description="Your unique username">
            <InputSetting
              value={formData.userName}
              onValueChange={(value) => setFormData(prev => ({ ...prev, userName: value }))}
              disabled={!isEditing}
              placeholder="Enter username"
            />
          </SettingsRow>

          <SettingsRow label="Email" description="Your email address">
            <InputSetting
              value={formData.email}
              onValueChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              disabled={true}
              placeholder="Email address"
            />
          </SettingsRow>

          <div className="pt-4">
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: user?.displayName || '',
                      userName: user?.userName || '',
                      email: user?.email || ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </form>
      </SettingsSection>

      {/* Display & Theme Settings */}
      <SettingsSection
        title="Display & Theme"
        description="Customize the appearance and visual preferences"
        icon={<SettingsIcons.Palette className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('display')}
            showSave={false}
            showExport={false}
            showImport={false}
          />
        }
      >
        <SettingsRow
          label="Dark Mode"
          description="Switch between light and dark themes"
        >
          <ToggleSwitch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
          />
        </SettingsRow>

        <SettingsRow
          label="High Contrast Mode"
          description="Enable high contrast for better accessibility"
          badge={isAccessibilityMode ? "Active" : undefined}
        >
          <ToggleSwitch
            checked={isAccessibilityMode}
            onCheckedChange={toggleAccessibilityMode}
          />
        </SettingsRow>

        <SettingsRow label="Language" description="Select your preferred language">
          <SelectSetting
            value={settings.display.language}
            onValueChange={(value) => updateSettings('display', { language: value })}
            options={languages}
          />
        </SettingsRow>

        <SettingsRow label="Timezone" description="Set your local timezone">
          <SelectSetting
            value={settings.display.timezone}
            onValueChange={(value) => updateSettings('display', { timezone: value })}
            options={timezones}
          />
        </SettingsRow>

        <SettingsRow label="Date Format" description="Choose how dates are displayed">
          <SelectSetting
            value={settings.display.dateFormat}
            onValueChange={(value) => updateSettings('display', { dateFormat: value as any })}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />
        </SettingsRow>

        <SettingsRow label="Time Format" description="Choose 12-hour or 24-hour format">
          <SelectSetting
            value={settings.display.timeFormat}
            onValueChange={(value) => updateSettings('display', { timeFormat: value as any })}
            options={[
              { value: '12h', label: '12 Hour' },
              { value: '24h', label: '24 Hour' },
            ]}
          />
        </SettingsRow>

        <SettingsRow label="Font Size" description="Adjust text size for better readability">
          <SelectSetting
            value={settings.display.fontSize}
            onValueChange={(value) => updateSettings('display', { fontSize: value as any })}
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          label="Reduced Motion"
          description="Minimize animations and transitions"
        >
          <ToggleSwitch
            checked={settings.display.reducedMotion}
            onCheckedChange={(checked) => updateSettings('display', { reducedMotion: checked })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Notification Settings */}
      <SettingsSection
        title="Notifications"
        description="Configure alert and notification preferences"
        icon={<SettingsIcons.Bell className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('notifications')}
            showSave={false}
            showExport={false}
            showImport={false}
          />
        }
      >
        <SettingsRow
          label="Alert Notifications"
          description="Receive notifications for system alerts"
        >
          <ToggleSwitch
            checked={settings.notifications.alerts}
            onCheckedChange={(checked) => updateSettings('notifications', { alerts: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Traffic Alerts"
          description="Get notified about traffic conditions"
        >
          <ToggleSwitch
            checked={settings.notifications.traffic}
            onCheckedChange={(checked) => updateSettings('notifications', { traffic: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Environmental Alerts"
          description="Receive air quality and environmental updates"
        >
          <ToggleSwitch
            checked={settings.notifications.environmental}
            onCheckedChange={(checked) => updateSettings('notifications', { environmental: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Security Alerts"
          description="Get notified about security incidents"
        >
          <ToggleSwitch
            checked={settings.notifications.security}
            onCheckedChange={(checked) => updateSettings('notifications', { security: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Parking Notifications"
          description="Receive parking availability updates"
        >
          <ToggleSwitch
            checked={settings.notifications.parking}
            onCheckedChange={(checked) => updateSettings('notifications', { parking: checked })}
          />
        </SettingsRow>

        <Separator className="my-4" />

        <SettingsRow
          label="Email Notifications"
          description="Send notifications to your email"
        >
          <ToggleSwitch
            checked={settings.notifications.email}
            onCheckedChange={(checked) => updateSettings('notifications', { email: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Push Notifications"
          description="Show browser push notifications"
        >
          <ToggleSwitch
            checked={settings.notifications.push}
            onCheckedChange={(checked) => updateSettings('notifications', { push: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Sound Notifications"
          description="Play sound for important alerts"
        >
          <ToggleSwitch
            checked={settings.notifications.sound}
            onCheckedChange={(checked) => updateSettings('notifications', { sound: checked })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Dashboard Settings */}
      <SettingsSection
        title="Dashboard"
        description="Customize your dashboard experience"
        icon={<SettingsIcons.Monitor className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('dashboard')}
            showSave={false}
            showExport={false}
            showImport={false}
          />
        }
      >
        <SettingsRow label="Default View" description="Choose your preferred dashboard layout">
          <SelectSetting
            value={settings.dashboard.defaultView}
            onValueChange={(value) => updateSettings('dashboard', { defaultView: value as any })}
            options={[
              { value: 'grid', label: 'Grid View' },
              { value: 'list', label: 'List View' },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          label="Auto Refresh"
          description="Automatically refresh dashboard data"
        >
          <ToggleSwitch
            checked={settings.dashboard.autoRefresh}
            onCheckedChange={(checked) => updateSettings('dashboard', { autoRefresh: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Refresh Interval"
          description="How often to refresh data (seconds)"
        >
          <SliderSetting
            value={settings.dashboard.refreshInterval}
            onValueChange={(value) => updateSettings('dashboard', { refreshInterval: value })}
            min={10}
            max={300}
            step={10}
            unit="s"
            disabled={!settings.dashboard.autoRefresh}
          />
        </SettingsRow>

        <SettingsRow
          label="Welcome Message"
          description="Show welcome message on dashboard"
        >
          <ToggleSwitch
            checked={settings.dashboard.showWelcomeMessage}
            onCheckedChange={(checked) => updateSettings('dashboard', { showWelcomeMessage: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Compact Mode"
          description="Use compact layout to show more information"
        >
          <ToggleSwitch
            checked={settings.dashboard.compactMode}
            onCheckedChange={(checked) => updateSettings('dashboard', { compactMode: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Show Tooltips"
          description="Display helpful tooltips on hover"
        >
          <ToggleSwitch
            checked={settings.dashboard.showTooltips}
            onCheckedChange={(checked) => updateSettings('dashboard', { showTooltips: checked })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Alert Settings */}
      <SettingsSection
        title="Alert Management"
        description="Configure how alerts are handled and displayed"
        icon={<SettingsIcons.AlertTriangle className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('alerts')}
            showSave={false}
            showExport={false}
            showImport={false}
          />
        }
      >
        <SettingsRow
          label="Auto Acknowledge"
          description="Automatically acknowledge alerts after a delay"
        >
          <ToggleSwitch
            checked={settings.alerts.autoAcknowledge}
            onCheckedChange={(checked) => updateSettings('alerts', { autoAcknowledge: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Auto Acknowledge Delay"
          description="Minutes before auto-acknowledging alerts"
        >
          <SliderSetting
            value={settings.alerts.autoAcknowledgeDelay}
            onValueChange={(value) => updateSettings('alerts', { autoAcknowledgeDelay: value })}
            min={1}
            max={60}
            step={1}
            unit=" min"
            disabled={!settings.alerts.autoAcknowledge}
          />
        </SettingsRow>

        <SettingsRow
          label="Sound Alerts"
          description="Play sound for new alerts"
        >
          <ToggleSwitch
            checked={settings.alerts.soundEnabled}
            onCheckedChange={(checked) => updateSettings('alerts', { soundEnabled: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Sound Volume"
          description="Alert sound volume level"
        >
          <SliderSetting
            value={settings.alerts.soundVolume}
            onValueChange={(value) => updateSettings('alerts', { soundVolume: value })}
            min={0}
            max={100}
            step={5}
            unit="%"
            disabled={!settings.alerts.soundEnabled}
          />
        </SettingsRow>

        <SettingsRow label="Priority Filter" description="Show alerts of selected priority and above">
          <SelectSetting
            value={settings.alerts.priorityFilter}
            onValueChange={(value) => updateSettings('alerts', { priorityFilter: value as any })}
            options={[
              { value: 'all', label: 'All Alerts' },
              { value: 'high', label: 'High Priority' },
              { value: 'critical', label: 'Critical Only' },
            ]}
          />
        </SettingsRow>

        <SettingsRow
          label="Group Similar Alerts"
          description="Combine similar alerts to reduce clutter"
        >
          <ToggleSwitch
            checked={settings.alerts.groupSimilar}
            onCheckedChange={(checked) => updateSettings('alerts', { groupSimilar: checked })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* Privacy Settings */}
      <SettingsSection
        title="Privacy & Security"
        description="Manage your privacy preferences and data sharing"
        icon={<SettingsIcons.Shield className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('privacy')}
            showSave={false}
            showExport={false}
            showImport={false}
          />
        }
      >
        <SettingsRow
          label="Share Analytics"
          description="Help improve the app by sharing usage analytics"
        >
          <ToggleSwitch
            checked={settings.privacy.shareAnalytics}
            onCheckedChange={(checked) => updateSettings('privacy', { shareAnalytics: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Share Location"
          description="Allow location-based features and services"
        >
          <ToggleSwitch
            checked={settings.privacy.shareLocation}
            onCheckedChange={(checked) => updateSettings('privacy', { shareLocation: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Cookies"
          description="Enable cookies for enhanced functionality"
        >
          <ToggleSwitch
            checked={settings.privacy.cookiesEnabled}
            onCheckedChange={(checked) => updateSettings('privacy', { cookiesEnabled: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Tracking"
          description="Allow tracking for personalized experience"
          warning={settings.privacy.trackingEnabled}
        >
          <ToggleSwitch
            checked={settings.privacy.trackingEnabled}
            onCheckedChange={(checked) => updateSettings('privacy', { trackingEnabled: checked })}
          />
        </SettingsRow>
      </SettingsSection>

      {/* System Settings */}
      <SettingsSection
        title="System"
        description="Advanced system and performance settings"
        icon={<SettingsIcons.Database className="h-5 w-5" />}
        actions={
          <SettingsActions
            onReset={() => resetSettings('system')}
            onExport={handleExportSettings}
            onImport={handleImportSettings}
            showSave={false}
          />
        }
      >
        <SettingsRow
          label="Auto Save"
          description="Automatically save changes as you make them"
        >
          <ToggleSwitch
            checked={settings.system.autoSave}
            onCheckedChange={(checked) => updateSettings('system', { autoSave: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Auto Save Interval"
          description="How often to auto-save (minutes)"
        >
          <SliderSetting
            value={settings.system.autoSaveInterval}
            onValueChange={(value) => updateSettings('system', { autoSaveInterval: value })}
            min={1}
            max={10}
            step={1}
            unit=" min"
            disabled={!settings.system.autoSave}
          />
        </SettingsRow>

        <SettingsRow
          label="Backup Enabled"
          description="Create automatic backups of your data"
        >
          <ToggleSwitch
            checked={settings.system.backupEnabled}
            onCheckedChange={(checked) => updateSettings('system', { backupEnabled: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Debug Mode"
          description="Enable debug information for troubleshooting"
          badge={settings.system.debugMode ? "Active" : undefined}
          warning={settings.system.debugMode}
        >
          <ToggleSwitch
            checked={settings.system.debugMode}
            onCheckedChange={(checked) => updateSettings('system', { debugMode: checked })}
          />
        </SettingsRow>

        <SettingsRow
          label="Performance Mode"
          description="Optimize for better performance on slower devices"
        >
          <ToggleSwitch
            checked={settings.system.performanceMode}
            onCheckedChange={(checked) => updateSettings('system', { performanceMode: checked })}
          />
        </SettingsRow>

        <Separator className="my-4" />

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={() => resetSettings()}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <SettingsIcons.RotateCcw className="h-4 w-4" />
            Reset All Settings
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleExportSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SettingsIcons.Download className="h-4 w-4" />
              Export Settings
            </Button>

            <Button
              onClick={handleImportSettings}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SettingsIcons.Upload className="h-4 w-4" />
              Import Settings
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}