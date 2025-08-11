import { useEffect, useRef, useState } from 'react';
import { initGoogleMaps, createMap, createHeatmap, createTrafficLayer } from '@/lib/maps';
import { Card } from '@/components/ui/card';
import { useCity } from '@/contexts/CityContext';
import { fetchTrafficData } from '@/services/traffic';
import { fetchSecurityData } from '@/services/security';
import { fetchEnvironmentalData } from '@/services/aqi';

declare global {
  interface Window {
    google: typeof google;
    [key: string]: any; // Allow dynamic callback names
  }
}

// Type definitions for our data structures
interface SecurityZone {
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface TrafficData {
  currentTraffic: {
    vehicleCount: number;
  };
}

interface EnvironmentalData {
  current: {
    aqi: {
      value: number;
    };
  };
}

interface CityData {
  center: google.maps.LatLngLiteral;
  heatmapData: Array<{
    lat: number;
    lng: number;
    weight: number;
    type: 'traffic' | 'security' | 'environmental';
  }>;
}

const CITY_COORDINATES: Record<string, google.maps.LatLngLiteral> = {
  Borivali: { lat: 19.2335, lng: 72.8474 },
  Thane: { lat: 19.2000, lng: 72.9780 },
  Kalyan: { lat: 19.2350, lng: 73.1305 }
};

export function DashboardMapView() {
  const { selectedCity } = useCity();
  const [error, setError] = useState<string | null>(null);
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const maps = useRef<Record<string, google.maps.Map>>({});
  const heatmaps = useRef<Record<string, google.maps.visualization.HeatmapLayer>>({});
  
  const mapRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    Borivali: useRef<HTMLDivElement>(null),
    Thane: useRef<HTMLDivElement>(null),
    Kalyan: useRef<HTMLDivElement>(null)
  };

  // Debounce function to prevent excessive updates
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Memoized function to process city data
  const processCityData = (
    city: string,
    trafficData: TrafficData | any[],
    securityData: { zones: SecurityZone[] },
    environmentalData: EnvironmentalData
  ): CityData['heatmapData'] => {
    const heatmapData: CityData['heatmapData'] = [];

    // Process traffic data
    if (!Array.isArray(trafficData)) {
      const congestionLevel = Math.min(trafficData.currentTraffic.vehicleCount / 1000, 1);
      heatmapData.push({
        lat: CITY_COORDINATES[city].lat + 0.002,
        lng: CITY_COORDINATES[city].lng + 0.002,
        weight: congestionLevel,
        type: 'traffic'
      });
    }

    // Process security data (limit to max 5 zones for performance)
    securityData.zones.slice(0, 5).forEach((zone: any, index: number) => {
      if (zone.riskLevel !== 'Low') {
        heatmapData.push({
          lat: CITY_COORDINATES[city].lat - 0.002 + (index * 0.001),
          lng: CITY_COORDINATES[city].lng - 0.002 + (index * 0.001),
          weight: zone.riskLevel === 'High' ? 0.9 : 0.6,
          type: 'security'
        });
      }
    });

    // Process environmental data
    const aqiWeight = Math.min(environmentalData.current.aqi.value / 500, 1);
    heatmapData.push({
      lat: CITY_COORDINATES[city].lat - 0.001,
      lng: CITY_COORDINATES[city].lng - 0.001,
      weight: aqiWeight,
      type: 'environmental'
    });

    return heatmapData;
  };

  // Optimized update function for heatmaps
  const updateHeatmap = (city: string, data: CityData['heatmapData']) => {
    const heatmap = heatmaps.current[city];
    if (heatmap && data.length > 0) {
      const heatmapPoints = new google.maps.MVCArray(
        data.map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight
        }))
      );
      heatmap.setData(heatmapPoints);
    }
  };

  // Fetch real-time data and update heatmap
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newCityData: Record<string, CityData> = {};
        const cities = Object.keys(CITY_COORDINATES);

        // Fetch data for all cities in parallel
        const cityDataPromises = cities.map(async (city) => {
          const [trafficData, securityData, environmentalData] = await Promise.all([
            fetchTrafficData(city),
            fetchSecurityData(city),
            fetchEnvironmentalData(city)
          ]);

          const heatmapData = processCityData(
            city,
            trafficData,
            securityData,
            environmentalData
          );

          return { city, heatmapData };
        });

        const results = await Promise.all(cityDataPromises);

        // Process results and update state
        results.forEach(({ city, heatmapData }) => {
          newCityData[city] = {
            center: CITY_COORDINATES[city],
            heatmapData
          };

          // Update heatmap if maps are loaded
          if (mapsLoaded) {
            updateHeatmap(city, heatmapData);
          }
        });

        setCityData(newCityData);
      } catch (err) {
        console.error('Error fetching data for maps:', err);
        setError('Failed to fetch real-time data');
      }
    };

    // Initial fetch
    fetchData();

    // Debounced updates
    const debouncedFetch = debounce(fetchData, 1000);
    const interval = setInterval(debouncedFetch, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [mapsLoaded]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    let isMounted = true;

    const initializeMapsAndLayers = async () => {
      try {
        await initGoogleMaps({
          apiKey,
          onError: (error) => setError(error.message)
        });

        if (!isMounted) return;

        // Initialize maps for each city
        Object.entries(CITY_COORDINATES).forEach(([city, center]) => {
          const mapRef = mapRefs[city];
          if (!mapRef?.current) return;

          // Create map instance
          const map = createMap(mapRef.current, {
            zoom: 13,
            center,
            mapTypeId: 'roadmap',
            disableDefaultUI: true,
            draggable: false,
            zoomControl: false,
            scrollwheel: false,
            streetViewControl: false,
            styles: [
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#3e606f' }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry',
                stylers: [{ color: '#2c5364' }]
              }
            ]
          });

          // Store map instance
          maps.current[city] = map;

          // Add traffic layer
          const trafficLayer = createTrafficLayer();
          trafficLayer.setMap(map);

          // Create heatmap layer
          const heatmap = createHeatmap({
            map,
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

          heatmaps.current[city] = heatmap;
        });

        if (isMounted) {
          setMapsLoaded(true);
        }
      } catch (err) {
        console.error('Error initializing maps:', err);
        if (isMounted) {
          setError('Failed to initialize maps');
          setMapsLoaded(false);
        }
      }
    };

    initializeMapsAndLayers();

    return () => {
      isMounted = false;

      // Clean up maps and event listeners
      Object.values(maps.current).forEach(map => {
        if (map) {
          google.maps.event.clearInstanceListeners(map);
        }
      });

      // Clean up heatmaps
      Object.values(heatmaps.current).forEach(heatmap => {
        if (heatmap) {
          heatmap.setMap(null);
        }
      });

      // Reset refs and state
      maps.current = {};
      heatmaps.current = {};
      setMapsLoaded(false);
    };
  }, []);

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 rounded-lg">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.keys(CITY_COORDINATES).map(city => (
        <Card
          key={city}
          className={`p-6 relative ${selectedCity === city ? 'ring-2 ring-primary' : ''}`}
        >
          <h3 className="text-lg font-semibold mb-2">{city}</h3>
          <div
            ref={mapRefs[city]}
            className="h-[250px] w-full rounded-lg overflow-hidden"
          />
          {!mapsLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-sm animate-pulse">Loading map...</div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}