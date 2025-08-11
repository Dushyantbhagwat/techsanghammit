import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface SynchronizationStatusProps {
  className?: string;
}

export const SynchronizationStatus: React.FC<SynchronizationStatusProps> = ({ className = '' }) => {
  const [lastSync, setLastSync] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'error'>('connected');

  useEffect(() => {
    // Simulate sync status updates
    const interval = setInterval(() => {
      setLastSync(new Date().toLocaleTimeString());
      setSyncStatus('connected');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'connected':
        return 'Synchronized';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Synchronized';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'syncing':
        return 'text-blue-600 dark:text-blue-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  return (
    <Card className={`${className} bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          System Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          {lastSync && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {lastSync}
            </span>
          )}
        </div>

        {/* Sync Components */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Camera Feed</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live detection active</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enhanced Grid</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Event-driven updates</p>
          </div>
        </div>

        {/* Update Strategy */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Optimized Update Strategy:
          </h4>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span><strong>Live Feed:</strong> Continuous 2-second polling</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <span><strong>Enhanced Grid:</strong> Event-driven updates only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
              <span><strong>Detection Events:</strong> Instant synchronization</span>
            </div>
          </div>
        </div>

        {/* Performance Benefits */}
        <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Performance Benefits:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-700 dark:text-gray-300">
              • Reduced server load
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              • Instant updates
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              • Better responsiveness
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              • Lower bandwidth usage
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
