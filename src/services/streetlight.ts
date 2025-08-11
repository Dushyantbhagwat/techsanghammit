interface StreetLightData {
  location: string;
  current: {
    totalLights: number;
    activeLights: number;
    faultyLights: number;
    energyConsumption: number; // in kWh
    timestamp: string;
  };
  hourly: Array<{
    hour: string;
    activeCount: number;
    energyUsage: number;
  }>;
  faultReport: Array<{
    zone: string;
    count: number;
    status: 'critical' | 'moderate' | 'minor';
  }>;
  energyStats: {
    daily: number;
    weekly: number;
    monthly: number;
    yearlyComparison: Array<{
      year: number;
      consumption: number;
    }>;
  };
}

const MOCK_DATA: Record<string, StreetLightData> = {
  "thane": {
    location: "thane",
    current: {
      totalLights: 3000,
      activeLights: 2900,
      faultyLights: 100,
      energyConsumption: 1050,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 2900,
        energyUsage: isDayTime ? 0 : 42 + Math.random() * 6
      };
    }),
    faultReport: [
      { zone: "Lake Area", count: 35, status: "critical" },
      { zone: "Market Zone", count: 40, status: "moderate" },
      { zone: "Residential Area", count: 25, status: "minor" }
    ],
    energyStats: {
      daily: 1050,
      weekly: 7350,
      monthly: 31500,
      yearlyComparison: [
        { year: 2020, consumption: 420000 },
        { year: 2021, consumption: 410000 },
        { year: 2022, consumption: 395000 },
        { year: 2023, consumption: 380000 },
        { year: 2024, consumption: 370000 }
      ]
    }
  },
  "borivali": {
    location: "borivali",
    current: {
      totalLights: 2500,
      activeLights: 2450,
      faultyLights: 50,
      energyConsumption: 875,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 2450,
        energyUsage: isDayTime ? 0 : 35 + Math.random() * 5
      };
    }),
    faultReport: [
      { zone: "Western Zone", count: 20, status: "moderate" },
      { zone: "Central Area", count: 15, status: "minor" },
      { zone: "Railway Station", count: 15, status: "critical" }
    ],
    energyStats: {
      daily: 875,
      weekly: 6125,
      monthly: 26250,
      yearlyComparison: [
        { year: 2020, consumption: 350000 },
        { year: 2021, consumption: 340000 },
        { year: 2022, consumption: 320000 },
        { year: 2023, consumption: 310000 },
        { year: 2024, consumption: 300000 }
      ]
    }
  },
  "kharghar": {
    location: "kharghar",
    current: {
      totalLights: 2800,
      activeLights: 2700,
      faultyLights: 100,
      energyConsumption: 980,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 2700,
        energyUsage: isDayTime ? 0 : 39 + Math.random() * 5
      };
    }),
    faultReport: [
      { zone: "Main Market", count: 30, status: "critical" },
      { zone: "Station Road", count: 45, status: "moderate" },
      { zone: "New Development", count: 25, status: "minor" }
    ],
    energyStats: {
      daily: 980,
      weekly: 6860,
      monthly: 29400,
      yearlyComparison: [
        { year: 2020, consumption: 390000 },
        { year: 2021, consumption: 385000 },
        { year: 2022, consumption: 375000 },
        { year: 2023, consumption: 360000 },
        { year: 2024, consumption: 350000 }
      ]
    }
  },
  "pune": {
    location: "pune",
    current: {
      totalLights: 3500,
      activeLights: 3400,
      faultyLights: 100,
      energyConsumption: 1225,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 3400,
        energyUsage: isDayTime ? 0 : 45 + Math.random() * 7
      };
    }),
    faultReport: [
      { zone: "Shivaji Nagar", count: 30, status: "critical" },
      { zone: "Koregaon Park", count: 40, status: "moderate" },
      { zone: "FC Road", count: 30, status: "minor" }
    ],
    energyStats: {
      daily: 1225,
      weekly: 8575,
      monthly: 36750,
      yearlyComparison: [
        { year: 2020, consumption: 450000 },
        { year: 2021, consumption: 440000 },
        { year: 2022, consumption: 430000 },
        { year: 2023, consumption: 420000 },
        { year: 2024, consumption: 410000 }
      ]
    }
  },
  "nashik": {
    location: "nashik",
    current: {
      totalLights: 2600,
      activeLights: 2500,
      faultyLights: 100,
      energyConsumption: 910,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 2500,
        energyUsage: isDayTime ? 0 : 37 + Math.random() * 5
      };
    }),
    faultReport: [
      { zone: "College Road", count: 35, status: "critical" },
      { zone: "Old City", count: 40, status: "moderate" },
      { zone: "CIDCO Area", count: 25, status: "minor" }
    ],
    energyStats: {
      daily: 910,
      weekly: 6370,
      monthly: 27300,
      yearlyComparison: [
        { year: 2020, consumption: 360000 },
        { year: 2021, consumption: 350000 },
        { year: 2022, consumption: 340000 },
        { year: 2023, consumption: 330000 },
        { year: 2024, consumption: 320000 }
      ]
    }
  },
  "panvel": {
    location: "panvel",
    current: {
      totalLights: 2400,
      activeLights: 2300,
      faultyLights: 100,
      energyConsumption: 840,
      timestamp: new Date().toISOString()
    },
    hourly: Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const isDayTime = hour >= 6 && hour <= 18;
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        activeCount: isDayTime ? 0 : 2300,
        energyUsage: isDayTime ? 0 : 34 + Math.random() * 5
      };
    }),
    faultReport: [
      { zone: "New Panvel", count: 30, status: "critical" },
      { zone: "Old Market", count: 45, status: "moderate" },
      { zone: "CIDCO Colony", count: 25, status: "minor" }
    ],
    energyStats: {
      daily: 840,
      weekly: 5880,
      monthly: 25200,
      yearlyComparison: [
        { year: 2020, consumption: 340000 },
        { year: 2021, consumption: 330000 },
        { year: 2022, consumption: 320000 },
        { year: 2023, consumption: 310000 },
        { year: 2024, consumption: 300000 }
      ]
    }
  }
};

export const fetchStreetLightData = async (city?: string): Promise<StreetLightData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!city || !MOCK_DATA[city]) {
    return MOCK_DATA["borivali"]; // Default to Borivali if city not specified or not found
  }

  return {
    ...MOCK_DATA[city],
    current: {
      ...MOCK_DATA[city].current,
      timestamp: new Date().toISOString()
    }
  };
};