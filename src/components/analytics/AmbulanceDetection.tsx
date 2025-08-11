import React, { useRef, useEffect, useState } from 'react';
import { useCity } from '@/contexts/CityContext';
import { useGeolocation } from '@/hooks/useGeolocation';

const AmbulanceDetection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [ambulanceDetected, setAmbulanceDetected] = useState(false);
  const { selectedCity } = useCity();
  const { location } = useGeolocation();

  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;
    if (isDetecting && !ambulanceDetected) {
      detectionInterval = setInterval(async () => {
        try {
          const response = await fetch('http://localhost:5001/ambulance_detection');
          const data = await response.json();
          if (data.ambulance_detected) {
            setAmbulanceDetected(true);
          }
        } catch (error) {
          console.error('Error detecting ambulance:', error);
        }
      }, 1000); // Check for ambulance every second
    }
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isDetecting, ambulanceDetected]);

  const handleStartDetection = () => {
    setIsDetecting(true);
    setAmbulanceDetected(false);
  };

  const getMapUrl = () => {
    const destination = "hospital in " + selectedCity;
    let origin = `${selectedCity}`;
    if (location) {
      origin = `${location.latitude},${location.longitude}`;
    }
    
    return `https://www.google.com/maps/embed/v1/directions?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}`;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Ambulance Detection</h2>
      {!isDetecting ? (
        <button
          onClick={handleStartDetection}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Start Detection System
        </button>
      ) : !ambulanceDetected ? (
        <div>
          <img src="http://localhost:5001/video_feed" className="w-full h-auto" />
          <p className="text-center mt-4">Detecting ambulance...</p>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold mb-2">Ambulance Detected!</h3>
          <p className="mb-4">Showing nearest route to the hospital:</p>
          <iframe
            src={getMapUrl()}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDetection;