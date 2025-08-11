interface CityCharacteristics {
  type: 'business' | 'it_hub' | 'residential' | 'industrial' | 'religious' | 'mixed';
  populationDensity: 'low' | 'medium' | 'high' | 'very_high';
  infrastructureCapacity: number; // 1-10 scale
  economicActivity: 'low' | 'medium' | 'high' | 'very_high';
  peakHours: {
    morning: { start: number; end: number; intensity: number };
    evening: { start: number; end: number; intensity: number };
    additional?: { start: number; end: number; intensity: number; reason: string };
  };
  baseVehicleCount: number;
  averageSpeed: number;
  congestionMultiplier: number;
}

interface Location {
  latitude: number;
  longitude: number;
  characteristics: CityCharacteristics;
  trafficHotspots: Array<{
    lat: number;
    lng: number;
    name: string;
    baseMultiplier: number;
    type: 'station' | 'highway' | 'market' | 'office' | 'mall' | 'hospital' | 'school' | 'temple' | 'industrial';
    peakTimes?: number[]; // Hours when this hotspot is most congested
  }>;
}

interface TrafficData {
  duration: number;  // Duration in seconds
  vehicleCount: number;
  timestamp: string;
}

export interface LocationTrafficData {
  location: string;
  currentTraffic: TrafficData;
  peakHour: {
    hour: number;
    vehicleCount: number;
  };
  dailyTotal: number;
  hourlyData: Array<{
    hour: string;
    vehicleCount: number;
  }>;
  hotspots: Array<{
    name: string;
    congestionLevel: number;
    vehicleCount: number;
  }>;
  cityCharacteristics?: {
    type: string;
    averageSpeed: number;
    infrastructureRating: number;
    populationDensity: string;
    economicActivity: string;
  };
}

const LOCATIONS: Record<string, Location> = {
  "thane": {
    latitude: 19.2000,
    longitude: 72.9780,
    characteristics: {
      type: 'business',
      populationDensity: 'very_high',
      infrastructureCapacity: 6,
      economicActivity: 'very_high',
      peakHours: {
        morning: { start: 8, end: 11, intensity: 2.8 },
        evening: { start: 17, end: 20, intensity: 3.2 }
      },
      baseVehicleCount: 450,
      averageSpeed: 28,
      congestionMultiplier: 1.4
    },
    trafficHotspots: [
      {
        lat: 19.2010, lng: 72.9790,
        name: "Thane Station Complex",
        baseMultiplier: 2.2,
        type: 'station',
        peakTimes: [8, 9, 18, 19, 20]
      },
      {
        lat: 19.1990, lng: 72.9770,
        name: "Eastern Express Highway",
        baseMultiplier: 2.5,
        type: 'highway',
        peakTimes: [8, 9, 17, 18, 19]
      },
      {
        lat: 19.2020, lng: 72.9800,
        name: "Viviana Mall Junction",
        baseMultiplier: 1.8,
        type: 'mall',
        peakTimes: [12, 13, 19, 20, 21]
      },
      {
        lat: 19.1980, lng: 72.9760,
        name: "Ghodbunder Road",
        baseMultiplier: 2.0,
        type: 'highway',
        peakTimes: [8, 9, 18, 19]
      },
      {
        lat: 19.2030, lng: 72.9810,
        name: "Thane Creek Bridge",
        baseMultiplier: 1.9,
        type: 'highway',
        peakTimes: [7, 8, 17, 18]
      }
    ]
  },
  "borivali": {
    latitude: 19.2335,
    longitude: 72.8474,
    characteristics: {
      type: 'residential',
      populationDensity: 'high',
      infrastructureCapacity: 7,
      economicActivity: 'high',
      peakHours: {
        morning: { start: 7, end: 10, intensity: 2.4 },
        evening: { start: 18, end: 21, intensity: 2.6 }
      },
      baseVehicleCount: 380,
      averageSpeed: 32,
      congestionMultiplier: 1.2
    },
    trafficHotspots: [
      {
        lat: 19.2345, lng: 72.8484,
        name: "Borivali Station East",
        baseMultiplier: 2.0,
        type: 'station',
        peakTimes: [7, 8, 9, 18, 19, 20]
      },
      {
        lat: 19.2325, lng: 72.8464,
        name: "Western Express Highway",
        baseMultiplier: 2.2,
        type: 'highway',
        peakTimes: [8, 9, 18, 19]
      },
      {
        lat: 19.2355, lng: 72.8494,
        name: "Borivali National Park Gate",
        baseMultiplier: 1.5,
        type: 'highway',
        peakTimes: [10, 11, 16, 17]
      },
      {
        lat: 19.2315, lng: 72.8454,
        name: "Poisar Bus Depot",
        baseMultiplier: 1.7,
        type: 'station',
        peakTimes: [7, 8, 17, 18, 19]
      }
    ]
  },
  "kharghar": {
    latitude: 19.0330,
    longitude: 73.0297,
    characteristics: {
      type: 'residential',
      populationDensity: 'medium',
      infrastructureCapacity: 8,
      economicActivity: 'medium',
      peakHours: {
        morning: { start: 8, end: 10, intensity: 1.8 },
        evening: { start: 18, end: 20, intensity: 2.0 }
      },
      baseVehicleCount: 280,
      averageSpeed: 38,
      congestionMultiplier: 0.9
    },
    trafficHotspots: [
      {
        lat: 19.0340, lng: 73.0307,
        name: "Central Park Square",
        baseMultiplier: 1.4,
        type: 'mall',
        peakTimes: [11, 12, 19, 20, 21]
      },
      {
        lat: 19.0320, lng: 73.0287,
        name: "Kharghar Station",
        baseMultiplier: 1.6,
        type: 'station',
        peakTimes: [8, 9, 18, 19]
      },
      {
        lat: 19.0350, lng: 73.0317,
        name: "Palm Beach Road",
        baseMultiplier: 1.3,
        type: 'highway',
        peakTimes: [8, 9, 17, 18]
      },
      {
        lat: 19.0310, lng: 73.0277,
        name: "Sector 35 Junction",
        baseMultiplier: 1.2,
        type: 'highway',
        peakTimes: [8, 18, 19]
      }
    ]
  },
  "pune": {
    latitude: 18.5204,
    longitude: 73.8567,
    characteristics: {
      type: 'it_hub',
      populationDensity: 'very_high',
      infrastructureCapacity: 5,
      economicActivity: 'very_high',
      peakHours: {
        morning: { start: 8, end: 11, intensity: 3.5 },
        evening: { start: 17, end: 21, intensity: 3.8 },
        additional: { start: 13, end: 14, intensity: 1.8, reason: 'lunch_break' }
      },
      baseVehicleCount: 520,
      averageSpeed: 24,
      congestionMultiplier: 1.6
    },
    trafficHotspots: [
      {
        lat: 18.5214, lng: 73.8577,
        name: "Hinjewadi IT Park Phase 1",
        baseMultiplier: 3.2,
        type: 'office',
        peakTimes: [9, 10, 13, 18, 19, 20]
      },
      {
        lat: 18.5194, lng: 73.8557,
        name: "Pune Railway Station",
        baseMultiplier: 2.4,
        type: 'station',
        peakTimes: [8, 9, 18, 19, 20]
      },
      {
        lat: 18.5224, lng: 73.8587,
        name: "Baner-Balewadi Road",
        baseMultiplier: 2.8,
        type: 'highway',
        peakTimes: [8, 9, 10, 17, 18, 19]
      },
      {
        lat: 18.5184, lng: 73.8547,
        name: "Shivajinagar IT Corridor",
        baseMultiplier: 2.6,
        type: 'office',
        peakTimes: [9, 10, 18, 19]
      },
      {
        lat: 18.5234, lng: 73.8597,
        name: "Wakad IT Hub",
        baseMultiplier: 2.9,
        type: 'office',
        peakTimes: [9, 10, 13, 18, 19]
      },
      {
        lat: 18.5174, lng: 73.8537,
        name: "Katraj-Dehu Road Bypass",
        baseMultiplier: 2.2,
        type: 'highway',
        peakTimes: [8, 9, 17, 18]
      }
    ]
  },
  "nashik": {
    latitude: 19.9975,
    longitude: 73.7898,
    characteristics: {
      type: 'religious',
      populationDensity: 'high',
      infrastructureCapacity: 6,
      economicActivity: 'medium',
      peakHours: {
        morning: { start: 6, end: 9, intensity: 2.2 },
        evening: { start: 17, end: 19, intensity: 2.4 },
        additional: { start: 16, end: 18, intensity: 2.0, reason: 'temple_hours' }
      },
      baseVehicleCount: 350,
      averageSpeed: 30,
      congestionMultiplier: 1.1
    },
    trafficHotspots: [
      {
        lat: 19.9985, lng: 73.7908,
        name: "Trimbakeshwar Temple Road",
        baseMultiplier: 2.1,
        type: 'temple',
        peakTimes: [6, 7, 16, 17, 18]
      },
      {
        lat: 19.9965, lng: 73.7888,
        name: "Nashik Road Station",
        baseMultiplier: 1.8,
        type: 'station',
        peakTimes: [7, 8, 17, 18]
      },
      {
        lat: 19.9955, lng: 73.7878,
        name: "Gangapur Road Market",
        baseMultiplier: 1.9,
        type: 'market',
        peakTimes: [10, 11, 16, 17, 18]
      },
      {
        lat: 19.9945, lng: 73.7868,
        name: "CIDCO Industrial Area",
        baseMultiplier: 1.6,
        type: 'industrial',
        peakTimes: [8, 9, 17, 18]
      },
      {
        lat: 19.9995, lng: 73.7918,
        name: "Panchavati Ghat",
        baseMultiplier: 1.7,
        type: 'temple',
        peakTimes: [6, 7, 17, 18, 19]
      },
      {
        lat: 19.9935, lng: 73.7858,
        name: "College Road Junction",
        baseMultiplier: 1.5,
        type: 'school',
        peakTimes: [8, 9, 16, 17]
      }
    ]
  },
  "panvel": {
    latitude: 18.9894,
    longitude: 73.1175,
    characteristics: {
      type: 'mixed',
      populationDensity: 'medium',
      infrastructureCapacity: 7,
      economicActivity: 'medium',
      peakHours: {
        morning: { start: 7, end: 9, intensity: 2.0 },
        evening: { start: 17, end: 19, intensity: 2.2 }
      },
      baseVehicleCount: 320,
      averageSpeed: 35,
      congestionMultiplier: 1.0
    },
    trafficHotspots: [
      {
        lat: 18.9904, lng: 73.1185,
        name: "Panvel Railway Station",
        baseMultiplier: 1.8,
        type: 'station',
        peakTimes: [7, 8, 17, 18, 19]
      },
      {
        lat: 18.9884, lng: 73.1165,
        name: "Old Panvel Market",
        baseMultiplier: 1.6,
        type: 'market',
        peakTimes: [10, 11, 16, 17]
      },
      {
        lat: 18.9874, lng: 73.1155,
        name: "CIDCO Colony Gate",
        baseMultiplier: 1.4,
        type: 'highway',
        peakTimes: [8, 9, 17, 18]
      },
      {
        lat: 18.9864, lng: 73.1145,
        name: "New Panvel Junction",
        baseMultiplier: 1.7,
        type: 'highway',
        peakTimes: [8, 9, 18, 19]
      },
      {
        lat: 18.9914, lng: 73.1195,
        name: "Panvel Creek Bridge",
        baseMultiplier: 1.5,
        type: 'highway',
        peakTimes: [7, 8, 17, 18]
      }
    ]
  }
};

// Generate realistic hourly data based on city-specific characteristics
const generateHourlyData = (location: string) => {
  const cityData = LOCATIONS[location];
  if (!cityData) return [];

  const { characteristics } = cityData;
  const baseCount = characteristics.baseVehicleCount;

  return Array.from({ length: 24 }, (_, hour) => {
    let multiplier = 1;

    // Apply city-specific peak hours
    const { morning, evening, additional } = characteristics.peakHours;

    // Morning rush hour
    if (hour >= morning.start && hour <= morning.end) {
      multiplier = morning.intensity;
    }
    // Evening rush hour
    else if (hour >= evening.start && hour <= evening.end) {
      multiplier = evening.intensity;
    }
    // Additional peak (for cities like Pune with lunch rush, Nashik with temple hours)
    else if (additional && hour >= additional.start && hour <= additional.end) {
      multiplier = additional.intensity;
    }
    // Late night (11 PM - 5 AM)
    else if (hour >= 23 || hour <= 5) {
      multiplier = 0.2 + (characteristics.economicActivity === 'very_high' ? 0.2 : 0);
    }
    // Normal daytime
    else {
      multiplier = 1.2 + (characteristics.economicActivity === 'very_high' ? 0.4 :
                         characteristics.economicActivity === 'high' ? 0.3 :
                         characteristics.economicActivity === 'medium' ? 0.2 : 0.1);
    }

    // Apply city-specific congestion multiplier
    multiplier *= characteristics.congestionMultiplier;

    // Add infrastructure capacity factor (better infrastructure = smoother flow)
    const infrastructureFactor = characteristics.infrastructureCapacity / 10;
    multiplier *= (1 + infrastructureFactor * 0.1);

    // Add population density impact
    const densityMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.2,
      'very_high': 1.4
    }[characteristics.populationDensity];

    multiplier *= densityMultiplier;

    // Add realistic variation (±15%)
    const variation = (Math.random() - 0.5) * 0.3;
    const finalCount = Math.round(baseCount * multiplier * (1 + variation));

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      vehicleCount: Math.max(50, finalCount) // Minimum 50 vehicles
    };
  });
};

// Generate hotspot data based on city-specific characteristics
const generateHotspotData = (location: string, currentHour: number) => {
  const cityData = LOCATIONS[location];
  if (!cityData) return [];

  const { trafficHotspots, characteristics } = cityData;

  return trafficHotspots.map(hotspot => {
    let congestionLevel = hotspot.baseMultiplier;

    // Check if current hour is a peak time for this specific hotspot
    const isPeakTime = hotspot.peakTimes?.includes(currentHour);
    if (isPeakTime) {
      congestionLevel *= 1.8; // Significant increase during peak times
    }

    // Apply city-specific peak hour multipliers
    const { morning, evening, additional } = characteristics.peakHours;

    if (currentHour >= morning.start && currentHour <= morning.end) {
      congestionLevel *= (morning.intensity * 0.4); // Scale down for hotspot level
    } else if (currentHour >= evening.start && currentHour <= evening.end) {
      congestionLevel *= (evening.intensity * 0.4);
    } else if (additional && currentHour >= additional.start && currentHour <= additional.end) {
      congestionLevel *= (additional.intensity * 0.4);
    }

    // Apply hotspot type-specific factors
    const typeMultipliers = {
      'station': currentHour >= 7 && currentHour <= 9 || currentHour >= 17 && currentHour <= 19 ? 1.4 : 1.0,
      'highway': currentHour >= 8 && currentHour <= 10 || currentHour >= 17 && currentHour <= 19 ? 1.3 : 1.0,
      'office': currentHour >= 9 && currentHour <= 10 || currentHour >= 18 && currentHour <= 19 ? 1.5 :
                currentHour >= 13 && currentHour <= 14 ? 1.2 : 0.8,
      'mall': currentHour >= 11 && currentHour <= 13 || currentHour >= 19 && currentHour <= 21 ? 1.3 : 1.0,
      'market': currentHour >= 10 && currentHour <= 12 || currentHour >= 16 && currentHour <= 18 ? 1.4 : 1.0,
      'temple': currentHour >= 6 && currentHour <= 8 || currentHour >= 17 && currentHour <= 19 ? 1.6 : 1.0,
      'school': currentHour >= 8 && currentHour <= 9 || currentHour >= 15 && currentHour <= 16 ? 1.5 : 0.7,
      'hospital': 1.1, // Consistent moderate traffic
      'industrial': currentHour >= 8 && currentHour <= 9 || currentHour >= 17 && currentHour <= 18 ? 1.3 : 0.9
    };

    congestionLevel *= typeMultipliers[hotspot.type] || 1.0;

    // Apply city congestion multiplier
    congestionLevel *= characteristics.congestionMultiplier;

    // Add realistic variation (±20%)
    const variation = (Math.random() - 0.5) * 0.4;
    congestionLevel *= (1 + variation);

    // Calculate vehicle count based on congestion and hotspot type
    const baseVehicleCount = {
      'station': 300,
      'highway': 400,
      'office': 250,
      'mall': 200,
      'market': 180,
      'temple': 150,
      'school': 120,
      'hospital': 100,
      'industrial': 220
    }[hotspot.type] || 200;

    return {
      name: hotspot.name,
      congestionLevel: Math.min(Math.max(congestionLevel, 0.5), 3.0), // Clamp between 0.5 and 3.0
      vehicleCount: Math.round(baseVehicleCount * congestionLevel)
    };
  });
};

// Generate mock traffic data with city-specific realistic patterns
const generateMockTrafficData = (location: string): LocationTrafficData => {
  const cityData = LOCATIONS[location];
  if (!cityData) {
    throw new Error(`Unknown location: ${location}`);
  }

  const currentHour = new Date().getHours();
  const { characteristics } = cityData;

  // Generate hourly data using city-specific patterns
  const hourlyData = generateHourlyData(location);

  // Find peak hour based on city characteristics
  const peakHourData = hourlyData.reduce((max, current) =>
    current.vehicleCount > max.vehicleCount ? current : max
  );

  // Calculate daily total
  const dailyTotal = hourlyData.reduce((sum, hour) => sum + hour.vehicleCount, 0);

  // Generate city-specific hotspot data
  const hotspots = generateHotspotData(location, currentHour);

  // Calculate current traffic metrics based on city characteristics
  const currentVehicleCount = hourlyData[currentHour].vehicleCount;
  const currentCongestion = Math.min(100, Math.max(0,
    (currentVehicleCount / characteristics.baseVehicleCount) * 50 * characteristics.congestionMultiplier
  ));

  // Calculate duration based on congestion and infrastructure
  const baseDuration = 30; // Base 30 minutes
  const congestionFactor = currentCongestion / 100;
  const infrastructureFactor = (10 - characteristics.infrastructureCapacity) / 10;
  const duration = Math.round(baseDuration * (1 + congestionFactor + infrastructureFactor));

  return {
    location,
    currentTraffic: {
      duration: duration,
      vehicleCount: currentVehicleCount,
      timestamp: new Date().toISOString()
    },
    peakHour: {
      hour: parseInt(peakHourData.hour),
      vehicleCount: peakHourData.vehicleCount
    },
    dailyTotal,
    hourlyData,
    hotspots,
    // Add city-specific metadata
    cityCharacteristics: {
      type: characteristics.type,
      averageSpeed: characteristics.averageSpeed,
      infrastructureRating: characteristics.infrastructureCapacity,
      populationDensity: characteristics.populationDensity,
      economicActivity: characteristics.economicActivity
    }
  };
};

export const fetchTrafficData = async (city?: string): Promise<LocationTrafficData | LocationTrafficData[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (city) {
      // Return data for specific city
      return generateMockTrafficData(city);
    }
    // Generate mock data for each location
    const mockData = Object.keys(LOCATIONS).map(location =>
      generateMockTrafficData(location)
    );

    return mockData;
  } catch (error) {
    console.error('Error generating traffic data:', error);
    throw new Error('Failed to generate traffic data');
  }
};