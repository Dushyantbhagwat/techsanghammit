import { useEffect, useRef, useState } from 'react';
import { initGoogleMaps, createMap, createHeatmap, createTrafficLayer } from '@/lib/maps';
import { Card } from '@/components/ui/card';
import { useCity } from '@/contexts/CityContext';
import { fetchTrafficData, LocationTrafficData } from '@/services/traffic';
import { fetchSecurityData } from '@/services/security';
import { fetchEnvironmentalData } from '@/services/aqi';

declare global {
  interface Window {
    google: typeof google;
    [key: string]: any;
  }
}

interface CityData {
  center: google.maps.LatLngLiteral;
  heatmapData: Array<{
    lat: number;
    lng: number;
    weight: number;
    type: 'traffic' | 'security' | 'environmental';
  }>;
  trafficHotspots?: Array<{
    name: string;
    congestionLevel: number;
    vehicleCount: number;
    position: google.maps.LatLngLiteral;
  }>;
}

const formatCityName = (city: string) => {
  return city.charAt(0).toUpperCase() + city.slice(1);
};

const CITY_COORDINATES: Record<string, google.maps.LatLngLiteral> = {
  thane: { lat: 19.2000, lng: 72.9780 },
  borivali: { lat: 19.2335, lng: 72.8474 },
  kharghar: { lat: 19.0330, lng: 73.0297 },
  pune: { lat: 18.5204, lng: 73.8567 },
  'delhi-ncr': { lat: 19.9975, lng: 73.7898 },
  panvel: { lat: 18.9894, lng: 73.1175 }
};

export function DashboardMapView() {
  const { selectedCity } = useCity();
  const [error, setError] = useState<string | null>(null);
  const [cityData, setCityData] = useState<Record<string, CityData>>({});
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const maps = useRef<Record<string, google.maps.Map>>({});
  const heatmaps = useRef<Record<string, google.maps.visualization.HeatmapLayer>>({});
  const markers = useRef<Record<string, google.maps.Marker[]>>({});
  const infoWindows = useRef<Record<string, google.maps.InfoWindow[]>>({});
  
  const mapRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    thane: useRef<HTMLDivElement>(null),
    borivali: useRef<HTMLDivElement>(null),
    kharghar: useRef<HTMLDivElement>(null),
    pune: useRef<HTMLDivElement>(null),
    'delhi-ncr': useRef<HTMLDivElement>(null),
    panvel: useRef<HTMLDivElement>(null)
  };

  const processCityData = (
    city: string,
    trafficData: LocationTrafficData,
    securityData: { zones: any[] },
    environmentalData: any
  ): CityData => {
    const heatmapData: CityData['heatmapData'] = [];
    const trafficHotspots: CityData['trafficHotspots'] = [];

    // Process traffic hotspots using improved distribution algorithm
    trafficData.hotspots?.forEach((hotspot, index) => {
      // Create better spread pattern - use circular distribution
      const angle = (index * 2 * Math.PI) / Math.max(trafficData.hotspots.length, 1);
      const radius = 0.008 + (index % 3) * 0.004; // Varying radius for depth
      
      // Convert polar to cartesian coordinates for better distribution
      const latOffset = Math.cos(angle) * radius;
      const lngOffset = Math.sin(angle) * radius;
      
      // Add some controlled randomization
      const randomFactor = 0.002;
      const randomLatOffset = (Math.random() - 0.5) * randomFactor;
      const randomLngOffset = (Math.random() - 0.5) * randomFactor;
      
      const position = {
        lat: CITY_COORDINATES[city].lat + latOffset + randomLatOffset,
        lng: CITY_COORDINATES[city].lng + lngOffset + randomLngOffset
      };

      trafficHotspots.push({
        ...hotspot,
        position
      });

      // Add hotspot to heatmap
      heatmapData.push({
        lat: position.lat,
        lng: position.lng,
        weight: hotspot.congestionLevel,
        type: 'traffic'
      });
    });

    // Process security data
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

    return {
      center: CITY_COORDINATES[city],
      heatmapData,
      trafficHotspots
    };
  };

  const updateMapVisualization = (city: string, data: CityData) => {
    const map = maps.current[city];
    if (!map) return;

    // Clear existing markers
    markers.current[city]?.forEach(marker => marker.setMap(null));
    infoWindows.current[city]?.forEach(infoWindow => infoWindow.close());
    markers.current[city] = [];
    infoWindows.current[city] = [];

    // Update heatmap
    const heatmap = heatmaps.current[city];
    if (heatmap && data.heatmapData.length > 0) {
      const heatmapPoints = new google.maps.MVCArray(
        data.heatmapData.map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight
        }))
      );
      heatmap.setData(heatmapPoints);
    }

    // Add traffic hotspot markers
    data.trafficHotspots?.forEach(hotspot => {
      const color = hotspot.congestionLevel > 1.5 ? '#FF4560' :
                   hotspot.congestionLevel > 1.0 ? '#FEB019' : '#00E396';
      
      // Different marker scales based on congestion level
      const scale = hotspot.congestionLevel > 1.5 ? 15 : 
                   hotspot.congestionLevel > 1.0 ? 12 : 8;

      const marker = new google.maps.Marker({
        position: hotspot.position,
        map,
        title: hotspot.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: color,
          fillOpacity: 0.8,
          strokeWeight: 3,
          strokeColor: '#ffffff'
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-gray-900 mb-2">${hotspot.name}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="font-medium">Congestion:</span>
                <span class="font-bold" style="color: ${color}">
                  ${Math.round(hotspot.congestionLevel * 100)}%
                </span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Vehicles:</span>
                <span class="font-bold">${hotspot.vehicleCount}</span>
              </div>
              <div class="flex justify-between">
                <span class="font-medium">Traffic Level:</span>
                <span class="px-2 py-1 rounded text-xs font-medium ${
                  hotspot.congestionLevel > 1.5
                    ? 'bg-red-100 text-red-800'
                    : hotspot.congestionLevel > 1.0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }">
                  ${hotspot.congestionLevel > 1.5 ? 'SEVERE' :
                    hotspot.congestionLevel > 1.0 ? 'MODERATE' : 'LIGHT'}
                </span>
              </div>
              <div class="flex justify-between mt-2">
                <span class="font-medium">Status:</span>
                <div class="flex items-center">
                  <div class="w-2 h-2 rounded-full mr-1" style="background-color: ${color}"></div>
                  <span class="text-xs">
                    ${hotspot.congestionLevel > 1.5 ? 'Heavy Traffic' :
                      hotspot.congestionLevel > 1.0 ? 'Moderate Traffic' : 'Light Traffic'}
                  </span>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2 italic">Click other markers to compare traffic data</p>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindows.current[city]?.forEach(iw => iw.close());
        infoWindow.open(map, marker);
      });

      markers.current[city] = [...(markers.current[city] || []), marker];
      infoWindows.current[city] = [...(infoWindows.current[city] || []), infoWindow];
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newCityData: Record<string, CityData> = {};
        const cities = Object.keys(CITY_COORDINATES);

        const cityDataPromises = cities.map(async (city) => {
          const [trafficData, securityData, environmentalData] = await Promise.all([
            fetchTrafficData(city),
            fetchSecurityData(city),
            fetchEnvironmentalData(city)
          ]);

          const processedData = processCityData(
            city,
            trafficData as LocationTrafficData,
            securityData,
            environmentalData
          );

          return { city, data: processedData };
        });

        const results = await Promise.all(cityDataPromises);

        results.forEach(({ city, data }) => {
          newCityData[city] = data;
          if (mapsLoaded) {
            updateMapVisualization(city, data);
          }
        });

        setCityData(newCityData);
      } catch (err) {
        console.error('Error fetching data for maps:', err);
        setError('Failed to fetch real-time data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [mapsLoaded]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('VITE_GOOGLE_MAPS_API_KEY is not defined. Please set it in your .env file.');
      console.error('VITE_GOOGLE_MAPS_API_KEY is not defined. Please set it in your .env file.');
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

        Object.entries(CITY_COORDINATES).forEach(([city, center]) => {
          const mapRef = mapRefs[city];
          if (!mapRef?.current) return;

          const map = createMap(mapRef.current, {
            zoom: 14,
            center,
            mapTypeId: 'roadmap',
            disableDefaultUI: false,
            draggable: true,
            zoomControl: true,
            scrollwheel: true,
            streetViewControl: true,
            mapTypeControl: true,
            scaleControl: true,
            fullscreenControl: true,
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

          maps.current[city] = map;

          // Add click handler for map interaction
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();

              // Create info window with location details
              const infoWindow = new google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h3 class="font-semibold text-gray-900">${formatCityName(city)}</h3>
                    <p class="text-sm text-gray-600">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                    <p class="text-sm text-gray-600">Click to view detailed analytics</p>
                  </div>
                `,
                position: event.latLng
              });

              infoWindow.open(map);

              // Close info window after 3 seconds
              setTimeout(() => {
                infoWindow.close();
              }, 3000);
            }
          });

          const trafficLayer = createTrafficLayer();
          trafficLayer.setMap(map);

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

      Object.values(maps.current).forEach(map => {
        if (map) {
          google.maps.event.clearInstanceListeners(map);
        }
      });

      Object.values(heatmaps.current).forEach(heatmap => {
        if (heatmap) {
          heatmap.setMap(null);
        }
      });

      Object.values(markers.current).forEach(cityMarkers => {
        cityMarkers?.forEach(marker => marker.setMap(null));
      });

      Object.values(infoWindows.current).forEach(cityInfoWindows => {
        cityInfoWindows?.forEach(infoWindow => infoWindow.close());
      });

      maps.current = {};
      heatmaps.current = {};
      markers.current = {};
      infoWindows.current = {};
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{formatCityName(city)}</h3>
            {cityData[city]?.trafficHotspots && (
              <span className={`text-sm px-2 py-1 rounded ${
                Math.max(...cityData[city].trafficHotspots!.map(h => h.congestionLevel)) > 1.5
                  ? 'bg-red-500/20 text-red-500'
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {cityData[city].trafficHotspots!.length} Hotspots
              </span>
            )}
          </div>
          <div
            ref={mapRefs[city]}
            className="h-[250px] w-full rounded-lg overflow-hidden"
          />
          {!mapsLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <div className="text-sm animate-pulse">Loading map...</div>
            </div>
          )}
          {mapsLoaded && cityData[city]?.trafficHotspots && (
            <div className="mt-2 text-sm space-y-1">
              {cityData[city].trafficHotspots!
                .sort((a, b) => b.congestionLevel - a.congestionLevel)
                .slice(0, 2)
                .map((hotspot, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-400">{hotspot.name}</span>
                    <span className={`${
                      hotspot.congestionLevel > 1.5 ? 'text-red-500' :
                      hotspot.congestionLevel > 1.0 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {Math.round(hotspot.congestionLevel * 100)}% Congested
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}