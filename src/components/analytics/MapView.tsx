import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchTrafficData, type LocationTrafficData } from '@/services/traffic';
import { useCity } from '@/contexts/CityContext';

// Extend Window interface without redeclaring google property
declare global {
  interface Window {
    initMap: () => void;
  }
}

interface CityMapData {
  center: google.maps.LatLngLiteral;
  heatmapData: Array<google.maps.visualization.WeightedLocation>;
}

const CITY_COORDINATES: Record<string, google.maps.LatLngLiteral> = {
  Borivali: { lat: 19.2335, lng: 72.8474 },
  Thane: { lat: 19.2183, lng: 72.9780 },
  Kalyan: { lat: 19.2403, lng: 73.1305 }
};

const POINTS_OF_INTEREST: Record<string, Array<{ name: string } & google.maps.LatLngLiteral>> = {
  Borivali: [
    { name: 'Station Area', lat: 19.2335, lng: 72.8474 },
    { name: 'Market Complex', lat: 19.2310, lng: 72.8460 },
    { name: 'Residential Area', lat: 19.2360, lng: 72.8490 },
    { name: 'Shopping District', lat: 19.2320, lng: 72.8440 },
    { name: 'Business Hub', lat: 19.2380, lng: 72.8450 }
  ],
  Thane: [
    { name: 'Lake City Mall', lat: 19.2183, lng: 72.9780 },
    { name: 'Station Complex', lat: 19.2150, lng: 72.9760 },
    { name: 'Business District', lat: 19.2200, lng: 72.9800 },
    { name: 'Market Area', lat: 19.2170, lng: 72.9740 },
    { name: 'Residential Zone', lat: 19.2220, lng: 72.9770 }
  ],
  Kalyan: [
    { name: 'Kalyan Station', lat: 19.2403, lng: 73.1305 },
    { name: 'Market Area', lat: 19.2350, lng: 73.1290 },
    { name: 'Shopping District', lat: 19.2420, lng: 73.1320 },
    { name: 'Residential Area', lat: 19.2380, lng: 73.1340 },
    { name: 'Business District', lat: 19.2410, lng: 73.1280 }
  ]
};

export function MapView() {
  const { selectedCity } = useCity();
  const [trafficData, setTrafficData] = useState<LocationTrafficData[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maps, setMaps] = useState<Record<string, google.maps.Map>>({});
  const [heatmaps, setHeatmaps] = useState<Record<string, google.maps.visualization.HeatmapLayer>>({});
  
  const mapRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    Borivali: useRef<HTMLDivElement>(null),
    Thane: useRef<HTMLDivElement>(null),
    Kalyan: useRef<HTMLDivElement>(null)
  };

  // Convert traffic data to heatmap weights
  const getHeatmapData = (city: string, data: LocationTrafficData): CityMapData => {
    const points = POINTS_OF_INTEREST[city];
    const maxVehicles = data.hourlyData.reduce((max, hour) => 
      Math.max(max, hour.vehicleCount), 0);
    
    return {
      center: CITY_COORDINATES[city],
      heatmapData: points.map((point, index) => {
        // Calculate weight based on current traffic and point location
        const baseWeight = data.currentTraffic.vehicleCount / maxVehicles;
        // Add some variation based on point index
        const variation = 0.2 * (Math.sin(index) + 1);
        return {
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: Math.min(1, baseWeight + variation)
        };
      })
    };
  };

  // Fetch traffic data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchTrafficData();
        setTrafficData(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
        console.error('Error fetching traffic data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Update heatmap data when traffic data changes
  useEffect(() => {
    if (!mapsLoaded || !window.google || trafficData.length === 0) return;

    trafficData.forEach(cityData => {
      const city = cityData.location;
      const map = maps[city];
      const heatmap = heatmaps[city];
      
      if (!map || !heatmap) return;

      const { heatmapData } = getHeatmapData(city, cityData);
      heatmap.setData(heatmapData);
    });
  }, [trafficData, mapsLoaded, maps, heatmaps]);

  const initializeMaps = () => {
    const newMaps: Record<string, google.maps.Map> = {};
    const newHeatmaps: Record<string, google.maps.visualization.HeatmapLayer> = {};

    Object.keys(CITY_COORDINATES).forEach(city => {
      const mapRef = mapRefs[city];
      if (!mapRef?.current) return;

      const map = new google.maps.Map(mapRef.current, {
        zoom: 14,
        center: CITY_COORDINATES[city],
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text.stroke',
            stylers: [{ visibility: 'on' }, { color: '#3e606f' }, { weight: 2 }, { gamma: 0.84 }]
          },
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ weight: 0.6 }, { color: '#1a3541' }]
          }
        ]
      });

      // Add Traffic Layer
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      // Initialize empty heatmap
      const heatmap = new google.maps.visualization.HeatmapLayer({
        radius: 30,
        opacity: 0.7,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)',
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
      heatmap.setMap(map);

      newMaps[city] = map;
      newHeatmaps[city] = heatmap;
    });

    setMaps(newMaps);
    setHeatmaps(newHeatmaps);
    setMapsLoaded(true);
  };

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMaps();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setError('Failed to load Google Maps');

    window.initMap = initializeMaps;

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      window.initMap = () => {};
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const citiesToShow = Object.keys(CITY_COORDINATES);

  return (
    <div className="space-y-6">
      {citiesToShow.map(city => (
        <Card key={city} className="p-6 relative">
          <h2 className="text-xl font-semibold mb-4">Real-Time Traffic & Crowd Analytics for {city}</h2>
          <div
            ref={mapRefs[city]}
            className="h-[400px] w-full rounded-lg overflow-hidden"
          />
          {!mapsLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-lg">Loading map...</div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}