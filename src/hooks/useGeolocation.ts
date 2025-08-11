import { useState, useEffect } from 'react';

interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
  } | null;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        error: null
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        error: error.message
      }));
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch for position updates
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}