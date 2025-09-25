// Enhanced interfaces for city-specific street light characteristics
interface CityLightingCharacteristics {
  cityType: 'business' | 'it_hub' | 'residential' | 'industrial' | 'religious' | 'mixed';
  populationDensity: 'low' | 'medium' | 'high' | 'very_high';
  infrastructureAge: 'new' | 'modern' | 'aging' | 'old'; // Affects fault rates
  economicActivity: 'low' | 'medium' | 'high' | 'very_high';
  lightingRequirements: {
    securityLevel: 'basic' | 'standard' | 'high' | 'maximum';
    aestheticImportance: 'low' | 'medium' | 'high';
    energyEfficiencyFocus: 'low' | 'medium' | 'high' | 'maximum';
  };
  operationalPatterns: {
    duskToDawn: boolean;
    motionSensors: boolean;
    dimming: boolean;
    smartControls: boolean;
  };
  maintenanceSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    responsiveness: 'immediate' | 'fast' | 'standard' | 'slow';
  };
  baseMetrics: {
    lightsPerKm: number;
    averagePowerPerLight: number; // Watts
    faultRateMultiplier: number;
    energyEfficiencyRating: number; // 1-10 scale
  };
}

interface LightingZone {
  name: string;
  type: 'commercial' | 'residential' | 'industrial' | 'highway' | 'park' | 'temple' | 'station' | 'market' | 'office' | 'hospital';
  lightCount: number;
  faultProneness: number; // 1-5 scale
  energyEfficiency: number; // 1-10 scale
  priorityLevel: 'low' | 'medium' | 'high' | 'critical';
  lastMaintenance?: string;
  specialFeatures?: string[];
}

export interface StreetLightData {
  location: string;
  cityCharacteristics: CityLightingCharacteristics;
  current: {
    totalLights: number;
    activeLights: number;
    faultyLights: number;
    energyConsumption: number; // in kWh
    timestamp: string;
    operationalEfficiency: number; // Percentage
    maintenanceScore: number; // 1-10 scale
  };
  hourly: Array<{
    hour: string;
    activeCount: number;
    energyUsage: number;
    dimmedLights?: number;
    motionActivated?: number;
  }>;
  zones: LightingZone[];
  faultReport: Array<{
    zone: string;
    count: number;
    status: 'critical' | 'moderate' | 'minor';
    type: 'electrical' | 'physical' | 'sensor' | 'connectivity';
    estimatedRepairTime: string;
    priority: number; // 1-5 scale
  }>;
  energyStats: {
    daily: number;
    weekly: number;
    monthly: number;
    yearlyComparison: Array<{
      year: number;
      consumption: number;
    }>;
    efficiency: {
      currentMonth: number;
      previousMonth: number;
      yearOverYear: number;
      targetEfficiency: number;
    };
  };
  smartFeatures: {
    adaptiveBrightness: boolean;
    weatherResponsive: boolean;
    trafficAdaptive: boolean;
    remoteMonitoring: boolean;
    predictiveMaintenance: boolean;
  };
}

// Helper function to generate city-specific lighting data
const generateCityLightingData = (
  location: string,
  characteristics: CityLightingCharacteristics,
  zones: LightingZone[]
): StreetLightData => {
  const totalLights = zones.reduce((sum, zone) => sum + zone.lightCount, 0);
  const currentHour = new Date().getHours();
  const isDayTime = currentHour >= 6 && currentHour <= 18;

  // Calculate faults based on infrastructure age and zone characteristics
  const faultReport = zones.map(zone => {
    const baseFaultRate = characteristics.infrastructureAge === 'new' ? 0.01 :
                         characteristics.infrastructureAge === 'modern' ? 0.02 :
                         characteristics.infrastructureAge === 'aging' ? 0.04 : 0.06;

    const zoneFaultRate = baseFaultRate * zone.faultProneness * characteristics.baseMetrics.faultRateMultiplier;
    const faultCount = Math.round(zone.lightCount * zoneFaultRate);

    const faultTypes = ['electrical', 'physical', 'sensor', 'connectivity'] as const;
    const faultType = faultTypes[Math.floor(Math.random() * faultTypes.length)];

    let status: 'critical' | 'moderate' | 'minor';
    let priority: number;
    let estimatedRepairTime: string;

    if (zone.priorityLevel === 'critical' || faultCount > zone.lightCount * 0.05) {
      status = 'critical';
      priority = 5;
      estimatedRepairTime = '2-4 hours';
    } else if (faultCount > zone.lightCount * 0.03) {
      status = 'moderate';
      priority = 3;
      estimatedRepairTime = '1-2 days';
    } else {
      status = 'minor';
      priority = 1;
      estimatedRepairTime = '3-5 days';
    }

    return {
      zone: zone.name,
      count: Math.max(1, faultCount),
      status,
      type: faultType,
      estimatedRepairTime,
      priority
    };
  }).filter(fault => fault.count > 0);

  const totalFaultyLights = faultReport.reduce((sum, fault) => sum + fault.count, 0);
  const activeLights = totalLights - totalFaultyLights;

  // Calculate energy consumption based on characteristics
  const baseEnergyPerLight = characteristics.baseMetrics.averagePowerPerLight / 1000; // Convert to kW
  const efficiencyFactor = characteristics.baseMetrics.energyEfficiencyRating / 10;
  const hourlyEnergyUsage = activeLights * baseEnergyPerLight * efficiencyFactor;

  // Generate hourly data with smart features
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const isDayTime = hour >= 6 && hour <= 18;

    let activeCount = isDayTime ? 0 : activeLights;
    let energyUsage = 0;
    let dimmedLights = 0;
    let motionActivated = 0;

    if (!isDayTime) {
      // Apply smart lighting features
      if (characteristics.operationalPatterns.dimming) {
        // Dim lights during low activity hours (11 PM - 5 AM)
        if (hour >= 23 || hour <= 5) {
          dimmedLights = Math.round(activeLights * 0.6);
          activeCount = activeLights - dimmedLights;
          energyUsage = (activeCount * baseEnergyPerLight + dimmedLights * baseEnergyPerLight * 0.4) * efficiencyFactor;
        } else {
          energyUsage = hourlyEnergyUsage;
        }
      } else {
        energyUsage = hourlyEnergyUsage;
      }

      if (characteristics.operationalPatterns.motionSensors) {
        motionActivated = Math.round(activeLights * 0.2);
      }

      // Add realistic variation
      energyUsage *= (0.9 + Math.random() * 0.2);
    }

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      activeCount,
      energyUsage: Math.round(energyUsage * 100) / 100,
      dimmedLights,
      motionActivated
    };
  });

  const dailyEnergy = hourly.reduce((sum, h) => sum + h.energyUsage, 0);
  const monthlyEnergy = dailyEnergy * 30;

  // Calculate efficiency metrics
  const targetEfficiency = characteristics.lightingRequirements.energyEfficiencyFocus === 'maximum' ? 95 :
                          characteristics.lightingRequirements.energyEfficiencyFocus === 'high' ? 85 :
                          characteristics.lightingRequirements.energyEfficiencyFocus === 'medium' ? 75 : 65;

  const currentEfficiency = Math.min(95, characteristics.baseMetrics.energyEfficiencyRating * 10 - 5 + Math.random() * 10);

  return {
    location,
    cityCharacteristics: characteristics,
    current: {
      totalLights,
      activeLights,
      faultyLights: totalFaultyLights,
      energyConsumption: Math.round(dailyEnergy * 100) / 100,
      timestamp: new Date().toISOString(),
      operationalEfficiency: Math.round((activeLights / totalLights) * 100 * 100) / 100,
      maintenanceScore: Math.round((10 - (totalFaultyLights / totalLights) * 50) * 100) / 100
    },
    hourly,
    zones,
    faultReport,
    energyStats: {
      daily: Math.round(dailyEnergy),
      weekly: Math.round(dailyEnergy * 7),
      monthly: Math.round(monthlyEnergy),
      yearlyComparison: [
        { year: 2020, consumption: Math.round(monthlyEnergy * 12 * 1.15) },
        { year: 2021, consumption: Math.round(monthlyEnergy * 12 * 1.10) },
        { year: 2022, consumption: Math.round(monthlyEnergy * 12 * 1.05) },
        { year: 2023, consumption: Math.round(monthlyEnergy * 12 * 1.02) },
        { year: 2024, consumption: Math.round(monthlyEnergy * 12) }
      ],
      efficiency: {
        currentMonth: currentEfficiency,
        previousMonth: currentEfficiency - 2 + Math.random() * 4,
        yearOverYear: currentEfficiency - 5 + Math.random() * 10,
        targetEfficiency
      }
    },
    smartFeatures: {
      adaptiveBrightness: characteristics.operationalPatterns.dimming,
      weatherResponsive: characteristics.operationalPatterns.smartControls,
      trafficAdaptive: characteristics.cityType === 'business' || characteristics.cityType === 'it_hub',
      remoteMonitoring: characteristics.operationalPatterns.smartControls,
      predictiveMaintenance: characteristics.maintenanceSchedule.responsiveness === 'immediate'
    }
  };
};

const MOCK_DATA: Record<string, StreetLightData> = {
  "thane": generateCityLightingData(
    "thane",
    {
      cityType: 'business',
      populationDensity: 'very_high',
      infrastructureAge: 'modern',
      economicActivity: 'very_high',
      lightingRequirements: {
        securityLevel: 'high',
        aestheticImportance: 'high',
        energyEfficiencyFocus: 'high'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: true,
        dimming: true,
        smartControls: true
      },
      maintenanceSchedule: {
        frequency: 'biweekly',
        responsiveness: 'fast'
      },
      baseMetrics: {
        lightsPerKm: 25,
        averagePowerPerLight: 150,
        faultRateMultiplier: 1.2,
        energyEfficiencyRating: 8
      }
    },
    [
      { name: "Thane Station Complex", type: 'station', lightCount: 450, faultProneness: 3, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['CCTV Integration', 'Emergency Lighting'] },
      { name: "Eastern Express Highway", type: 'highway', lightCount: 600, faultProneness: 4, energyEfficiency: 7, priorityLevel: 'critical', specialFeatures: ['High-mast Lighting', 'Weather Sensors'] },
      { name: "Viviana Mall District", type: 'commercial', lightCount: 380, faultProneness: 2, energyEfficiency: 9, priorityLevel: 'high', specialFeatures: ['Decorative Lighting', 'Smart Controls'] },
      { name: "Ghodbunder Business Zone", type: 'commercial', lightCount: 520, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'high', specialFeatures: ['LED Upgrade', 'Motion Sensors'] },
      { name: "Lake City Residential", type: 'residential', lightCount: 750, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'medium', specialFeatures: ['Solar Integration', 'Dimming Controls'] },
      { name: "Thane Creek Area", type: 'park', lightCount: 300, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'medium', specialFeatures: ['Flood Resistant', 'Wildlife Friendly'] }
    ]
  ),

  "borivali": generateCityLightingData(
    "borivali",
    {
      cityType: 'residential',
      populationDensity: 'high',
      infrastructureAge: 'modern',
      economicActivity: 'high',
      lightingRequirements: {
        securityLevel: 'standard',
        aestheticImportance: 'medium',
        energyEfficiencyFocus: 'high'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: true,
        dimming: true,
        smartControls: false
      },
      maintenanceSchedule: {
        frequency: 'monthly',
        responsiveness: 'standard'
      },
      baseMetrics: {
        lightsPerKm: 20,
        averagePowerPerLight: 120,
        faultRateMultiplier: 1.0,
        energyEfficiencyRating: 8
      }
    },
    [
      { name: "Borivali Station East", type: 'station', lightCount: 350, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['Passenger Safety Lighting', 'Platform Integration'] },
      { name: "Western Express Highway", type: 'highway', lightCount: 480, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'critical', specialFeatures: ['High-intensity Lighting', 'Traffic Adaptive'] },
      { name: "National Park Periphery", type: 'park', lightCount: 280, faultProneness: 4, energyEfficiency: 6, priorityLevel: 'medium', specialFeatures: ['Wildlife Friendly', 'Solar Powered'] },
      { name: "Poisar Residential Complex", type: 'residential', lightCount: 650, faultProneness: 2, energyEfficiency: 9, priorityLevel: 'medium', specialFeatures: ['Community Lighting', 'Energy Efficient'] },
      { name: "Borivali Market Area", type: 'market', lightCount: 320, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'high', specialFeatures: ['Extended Hours', 'Security Integration'] },
      { name: "IC Colony Residential", type: 'residential', lightCount: 420, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'medium', specialFeatures: ['Smart Meters', 'LED Retrofit'] }
    ]
  ),

  "kharghar": generateCityLightingData(
    "kharghar",
    {
      cityType: 'residential',
      populationDensity: 'medium',
      infrastructureAge: 'new',
      economicActivity: 'medium',
      lightingRequirements: {
        securityLevel: 'standard',
        aestheticImportance: 'high',
        energyEfficiencyFocus: 'maximum'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: true,
        dimming: true,
        smartControls: true
      },
      maintenanceSchedule: {
        frequency: 'monthly',
        responsiveness: 'fast'
      },
      baseMetrics: {
        lightsPerKm: 18,
        averagePowerPerLight: 100,
        faultRateMultiplier: 0.8,
        energyEfficiencyRating: 9
      }
    },
    [
      { name: "Central Park Square", type: 'commercial', lightCount: 280, faultProneness: 1, energyEfficiency: 10, priorityLevel: 'high', specialFeatures: ['Decorative LED', 'Smart Controls', 'Solar Integration'] },
      { name: "Kharghar Station Plaza", type: 'station', lightCount: 220, faultProneness: 2, energyEfficiency: 9, priorityLevel: 'critical', specialFeatures: ['Modern LED', 'Passenger Information'] },
      { name: "Palm Beach Road", type: 'highway', lightCount: 400, faultProneness: 2, energyEfficiency: 9, priorityLevel: 'critical', specialFeatures: ['Smart Poles', 'Weather Adaptive'] },
      { name: "Sector 35 Residential", type: 'residential', lightCount: 550, faultProneness: 1, energyEfficiency: 10, priorityLevel: 'medium', specialFeatures: ['Energy Star Rated', 'Community App Control'] },
      { name: "Kharghar Hills Park", type: 'park', lightCount: 180, faultProneness: 2, energyEfficiency: 9, priorityLevel: 'low', specialFeatures: ['Nature Friendly', 'Solar Powered'] },
      { name: "CIDCO Commercial Hub", type: 'commercial', lightCount: 370, faultProneness: 1, energyEfficiency: 9, priorityLevel: 'high', specialFeatures: ['Business District Lighting', 'Smart Grid'] }
    ]
  ),

  "pune": generateCityLightingData(
    "pune",
    {
      cityType: 'it_hub',
      populationDensity: 'very_high',
      infrastructureAge: 'aging',
      economicActivity: 'very_high',
      lightingRequirements: {
        securityLevel: 'maximum',
        aestheticImportance: 'high',
        energyEfficiencyFocus: 'high'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: true,
        dimming: false, // High security requirements
        smartControls: true
      },
      maintenanceSchedule: {
        frequency: 'weekly',
        responsiveness: 'immediate'
      },
      baseMetrics: {
        lightsPerKm: 30,
        averagePowerPerLight: 180,
        faultRateMultiplier: 1.4,
        energyEfficiencyRating: 7
      }
    },
    [
      { name: "Hinjewadi IT Park Phase 1", type: 'office', lightCount: 650, faultProneness: 3, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['24/7 Operation', 'Security Integration', 'Emergency Backup'] },
      { name: "Pune Railway Station", type: 'station', lightCount: 420, faultProneness: 4, energyEfficiency: 6, priorityLevel: 'critical', specialFeatures: ['Heritage Lighting', 'Crowd Management'] },
      { name: "Baner-Balewadi IT Corridor", type: 'office', lightCount: 580, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'critical', specialFeatures: ['Tech Park Lighting', 'Smart Monitoring'] },
      { name: "Shivajinagar Commercial", type: 'commercial', lightCount: 480, faultProneness: 4, energyEfficiency: 6, priorityLevel: 'high', specialFeatures: ['Historic Area', 'Cultural Lighting'] },
      { name: "Wakad IT Hub", type: 'office', lightCount: 520, faultProneness: 3, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['Modern LED', 'Energy Monitoring'] },
      { name: "Katraj Residential", type: 'residential', lightCount: 750, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'medium', specialFeatures: ['Community Lighting', 'Safety Focus'] },
      { name: "FC Road Entertainment", type: 'commercial', lightCount: 350, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'high', specialFeatures: ['Extended Hours', 'Aesthetic Lighting'] }
    ]
  ),

  "delhi-ncr": generateCityLightingData(
    "delhi-ncr",
    {
      cityType: 'religious',
      populationDensity: 'high',
      infrastructureAge: 'aging',
      economicActivity: 'medium',
      lightingRequirements: {
        securityLevel: 'high',
        aestheticImportance: 'high',
        energyEfficiencyFocus: 'medium'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: false,
        dimming: false, // Religious sites need consistent lighting
        smartControls: false
      },
      maintenanceSchedule: {
        frequency: 'monthly',
        responsiveness: 'standard'
      },
      baseMetrics: {
        lightsPerKm: 22,
        averagePowerPerLight: 140,
        faultRateMultiplier: 1.3,
        energyEfficiencyRating: 6
      }
    },
    [
      { name: "Trimbakeshwar Temple Road", type: 'temple', lightCount: 380, faultProneness: 3, energyEfficiency: 6, priorityLevel: 'critical', specialFeatures: ['Pilgrimage Lighting', 'Festival Ready', 'Traditional Design'] },
      { name: "DELHI NCR Road Station", type: 'station', lightCount: 320, faultProneness: 4, energyEfficiency: 5, priorityLevel: 'critical', specialFeatures: ['Heritage Station', 'Passenger Safety'] },
      { name: "Gangapur Road Market", type: 'market', lightCount: 420, faultProneness: 3, energyEfficiency: 6, priorityLevel: 'high', specialFeatures: ['Market Hours Lighting', 'Vendor Support'] },
      { name: "CIDCO Industrial Area", type: 'industrial', lightCount: 480, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'medium', specialFeatures: ['Industrial Grade', 'Shift Support'] },
      { name: "Panchavati Ghat", type: 'temple', lightCount: 280, faultProneness: 4, energyEfficiency: 5, priorityLevel: 'high', specialFeatures: ['Waterfront Lighting', 'Religious Significance'] },
      { name: "College Road Academic", type: 'residential', lightCount: 450, faultProneness: 2, energyEfficiency: 7, priorityLevel: 'medium', specialFeatures: ['Student Safety', 'Educational Zone'] },
      { name: "Old DELHI NCR Heritage", type: 'residential', lightCount: 370, faultProneness: 4, energyEfficiency: 5, priorityLevel: 'medium', specialFeatures: ['Heritage Preservation', 'Traditional Style'] }
    ]
  ),

  "panvel": generateCityLightingData(
    "panvel",
    {
      cityType: 'mixed',
      populationDensity: 'medium',
      infrastructureAge: 'modern',
      economicActivity: 'medium',
      lightingRequirements: {
        securityLevel: 'standard',
        aestheticImportance: 'medium',
        energyEfficiencyFocus: 'high'
      },
      operationalPatterns: {
        duskToDawn: true,
        motionSensors: true,
        dimming: true,
        smartControls: true
      },
      maintenanceSchedule: {
        frequency: 'monthly',
        responsiveness: 'fast'
      },
      baseMetrics: {
        lightsPerKm: 19,
        averagePowerPerLight: 110,
        faultRateMultiplier: 0.9,
        energyEfficiencyRating: 8
      }
    },
    [
      { name: "Panvel Railway Station", type: 'station', lightCount: 300, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['Junction Station', 'Multi-platform'] },
      { name: "Old Panvel Market", type: 'market', lightCount: 280, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'high', specialFeatures: ['Traditional Market', 'Extended Hours'] },
      { name: "CIDCO Colony Residential", type: 'residential', lightCount: 520, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'medium', specialFeatures: ['Planned Development', 'Energy Efficient'] },
      { name: "New Panvel Junction", type: 'highway', lightCount: 350, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'critical', specialFeatures: ['Highway Junction', 'Traffic Adaptive'] },
      { name: "Panvel Creek Bridge", type: 'highway', lightCount: 180, faultProneness: 3, energyEfficiency: 7, priorityLevel: 'high', specialFeatures: ['Bridge Lighting', 'Weather Resistant'] },
      { name: "Karnala Industrial", type: 'industrial', lightCount: 320, faultProneness: 2, energyEfficiency: 8, priorityLevel: 'medium', specialFeatures: ['Industrial Zone', 'Shift Lighting'] }
    ]
  )
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