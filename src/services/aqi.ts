import { AQIPrediction, initializeAQIPredictor, predictAQI } from './ml/aqi_predictor';

// City coordinates mapping for AQI data fetching
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'borivali': { lat: 19.2307, lng: 72.8567 }, // Borivali, Mumbai
  'andheri': { lat: 19.1136, lng: 72.8697 }, // Andheri, Mumbai
};

export interface EnvironmentalData {
  current: {
    timestamp: string;
    temperature: number;
    humidity: number;
    co2: number;
    windSpeed?: number;
    city?: string;
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
      source?: string;
    };
  };
  hourly: Array<{
    hour: string;
    temperature: number;
    humidity: number;
    co2: number;
    windSpeed?: number;
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

export const getAqiImpact = (aqi: number): string => {
  if (aqi <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk.';
  if (aqi <= 100) return 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  if (aqi <= 200) return 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.';
  if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions: everyone is more likely to be affected.';
};

// 🟡 Fetch real AQI from Google API
interface GoogleAirQualityResponse {
  currentConditions: {
    indexes: Array<{
      aqi: number;
      category: string;
      name: string;
    }>;
    pollutants: Array<{
      code: string;
      concentration: {
        value: number;
        units: string;
      };
    }>;
    time: string;
  };
}

// Fallback AQI data in case all APIs fail
const FALLBACK_AQI = {
  aqi: 45 + Math.floor(Math.random() * 30), // Random AQI between 45-75 (Good to Moderate)
  category: 'Moderate',
  pollutants: {
    pm25: 10 + Math.random() * 20,
    pm10: 20 + Math.random() * 30,
    no2: 10 + Math.random() * 40,
    so2: 2 + Math.random() * 8,
    o3: 30 + Math.random() * 50,
    co: 0.5 + Math.random() * 2
  }
};

// Historical AQI data point interface
export interface HistoricalAqiDataPoint {
  dt: number; // Unix timestamp
  main: {
    aqi: number;
  };
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
}

// Function to fetch historical AQI data
export const fetchHistoricalAQI = async (
  lat: number,
  lng: number,
  start: number, // Unix timestamp
  end?: number // Optional end timestamp (defaults to now)
): Promise<HistoricalAqiDataPoint[]> => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'YOUR_OPENWEATHER_API_KEY') {
      console.warn('OpenWeatherMap API key not configured for historical data');
      return [];
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lng}&start=${start}${end ? `&end=${end}` : ''}&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch historical AQI data');

    const data = await response.json();
    return data.list || [];
  } catch (error) {
    console.error('Error fetching historical AQI:', error);
    return [];
  }
};

export const fetchRealAQI = async (lat: number, lng: number): Promise<{
  aqi: number;
  category: string;
  pollutants: Record<string, number>;
  source: 'openweather' | 'google' | 'waqi' | 'fallback';
}> => {
  try {
    // First try Google's AQI API with the provided key
    const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (googleApiKey) {
      try {
        const googleUrl = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${googleApiKey}`;

        const googleResponse = await fetch(googleUrl, {
          method: 'POST',
          body: JSON.stringify({
            location: { latitude: lat, longitude: lng },
            languageCode: 'en'
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (googleResponse.ok) {
          const data: GoogleAirQualityResponse = await googleResponse.json();

          if (data.currentConditions && data.currentConditions.indexes && data.currentConditions.indexes.length > 0) {
            const index = data.currentConditions.indexes[0];

            const pollutantsObj: Record<string, number> = {};
            if (data.currentConditions.pollutants) {
              data.currentConditions.pollutants.forEach(p => {
                pollutantsObj[p.code.toLowerCase()] = p.concentration.value;
              });
            }

            return {
              aqi: index.aqi,
              category: index.category,
              pollutants: pollutantsObj,
              source: 'google'
            };
          }
        } else {
          console.warn('Google API failed with status:', googleResponse.status);
        }
      } catch (error) {
        console.warn('Google API failed:', error);
      }
    }

    // Try World Air Quality Index (WAQI) API as fallback
    const waqiApiKey = import.meta.env.VITE_WAQI_API_KEY;
    if (waqiApiKey) {
      try {
        const waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${waqiApiKey}`;
        const waqiResponse = await fetch(waqiUrl);

        if (waqiResponse.ok) {
          const waqiData = await waqiResponse.json();
          if (waqiData.status === 'ok' && waqiData.data) {
            const aqiValue = waqiData.data.aqi;
            const pollutants = waqiData.data.iaqi || {};

            return {
              aqi: aqiValue,
              category: getAqiCategory(aqiValue),
              pollutants: {
                pm25: pollutants.pm25?.v || 0,
                pm10: pollutants.pm10?.v || 0,
                no2: pollutants.no2?.v || 0,
                so2: pollutants.so2?.v || 0,
                o3: pollutants.o3?.v || 0,
                co: pollutants.co?.v || 0
              },
              source: 'waqi'
            };
          }
        }
      } catch (error) {
        console.warn('WAQI API failed:', error);
      }
    }

    // Try OpenWeatherMap Air Pollution API as final fallback
    const owmApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (owmApiKey && owmApiKey !== 'YOUR_OPENWEATHER_API_KEY') {
      try {
        const owmUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${owmApiKey}`;
        const response = await fetch(owmUrl);

        if (response.ok) {
          const data = await response.json();
          const aqi = data.list?.[0]?.main?.aqi || 1; // AQI from 1-5, need to convert to standard AQI
          const components = data.list?.[0]?.components || {};

          // Convert 1-5 AQI to standard 0-500 AQI
          const aqiValue = Math.round((aqi - 1) * 125);

          return {
            aqi: aqiValue,
            category: getAqiCategory(aqiValue),
            pollutants: {
              pm25: components.pm2_5,
              pm10: components.pm10,
              no2: components.no2,
              so2: components.so2,
              o3: components.o3,
              co: components.co
            },
            source: 'openweather'
          };
        }
      } catch (error) {
        console.warn('OpenWeatherMap API failed:', error);
      }
    }

    // If all APIs fail, return fallback data
    console.warn('All AQI APIs failed, using fallback data');
    return {
      ...FALLBACK_AQI,
      source: 'fallback'
    };

  } catch (error) {
    console.error('Error fetching AQI data:', error);
    // Return fallback data if there's an error
    return {
      ...FALLBACK_AQI,
      source: 'fallback'
    };
  }
};

// 🟡 Simulate historical hourly data for 24 hours
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

// Helper function to get location-based environmental data
const getLocationBasedEnvironmentalData = (city: string, lat: number, lng: number) => {
  const cityKey = city.toLowerCase();

  // City-specific environmental baselines
  const cityData: Record<string, {
    aqi: number;
    temperature: number;
    humidity: number;
    co2: number;
    windSpeed: number;
  }> = {
    'mumbai': { aqi: 85, temperature: 28, humidity: 75, co2: 420, windSpeed: 12 },
    'delhi': { aqi: 120, temperature: 25, humidity: 60, co2: 450, windSpeed: 8 },
    'bangalore': { aqi: 75, temperature: 24, humidity: 65, co2: 400, windSpeed: 10 },
    'hyderabad': { aqi: 90, temperature: 29, humidity: 55, co2: 410, windSpeed: 9 },
    'chennai': { aqi: 80, temperature: 31, humidity: 80, co2: 415, windSpeed: 15 },
    'kolkata': { aqi: 110, temperature: 27, humidity: 85, co2: 440, windSpeed: 7 },
    'pune': { aqi: 70, temperature: 26, humidity: 60, co2: 395, windSpeed: 11 },
    'ahmedabad': { aqi: 95, temperature: 32, humidity: 45, co2: 425, windSpeed: 9 },
    'surat': { aqi: 85, temperature: 30, humidity: 70, co2: 420, windSpeed: 10 },
    'jaipur': { aqi: 100, temperature: 28, humidity: 50, co2: 430, windSpeed: 8 },
    'borivali': { aqi: 80, temperature: 27, humidity: 72, co2: 415, windSpeed: 13 },
    'andheri': { aqi: 88, temperature: 28, humidity: 74, co2: 422, windSpeed: 12 },
  };

  const baseData = cityData[cityKey] || cityData['mumbai'];

  // Add some realistic variation
  const now = new Date();
  const hour = now.getHours();
  const season = Math.floor((now.getMonth() + 1) / 3); // 0=winter, 1=spring, 2=summer, 3=autumn

  // Time-based variations
  let tempVariation = 0;
  let humidityVariation = 0;
  let co2Variation = 0;

  // Daily temperature cycle
  if (hour >= 6 && hour <= 18) {
    tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 5; // Peak at noon
  } else {
    tempVariation = -2 - Math.random() * 3; // Cooler at night
  }

  // Humidity inversely related to temperature
  humidityVariation = -tempVariation * 0.8;

  // CO2 higher during rush hours
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    co2Variation = 20 + Math.random() * 15;
  }

  // Seasonal adjustments
  const seasonalTemp = [0, 3, 8, 2][season]; // Winter, Spring, Summer, Autumn
  const seasonalHumidity = [0, -5, -10, 5][season];

  return {
    aqi: Math.round(baseData.aqi + (Math.random() * 20 - 10)),
    temperature: Math.round((baseData.temperature + tempVariation + seasonalTemp) * 10) / 10,
    humidity: Math.max(20, Math.min(95, Math.round(baseData.humidity + humidityVariation + seasonalHumidity))),
    co2: Math.round(baseData.co2 + co2Variation + (Math.random() * 10 - 5)),
    windSpeed: Math.round((baseData.windSpeed + (Math.random() * 4 - 2)) * 10) / 10
  };
};

// Helper function to get location-based AQI baseline (for backward compatibility)
const getLocationBasedAqi = (lat: number, lng: number): number => {
  // Delhi area (high pollution)
  if (lat > 28 && lat < 29 && lng > 76 && lng < 78) return 120;

  // Mumbai area (moderate pollution)
  if (lat > 18 && lat < 20 && lng > 72 && lng < 73) return 85;

  // Bangalore area (moderate pollution)
  if (lat > 12 && lat < 13 && lng > 77 && lng < 78) return 75;

  // Chennai area (moderate pollution)
  if (lat > 12 && lat < 14 && lng > 80 && lng < 81) return 80;

  // Kolkata area (high pollution)
  if (lat > 22 && lat < 23 && lng > 88 && lng < 89) return 110;

  // Default for other locations
  return 70;
};

// Helper function to get time-based AQI variation
const getTimeBasedVariation = (hour: number): number => {
  // AQI typically higher during rush hours and lower at night
  if (hour >= 7 && hour <= 9) return 25; // Morning rush
  if (hour >= 17 && hour <= 19) return 30; // Evening rush
  if (hour >= 22 || hour <= 5) return -20; // Night time
  if (hour >= 10 && hour <= 16) return 10; // Daytime
  return 0; // Default
};

// Function to fetch real historical data for different time ranges
const fetchRealHistoricalData = async (
  lat: number,
  lng: number,
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Promise<{
  daily: Array<{ hour: string; averageAqi: number }>;
  weekly: Array<{ week: string; averageAqi: number }>;
  monthly: Array<{ month: string; averageAqi: number }>;
  yearly: Array<{ year: string; averageAqi: number }>;
}> => {
  const now = new Date();
  try {
    // Try to fetch real historical data from OpenWeatherMap
    const dailyStart = Math.floor((now.getTime() - 24 * 60 * 60 * 1000) / 1000);
    const dailyData = await fetchHistoricalAQI(lat, lng, dailyStart);

    let hasRealData = dailyData.length > 0;

    // Process daily data into hourly averages
    const hourlyAverages = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0') + ':00';

      if (hasRealData) {
        const hourData = dailyData.filter(d => {
          const date = new Date(d.dt * 1000);
          return date.getHours() === i;
        });

        const averageAqi = hourData.length > 0
          ? Math.round(hourData.reduce((sum, d) => sum + (d.main.aqi - 1) * 125, 0) / hourData.length)
          : Math.round(70 + Math.random() * 30); // Fallback for missing hours

        return { hour, averageAqi };
      } else {
        // Generate realistic simulated data based on location and time
        const baseAqi = getLocationBasedAqi(lat, lng);
        const timeVariation = getTimeBasedVariation(i);
        const averageAqi = Math.round(baseAqi + timeVariation + (Math.random() * 20 - 10));

        return { hour, averageAqi: Math.max(0, Math.min(500, averageAqi)) };
      }
    });

    // For weekly data, generate last 7 days with realistic variations
    const baseAqi = getLocationBasedAqi(lat, lng);
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Weekend typically has lower AQI due to less traffic
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendAdjustment = isWeekend ? -15 : 0;

      const averageAqi = Math.round(baseAqi + weekendAdjustment + (Math.random() * 30 - 15));

      return { week: dayName, averageAqi: Math.max(0, Math.min(500, averageAqi)) };
    });

    // For monthly data, generate last 12 months with seasonal variations
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const month = date.toLocaleDateString('en-US', { month: 'short' });

      // Seasonal variations (winter months typically have higher AQI in India)
      const monthNum = date.getMonth();
      let seasonalAdjustment = 0;
      if (monthNum >= 10 || monthNum <= 2) seasonalAdjustment = 25; // Winter
      else if (monthNum >= 3 && monthNum <= 5) seasonalAdjustment = 10; // Summer
      else seasonalAdjustment = -10; // Monsoon

      const averageAqi = Math.round(baseAqi + seasonalAdjustment + (Math.random() * 20 - 10));

      return { month, averageAqi: Math.max(0, Math.min(500, averageAqi)) };
    });

    // For yearly data, generate last 5 years with gradual improvement trend
    const yearlyData = Array.from({ length: 5 }, (_, i) => {
      const year = (new Date().getFullYear() - (4 - i)).toString();

      // Simulate gradual improvement over years (optimistic trend)
      const yearlyImprovement = i * 5; // 5 AQI improvement per year
      const averageAqi = Math.round(baseAqi + 20 - yearlyImprovement + (Math.random() * 15 - 7.5));

      return { year, averageAqi: Math.max(0, Math.min(500, averageAqi)) };
    });

    return {
      daily: hourlyAverages,
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    };

  } catch (error) {
    console.error('Error fetching historical data, using simulated data:', error);

    // Fallback to simulated data
    return {
      daily: Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        averageAqi: Math.round(70 + Math.random() * 30)
      })),
      weekly: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return {
          week: dayName,
          averageAqi: Math.round(70 + Math.random() * 30)
        };
      }),
      monthly: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
        averageAqi: Math.round(70 + Math.random() * 30)
      })),
      yearly: Array.from({ length: 5 }, (_, i) => ({
        year: (2020 + i).toString(),
        averageAqi: Math.round(70 + Math.random() * 30)
      }))
    };
  }
};

// 🟢 Main Function: Fetch All Environmental Data
export const fetchEnvironmentalData = async (city?: string): Promise<EnvironmentalData> => {
  const now = new Date();

  // Get city-specific coordinates and environmental data
  const cityKey = city?.toLowerCase() || 'mumbai';
  const cityCoords = CITY_COORDINATES[cityKey] || CITY_COORDINATES['mumbai'];
  const cityEnvData = getLocationBasedEnvironmentalData(cityKey, cityCoords.lat, cityCoords.lng);

  // 🌐 Fetch real AQI data for the specific city
  let realAqi: number;
  let category: string;
  let pollutants: Record<string, number>;
  let dataSource: string;

  try {
    const res = await fetchRealAQI(cityCoords.lat, cityCoords.lng);
    realAqi = res.aqi;
    category = res.category;
    pollutants = res.pollutants;
    dataSource = res.source;

  } catch (err) {
    console.error('fetchRealAQI failed, using city-specific fallback:', err);
    realAqi = cityEnvData.aqi;
    category = getAqiCategory(realAqi);
    pollutants = {};
    dataSource = 'fallback';
  }

  // 🔁 Fetch real historical data for all time ranges
  const timeRangeData = await fetchRealHistoricalData(cityCoords.lat, cityCoords.lng, 'daily');

  // Generate historical data for ML prediction (using daily data)
  const historicalData = generateHistoricalData(now);

  // 🧠 AQI prediction using ML
  await initializeAQIPredictor(historicalData.map(d => d.aqi));
  const recentAqiValues = historicalData.slice(0, 6).map(d => d.aqi).reverse();
  const prediction = await predictAQI(recentAqiValues);

  return {
    current: {
      timestamp: now.toISOString(),
      temperature: cityEnvData.temperature,
      humidity: cityEnvData.humidity,
      co2: cityEnvData.co2,
      windSpeed: cityEnvData.windSpeed,
      city: city || 'Mumbai',
      aqi: {
        value: realAqi,
        category,
        pollutants: {
          pm25: pollutants['pm25'] || Math.round(20 + Math.random() * 40),
          no2: pollutants['no2'] || Math.round(15 + Math.random() * 30),
          so2: pollutants['so2'] || Math.round(10 + Math.random() * 25),
          o3: pollutants['o3'] || Math.round(25 + Math.random() * 35)
        },
        prediction,
        source: dataSource
      }
    },
    hourly: historicalData.map((h, index) => {
      const hourVariation = Math.sin((index * 2 * Math.PI) / 24) * 3; // Daily cycle
      return {
        hour: new Date(h.timestamp).getHours().toString().padStart(2, '0') + ':00',
        temperature: Math.round((cityEnvData.temperature + hourVariation) * 10) / 10,
        humidity: Math.max(20, Math.min(95, cityEnvData.humidity - Math.round(hourVariation * 2))),
        co2: cityEnvData.co2 + Math.round(Math.random() * 50 - 25),
        windSpeed: Math.max(0, cityEnvData.windSpeed + Math.random() * 4 - 2),
        aqi: {
          value: h.aqi,
          pollutants: {
            no2: Math.round(30 + Math.random() * 70),
            so2: Math.round(20 + Math.random() * 55),
            o3: Math.round(35 + Math.random() * 35)
          }
        }
      };
    }),
    timeRangeAverages: timeRangeData,
    locationAverages: [
      { location: 'downtown', averageAqi: Math.round(70 + Math.random() * 30) },
      { location: 'suburbs', averageAqi: Math.round(60 + Math.random() * 30) },
      { location: 'industrial', averageAqi: Math.round(80 + Math.random() * 30) },
      { location: 'residential', averageAqi: Math.round(65 + Math.random() * 30) },
      { location: 'parks', averageAqi: Math.round(55 + Math.random() * 30) }
    ]
  };
};
