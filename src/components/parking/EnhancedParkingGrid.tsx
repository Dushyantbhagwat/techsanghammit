import React from 'react';
import { CarIcon, SimpleCarIcon, getSpotCarColor } from './CarIcons';
import { ENHANCED_PARKING_FLOORS, getFloorSpots, ParkingSpot } from '@/parking/constants';
import { cn } from '@/lib/utils';

interface EnhancedParkingGridProps {
  selectedFloor: string;
  occupiedSpots: string[];
  className?: string;
}

export const EnhancedParkingGrid: React.FC<EnhancedParkingGridProps> = ({
  selectedFloor,
  occupiedSpots,
  className = ''
}) => {
  const floorData = ENHANCED_PARKING_FLOORS.find(floor => floor.id === selectedFloor);
  
  if (!floorData) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Floor data not available
      </div>
    );
  }

  const renderParkingSpot = (spot: ParkingSpot) => {
    const isOccupied = occupiedSpots.includes(spot.id);
    const carColor = getSpotCarColor(spot.id);
    
    return (
      <div
        key={spot.id}
        className="absolute border border-gray-300 dark:border-gray-600 rounded-sm"
        style={{
          left: `${spot.x}px`,
          top: `${spot.y}px`,
          width: `${spot.width}px`,
          height: `${spot.height}px`,
          transform: spot.rotation ? `rotate(${spot.rotation}deg)` : undefined
        }}
      >
        {isOccupied ? (
          <div className="w-full h-full flex items-center justify-center">
            <SimpleCarIcon 
              color={carColor}
              className="w-full h-full"
              rotation={spot.rotation || 0}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-sm">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {spot.id}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (sectionId: string, sectionName: string) => {
    const section = floorData.sections.find(s => s.id === sectionId);
    if (!section) return null;

    return (
      <div key={sectionId} className="relative">
        {section.spots.map(renderParkingSpot)}
      </div>
    );
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
      {/* Parking Grid Container */}
      <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-8" style={{ height: '500px', width: '100%' }}>

        {/* Entry Indicator */}
        <div className="absolute right-4 top-16 flex flex-col items-center">
          <div className="w-3 h-16 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-600 mt-2 transform rotate-90 origin-center">
            Entry
          </span>
        </div>

        {/* Exit Indicator */}
        <div className="absolute right-4 bottom-16 flex flex-col items-center">
          <div className="w-3 h-16 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-600 mt-2 transform rotate-90 origin-center">
            Exit
          </span>
        </div>

        {/* Parking Sections */}
        {floorData.sections.map(section => (
          <div key={section.id}>
            {section.spots.map(renderParkingSpot)}
          </div>
        ))}

        {/* Section Labels */}
        <div className="absolute top-4 left-32">
          <span className="text-xl font-bold text-gray-700 dark:text-gray-300">Section A</span>
        </div>
        <div className="absolute top-4 right-24">
          <span className="text-xl font-bold text-gray-700 dark:text-gray-300">Section B</span>
        </div>

        {/* Central Driving Lane */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Main horizontal driving lane */}
          <div
            className="absolute bg-gray-300 dark:bg-gray-600 opacity-30"
            style={{
              left: '250px',
              top: '200px',
              width: '200px',
              height: '100px',
              borderRadius: '8px'
            }}
          />

          {/* Lane markings */}
          <div
            className="absolute border-dashed border-2 border-gray-400 dark:border-gray-500 opacity-50"
            style={{
              left: '250px',
              top: '245px',
              width: '200px',
              height: '10px'
            }}
          />
        </div>

        {/* Directional Arrows */}
        <div className="absolute" style={{ left: '320px', top: '230px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="absolute" style={{ left: '380px', top: '230px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-500">
            <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-sm"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Exit</span>
        </div>
      </div>
    </div>
  );
};
