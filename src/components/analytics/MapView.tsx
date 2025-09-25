import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchTrafficData, type LocationTrafficData } from '@/services/traffic';

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
  'delhi-ncr': { lat: 19.9975, lng: 73.7898 },
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
  'delhi-ncr': [
    { name: 'DELHI NCR Road Station', lat: 19.9975, lng: 73.7898 },
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
  const [trafficData, setTrafficData] = useState<LocationTrafficData[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maps, setMaps] = useState<Record<string, google.maps.Map>>({});
  const [heatmaps, setHeatmaps] = useState<Record<string, google.maps.visualization.HeatmapLayer>>({});
  
  const mapRefs: Record<string, React.RefObject<HTMLDivElement>> = {
    thane: useRef<HTMLDivElement>(null),
    borivali: useRef<HTMLDivElement>(null),
    kharghar: useRef<HTMLDivElement>(null),
    pune: useRef<HTMLDivElement>(null),
    'delhi-ncr': useRef<HTMLDivElement>(null),
    panvel: useRef<HTMLDivElement>(null)
  };

  const getHeatmapData = (city: string, data: LocationTrafficData): CityMapData => {
    const points = POINTS_OF_INTEREST[city];
    const maxVehicles = data.hourlyData.reduce((max, hour) => 
      Math.max(max, hour.vehicleCount), 0);
    
    return {
      center: CITY_COORDINATES[city],
      heatmapData: points.map((point, index) => {
        const baseWeight = data.currentTraffic.vehicleCount / maxVehicles;
        const variation = 0.2 * (Math.sin(index) + 1);
        return {
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: Math.min(1, baseWeight + variation)
        };
      })
    };
  };

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
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        zoom: 18,
        center: CITY_COORDINATES[city],
        mapTypeId: 'satellite',
        disableDefaultUI: false,
        draggable: true,
        zoomControl: true,
        scrollwheel: true,
        streetViewControl: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
          mapTypeIds: ['roadmap', 'satellite'],
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        tilt: 45,
        heading: 0,
        mapId: 'urbanx_3d_map'
      });

      // Add Traffic Layer
      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      // Create clickable markers for each point of interest
      POINTS_OF_INTEREST[city].forEach(point => {
        // Get traffic data for this location
        const locationData = trafficData.find(data => data.location === city);
        const hotspot = locationData?.hotspots.find(h => h.name === point.name);
        const congestionLevel = hotspot ?
          hotspot.congestionLevel >= 1.5 ? 'severe' :
          hotspot.congestionLevel >= 1.2 ? 'high' :
          hotspot.congestionLevel >= 0.8 ? 'moderate' : 'low'
          : 'low';

        // Set marker color based on congestion level
        const congestionColors: Record<string, string> = {
          low: '#4CAF50',
          moderate: '#FFC107',
          high: '#FF9800',
          severe: '#FF4560'
        };

        // Generate incident data based on congestion level
        const incidents = hotspot ? [{
          type: 'Traffic Congestion',
          severity: congestionLevel.toUpperCase(),
          description: `Traffic density: ${Math.round(hotspot.congestionLevel * 100)}%, ${hotspot.vehicleCount} vehicles`
        }] : [];

        // Create marker with congestion-based styling
        const marker = new google.maps.Marker({
          position: point,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: congestionColors[congestionLevel],
            fillOpacity: 0.7,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          }
        });

        // Create info window with enhanced content
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="
              background: rgba(0, 0, 0, 0.95);
              color: white;
              padding: 12px 16px;
              border-radius: 8px;
              font-family: system-ui, -apple-system, sans-serif;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 2px solid ${congestionColors[congestionLevel]};
              text-align: left;
              min-width: 200px;
            ">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
                ${point.name}
              </div>
              <div style="
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                background: ${congestionColors[congestionLevel]};
                font-size: 12px;
                margin-bottom: 8px;
              ">
                ${congestionLevel.toUpperCase()} TRAFFIC
              </div>
              ${incidents.map((incident: { type: string; severity: string; description: string; }) => `
                <div style="
                  margin-top: 8px;
                  padding: 8px;
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 4px;
                  font-size: 12px;
                ">
                  <div style="color: #FF4560; font-weight: bold; margin-bottom: 4px;">
                    ${incident.type.toUpperCase()} - ${incident.severity.toUpperCase()}
                  </div>
                  <div>${incident.description}</div>
                </div>
              `).join('')}
            </div>
          `
        });

        // Add click listener
        marker.addListener('click', () => {
          // Close any open info windows
          Object.values(maps).forEach(m => {
            google.maps.event.trigger(m, 'closeclick');
          });
          infoWindow.open(map, marker);
        });

        // Add blinking animation
        let scale = 15;
        let opacity = 0.7;
        let increasing = true;

        const markerInterval = setInterval(() => {
          scale = increasing ? scale + 1 : scale - 1;
          opacity = increasing ? opacity + 0.05 : opacity - 0.05;

          if (scale >= 25) increasing = false;
          if (scale <= 15) increasing = true;

          marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: '#FF4560',
            fillOpacity: opacity,
            strokeWeight: 3,
            strokeColor: '#FFFFFF'
          });
        }, 100);

        // Clean up animation interval
        window.addEventListener('beforeunload', () => {
          clearInterval(markerInterval);
        });
      });

      // Initialize heatmap with enhanced effect
      const heatmap = new google.maps.visualization.HeatmapLayer({
        data: POINTS_OF_INTEREST[city].map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: 0.7 // Increased base weight
        })),
        radius: 35, // Slightly larger radius
        opacity: 0.8, // Higher base opacity
        gradient: [
          'rgba(255, 69, 96, 0)',
          'rgba(255, 69, 96, 0.4)',
          'rgba(255, 69, 96, 0.6)',
          'rgba(255, 69, 96, 0.8)',
          'rgba(255, 69, 96, 1.0)'
        ]
      });
      heatmap.setMap(map);

      // Animate heatmap with enhanced blinking
      const heatmapInterval = setInterval(() => {
        const opacity = Math.sin(Date.now() / 300) * 0.4 + 0.6; // Faster and more pronounced blinking
        heatmap.setOptions({ opacity });
      }, 30);

      // Clean up animation interval
      window.addEventListener('beforeunload', () => {
        clearInterval(heatmapInterval);
      });

      newMaps[city] = map;
      newHeatmaps[city] = heatmap;
    });

    setMaps(newMaps);
    setHeatmaps(newHeatmaps);
    setMapsLoaded(true);
  };

  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMaps();
      return;
    }

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization,webgl&callback=initMap`;
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
          <div className="relative">
            <div
              ref={mapRefs[city]}
              className="h-[600px] w-full rounded-lg overflow-hidden"
            />
            {!mapsLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-sm">Initializing 3D view...</div>
              </div>
            )}
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              3D View Active
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  const map = maps[city];
                  if (map) {
                    const currentTilt = map.getTilt();
                    map.setTilt(currentTilt === 0 ? 45 : 0);
                  }
                }}
                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                title="Toggle tilt"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
                </svg>
              </button>
              <button
                onClick={() => {
                  const map = maps[city];
                  if (map) {
                    const currentHeading = map.getHeading() || 0;
                    map.setHeading((currentHeading + 90) % 360);
                  }
                }}
                className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                title="Rotate view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                </svg>
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}