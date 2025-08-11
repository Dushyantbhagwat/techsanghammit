import React, { useState, useEffect } from 'react';
import { PARKING_SPOTS } from './constants';

const Parking: React.FC = () => {
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
      <h1 className="text-2xl font-bold mb-4">Live Car Detection Feed</h1>
      <div className="flex">
        <div style={{ position: 'relative', width: '900px', height: '600px' }}>
          <img
            src="http://127.0.0.1:5001/video_feed"
            alt="Live car detection feed"
            width="900"
            height="600"
          />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-bold mb-2">Parking Status</h2>
          <p>Total Spaces: {PARKING_SPOTS.length}</p>
          <p>Available Spaces: {availableSpots}</p>
          <div className="mt-4">
            <h3 className="text-lg font-bold">Spots:</h3>
            <ul>
              {PARKING_SPOTS.map(spot => (
                <li key={spot.id} style={{ color: occupiedSpots.includes(spot.id) ? 'red' : 'green' }}>
                  {spot.id}: {occupiedSpots.includes(spot.id) ? 'Occupied' : 'Available'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parking;