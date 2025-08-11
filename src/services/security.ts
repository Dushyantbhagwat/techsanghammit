interface Location {
  latitude: number;
  longitude: number;
}

export interface SecurityData {
  current: {
    activeAlerts: number;
    activeCameras: number;
    incidentCount: number;
    timestamp: string;
  };
  hourly: Array<{
    hour: string;
    alertCount: number;
    incidentCount: number;
  }>;
  zones: Array<{
    name: string;
    activeCameras: number;
    alertCount: number;
    incidentCount: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  }>;
  incidentTypes: Array<{
    type: string;
    count: number;
  }>;
}

const LOCATIONS: Record<string, Location> = {
  "Thane": { latitude: 19.2183, longitude: 72.9783 },
  "Borivali": { latitude: 19.2301, longitude: 72.8507 },
  "Kalyan": { latitude: 19.2432, longitude: 73.1356 }
};

const ZONES: Record<string, string[]> = {
  "Thane": ["Central", "Station", "Market", "Lake City"],
  "Borivali": ["National Park", "Station", "Market", "IC Colony"],
  "Kalyan": ["Station Complex", "Market", "Residential", "Business"]
};

const INCIDENT_TYPES = [
  "Suspicious Activity",
  "Traffic Violation",
  "Public Safety",
  "Emergency",
  "Infrastructure Issue",
  "Crowd Management"
];

// Generate realistic hourly data based on time patterns
const generateHourlyData = (baseCount: number, timestamp: Date) => {
  return Array.from({ length: 24 }, (_, hour) => {
    let multiplier = 1;
    const currentHour = timestamp.getHours();

    // More incidents during rush hours
    if (hour >= 8 && hour <= 10) multiplier = 1.5;
    if (hour >= 17 && hour <= 19) multiplier = 1.8;
    // Fewer incidents during early morning
    if (hour >= 1 && hour <= 4) multiplier = 0.3;
    
    // Add some randomness
    const randomFactor = 0.7 + Math.random() * 0.6;
    
    // Calculate base numbers
    const baseAlertCount = Math.round(baseCount * multiplier * randomFactor);
    const baseIncidentCount = Math.round(baseAlertCount * 0.4); // 40% of alerts become incidents

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      alertCount: baseAlertCount,
      incidentCount: baseIncidentCount
    };
  });
};

// Calculate risk level based on incident count and camera status
const calculateRiskLevel = (incidentCount: number, totalCameras: number, activeCameras: number): SecurityData['zones'][0]['riskLevel'] => {
  const incidentRisk = incidentCount > 5 ? 2 : incidentCount > 2 ? 1 : 0;
  const cameraRisk = (activeCameras / totalCameras) < 0.8 ? 1 : 0;
  const totalRisk = incidentRisk + cameraRisk;

  if (totalRisk >= 2) return 'High';
  if (totalRisk === 1) return 'Medium';
  return 'Low';
};

// Generate mock security data with realistic patterns
const generateMockData = (location: string, timestamp: Date): SecurityData => {
  const baseAlertCount = 8; // Base number of alerts per hour
  const hourlyData = generateHourlyData(baseAlertCount, timestamp);
  
  // Calculate current hour's data
  const currentHourData = hourlyData[timestamp.getHours()];
  
  // Generate zone data
  const locationZones = ZONES[location] || ZONES["Thane"];
  const zones = locationZones.map(zoneName => {
    const totalCameras = 30 + Math.floor(Math.random() * 10);
    const activeCameras = totalCameras - Math.floor(Math.random() * 5); // Some cameras might be inactive
    const incidentCount = Math.floor(Math.random() * 6);
    const alertCount = incidentCount + Math.floor(Math.random() * 3);

    return {
      name: `${zoneName} Zone`,
      activeCameras,
      alertCount,
      incidentCount,
      riskLevel: calculateRiskLevel(incidentCount, totalCameras, activeCameras)
    };
  });

  // Generate incident type distribution
  const totalIncidents = zones.reduce((sum, zone) => sum + zone.incidentCount, 0);
  const incidentTypes = INCIDENT_TYPES.map(type => ({
    type,
    count: Math.floor(Math.random() * (totalIncidents / 2)) + 1
  })).sort((a, b) => b.count - a.count);

  return {
    current: {
      activeAlerts: currentHourData.alertCount,
      activeCameras: zones.reduce((sum, zone) => sum + zone.activeCameras, 0),
      incidentCount: currentHourData.incidentCount,
      timestamp: timestamp.toISOString()
    },
    hourly: hourlyData,
    zones,
    incidentTypes
  };
};

export const fetchSecurityData = async (city?: string): Promise<SecurityData> => {
  try {
    const timestamp = new Date();
    const location = city || "Thane";

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return generateMockData(location, timestamp);
  } catch (error) {
    console.error('Error generating security data:', error);
    throw new Error('Failed to fetch security data');
  }
};