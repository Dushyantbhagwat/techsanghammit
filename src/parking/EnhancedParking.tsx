import React, { useState, useEffect, useCallback } from 'react';
import { PARKING_SPOTS, ENHANCED_PARKING_FLOORS, getFloorSpots, mapLegacyToEnhanced } from './constants';
import { ParkingHeader } from '@/components/parking/ParkingHeader';
import { EnhancedParkingGrid } from '@/components/parking/EnhancedParkingGrid';
import { SynchronizationStatus } from '@/components/parking/SynchronizationStatus';
import { parkingEventService, ParkingEvent, ParkingStatusResponse } from '@/services/parkingEventService';

const EnhancedParking: React.FC = () => {
  const [occupiedSpots, setOccupiedSpots] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>('B1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Handle parking events
  const handleParkingEvents = useCallback((events: ParkingEvent[]) => {
    console.log('Parking events received:', events);

    events.forEach(event => {
      const message = event.event === 'car_parked'
        ? `Car parked in spot ${event.spot_id}`
        : `Car left spot ${event.spot_id}`;

      console.log(`${message} at ${event.timestamp}`);
    });

    setLastUpdate(new Date().toLocaleTimeString());
  }, []);

  // Handle parking status updates
  const handleParkingStatus = useCallback((status: ParkingStatusResponse) => {
    // Map legacy spot IDs to enhanced format if needed
    const enhancedOccupiedSpots = status.occupied_spots.map((spotId: string) =>
      mapLegacyToEnhanced(spotId)
    );

    setOccupiedSpots(enhancedOccupiedSpots);
    setError(null);
    setIsLoading(false);
  }, []);

  // Initialize parking status and set up event listeners
  useEffect(() => {
    const initializeParkingStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get initial parking status
        const initialStatus = await parkingEventService.getInitialParkingStatus();
        handleParkingStatus(initialStatus);

      } catch (error) {
        console.error("Error fetching initial parking status:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch parking status');
        setIsLoading(false);
      }
    };

    // Initialize
    initializeParkingStatus();

    // Subscribe to parking events for real-time updates
    const unsubscribeEvents = parkingEventService.onParkingEvents(handleParkingEvents);
    const unsubscribeStatus = parkingEventService.onParkingStatus(handleParkingStatus);

    // Cleanup on unmount
    return () => {
      unsubscribeEvents();
      unsubscribeStatus();
    };
  }, [handleParkingEvents, handleParkingStatus]);

  // Get current floor data
  const currentFloorData = ENHANCED_PARKING_FLOORS.find(floor => floor.id === selectedFloor);
  const currentFloorSpots = getFloorSpots(selectedFloor);
  const totalSpots = currentFloorData?.totalSpots || 10;
  
  // Calculate occupied spots for current floor
  const currentFloorOccupiedSpots = occupiedSpots.filter(spotId => 
    currentFloorSpots.some(spot => spot.id === spotId)
  );

  const handleFloorSelect = (floor: string) => {
    setSelectedFloor(floor);
  };

  const handleReportProblem = () => {
    // TODO: Implement report problem functionality
    alert('Report Problem feature will be implemented soon!');
  };

  const handleManualRefresh = async () => {
    try {
      setIsLoading(true);
      await parkingEventService.refreshParkingStatus();
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Error refreshing parking status:", error);
      setError(error instanceof Error ? error.message : 'Failed to refresh parking status');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Connection Error
          </h3>
          <p className="text-red-600 dark:text-red-300">
            Unable to connect to parking detection system: {error}
          </p>
          <p className="text-sm text-red-500 dark:text-red-400 mt-2">
            Please ensure the Python server is running on http://127.0.0.1:5002
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with floor selection and statistics */}
      <ParkingHeader
        selectedFloor={selectedFloor}
        onFloorSelect={handleFloorSelect}
        totalSpots={totalSpots}
        occupiedSpots={currentFloorOccupiedSpots.length}
        onReportProblem={handleReportProblem}
        onRefresh={handleManualRefresh}
        isLoading={isLoading}
        notificationCount={4}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Updating parking status...</span>
        </div>
      )}

      {/* Enhanced parking grid and synchronization status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EnhancedParkingGrid
            selectedFloor={selectedFloor}
            occupiedSpots={currentFloorOccupiedSpots}
            className="w-full"
          />
        </div>
        <div className="xl:col-span-1">
          <SynchronizationStatus />
        </div>
      </div>

      {/* Status information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalSpots}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Spaces</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalSpots - currentFloorOccupiedSpots.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Available Spaces</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentFloorOccupiedSpots.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Occupied Spaces</div>
          </div>
        </div>
        
        {/* Real-time status indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? 'Updating...' : 'Event-driven updates'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last update: {lastUpdate}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Debug information (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Debug Information
          </h4>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>Selected Floor: {selectedFloor}</div>
            <div>Total Spots on Floor: {totalSpots}</div>
            <div>Occupied Spots: [{currentFloorOccupiedSpots.join(', ')}]</div>
            <div>Last Update: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedParking;
