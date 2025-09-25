import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metrics/MetricCard";
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Lightbulb, Car, Wind, Activity, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { DashboardMapView } from '@/components/analytics/DashboardMapView';
import { fetchEnvironmentalData, getAqiCategory, getAqiImpact, fetchRealAQI } from '@/services/aqi';
import { useCity } from '@/contexts/CityContext';
import { fetchParkingData, LocationParkingData } from '@/services/parking';
import { fetchStreetLightData } from '@/services/streetlight';
import { fetchTrafficData } from '@/services/traffic';
import { motion, AnimatePresence } from 'framer-motion';

// City coordinates mapping
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
};

// Skeleton component for loading states
const Skeleton = ({ className = '', ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
    {...props}
  />
);

interface AqiDataPoint extends BarDatum {
  label: string;
  aqi: number;
  value: number;
  category: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  timestamp: string;
}

interface DataStatus {
  isReal: boolean;
  source: 'waqi' | 'openweather' | 'google' | 'fallback' | 'simulated';
  lastUpdated: string;
  city: string;
}

interface TooltipProps {
  id: string | number;
  value: number;
  color: string;
}

const getAqiColor = (value: number) => {
  if (value <= 50) return '#00E396';    // Good
  if (value <= 100) return '#FEB019';   // Moderate
  if (value <= 150) return '#FF4560';   // Unhealthy for Sensitive Groups
  if (value <= 200) return '#775DD0';   // Unhealthy
  if (value <= 300) return '#FF1010';   // Very Unhealthy
  return '#7A0000';                     // Hazardous
};

// Custom AQI Tooltip Component
const AQITooltip = (props: any) => {
  const { value, label, color } = props.data;
  const aqiValue = value as number;

  return (
    <div className="bg-gray-900/90 backdrop-blur-sm p-3 rounded-lg border border-gray-700 shadow-xl">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-lg font-bold mt-1" style={{ color }}>{aqiValue} AQI</div>
      <div className="text-xs text-gray-300 mt-1">{getAqiCategory(aqiValue)}</div>
      <div className="text-xs text-gray-400 mt-1">{getAqiImpact(aqiValue)}</div>
    </div>
  );
};

// Parking Visualization Component
interface ParkingLotData {
  id: string;
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  occupancyRate: number;
}

const ParkingVisualization = ({ 
  parkingData,
  isLoading 
}: { 
  parkingData: ParkingLotData[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const totalSpaces = parkingData.reduce((sum, lot) => sum + (lot?.totalSpaces || 0), 0);
  const occupiedSpaces = parkingData.reduce((sum, lot) => sum + (lot?.occupiedSpaces || 0), 0);
  const availableSpaces = totalSpaces - occupiedSpaces;
  const occupancyRate = totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parking Availability</CardTitle>
        <CardDescription>
          {occupiedSpaces} of {totalSpaces} spaces occupied ({Math.round(occupancyRate)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{availableSpaces}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{occupiedSpaces}</div>
            <div className="text-sm text-muted-foreground">Occupied</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className = ''
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  subtitle?: string;
  className?: string;
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-center justify-between">
      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center text-xs font-medium ${
          trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-bold mt-1 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export function DashboardPage() {
  const { selectedCity } = useCity();
  const [activeTab, setActiveTab] = useState("24h");
  const [aqiData, setAqiData] = useState<AqiDataPoint[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [parkingData, setParkingData] = useState<LocationParkingData | null>(null);
  const [streetLightData, setStreetLightData] = useState<{on: number, off: number, total: number} | null>(null);
  const [trafficData, setTrafficData] = useState<{current: number, average: number, trend: 'up' | 'down' | 'same'} | null>(null);
  const [locationParkingData, setLocationParkingData] = useState<ParkingLotData[]>([]);
  const [isLoading, setIsLoading] = useState({
    streetLights: true,
    traffic: true,
    parking: true,
    aqi: true,
    environmental: true
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [aqiError, setAqiError] = useState<string | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatus>({
    isReal: false,
    source: 'simulated',
    lastUpdated: '',
    city: ''
  });
  
  // Helper to update loading state for a specific key
  const setIsLoadingFor = useCallback((key: keyof typeof isLoading, value: boolean) => {
    setIsLoading(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Calculate parking metrics from location parking data
  const parkingMetrics = useMemo(() => {
    if (!locationParkingData || locationParkingData.length === 0) {
      return {
        totalSpaces: 0,
        occupiedSpaces: 0,
        availableSpaces: 0,
        occupancyRate: 0,
      };
    }

    const totalSpaces = locationParkingData.reduce((sum, lot) => sum + (lot?.totalSpaces || 0), 0);
    const occupiedSpaces = locationParkingData.reduce((sum, lot) => sum + (lot?.occupiedSpaces || 0), 0);
    const availableSpaces = totalSpaces - occupiedSpaces;
    const occupancyRate = totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0;

    return {
      totalSpaces,
      occupiedSpaces,
      availableSpaces,
      occupancyRate: Math.round(occupancyRate * 10) / 10, // Round to 1 decimal place
    };
  }, [locationParkingData]);

  // Calculate trends (mock data - in a real app, this would come from your API)
  const mockTrends = useMemo(() => ({
    lights: Math.floor(Math.random() * 15) - 5, // -5% to +10%
    traffic: Math.floor(Math.random() * 20) - 10, // -10% to +10%
    parking: Math.floor(Math.random() * 15) - 5, // -5% to +10%
    aqi: Math.floor(Math.random() * 20) - 15, // -15% to +5%
  }), []);

  interface LoadingState {
    streetLights: boolean;
    traffic: boolean;
    parking: boolean;
    aqi: boolean;
    environmental: boolean;
    [key: string]: boolean;
  }

  const handleTabChange = (value: string) => {
    // Convert the tab value to lowercase to match the state type
    const tabMap: Record<string, '24h' | 'week' | 'month' | 'year'> = {
      '24h': '24h',
      'Week': 'week',
      'Month': 'month',
      'Year': 'year'
    };

    const newTab = tabMap[value] || '24h';

    setActiveTab(newTab);
  };

  // Helper function to generate mock AQI data for different time ranges
  const generateMockAqiData = (count: number, type: 'hour' | 'day' | 'week' | 'month' = 'hour', baseAqi: number = 40 + Math.random() * 60): AqiDataPoint[] => {
    const now = new Date();
    const data: AqiDataPoint[] = [];
    
    for (let i = count - 1; i >= 0; i--) {
      const pointDate = new Date(now);
      
      // Adjust date based on data type
      if (type === 'hour') {
        pointDate.setHours(now.getHours() - i);
      } else if (type === 'day') {
        pointDate.setDate(now.getDate() - i);
      } else if (type === 'week') {
        pointDate.setDate(now.getDate() - (i * 7));
      } else if (type === 'month') {
        pointDate.setMonth(now.getMonth() - i);
      }
      
      // Add variation based on time of day
      const hour = pointDate.getHours();
      let variation = 0;
      
      if (type === 'hour') {
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
          variation = 15 + Math.random() * 20; // Rush hours
        } else if (hour >= 22 || hour <= 5) {
          variation = -10 - Math.random() * 15; // Night
        } else {
          variation = -5 + Math.random() * 15; // Daytime
        }
      } else {
        // Add some random variation for daily/weekly/monthly data
        variation = (Math.random() * 40) - 20; // -20 to +20
      }
      
      const aqiValue = Math.max(0, Math.min(500, baseAqi + variation));
      
      // Format label based on data type
      let label = '';
      if (type === 'hour') {
        label = pointDate.getHours().toString().padStart(2, '0') + ':00';
      } else if (type === 'day') {
        label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][pointDate.getDay()];
      } else if (type === 'week') {
        label = `Week ${Math.ceil(pointDate.getDate() / 7)}`;
      } else {
        label = pointDate.toLocaleString('default', { month: 'short' });
      }
      
      data.push({
        label,
        aqi: Math.round(aqiValue),
        value: Math.round(aqiValue),
        category: getAqiCategory(aqiValue) as any,
        timestamp: pointDate.toISOString()
      });
    }
    
    return data;
  };

  // Use aqiData directly since fetchAqiData already provides the correct data for each time range
  const activeAqiData = useMemo(() => {
    if (isLoading.aqi || !aqiData.length) return [];

    return aqiData;
  }, [isLoading.aqi, aqiData, activeTab]);

  // Map Dashboard tabs to Analytics time ranges
  const getTimeRange = (tab: string): 'daily' | 'weekly' | 'monthly' | 'yearly' => {
    switch (tab) {
      case '24h': return 'daily';
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      case 'year': return 'yearly';
      default: return 'daily';
    }
  };



  // Fetch AQI data based on selected time range
  const fetchAqiData = useCallback(async () => {
    if (!selectedCity) return;
    
    setIsLoadingFor('aqi', true);
    setAqiError(null);
    
    try {
      const cityCoords = CITY_COORDINATES[selectedCity.toLowerCase()] || CITY_COORDINATES['mumbai'];
      const now = new Date();
      
      // Fetch environmental data which includes all time ranges
      const envData = await fetchEnvironmentalData(selectedCity);
      const timeRange = getTimeRange(activeTab);

      // Update environmental data state for other components
      setEnvironmentalData(envData);
      
      // Get the appropriate data for the current time range
      let rangeData = [];
      switch (timeRange) {
        case 'daily':
          rangeData = envData.timeRangeAverages.daily.map(item => ({
            label: item.hour,
            aqi: item.averageAqi,
            value: item.averageAqi,
            category: getAqiCategory(item.averageAqi) as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous',
            timestamp: item.hour
          }));
          break;
          
        case 'weekly':
          rangeData = envData.timeRangeAverages.weekly.map((item) => ({
            label: item.week,
            aqi: item.averageAqi,
            value: item.averageAqi,
            category: getAqiCategory(item.averageAqi) as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous',
            timestamp: item.week
          }));
          break;
          
        case 'monthly':
          rangeData = envData.timeRangeAverages.monthly.map(item => ({
            label: item.month,
            aqi: item.averageAqi,
            value: item.averageAqi,
            category: getAqiCategory(item.averageAqi) as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous',
            timestamp: item.month
          }));
          break;
          
        case 'yearly':
          rangeData = envData.timeRangeAverages.yearly.map(item => ({
            label: item.year,
            aqi: item.averageAqi,
            value: item.averageAqi,
            category: getAqiCategory(item.averageAqi) as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous',
            timestamp: item.year
          }));
          break;
      }
      
      // Update the data with the current tab's data
      setAqiData(rangeData);
      setLastUpdated(now.toLocaleTimeString());

      // Update data status
      setDataStatus({
        isReal: true,
        source: 'waqi', // Will be updated when we get real data
        lastUpdated: now.toLocaleTimeString(),
        city: selectedCity
      });
      
      // Try to fetch real data in the background for the most recent point
      if (rangeData.length > 0) {
        try {
          const currentAqi = await fetchRealAQI(cityCoords.lat, cityCoords.lng);
          if (currentAqi) {
            // Update data status with real source information
            setDataStatus(prev => ({
              ...prev,
              isReal: currentAqi.source !== 'fallback',
              source: currentAqi.source
            }));

            setAqiData(prevData => {
              const updated = [...prevData];
              const latest = { ...updated[updated.length - 1] };
              latest.aqi = currentAqi.aqi;
              latest.value = currentAqi.aqi;
              latest.category = getAqiCategory(currentAqi.aqi) as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
              updated[updated.length - 1] = latest;
              return updated;
            });


          }
        } catch (error) {
          console.error('Failed to update with real AQI data:', error);
          setDataStatus(prev => ({
            ...prev,
            isReal: false,
            source: 'fallback'
          }));
        }
      }
      
    } catch (err) {
      console.error('Failed to generate AQI data:', err);
      setAqiError(`Unable to fetch real AQI data for ${selectedCity}. Using simulated data.`);

      // Update data status to indicate fallback
      setDataStatus({
        isReal: false,
        source: 'simulated',
        lastUpdated: new Date().toLocaleTimeString(),
        city: selectedCity
      });

      // Generate appropriate mock data based on the active tab
      const mockDataCount = {
        '24h': 24,
        'week': 7,
        'month': 4,
        'year': 12
      }[activeTab] || 24;

      const mockDataType = {
        '24h': 'hour',
        'week': 'day',
        'month': 'week',
        'year': 'month'
      }[activeTab] || 'hour';

      const fallbackData = generateMockAqiData(mockDataCount, mockDataType as any);
      setAqiData(fallbackData);
      setLastUpdated(`${new Date().toLocaleTimeString()} (Simulated)`);
    } finally {
      setIsLoadingFor('aqi', false);
    }
  }, [selectedCity, activeTab]);

  // Fetch AQI data when component mounts, selected city changes, or time range changes
  useEffect(() => {
    fetchAqiData();
  }, [fetchAqiData]);

  // Note: Removed automatic refresh to prevent excessive API calls
  // Data will only be fetched on page load, city change, or manual refresh

  // Mock data for other charts
  const mockAqiData: AqiDataPoint[] = useMemo(() => {
    // This is kept as fallback if needed
    const citySeed = selectedCity ? selectedCity.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    
    return Array.from({ length: 24 }, (_, i) => {
      const random = Math.sin(citySeed + i) * 10000;
      const aqiValue = Math.floor((random - Math.floor(random)) * 70) + 30;
      const categoryIndex = Math.floor((citySeed + i) % 5);
      const categories = ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous'] as const;
      
      return {
        label: `${i}:00`,
        aqi: aqiValue,
        value: aqiValue,
        category: categories[categoryIndex],
        timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString()
      };
    });
  }, [selectedCity]);



  // Fetch data when city or tab changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchData = async () => {
      try {
        // Set loading states (excluding AQI which is handled separately)
        setIsLoading(prev => ({
          ...prev,
          streetLights: true,
          traffic: true,
          parking: true,
          environmental: true
        }));

        // Mock data fetch - replace with actual API calls
        const mockFetch = <T,>(data: T, delay = 1000): Promise<T> =>
          new Promise(resolve => setTimeout(() => resolve(data), delay));

        // Fetch city-specific data
        const [, lightData, trafData, realParkingData] = await Promise.all([
          mockFetch<AqiDataPoint[]>(mockAqiData), // Not used, AQI data handled separately
          mockFetch<{on: number, off: number, total: number}>({
            on: Math.round(120 + Math.random() * 30),
            off: Math.round(20 + Math.random() * 10),
            total: 150
          }),
          mockFetch<{current: number, average: number, trend: 'up' | 'down' | 'same'}>({
            current: Math.round(35 + Math.random() * 15),
            average: 38,
            trend: Math.random() > 0.5 ? 'up' : 'down'
          }),
          fetchParkingData(selectedCity) // Use real parking service
        ]);

        // Convert parking data to the format expected by the component
        const parkData: ParkingLotData[] = Array.isArray(realParkingData)
          ? realParkingData.flatMap(cityData =>
              cityData.locations.map(loc => ({
                id: `${cityData.location}-${loc.name.replace(/\s+/g, '-').toLowerCase()}`,
                name: loc.name,
                totalSpaces: loc.totalSpaces,
                occupiedSpaces: loc.occupiedSpaces,
                occupancyRate: loc.occupancyRate
              }))
            )
          : realParkingData.locations.map(loc => ({
              id: `${realParkingData.location}-${loc.name.replace(/\s+/g, '-').toLowerCase()}`,
              name: loc.name,
              totalSpaces: loc.totalSpaces,
              occupiedSpaces: loc.occupiedSpaces,
              occupancyRate: loc.occupancyRate
            }));

        // Update state with fetched data (excluding AQI data which is handled separately)
        setStreetLightData(lightData);
        setTrafficData(trafData);
        setLocationParkingData(parkData);

        // Set parking data for overall metrics
        if (!Array.isArray(realParkingData)) {
          setParkingData(realParkingData);
        }

        // Set last updated time
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(prev => ({
          ...prev,
          streetLights: false,
          traffic: false,
          parking: false,
          environmental: false
        }));
      }
    };

    fetchData();

    // Note: Removed automatic polling to prevent excessive API calls
    // Data will only be fetched on page load or city change
  }, [selectedCity]); // Removed activeTab dependency since AQI is handled separately

  if (isLoading.streetLights || isLoading.traffic || isLoading.parking || isLoading.aqi || isLoading.environmental) {
    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-64 w-full" />
          </Card>
        </div>

        {/* Map Skeleton */}
        <Card className="p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-80 w-full rounded-lg" />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <header className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pt-2 pb-4 sm:pt-0 sm:pb-6 -mx-3 sm:-mx-6 px-3 sm:px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCity ? (
                  <span>
                    <span 
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-extrabold relative"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        position: 'relative'
                      }}
                    >
                      <span className="absolute inset-0 blur-sm bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent opacity-40"></span>
                      <span className="relative z-10">
                        {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1).toLowerCase()}
                      </span>
                    </span>
                    {' Dashboard'}
                  </span>
                ) : 'City Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Real-time monitoring and analytics for {selectedCity || 'your city'}
              </p>
            </div>
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
              <div className="text-xs sm:text-sm px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                <span className="hidden sm:inline">Last updated: </span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
              <button
                className="sm:hidden p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={fetchAqiData}
                aria-label="Refresh data"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Data Status Notification Banner */}
      {!dataStatus.isReal && dataStatus.source === 'simulated' && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Using Simulated AQI Data
                </h3>
                <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                  <p>
                    Real-time AQI data is currently unavailable for {selectedCity}.
                    The dashboard is showing simulated data based on typical air quality patterns for this location.
                  </p>
                </div>
                <div className="mt-3">
                  <button
                    onClick={fetchAqiData}
                    className="bg-amber-100 dark:bg-amber-800 px-3 py-1.5 rounded-md text-sm font-medium text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                  >
                    Try to fetch real data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <StatCard
            title="Street Lights"
            value={streetLightData?.total ?? 0}
            icon={<Lightbulb className="w-5 h-5 text-yellow-500" />}
            trend={mockTrends.lights}
            subtitle={`${streetLightData?.on ?? 0} active`}
            className={isLoading.streetLights ? 'opacity-50' : ''}
          />

          <StatCard
            title="Traffic Flow"
            value={`${trafficData?.current ?? 0} km/h`}
            icon={<Car className="w-5 h-5 text-blue-500" />}
            trend={mockTrends.traffic}
            subtitle={`${trafficData?.trend ?? 'same'} congestion`}
            className={isLoading.traffic ? 'opacity-50' : ''}
          />

          <StatCard
            title="Parking Available"
            value={`${parkingMetrics.availableSpaces} / ${parkingMetrics.totalSpaces}`}
            icon={<Activity className="w-5 h-5 text-green-500" />}
            trend={mockTrends.parking}
            subtitle={`${Math.round(parkingMetrics.occupancyRate)}% occupied`}
            className={isLoading.parking ? 'opacity-50' : ''}
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* AQI Graph - Full Width */}
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Air Quality Index</h3>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ 
                      backgroundColor: activeAqiData.length > 0 
                        ? getAqiColor(activeAqiData[activeAqiData.length - 1].aqi) 
                        : getAqiColor(0)
                    }}
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    {activeTab === '24h' ? 'Current' : 
                     activeTab === 'week' ? 'This Week' :
                     activeTab === 'month' ? 'This Month' : 'This Year'}:
                    <span className="font-medium ml-1">
                      {activeAqiData.length > 0 ? activeAqiData[activeAqiData.length - 1].aqi : '--'}
                    </span>
                    {activeAqiData.length > 0 && (
                      <span className="capitalize">
                        {' '}({getAqiCategory(activeAqiData[activeAqiData.length - 1].aqi).toLowerCase()})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                  {['24h', 'Week', 'Month', 'Year'].map((tab) => (
                    <button
                      key={tab}
                      className={`px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                        (activeTab === '24h' && tab === '24h') ||
                        (activeTab === 'week' && tab === 'Week') ||
                        (activeTab === 'month' && tab === 'Month') ||
                        (activeTab === 'year' && tab === 'Year')
                          ? "bg-[#6C5DD3] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => handleTabChange(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <button
                  onClick={fetchAqiData}
                  disabled={isLoading.aqi}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  title="Refresh AQI data"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${isLoading.aqi ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            <CardContent>
              {isLoading.aqi ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-40 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ) : aqiError ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <div className="text-amber-500 mb-2">⚠️ {aqiError}</div>
                  <div className="text-sm text-gray-500 mb-4">
                    Showing {activeTab === '24h' ? '24-hour' : activeTab} AQI data for {selectedCity}.
                    <br />
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                  <button
                    onClick={fetchAqiData}
                    className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry Real Data
                  </button>
                </div>
              ) : activeAqiData.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveBar
                    data={activeAqiData}
                    keys={['value']}
                    indexBy="label"
                    margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
                    padding={0.4}
                    colors={({ data }) => getAqiColor(data.value as number)}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 8,
                      tickRotation: -45,
                      legend: activeTab === '24h' ? 'Time of Day' :
                              activeTab === 'week' ? 'Day of Week' :
                              activeTab === 'month' ? 'Month' : 'Year',
                      legendPosition: 'middle',
                      legendOffset: 60,
                      tickValues: activeAqiData.length > 12 ? 12 : 'every 1', // Show fewer ticks if many data points
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 8,
                      tickRotation: 0,
                      legend: 'Air Quality Index (AQI)',
                      legendPosition: 'middle',
                      legendOffset: -50,
                      tickValues: 6, // Show 6 ticks on Y axis
                    }}
                    tooltip={AQITooltip}
                    enableGridY={true}
                    enableGridX={false}
                    enableLabel={false}
                    animate={true}
                    motionConfig="gentle"
                    borderRadius={4}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
                    theme={{
                      axis: {
                        domain: {
                          line: {
                            stroke: '#E5E7EB',
                            strokeWidth: 2,
                          },
                        },
                        ticks: {
                          text: {
                            fill: '#6B7280',
                            fontSize: '12px',
                            fontWeight: 500,
                          },
                          line: {
                            stroke: '#E5E7EB',
                            strokeWidth: 1,
                          },
                        },
                        legend: {
                          text: {
                            fill: '#4B5563',
                            fontSize: '14px',
                            fontWeight: 600,
                          },
                        },
                      },
                      grid: {
                        line: {
                          stroke: '#F3F4F6',
                          strokeWidth: 1,
                          strokeDasharray: '4 4',
                        },
                      },
                      tooltip: {
                        container: {
                          background: 'white',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          fontSize: '14px',
                        },
                      },
                    }}
                    defs={[
                      {
                        id: 'gradient',
                        type: 'linearGradient',
                        colors: [
                          { offset: 0, color: 'inherit', opacity: 0.9 },
                          { offset: 100, color: 'inherit', opacity: 0.3 },
                        ],
                      },
                    ]}
                    fill={[
                      {
                        match: {
                          id: 'value',
                        },
                        id: 'gradient',
                      },
                    ]}
                    isInteractive={true}
                    onClick={(data) => {
                      console.log('Bar clicked:', data);
                    }}
                    onMouseEnter={(_data, e) => {
                      // Add hover effect
                      const element = e.currentTarget;
                      element.style.transform = 'scale(1.02)';
                      element.style.transition = 'transform 0.2s ease';
                    }}
                    onMouseLeave={(_data, e) => {
                      // Reset hover effect
                      const element = e.currentTarget;
                      element.style.transform = 'scale(1)';
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No AQI data available
                </div>
              )}
            </CardContent>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6">
              {[
                { color: '#00E396', label: 'Good (0-50)' },
                { color: '#FEB019', label: 'Moderate (51-100)' },
                { color: '#FF4560', label: 'Unhealthy (101-150)' },
                { color: '#775DD0', label: 'Very Unhealthy (151-200)' },
                { color: '#FF1010', label: 'Hazardous (201-300)' },
                { color: '#7A0000', label: 'Hazardous+ (300+)' }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Live Traffic Map */}
          <DashboardMapView />
        </section>
      </main>

      {/* Environmental Data */}
      <Card className="p-4 sm:p-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Air Quality Index</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {isLoading.aqi ? 'Updating...' : `Updated: ${lastUpdated}`}
              </span>
              <button 
                onClick={fetchAqiData} 
                disabled={isLoading.aqi}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh AQI data"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading.aqi ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {aqiError && (
            <div className="text-xs text-red-500 mt-1">{aqiError}</div>
          )}
        </CardHeader>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6C5DD3]" />
              <div className="text-sm text-gray-500">Temperature</div>
            </div>
            <div className="text-2xl font-semibold">{environmentalData?.current.temperature}°C</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6C5DD3]" />
              <div className="text-sm text-gray-500">AQI</div>
            </div>
            <div className="text-2xl font-semibold">{environmentalData?.current.aqi.value}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6C5DD3]" />
              <div className="text-sm text-gray-500">Humidity</div>
            </div>
            <div className="text-2xl font-semibold">{environmentalData?.current.humidity}%</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6C5DD3]" />
              <div className="text-sm text-gray-500">CO₂</div>
            </div>
            <div className="text-2xl font-semibold">{environmentalData?.current.co2} ppm</div>
          </div>
        </div>
      </Card>

      {/* Parking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parking Occupancy */}
        <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Parking Occupancy</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time parking space availability
              </p>
            </div>
            <button
              className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline transition-colors"
              onClick={() => window.location.href = '/analytics?section=parking'}
            >
              View details →
            </button>
          </div>

          <div className="h-[200px] sm:h-[220px] flex items-center justify-center">
            <div className="w-full max-w-md">
              <ParkingVisualization 
                parkingData={locationParkingData} 
                isLoading={isLoading.parking} 
              />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Spaces</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {parkingMetrics.totalSpaces}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Occupancy Rate</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {Math.round(parkingMetrics.occupancyRate)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Parking Locations */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Parking Locations</h3>
          </div>
          <div className="space-y-3 sm:space-y-4 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
            {locationParkingData.map((location, index) => (
              <div key={index} className="p-3 sm:p-4 bg-gray-800 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                  <h4 className="text-sm sm:text-base font-medium">{location.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs sm:text-sm w-fit ${
                    (location.occupiedSpaces / location.totalSpaces * 100) > 80 ? 'bg-red-500/20 text-red-500' :
                    (location.occupiedSpaces / location.totalSpaces * 100) > 50 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {Math.round(location.occupiedSpaces / location.totalSpaces * 100)}% Full
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-400 gap-1 sm:gap-0">
                  <span>{location.occupiedSpaces} / {location.totalSpaces} spots</span>
                  <span>{location.totalSpaces - location.occupiedSpaces} available</span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (location.occupiedSpaces / location.totalSpaces * 100) > 80 ? 'bg-red-500' :
                      (location.occupiedSpaces / location.totalSpaces * 100) > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${location.occupiedSpaces / location.totalSpaces * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
