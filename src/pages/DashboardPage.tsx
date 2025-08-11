import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/metrics/MetricCard";
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Lightbulb, Car, Wind, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { DashboardMapView } from '@/components/analytics/DashboardMapView';
import { fetchEnvironmentalData, getAqiCategory, getAqiImpact } from '@/services/aqi';
import { useCity } from '@/contexts/CityContext';
import { fetchParkingData, LocationParkingData } from '@/services/parking';
import { fetchStreetLightData } from '@/services/streetlight';
import { fetchTrafficData } from '@/services/traffic';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [streetLightData, setStreetLightData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [locationParkingData, setLocationParkingData] = useState<ParkingLotData[]>([]);

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

  const [isLoading, setLoading] = useState<LoadingState>({
    streetLights: true,
    traffic: true,
    parking: true,
    aqi: true,
    environmental: true
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as '24h' | 'week' | 'month' | 'year');
  };

  // Get active tab data based on selected time range
  const getActiveTabData = useCallback((): AqiDataPoint[] => {
    if (!aqiData || aqiData.length === 0) return [];

    const now = new Date();
    const filteredData = [...aqiData];

    switch (activeTab) {
      case '24h': {
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return filteredData.filter(entry => new Date(entry.timestamp) >= last24Hours);
      }
      case 'week': {
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return filteredData.filter(entry => new Date(entry.timestamp) >= lastWeek);
      }
      case 'month': {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return filteredData.filter(entry => new Date(entry.timestamp) >= lastMonth);
      }
      case 'year': {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        return filteredData.filter(entry => new Date(entry.timestamp) >= lastYear);
      }
      default:
        return filteredData;
    }
  }, [activeTab, aqiData]);

  const activeAqiData = useMemo(() => getActiveTabData(), [getActiveTabData]);

  // Mock data for charts
  const mockAqiData: AqiDataPoint[] = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => {
      const aqiValue = Math.floor(Math.random() * 100) + 30;
      return {
        label: `${i}:00`,
        aqi: aqiValue,
        value: aqiValue, // Required by BarDatum
        category: ['Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous'][
          Math.floor(Math.random() * 5)
        ] as 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous',
        timestamp: new Date(Date.now() - (24 - i) * 60 * 60 * 1000).toISOString()
      };
    }), []);

  // State for last updated time
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch data when city or tab changes
  useEffect(() => {
    if (!selectedCity) return;

    const fetchData = async () => {
      try {
        // Set loading states
        setLoading((prev: LoadingState) => ({
          ...prev,
          streetLights: true,
          traffic: true,
          parking: true,
          aqi: true,
          environmental: true
        }));

        // Mock data fetch - replace with actual API calls
        const mockFetch = <T,>(data: T, delay = 1000): Promise<T> =>
          new Promise(resolve => setTimeout(() => resolve(data), delay));

        // Mock data for now - replace with actual API calls
        const [envData, lightData, trafData, parkData] = await Promise.all([
          mockFetch<AqiDataPoint[]>(mockAqiData),
          mockFetch<{on: number, off: number, total: number}>({ on: 125, off: 25, total: 150 }),
          mockFetch<{current: number, average: number, trend: 'up' | 'down' | 'same'}>({ current: 42, average: 38, trend: 'up' }),
          mockFetch<ParkingLotData[]>([
            { 
              id: 'lot1', 
              name: 'Main Lot', 
              totalSpaces: 200, 
              occupiedSpaces: 150, 
              occupancyRate: Math.round((150 / 200) * 100) 
            },
            { 
              id: 'lot2', 
              name: 'Downtown', 
              totalSpaces: 150, 
              occupiedSpaces: 120,
              occupancyRate: Math.round((120 / 150) * 100)
            }
          ])
        ]);

        // Update state with fetched data
        setAqiData(envData);
        setStreetLightData(lightData);
        setTrafficData(trafData);
        setLocationParkingData(parkData);

        // Set last updated time
        setLastUpdated(new Date().toLocaleTimeString());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading((prev: LoadingState) => ({
          ...prev,
          streetLights: false,
          traffic: false,
          parking: false,
          aqi: false,
          environmental: false
        }));
      }
    };

    fetchData();

    // Set up polling (refresh every 30 seconds)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [selectedCity, activeTab]);

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
                {selectedCity ? `${selectedCity} Dashboard` : 'City Dashboard'}
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
                onClick={() => {/* TODO: Implement refresh */}}
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
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* AQI Graph */}
          <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Air Quality Index</h3>
                <div className="flex items-center mt-1">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getAqiColor(environmentalData?.current.aqi.value || 0) }}
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Current: <span className="font-medium">{environmentalData?.current.aqi.value} </span>
                    <span className="capitalize">({environmentalData?.current.aqi.category.toLowerCase()})</span>
                  </p>
                </div>
              </div>
              <div className="flex space-x-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                {['24h', 'Week', 'Month', 'Year'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-3 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${
                      activeTab === tab
                        ? "bg-[#6C5DD3] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => handleTabChange(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[380px] relative">
              <ResponsiveBar<AqiDataPoint>
                data={aqiData}
                keys={['value']}
                indexBy="label"
                margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                padding={0.5}
                valueScale={{ type: 'linear' }}
                colors={({ data }) => getAqiColor(data.value)}
                borderRadius={4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: -45,
                  legend: activeTab === "24h" ? "Hours" :
                         activeTab === "Week" ? "Days" :
                         activeTab === "Month" ? "Weeks" : "Months",
                  legendPosition: "middle",
                  legendOffset: 50,
                  tickValues: 5
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 10,
                  tickRotation: 0,
                  legend: 'Air Quality Index (AQI)',
                  legendPosition: 'middle',
                  legendOffset: -50,
                  tickValues: 5
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                role="application"
                tooltip={AQITooltip}
                theme={{
                  text: {
                    fill: "#6B7280",
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif'
                  },
                  axis: {
                    domain: {
                      line: {
                        stroke: "#E5E7EB",
                        strokeWidth: 1
                      }
                    },
                    ticks: {
                      line: {
                        stroke: "#E5E7EB",
                        strokeWidth: 1
                      },
                      text: {
                        fill: "#6B7280",
                        fontSize: 11
                      }
                    },
                    legend: {
                      text: {
                        fill: "#374151",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: 'Inter, sans-serif'
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: "#E5E7EB",
                      strokeWidth: 1,
                      strokeDasharray: "4 4"
                    }
                  }
                }}
              />
            </div>
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
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold">Environmental data</h3>
          <button
            className="text-xs sm:text-sm text-[#6C5DD3] hover:underline"
            onClick={() => window.location.href = '/analytics?section=environmental'}
          >
            Read more
          </button>
        </div>
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
