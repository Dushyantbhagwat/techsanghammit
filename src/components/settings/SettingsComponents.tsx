import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Palette, 
  Monitor, 
  Shield, 
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  AlertTriangle,
  Info,
  CheckCircle
} from "lucide-react";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function SettingsSection({ title, description, icon, children, actions }: SettingsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
  warning?: boolean;
}

export function SettingsRow({ label, description, children, badge, warning }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Label className="font-medium">{label}</Label>
          {badge && (
            <Badge variant={warning ? "destructive" : "secondary"} className="text-xs">
              {badge}
            </Badge>
          )}
          {warning && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
        </div>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ checked, onCheckedChange, disabled }: ToggleSwitchProps) {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  );
}

interface SliderSettingProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export function SliderSetting({ 
  value, 
  onValueChange, 
  min = 0, 
  max = 100, 
  step = 1, 
  unit = '',
  disabled 
}: SliderSettingProps) {
  return (
    <div className="flex items-center gap-4 min-w-[200px]">
      <Slider
        value={[value]}
        onValueChange={(values) => onValueChange(values[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="flex-1"
      />
      <span className="text-sm font-medium min-w-[60px] text-right">
        {value}{unit}
      </span>
    </div>
  );
}

interface SelectSettingProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectSetting({ 
  value, 
  onValueChange, 
  options, 
  placeholder = "Select...",
  disabled 
}: SelectSettingProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface InputSettingProps {
  value: string;
  onValueChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InputSetting({ 
  value, 
  onValueChange, 
  type = "text", 
  placeholder,
  disabled 
}: InputSettingProps) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-[200px]"
    />
  );
}

interface SettingsActionsProps {
  onSave?: () => void;
  onReset?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  saveDisabled?: boolean;
  resetDisabled?: boolean;
  showSave?: boolean;
  showReset?: boolean;
  showExport?: boolean;
  showImport?: boolean;
}

export function SettingsActions({
  onSave,
  onReset,
  onExport,
  onImport,
  saveDisabled = false,
  resetDisabled = false,
  showSave = true,
  showReset = true,
  showExport = true,
  showImport = true,
}: SettingsActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {showSave && onSave && (
        <Button
          onClick={onSave}
          disabled={saveDisabled}
          size="sm"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
      )}
      {showReset && onReset && (
        <Button
          onClick={onReset}
          disabled={resetDisabled}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      )}
      {showExport && onExport && (
        <Button
          onClick={onExport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      )}
      {showImport && onImport && (
        <Button
          onClick={onImport}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

export function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const icons = {
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <AlertTriangle className="h-4 w-4 text-red-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />,
  };

  const colors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${colors[status]}`}>
      {icons[status]}
      <span>{message}</span>
    </div>
  );
}

// Export icons for use in settings pages
export const SettingsIcons = {
  Settings,
  Bell,
  Palette,
  Monitor,
  Shield,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  AlertTriangle,
  Info,
  CheckCircle,
};
