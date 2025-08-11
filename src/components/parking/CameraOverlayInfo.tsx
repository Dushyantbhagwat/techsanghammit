import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CameraOverlayInfoProps {
  className?: string;
}

export const CameraOverlayInfo: React.FC<CameraOverlayInfoProps> = ({ className = '' }) => {
  return (
    <Card className={`${className} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800 dark:text-blue-200">
          🎯 Enhanced Camera Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-2">Camera Overlay Features:</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Section A:</strong> Left side parking spots (A1-A5)</li>
            <li>• <strong>Section B:</strong> Right side parking spots (A6-A10)</li>
            <li>• <strong>Real-time Detection:</strong> Cars automatically detected and mapped</li>
            <li>• <strong>Visual Indicators:</strong> Red = Occupied, Green = Available</li>
            <li>• <strong>Spot Labels:</strong> Each spot clearly marked with ID</li>
          </ul>
        </div>
        
        <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            💡 The camera feed now shows the same 10-spot layout as the Enhanced Parking Grid
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Synchronized Detection System:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Live Camera Feed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Enhanced Grid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Event-Driven Updates</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Spot Mapping</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded p-2">
          <strong>How it works:</strong> When a car is detected in the camera feed, it's automatically mapped to the correct parking spot and instantly updates both the camera overlay and the Enhanced Parking Grid tab.
        </div>
      </CardContent>
    </Card>
  );
};
