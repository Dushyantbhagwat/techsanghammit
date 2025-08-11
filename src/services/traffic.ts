interface Location {
  latitude: number;
  longitude: number;
  trafficHotspots: Array<{
    lat: number;
    lng: number;
    name: string;
    baseMultiplier: number;
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
}

const LOCATIONS: Record<string, Location> = {
  "thane": {
    latitude: 19.2000,
    longitude: 72.9780,
    trafficHotspots: [
      { lat: 19.2010, lng: 72.9790, name: "Thane Station", baseMultiplier: 1.5 },
      { lat: 19.1990, lng: 72.9770, name: "Eastern Express Highway", baseMultiplier: 1.8 }
    ]
  },
  "borivali": {
    latitude: 19.2335,
    longitude: 72.8474,
    trafficHotspots: [
      { lat: 19.2345, lng: 72.8484, name: "Borivali Station", baseMultiplier: 1.4 },
      { lat: 19.2325, lng: 72.8464, name: "Western Express Highway", baseMultiplier: 1.7 }
    ]
  },
  "kharghar": {
    latitude: 19.0330,
    longitude: 73.0297,
    trafficHotspots: [
      { lat: 19.0340, lng: 73.0307, name: "Central Park", baseMultiplier: 1.2 },
      { lat: 19.0320, lng: 73.0287, name: "Kharghar Station", baseMultiplier: 1.3 }
    ]
  },
  "pune": {
    latitude: 18.5204,
    longitude: 73.8567,
    trafficHotspots: [
      { lat: 18.5214, lng: 73.8577, name: "Hinjewadi IT Park", baseMultiplier: 2.0 },
      { lat: 18.5194, lng: 73.8557, name: "Pune Station", baseMultiplier: 1.6 }
    ]
  },
  "nashik": {
    latitude: 19.9975,
    longitude: 73.7898,
    trafficHotspots: [
      { lat: 19.9985, lng: 73.7908, name: "College Road", baseMultiplier: 1.4 },
      { lat: 19.9965, lng: 73.7888, name: "Nashik Road Station", baseMultiplier: 1.5 },
      { lat: 19.9955, lng: 73.7878, name: "Gangapur Road", baseMultiplier: 1.6 },
      { lat: 19.9945, lng: 73.7868, name: "CIDCO Area", baseMultiplier: 1.3 }
    ]
  },
  "panvel": {
    latitude: 18.9894,
    longitude: 73.1175,
    trafficHotspots: [
      { lat: 18.9904, lng: 73.1185, name: "Panvel Station", baseMultiplier: 1.3 },
      { lat: 18.9884, lng: 73.1165, name: "Old Panvel Market", baseMultiplier: 1.4 },
      { lat: 18.9874, lng: 73.1155, name: "CIDCO Colony", baseMultiplier: 1.2 },
      { lat: 18.9864, lng: 73.1145, name: "New Panvel Junction", baseMultiplier: 1.5 }
    ]
  }
};

// Generate realistic hourly data based on typical traffic patterns
const generateHourlyData = (baseCount: number, location: string) => {
  return Array.from({ length: 24 }, (_, hour) => {
    let multiplier = 1;
    
    // Morning rush hour (8-10 AM)
    if (hour >= 8 && hour <= 10) {
      multiplier = location === "pune" ? 3.0 : 2.5;
    }
    // Evening rush hour (5-7 PM)
    else if (hour >= 17 && hour <= 19) {
      multiplier = location === "thane" ? 3.0 : 2.8;
    }
    // Late night (11 PM - 5 AM)
    else if (hour >= 23 || hour <= 5) {
      multiplier = 0.3;
    }
    // Normal daytime
    else {
      multiplier = 1.5;
    }

    // Add location-specific variations
    const locationMultiplier = {
      "thane": 1.3,     // High traffic due to business district
      "borivali": 1.2,  // High residential and commercial traffic
      "kharghar": 0.9,  // Moderate suburban traffic
      "pune": 1.4,      // Highest traffic due to IT hubs and urban density
      "nashik": 1.1,    // Moderate to high city traffic with multiple hotspots
      "panvel": 1.0     // Moderate traffic with growing infrastructure
    }[location] || 1;

    // Add time-based variations for Nashik and Panvel
    if (location === "nashik") {
      // Higher traffic during market hours (11 AM - 4 PM)
      if (hour >= 11 && hour <= 16) {
        multiplier *= 1.3;
      }
      // Religious site rush (6 AM - 8 AM)
      if (hour >= 6 && hour <= 8) {
        multiplier *= 1.4;
      }
    } else if (location === "panvel") {
      // Station area rush (7 AM - 9 AM)
      if (hour >= 7 && hour <= 9) {
        multiplier *= 1.4;
      }
      // Market area peak (4 PM - 7 PM)
      if (hour >= 16 && hour <= 19) {
        multiplier *= 1.3;
      }
    }

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      vehicleCount: Math.round(baseCount * multiplier * locationMultiplier + (Math.random() * 100 - 50))
    };
  });
};

// Generate hotspot data
const generateHotspotData = (location: string, currentHour: number) => {
  const hotspots = LOCATIONS[location].trafficHotspots;
  return hotspots.map(hotspot => {
    let congestionLevel = hotspot.baseMultiplier;

    // Add time-based variations
    if (currentHour >= 8 && currentHour <= 10) {
      congestionLevel *= 1.5; // Morning rush
    } else if (currentHour >= 17 && currentHour <= 19) {
      congestionLevel *= 1.6; // Evening rush
    }

    // Add some randomness
    congestionLevel *= (0.8 + Math.random() * 0.4);

    return {
      name: hotspot.name,
      congestionLevel: Math.min(Math.round(congestionLevel * 100) / 100, 2),
      vehicleCount: Math.round(200 * congestionLevel)
    };
  });
};

// Generate mock traffic data with realistic patterns
const generateMockTrafficData = (location: string): LocationTrafficData => {
  const currentHour = new Date().getHours();
  const baseCount = 300; // Base vehicle count per hour
  const hourlyData = generateHourlyData(baseCount, location);
  
  // Find peak hour
  const peakHourData = hourlyData.reduce((max, current) => 
    current.vehicleCount > max.vehicleCount ? current : max
  );

  // Calculate daily total
  const dailyTotal = hourlyData.reduce((sum, hour) => sum + hour.vehicleCount, 0);

  // Generate hotspot data
  const hotspots = generateHotspotData(location, currentHour);

  return {
    location,
    currentTraffic: {
      duration: Math.round(hourlyData[currentHour].vehicleCount * 1.2), // Rough duration estimate
      vehicleCount: hourlyData[currentHour].vehicleCount,
      timestamp: new Date().toISOString()
    },
    peakHour: {
      hour: parseInt(peakHourData.hour),
      vehicleCount: peakHourData.vehicleCount
    },
    dailyTotal,
    hourlyData,
    hotspots
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