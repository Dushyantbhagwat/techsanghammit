import React from 'react';
import { Bell, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ParkingHeaderProps {
  selectedFloor: string;
  onFloorSelect: (floor: string) => void;
  totalSpots: number;
  occupiedSpots: number;
  onReportProblem: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  notificationCount?: number;
}

const FLOORS = ['B1', 'B2', 'B3', 'B4', 'B5'];

export const ParkingHeader: React.FC<ParkingHeaderProps> = ({
  selectedFloor,
  onFloorSelect,
  totalSpots,
  occupiedSpots,
  onReportProblem,
  onRefresh,
  isLoading = false,
  notificationCount = 4
}) => {
  const availableSpots = totalSpots - occupiedSpots;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between">
        {/* Left Section: Floor Selection */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Floor</span>
            <div className="flex gap-1">
              {FLOORS.map((floor) => (
                <button
                  key={floor}
                  onClick={() => onFloorSelect(floor)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    selectedFloor === floor
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Section: Statistics */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSpots}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {occupiedSpots}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Filled</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {availableSpots}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Empty</div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Search Icon */}
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Report Problem Button */}
          <Button
            onClick={onReportProblem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Report Problem
          </Button>
        </div>
      </div>

      {/* Occupancy Rate Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round((occupiedSpots / totalSpots) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              occupiedSpots / totalSpots < 0.5 ? "bg-green-500" :
              occupiedSpots / totalSpots < 0.8 ? "bg-yellow-500" : "bg-red-500"
            )}
            style={{ width: `${(occupiedSpots / totalSpots) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
