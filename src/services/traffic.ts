interface Location {
  latitude: number;
  longitude: number;
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
}

const LOCATIONS: Record<string, Location> = {
  "thane": { latitude: 19.2000, longitude: 72.9780 },
  "borivali": { latitude: 19.2335, longitude: 72.8474 },
  "kharghar": { latitude: 19.0330, longitude: 73.0297 },
  "pune": { latitude: 18.5204, longitude: 73.8567 },
  "nashik": { latitude: 19.9975, longitude: 73.7898 },
  "panvel": { latitude: 18.9894, longitude: 73.1175 }
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
      "nashik": 1.0,    // Moderate city traffic
      "panvel": 0.8     // Lower suburban traffic
    }[location] || 1;

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      vehicleCount: Math.round(baseCount * multiplier * locationMultiplier + (Math.random() * 100 - 50))
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
    hourlyData
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