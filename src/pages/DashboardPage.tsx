import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/metrics/MetricCard";
import { ResponsiveBar, BarDatum } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Lightbulb, Car, Wind, Activity } from 'lucide-react';
import { DashboardMapView } from '@/components/analytics/DashboardMapView';
import { fetchEnvironmentalData, getAqiCategory } from '@/services/aqi';
import { useCity } from '@/contexts/CityContext';
import { fetchParkingData, LocationParkingData } from '@/services/parking';
import { fetchStreetLightData } from '@/services/streetlight';
import { fetchTrafficData } from '@/services/traffic';

interface AqiDataPoint extends BarDatum {
  label: string;
  value: number;
  category: string;
  [key: string]: string | number;
}

interface TooltipProps {
  id: string | number;
  value: number;
  color: string;
}

const getAqiColor = (value: number) => {
  if (value <= 50) return '#00E396';
  if (value <= 100) return '#FEB019';
  if (value <= 150) return '#FF4560';
  if (value <= 200) return '#775DD0';
  if (value <= 300) return '#FF1010';
  return '#7A0000';
};

export function DashboardPage() {
  const { selectedCity } = useCity();
  const [activeTab, setActiveTab] = useState("DAY");
  const [aqiData, setAqiData] = useState<AqiDataPoint[]>([]);
  const [environmentalData, setEnvironmentalData] = useState<any>(null);
  const [parkingData, setParkingData] = useState<LocationParkingData | null>(null);
  const [streetLightData, setStreetLightData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [locationParkingData, setLocationParkingData] = useState<Array<{
    name: string;
    totalSpaces: number;
    occupiedSpaces: number;
    occupancyRate: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data when city changes
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAllData = async () => {
      if (!selectedCity) return;

      setIsLoading(true);
      try {
        const [envData, parkData, lightData, trafData] = await Promise.all([
          fetchEnvironmentalData(selectedCity),
          fetchParkingData(selectedCity),
          fetchStreetLightData(selectedCity),
          fetchTrafficData(selectedCity)
        ]);
        
        setEnvironmentalData(envData);
        setStreetLightData(lightData);
        setTrafficData(trafData);

        // Transform parking data
        const parkingInfo = Array.isArray(parkData) ? parkData[0] : parkData as LocationParkingData;
        setParkingData(parkingInfo);

        // Update locations data
        if (parkingInfo && parkingInfo.locations) {
          setLocationParkingData(parkingInfo.locations);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCity]);

  useEffect(() => {
    const fetchAqiData = async () => {
      if (!selectedCity) return;

      try {
        const envData = await fetchEnvironmentalData(selectedCity);
        let timeData: AqiDataPoint[] = [];

        switch (activeTab) {
          case "DAY":
            timeData = envData.timeRangeAverages.daily.map((item: { hour: string; averageAqi: number }) => ({
              label: item.hour,
              value: item.averageAqi,
              category: getAqiCategory(item.averageAqi)
            }));
            break;
          case "WK":
            timeData = envData.timeRangeAverages.weekly.map((item: { week: string; averageAqi: number }) => ({
              label: item.week,
              value: item.averageAqi,
              category: getAqiCategory(item.averageAqi)
            }));
            break;
          case "MO":
            timeData = envData.timeRangeAverages.monthly.map((item: { month: string; averageAqi: number }) => ({
              label: item.month,
              value: item.averageAqi,
              category: getAqiCategory(item.averageAqi)
            }));
            break;
          case "YR":
            timeData = envData.timeRangeAverages.yearly.map((item: { year: string; averageAqi: number }) => ({
              label: item.year,
              value: item.averageAqi,
              category: getAqiCategory(item.averageAqi)
            }));
            break;
        }
        setAqiData(timeData);
      } catch (error) {
        console.error('Error fetching AQI data:', error);
      }
    };

    fetchAqiData();
  }, [activeTab, selectedCity]);

  // Calculate parking metrics
  const parkingMetrics = parkingData?.current ? {
    totalSpaces: parkingData.current.totalSpaces,
    availableSpaces: parkingData.current.totalSpaces - parkingData.current.occupiedSpaces,
    occupiedSpaces: parkingData.current.occupiedSpaces
  } : {
    totalSpaces: 0,
    availableSpaces: 0,
    occupiedSpaces: 0
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Lightbulb className="h-8 w-8 text-[#6C5DD3]" />}
          title="Total lights"
          value={streetLightData?.current.totalLights.toString() || "0"}
          details={[
            { label: "Functioning", value: streetLightData?.current.activeLights.toString() || "0" },
            { label: "Not functioning", value: streetLightData?.current.faultyLights.toString() || "0" },
          ]}
          analyticsSection="lights"
        />

        <MetricCard
          icon={<Activity className="h-8 w-8 text-[#6C5DD3]" />}
          title="Traffic Flow"
          value={trafficData?.currentTraffic.vehicleCount.toString() || "0"}
          subtitle="Vehicles/hour"
          details={[
            { label: "Peak hours", value: trafficData?.peakHour.vehicleCount.toString() || "0" },
            { label: "Off-peak", value: Math.round(trafficData?.dailyTotal / 24).toString() || "0" },
          ]}
          analyticsSection="traffic"
        />

        <MetricCard
          icon={<Car className="h-8 w-8 text-[#6C5DD3]" />}
          title="Parking Status"
          value={parkingMetrics.totalSpaces.toString()}
          subtitle={`${Math.round((parkingMetrics.occupiedSpaces / parkingMetrics.totalSpaces) * 100)}% Occupied`}
          details={[
            { 
              label: "Available", 
              value: parkingMetrics.availableSpaces.toString(),
              color: "text-green-500"
            },
            { 
              label: "Occupied", 
              value: parkingMetrics.occupiedSpaces.toString(),
              color: parkingMetrics.occupiedSpaces / parkingMetrics.totalSpaces > 0.8 ? "text-red-500" : "text-amber-500"
            }
          ]}
          analyticsSection="parking"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AQI Graph */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold">Air Quality Index</h3>
              <p className="text-sm text-gray-500 mt-1">
                Current AQI: {environmentalData?.current.aqi.value} ({environmentalData?.current.aqi.category})
              </p>
            </div>
            <div className="flex items-center bg-[#F4F7FE] rounded-lg p-1">
              {[
                { id: "DAY", label: "24H" },
                { id: "WK", label: "Week" },
                { id: "MO", label: "Month" },
                { id: "YR", label: "Year" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-[#6C5DD3] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[380px]">
            <ResponsiveBar<AqiDataPoint>
              data={aqiData}
              keys={['value']}
              indexBy="label"
              margin={{ top: 85, right: 20, bottom: 115, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              colors={({ data }) => getAqiColor(data.value)}
              borderRadius={4}
              axisBottom={{
                tickSize: 5,
                tickPadding: 12,
                tickRotation: -45,
                legend: activeTab === "DAY" ? "Hours" :
                       activeTab === "WK" ? "Weeks" :
                       activeTab === "MO" ? "Months" : "Years",
                legendPosition: "middle",
                legendOffset: 75
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Air Quality Index (AQI)',
                legendPosition: 'middle',
                legendOffset: -50
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              role="application"
              theme={{
                text: { fill: "#ffffff", fontSize: 12 },
                axis: {
                  domain: { line: { stroke: "#ffffff" } },
                  ticks: {
                    line: { stroke: "#ffffff" },
                    text: { fill: "#ffffff" }
                  },
                  legend: {
                    text: { fill: "#ffffff", fontSize: 12, fontWeight: 600 }
                  }
                },
                grid: {
                  line: { stroke: "#ffffff", strokeOpacity: 0.1 }
                },
                legends: {
                  text: { fill: "#ffffff", fontSize: 12 }
                }
              }}
            />
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00E396' }} />
              <span className="text-sm text-gray-600">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FEB019' }} />
              <span className="text-sm text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF4560' }} />
              <span className="text-sm text-gray-600">Unhealthy</span>
            </div>
          </div>
        </Card>

        {/* Live Traffic Map */}
        <DashboardMapView />
      </div>

      {/* Environmental Data */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Environmental data</h3>
          <button
            className="text-sm text-[#6C5DD3] hover:underline"
            onClick={() => window.location.href = '/analytics?section=environmental'}
          >
            Read more
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parking occupancy</h3>
            <button
              className="text-sm text-[#6C5DD3] hover:underline"
              onClick={() => window.location.href = '/analytics?section=parking'}
            >
              Read more
            </button>
          </div>
          <div className="h-[200px]">
            <ResponsivePie
              data={[
                {
                  id: "Available",
                  value: parkingMetrics.availableSpaces,
                  color: "#00E396",
                  label: `Available (${Math.round((parkingMetrics.availableSpaces/parkingMetrics.totalSpaces) * 100)}%)`
                },
                {
                  id: "Occupied",
                  value: parkingMetrics.occupiedSpaces,
                  color: "#FF4560",
                  label: `Occupied (${Math.round((parkingMetrics.occupiedSpaces/parkingMetrics.totalSpaces) * 100)}%)`
                }
              ]}
              margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
              innerRadius={0.6}
              padAngle={0.5}
              cornerRadius={3}
              colors={{ datum: 'data.color' }}
              enableArcLinkLabels={false}
              enableArcLabels={false}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 40,
                  itemWidth: 100,
                  itemHeight: 18,
                  itemTextColor: '#6B7280',
                  itemDirection: 'left-to-right',
                  itemOpacity: 1,
                  symbolSize: 10,
                  symbolShape: 'circle'
                }
              ]}
            />
          </div>
        </Card>

        {/* Parking Locations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parking Locations</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {locationParkingData.map((location, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{location.name}</h4>
                  <span className={`px-2 py-1 rounded text-sm ${
                    location.occupancyRate > 80 ? 'bg-red-500/20 text-red-500' :
                    location.occupancyRate > 50 ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {location.occupancyRate}% Full
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{location.occupiedSpaces} / {location.totalSpaces} spots</span>
                  <span>{location.totalSpaces - location.occupiedSpaces} available</span>
                </div>
                <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      location.occupancyRate > 80 ? 'bg-red-500' :
                      location.occupancyRate > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${location.occupancyRate}%` }}
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