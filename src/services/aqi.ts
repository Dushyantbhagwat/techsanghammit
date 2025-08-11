import { AQIPrediction, initializeAQIPredictor, predictAQI } from './ml/aqi_predictor';

export interface EnvironmentalData {
  current: {
    timestamp: string;
    temperature: number;
    humidity: number;
    co2: number;
    aqi: {
      value: number;
      category: string;
      pollutants: {
        pm25?: number;
        no2?: number;
        so2?: number;
        o3?: number;
      };
      prediction?: AQIPrediction;
    };
  };
  hourly: Array<{
    hour: string;
    temperature: number;
    humidity: number;
    co2: number;
    aqi: {
      value: number;
      pollutants?: {
        pm25?: number;
        no2?: number;
        so2?: number;
        o3?: number;
      };
    };
  }>;
  timeRangeAverages: {
    daily: Array<{ hour: string; averageAqi: number }>;
    weekly: Array<{ week: string; averageAqi: number }>;
    monthly: Array<{ month: string; averageAqi: number }>;
    yearly: Array<{ year: string; averageAqi: number }>;
  };
  locationAverages: Array<{
    location: string;
    averageAqi: number;
  }>;
}

export const getAqiCategory = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const generateHistoricalData = (timestamp: Date) => {
  const data = [];
  const baseAqi = Math.floor(Math.random() * 100) + 50;
  
  for (let i = 0; i < 24; i++) {
    const hourTimestamp = new Date(timestamp);
    hourTimestamp.setHours(hourTimestamp.getHours() - i);
    
    const variation = Math.sin((i / 24) * Math.PI * 2) * 20;
    const aqi = Math.max(0, Math.min(500, baseAqi + variation + (Math.random() * 20 - 10)));
    
    data.push({
      timestamp: hourTimestamp.toISOString(),
      aqi: Math.round(aqi)
    });
  }
  
  return data;
};

export const fetchEnvironmentalData = async (_city?: string): Promise<EnvironmentalData> => {
  // Simulated data for demonstration
  const now = new Date();
  const historicalData = generateHistoricalData(now);
  
  // Initialize and train AQI predictor with historical data
  await initializeAQIPredictor(historicalData.map(d => d.aqi));
  
  // Get AQI prediction
  const recentAqiValues = historicalData.slice(0, 6).map(d => d.aqi).reverse();
  const prediction = await predictAQI(recentAqiValues);
  
  const currentAqi = historicalData[0].aqi;
  
  const data: EnvironmentalData = {
    current: {
      timestamp: now.toISOString(),
      temperature: 25 + (Math.random() * 10 - 5),
      humidity: 60 + (Math.random() * 20 - 10),
      co2: 400 + Math.random() * 600,
      aqi: {
        value: currentAqi,
        category: getAqiCategory(currentAqi),
        pollutants: {
          no2: Math.round(30 + Math.random() * 70),
          so2: Math.round(20 + Math.random() * 55),
          o3: Math.round(35 + Math.random() * 35),
          pm25: Math.round(40 + Math.random() * 60)
        },
        prediction
      }
    },
    hourly: historicalData.map(h => ({
      hour: new Date(h.timestamp).getHours().toString().padStart(2, '0') + ':00',
      temperature: 25 + (Math.random() * 10 - 5),
      humidity: 60 + (Math.random() * 20 - 10),
      co2: 400 + Math.random() * 600,
      aqi: {
        value: h.aqi,
        pollutants: {
          no2: Math.round(30 + Math.random() * 70),
          so2: Math.round(20 + Math.random() * 55),
          o3: Math.round(35 + Math.random() * 35)
        }
      }
    })),
    timeRangeAverages: {
      daily: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        averageAqi: Math.round(70 + Math.random() * 30)
      })),
      weekly: Array.from({ length: 4 }, (_, i) => ({
        week: `Week ${i + 1}`,
        averageAqi: Math.round(70 + Math.random() * 30)
      })),
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        averageAqi: Math.round(70 + Math.random() * 30)
      })),
      yearly: Array.from({ length: 5 }, (_, i) => ({
        year: (2020 + i).toString(),
        averageAqi: Math.round(70 + Math.random() * 30)
      }))
    },
    locationAverages: [
      { location: 'downtown', averageAqi: Math.round(70 + Math.random() * 30) },
      { location: 'suburbs', averageAqi: Math.round(60 + Math.random() * 30) },
      { location: 'industrial', averageAqi: Math.round(80 + Math.random() * 30) },
      { location: 'residential', averageAqi: Math.round(65 + Math.random() * 30) },
      { location: 'parks', averageAqi: Math.round(55 + Math.random() * 30) }
    ]
  };
  
  return data;
};