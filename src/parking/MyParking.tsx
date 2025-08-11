import React, { useState, useEffect } from 'react';
import { PARKING_SPOTS } from './constants';

const MyParking: React.FC = () => {
  const [occupiedSpots, setOccupiedSpots] = useState<string[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5001/parking_status');
        const data = await response.json();
        setOccupiedSpots(data.occupied_spots);
      } catch (error) {
        console.error("Error fetching parking status:", error);
      }
    };

    const intervalId = setInterval(fetchStatus, 2000); // Poll every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  const availableSpots = PARKING_SPOTS.length - occupiedSpots.length;

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      {/* Floor Selection Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">My Parking</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Report Problem
          </button>
        </div>

        {/* Floor Selection Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Floor</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              B1
            </button>
            <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white font-medium">
              B2
            </button>
            <button className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              B3
            </button>
            <button className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              B4
            </button>
            <button className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              B5
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white text-lg">{PARKING_SPOTS.length - availableSpots}</span>
            <span className="text-gray-600 dark:text-gray-400">Filled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white text-lg">{availableSpots}</span>
            <span className="text-gray-600 dark:text-gray-400">Empty</span>
          </div>
        </div>
      </div>

      {/* Parking Grid Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Parking Grid</h2>

        {/* Parking Grid Layout matching reference image */}
        <div className="space-y-6">
          {/* Entry Indicator */}
          <div className="flex justify-end">
            <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-300 dark:border-green-700">
              Entry
            </div>
          </div>

          {/* Section A */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Section A</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {PARKING_SPOTS.slice(0, 5).map(spot => (
                <div
                  key={spot.id}
                  className={`relative p-3 sm:p-4 border-2 rounded-lg text-center transition-all duration-300 min-h-[80px] sm:min-h-[100px] ${
                    occupiedSpots.includes(spot.id)
                      ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                      : 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                  }`}
                >
                  {/* Car Icon */}
                  {occupiedSpots.includes(spot.id) && (
                    <div className="mb-1 sm:mb-2">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 19,21H20A1,1 0 0,0 21,20V12L18.92,6Z" />
                      </svg>
                    </div>
                  )}

                  {/* Spot ID */}
                  <div className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">{spot.id}</div>

                  {/* Status Indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    occupiedSpots.includes(spot.id) ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Driving Lane */}
          <div className="py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Driving Lane
            </div>
          </div>

          {/* Section B */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Section B</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {PARKING_SPOTS.slice(5, 10).map(spot => (
                <div
                  key={spot.id}
                  className={`relative p-3 sm:p-4 border-2 rounded-lg text-center transition-all duration-300 min-h-[80px] sm:min-h-[100px] ${
                    occupiedSpots.includes(spot.id)
                      ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
                      : 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
                  }`}
                >
                  {/* Car Icon */}
                  {occupiedSpots.includes(spot.id) && (
                    <div className="mb-1 sm:mb-2">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5,11L6.5,6.5H17.5L19,11M17.5,16A1.5,1.5 0 0,1 16,14.5A1.5,1.5 0 0,1 17.5,13A1.5,1.5 0 0,1 19,14.5A1.5,1.5 0 0,1 17.5,16M6.5,16A1.5,1.5 0 0,1 5,14.5A1.5,1.5 0 0,1 6.5,13A1.5,1.5 0 0,1 8,14.5A1.5,1.5 0 0,1 6.5,16M18.92,6C18.72,5.42 18.16,5 17.5,5H6.5C5.84,5 5.28,5.42 5.08,6L3,12V20A1,1 0 0,0 4,21H5A1,1 0 0,0 6,20V19H18V20A1,1 0 0,0 21,20V12L18.92,6Z" />
                      </svg>
                    </div>
                  )}

                  {/* Spot ID */}
                  <div className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">{spot.id}</div>

                  {/* Status Indicator */}
                  <div className={`absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    occupiedSpots.includes(spot.id) ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                </div>
              ))}
            </div>

            {/* Exit Indicator */}
            <div className="flex justify-end">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-300 dark:border-red-700">
                Exit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyParking;