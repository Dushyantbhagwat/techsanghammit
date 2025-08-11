interface Location {
  latitude: number;
  longitude: number;
}

interface ParkingSpot {
  totalSpaces: number;
  name: string;
}

export interface LocationParkingData {
  location: string;
  current: {
    totalSpaces: number;
    occupiedSpaces: number;
    occupancyRate: number;
    timestamp: string;
  };
  hourly: Array<{
    hour: string;
    occupiedSpaces: number;
    occupancyRate: number;
  }>;
  locations: Array<{
    name: string;
    totalSpaces: number;
    occupiedSpaces: number;
    occupancyRate: number;
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

const PARKING_SPOTS: Record<string, ParkingSpot[]> = {
  "thane": [
    { name: "Lake City Mall", totalSpaces: 400 },
    { name: "Station Complex", totalSpaces: 300 },
    { name: "Market Area", totalSpaces: 150 },
    { name: "Business District", totalSpaces: 250 }
  ],
  "borivali": [
    { name: "Central Parking", totalSpaces: 300 },
    { name: "Mall Parking", totalSpaces: 400 },
    { name: "Station Parking", totalSpaces: 200 },
    { name: "Market Parking", totalSpaces: 100 }
  ],
  "kharghar": [
    { name: "Central Park", totalSpaces: 250 },
    { name: "Station Area", totalSpaces: 200 },
    { name: "Golf Course", totalSpaces: 150 },
    { name: "Market Complex", totalSpaces: 200 }
  ],
  "pune": [
    { name: "Shivaji Nagar", totalSpaces: 500 },
    { name: "Koregaon Park", totalSpaces: 400 },
    { name: "FC Road", totalSpaces: 300 },
    { name: "Phoenix Mall", totalSpaces: 600 },
    { name: "Hinjewadi IT Park", totalSpaces: 800 }
  ],
  "nashik": [
    { name: "College Road", totalSpaces: 300 },
    { name: "City Center Mall", totalSpaces: 400 },
    { name: "Old City Area", totalSpaces: 200 },
    { name: "CIDCO Complex", totalSpaces: 250 }
  ],
  "panvel": [
    { name: "Station Complex", totalSpaces: 250 },
    { name: "Market Area", totalSpaces: 200 },
    { name: "New Panvel", totalSpaces: 300 },
    { name: "CIDCO Colony", totalSpaces: 150 }
  ]
};

// Generate realistic hourly data based on typical parking patterns
const generateHourlyData = (totalSpaces: number) => {
  return Array.from({ length: 24 }, (_, hour) => {
    let occupancyRate: number;
    
    // Early morning (12 AM - 6 AM)
    if (hour >= 0 && hour < 6) {
      occupancyRate = 20 + Math.random() * 10;
    }
    // Morning rush (7 AM - 10 AM)
    else if (hour >= 7 && hour <= 10) {
      occupancyRate = 70 + Math.random() * 20;
    }
    // Mid-day (11 AM - 4 PM)
    else if (hour >= 11 && hour <= 16) {
      occupancyRate = 60 + Math.random() * 15;
    }
    // Evening rush (5 PM - 8 PM)
    else if (hour >= 17 && hour <= 20) {
      occupancyRate = 80 + Math.random() * 15;
    }
    // Late evening (9 PM - 11 PM)
    else {
      occupancyRate = 40 + Math.random() * 20;
    }

    const occupiedSpaces = Math.round((occupancyRate / 100) * totalSpaces);

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      occupiedSpaces,
      occupancyRate: Math.round(occupancyRate)
    };
  });
};

// Generate mock parking data with realistic patterns
const generateMockParkingData = (location: string): LocationParkingData => {
  const spots = PARKING_SPOTS[location];
  const totalSpaces = spots.reduce((sum, spot) => sum + spot.totalSpaces, 0);
  const currentHour = new Date().getHours();
  const hourlyData = generateHourlyData(totalSpaces);
  
  // Calculate current occupancy based on time of day
  const current = hourlyData[currentHour];
  
  // Generate location-specific data
  const locationData = spots.map(spot => {
    const occupancyRate = Math.round(current.occupancyRate * (0.8 + Math.random() * 0.4));
    const occupiedSpaces = Math.round((occupancyRate / 100) * spot.totalSpaces);
    
    return {
      name: spot.name,
      totalSpaces: spot.totalSpaces,
      occupiedSpaces,
      occupancyRate
    };
  });

  return {
    location,
    current: {
      totalSpaces,
      occupiedSpaces: current.occupiedSpaces,
      occupancyRate: current.occupancyRate,
      timestamp: new Date().toISOString()
    },
    hourly: hourlyData,
    locations: locationData
  };
};

export const fetchParkingData = async (city?: string): Promise<LocationParkingData | LocationParkingData[]> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (city) {
      // Return data for specific city
      return generateMockParkingData(city);
    }
    
    // Generate mock data for each location
    const mockData = Object.keys(LOCATIONS).map(location =>
      generateMockParkingData(location)
    );

    return mockData;
  } catch (error) {
    console.error('Error generating parking data:', error);
    throw new Error('Failed to generate parking data');
  }
};