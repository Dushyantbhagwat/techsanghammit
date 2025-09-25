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
  "mumbai": { latitude: 19.0760, longitude: 72.8777 },
  "delhi": { latitude: 28.6139, longitude: 77.2090 },
  "bangalore": { latitude: 12.9716, longitude: 77.5946 },
  "hyderabad": { latitude: 17.3850, longitude: 78.4867 },
  "chennai": { latitude: 13.0827, longitude: 80.2707 },
  "kolkata": { latitude: 22.5726, longitude: 88.3639 },
  "pune": { latitude: 18.5204, longitude: 73.8567 },
  "ahmedabad": { latitude: 23.0225, longitude: 72.5714 },
  "surat": { latitude: 21.1702, longitude: 72.8311 },
  "jaipur": { latitude: 26.9124, longitude: 75.7873 },
  "thane": { latitude: 19.2000, longitude: 72.9780 },
  "borivali": { latitude: 19.2335, longitude: 72.8474 },
  "andheri": { latitude: 19.1136, longitude: 72.8697 },
  "kharghar": { latitude: 19.0330, longitude: 73.0297 },
  "delhi-ncr": { latitude: 19.9975, longitude: 73.7898 },
  "panvel": { latitude: 18.9894, longitude: 73.1175 }
};

const PARKING_SPOTS: Record<string, ParkingSpot[]> = {
  "mumbai": [
    { name: "Bandra Kurla Complex", totalSpaces: 800 },
    { name: "Nariman Point", totalSpaces: 600 },
    { name: "Powai IT Park", totalSpaces: 500 },
    { name: "Colaba Market", totalSpaces: 300 },
    { name: "Worli Sea Link Plaza", totalSpaces: 400 }
  ],
  "delhi": [
    { name: "Connaught Place", totalSpaces: 1000 },
    { name: "Cyber City Gurgaon", totalSpaces: 1200 },
    { name: "Khan Market", totalSpaces: 400 },
    { name: "India Gate", totalSpaces: 600 },
    { name: "Karol Bagh", totalSpaces: 500 }
  ],
  "bangalore": [
    { name: "Electronic City", totalSpaces: 900 },
    { name: "Koramangala", totalSpaces: 600 },
    { name: "Whitefield IT Park", totalSpaces: 800 },
    { name: "Brigade Road", totalSpaces: 400 },
    { name: "Indiranagar", totalSpaces: 500 }
  ],
  "hyderabad": [
    { name: "HITEC City", totalSpaces: 1000 },
    { name: "Banjara Hills", totalSpaces: 600 },
    { name: "Secunderabad", totalSpaces: 500 },
    { name: "Gachibowli", totalSpaces: 700 },
    { name: "Jubilee Hills", totalSpaces: 400 }
  ],
  "chennai": [
    { name: "OMR IT Corridor", totalSpaces: 800 },
    { name: "T. Nagar", totalSpaces: 600 },
    { name: "Anna Nagar", totalSpaces: 500 },
    { name: "Express Avenue", totalSpaces: 700 },
    { name: "Marina Beach", totalSpaces: 400 }
  ],
  "kolkata": [
    { name: "Salt Lake City", totalSpaces: 600 },
    { name: "Park Street", totalSpaces: 400 },
    { name: "New Market", totalSpaces: 300 },
    { name: "Howrah Station", totalSpaces: 800 },
    { name: "Rajarhat", totalSpaces: 500 }
  ],
  "pune": [
    { name: "Shivaji Nagar", totalSpaces: 500 },
    { name: "Koregaon Park", totalSpaces: 400 },
    { name: "FC Road", totalSpaces: 300 },
    { name: "Phoenix Mall", totalSpaces: 600 },
    { name: "Hinjewadi IT Park", totalSpaces: 800 }
  ],
  "ahmedabad": [
    { name: "SG Highway", totalSpaces: 700 },
    { name: "Maninagar", totalSpaces: 400 },
    { name: "Vastrapur", totalSpaces: 500 },
    { name: "CG Road", totalSpaces: 350 },
    { name: "Satellite", totalSpaces: 450 }
  ],
  "surat": [
    { name: "Adajan", totalSpaces: 400 },
    { name: "Vesu", totalSpaces: 500 },
    { name: "City Light", totalSpaces: 300 },
    { name: "Pal", totalSpaces: 350 },
    { name: "Rander Road", totalSpaces: 250 }
  ],
  "jaipur": [
    { name: "Malviya Nagar", totalSpaces: 500 },
    { name: "C-Scheme", totalSpaces: 400 },
    { name: "Vaishali Nagar", totalSpaces: 450 },
    { name: "Pink City", totalSpaces: 300 },
    { name: "Mansarovar", totalSpaces: 350 }
  ],
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
  "andheri": [
    { name: "Andheri East", totalSpaces: 500 },
    { name: "SEEPZ", totalSpaces: 600 },
    { name: "Infinity Mall", totalSpaces: 400 },
    { name: "Metro Station", totalSpaces: 300 }
  ],
  "kharghar": [
    { name: "Central Park", totalSpaces: 250 },
    { name: "Station Area", totalSpaces: 200 },
    { name: "Golf Course", totalSpaces: 150 },
    { name: "Market Complex", totalSpaces: 200 }
  ],
  "delhi-ncr": [
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
const generateHourlyData = (totalSpaces: number, cityType: 'metro' | 'tier1' | 'tier2' = 'metro') => {
  const now = new Date();
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  return Array.from({ length: 24 }, (_, hour) => {
    let occupancyRate: number;

    // Base occupancy patterns
    if (hour >= 0 && hour < 6) {
      // Early morning (12 AM - 6 AM)
      occupancyRate = isWeekend ? 15 + Math.random() * 10 : 20 + Math.random() * 10;
    } else if (hour >= 7 && hour <= 10) {
      // Morning rush (7 AM - 10 AM)
      occupancyRate = isWeekend ? 40 + Math.random() * 15 : 70 + Math.random() * 20;
    } else if (hour >= 11 && hour <= 16) {
      // Mid-day (11 AM - 4 PM)
      occupancyRate = isWeekend ? 65 + Math.random() * 20 : 60 + Math.random() * 15;
    } else if (hour >= 17 && hour <= 20) {
      // Evening rush (5 PM - 8 PM)
      occupancyRate = isWeekend ? 70 + Math.random() * 20 : 80 + Math.random() * 15;
    } else {
      // Late evening (9 PM - 11 PM)
      occupancyRate = isWeekend ? 50 + Math.random() * 25 : 40 + Math.random() * 20;
    }

    // City type adjustments
    if (cityType === 'tier1') {
      occupancyRate *= 0.85; // Slightly less congested
    } else if (cityType === 'tier2') {
      occupancyRate *= 0.7; // Much less congested
    }

    // Ensure reasonable bounds
    occupancyRate = Math.max(10, Math.min(95, occupancyRate));
    const occupiedSpaces = Math.round((occupancyRate / 100) * totalSpaces);

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      occupiedSpaces,
      occupancyRate: Math.round(occupancyRate)
    };
  });
};

// City classification for parking patterns
const getCityType = (city: string): 'metro' | 'tier1' | 'tier2' => {
  const metroCities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata'];
  const tier1Cities = ['pune', 'ahmedabad', 'surat', 'jaipur'];

  if (metroCities.includes(city.toLowerCase())) return 'metro';
  if (tier1Cities.includes(city.toLowerCase())) return 'tier1';
  return 'tier2';
};

// Generate mock parking data with realistic patterns
const generateMockParkingData = (location: string): LocationParkingData => {
  const spots = PARKING_SPOTS[location] || PARKING_SPOTS['mumbai'];
  const totalSpaces = spots.reduce((sum, spot) => sum + spot.totalSpaces, 0);
  const currentHour = new Date().getHours();
  const cityType = getCityType(location);
  const hourlyData = generateHourlyData(totalSpaces, cityType);

  // Calculate current occupancy based on time of day
  const current = hourlyData[currentHour];

  // Generate location-specific data with more realistic variations
  const locationData = spots.map(spot => {
    // Different spot types have different occupancy patterns
    let spotMultiplier = 1;
    const spotName = spot.name.toLowerCase();

    if (spotName.includes('mall') || spotName.includes('market')) {
      spotMultiplier = 1.1; // Shopping areas more crowded
    } else if (spotName.includes('it') || spotName.includes('office')) {
      spotMultiplier = 0.9; // Office areas less crowded on weekends
    } else if (spotName.includes('station') || spotName.includes('metro')) {
      spotMultiplier = 1.2; // Transit hubs busier
    }

    const occupancyRate = Math.round(current.occupancyRate * spotMultiplier * (0.8 + Math.random() * 0.4));
    const finalOccupancyRate = Math.max(5, Math.min(95, occupancyRate));
    const occupiedSpaces = Math.round((finalOccupancyRate / 100) * spot.totalSpaces);

    return {
      name: spot.name,
      totalSpaces: spot.totalSpaces,
      occupiedSpaces,
      occupancyRate: finalOccupancyRate
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