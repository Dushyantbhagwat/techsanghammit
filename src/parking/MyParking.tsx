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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Parking Status</h1>
      <div className="ml-4">
        <h2 className="text-xl font-bold mb-2">Parking Status</h2>
        <p>Total Spaces: {PARKING_SPOTS.length}</p>
        <p>Available Spaces: {availableSpots}</p>
        <div className="mt-4">
          <h3 className="text-lg font-bold">Spots:</h3>
          <div className="grid grid-cols-5 grid-rows-2 gap-4 mt-4 h-[350px]">
            {PARKING_SPOTS.map(spot => (
              <div
                key={spot.id}
                className={`p-4 border rounded-lg text-center ${
                  occupiedSpots.includes(spot.id) ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}
              >
                <p className="font-bold text-lg">{spot.id}</p>
                <p>{occupiedSpots.includes(spot.id) ? 'Occupied' : 'Available'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyParking;