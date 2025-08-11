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

const formatCityName = (city: string) => {
  return city.charAt(0).toUpperCase() + city.slice(1);
};

const CITY_COORDINATES: Record<string, google.maps.LatLngLiteral> = {
  thane: { lat: 19.2000, lng: 72.9780 },
  borivali: { lat: 19.2335, lng: 72.8474 },
  kharghar: { lat: 19.0330, lng: 73.0297 },
  pune: { lat: 18.5204, lng: 73.8567 },
  nashik: { lat: 19.9975, lng: 73.7898 },
  panvel: { lat: 18.9894, lng: 73.1175 }
};

const POINTS_OF_INTEREST: Record<string, Array<{ name: string } & google.maps.LatLngLiteral>> = {
  thane: [
    { name: 'Lake City Mall', lat: 19.2000, lng: 72.9780 },
    { name: 'Station Complex', lat: 19.1950, lng: 72.9760 },
    { name: 'Business District', lat: 19.2050, lng: 72.9800 },
    { name: 'Market Area', lat: 19.1970, lng: 72.9740 },
    { name: 'Residential Zone', lat: 19.2020, lng: 72.9770 }
  ],
  borivali: [
    { name: 'Station Area', lat: 19.2335, lng: 72.8474 },
    { name: 'Market Complex', lat: 19.2310, lng: 72.8460 },
    { name: 'Residential Area', lat: 19.2360, lng: 72.8490 },
    { name: 'Shopping District', lat: 19.2320, lng: 72.8440 },
    { name: 'Business Hub', lat: 19.2380, lng: 72.8450 }
  ],
  kharghar: [
    { name: 'Central Park', lat: 19.0330, lng: 73.0297 },
    { name: 'Station Area', lat: 19.0350, lng: 73.0280 },
    { name: 'Golf Course', lat: 19.0310, lng: 73.0320 },
    { name: 'Market Complex', lat: 19.0370, lng: 73.0260 },
    { name: 'Business Hub', lat: 19.0290, lng: 73.0310 }
  ],
  pune: [
    { name: 'Shivaji Nagar', lat: 18.5204, lng: 73.8567 },
    { name: 'Koregaon Park', lat: 18.5350, lng: 73.8950 },
    { name: 'Hinjewadi IT Park', lat: 18.5912, lng: 73.7375 },
    { name: 'FC Road', lat: 18.5236, lng: 73.8478 },
    { name: 'Kalyani Nagar', lat: 18.5452, lng: 73.9040 }
  ],
  nashik: [
    { name: 'Nashik Road Station', lat: 19.9975, lng: 73.7898 },
    { name: 'College Road', lat: 20.0050, lng: 73.7890 },
    { name: 'CIDCO Area', lat: 19.9920, lng: 73.7650 },
    { name: 'Old City', lat: 20.0060, lng: 73.7920 },
    { name: 'Industrial Area', lat: 19.9850, lng: 73.7780 }
  ],
  panvel: [
    { name: 'Panvel Station', lat: 18.9894, lng: 73.1175 },
    { name: 'New Panvel', lat: 18.9950, lng: 73.1250 },
    { name: 'Kalamboli', lat: 19.0023, lng: 73.1012 },
    { name: 'Old Panvel Market', lat: 18.9880, lng: 73.1130 },
    { name: 'CIDCO Colony', lat: 18.9920, lng: 73.1220 }
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
    thane: useRef<HTMLDivElement>(null),
    borivali: useRef<HTMLDivElement>(null),
    kharghar: useRef<HTMLDivElement>(null),
    pune: useRef<HTMLDivElement>(null)
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
          <h2 className="text-xl font-semibold mb-4">Real-Time Traffic & Crowd Analytics for {formatCityName(city)}</h2>
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